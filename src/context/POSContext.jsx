import React, { createContext, useContext, useState, useMemo } from 'react';
import { useInventario } from './InventarioContext';
import { useCaja } from './CajaContext';
import { useAuth } from './AuthContext';
import { useFacturacion } from './FacturacionContext';

const POSContext = createContext();

export const usePOS = () => useContext(POSContext);

export const POSProvider = ({ children }) => {
    const { articulos } = useInventario();
    const { registrarRecibo, turnoActivo } = useCaja();
    const { user, empresa } = useAuth();
    const { guardarFactura } = useFacturacion();
    
    const [cart, setCart] = useState([]);
    const [checkoutStatus, setCheckoutStatus] = useState('idle'); // idle, processing, success, error
    const [lastTransaction, setLastTransaction] = useState(null);

    const addToCart = (producto) => {
        setCart(prev => {
            const existing = prev.find(item => item.id === producto.id);
            if (existing) {
                return prev.map(item => 
                    item.id === producto.id 
                    ? { ...item, quantity: item.quantity + 1 } 
                    : item
                );
            }
            return [...prev, { ...producto, quantity: 1 }];
        });
    };

    const removeFromCart = (id) => {
        setCart(prev => prev.filter(item => item.id !== id));
    };

    const updateQuantity = (id, delta) => {
        setCart(prev => prev.map(item => {
            if (item.id === id) {
                const newQty = Math.max(1, item.quantity + delta);
                return { ...item, quantity: newQty };
            }
            return item;
        }));
    };

    const clearCart = () => setCart([]);

    const totals = useMemo(() => {
        const subtotal = cart.reduce((acc, item) => acc + (item.precioVenta * item.quantity), 0);
        const itbis = cart.reduce((acc, item) => {
            if (item.gravado) {
                return acc + (item.precioVenta * item.quantity * 0.18);
            }
            return acc;
        }, 0);
        return {
            subtotal,
            itbis,
            total: subtotal + itbis
        };
    }, [cart]);

    const processCheckout = async (options = {}) => {
        const { 
            paymentMethod = 'Efectivo', 
            tipoComprobante = 'B02',
            cliente = null 
        } = options;

        if (cart.length === 0) return;
        setCheckoutStatus('processing');
        
        try {
            // 1. Preparar datos de la factura elite
            const facturaData = {
                empresa_id: empresa.id,
                clienteId: cliente?.id || 'CONTADO',
                clienteNombre: cliente?.nombre || 'Consumidor Final',
                rnc: cliente?.rnc || '',
                tipoComprobante, // B02 para Consumidor, B01 para Credito Fiscal
                condicion: 'Contado',
                subtotal: totals.subtotal,
                itbis: totals.itbis,
                total: totals.total,
                descuento: 0,
                monedaId: '1',
                tasa: 1,
                vendedor: user.nombre,
                metodo_pago: paymentMethod
            };

            // 2. Guardar factura (esto maneja NCF, Asiento y Stock automáticamente)
            const articulosFormateados = cart.map(item => ({
                articulo: item,
                cantidad: item.quantity,
                precio: item.precioVenta,
                itbis: item.gravado ? (item.precioVenta * 0.18) : 0
            }));

            const facturaGuardada = await guardarFactura(facturaData, articulosFormateados);

            // 3. Registrar Recibo en Caja para el cuadre
            const recibo = {
                empresa_id: empresa.id,
                usuario_id: user.id,
                cliente: facturaData.clienteNombre,
                monto: totals.total,
                itbis: totals.itbis,
                metodo_pago: paymentMethod,
                glosa: `POS Venta Elite - Fac ${facturaGuardada.numeroInterno} - NCF ${facturaGuardada.ncf}`,
                items: articulosFormateados
            };
            
            registrarRecibo(recibo);

            setLastTransaction({
                ...facturaGuardada,
                items: articulosFormateados
            });

            setCheckoutStatus('success');
            // No limpiar inmediatamente para que el usuario vea el feedback y el recibo
        } catch (error) {
            console.error('Elite Checkout error:', error);
            setCheckoutStatus('error');
            throw error;
        }
    };

    const resetCheckout = () => {
        setCheckoutStatus('idle');
        setLastTransaction(null);
        clearCart();
    };

    return (
        <POSContext.Provider value={{
            cart,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            totals,
            processCheckout,
            checkoutStatus,
            setCheckoutStatus,
            lastTransaction,
            resetCheckout,
            turnoActivo
        }}>
            {children}
        </POSContext.Provider>
    );
};
