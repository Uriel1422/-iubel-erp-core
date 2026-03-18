import React, { createContext, useContext, useState, useMemo } from 'react';
import { useInventario } from './InventarioContext';
import { useCaja } from './CajaContext';
import { useAuth } from './AuthContext';

const POSContext = createContext();

export const usePOS = () => useContext(POSContext);

export const POSProvider = ({ children }) => {
    const { articulos, ajustarStock } = useInventario();
    const { registrarRecibo, turnoActivo } = useCaja();
    const { user, empresa } = useAuth();
    
    const [cart, setCart] = useState([]);
    const [checkoutStatus, setCheckoutStatus] = useState('idle'); // idle, processing, success, error

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

    const processCheckout = async (paymentMethod = 'Efectivo') => {
        if (cart.length === 0) return;
        setCheckoutStatus('processing');
        
        try {
            // 1. Registrar Recibo en Caja
            const recibo = {
                empresa_id: empresa.id,
                usuario_id: user.id,
                cliente: 'Consumidor Final',
                monto: totals.total,
                itbis: totals.itbis,
                metodo_pago: paymentMethod,
                glosa: `Venta POS - ${cart.length} artículos`,
                items: cart.map(item => ({
                    id: item.id,
                    nombre: item.nombre,
                    cantidad: item.quantity,
                    precio: item.precioVenta,
                    itbis: item.gravado ? (item.precioVenta * 0.18) : 0
                }))
            };
            
            registrarRecibo(recibo);

            // 2. Ajustar Stock en Inventario
            cart.forEach(item => {
                if (item.tipo === 'Producto') {
                    ajustarStock(item.id, item.quantity, 'SALIDA');
                }
            });

            setCheckoutStatus('success');
            setTimeout(() => {
                clearCart();
                setCheckoutStatus('idle');
            }, 2000);

        } catch (error) {
            console.error('Checkout error:', error);
            setCheckoutStatus('error');
        }
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
            turnoActivo
        }}>
            {children}
        </POSContext.Provider>
    );
};
