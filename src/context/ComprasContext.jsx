import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../utils/api';
import { useContabilidad } from './ContabilidadContext';
import { useInventario } from './InventarioContext';

const ComprasContext = createContext();

export const useCompras = () => {
    return useContext(ComprasContext);
};

export const ComprasProvider = ({ children }) => {
    const { registrarAsiento, editarAsiento, eliminarAsiento } = useContabilidad();
    const { ajustarStock } = useInventario();

    const [compras, setCompras] = useState([]);
    const [ordenes, setOrdenes] = useState([]);
    const [hasLoaded, setHasLoaded] = useState(false);

    useEffect(() => {
        const loadComprasData = async () => {
            const dataCom = await api.get('compras');
            if (dataCom && Array.isArray(dataCom)) setCompras(dataCom);

            const dataOrd = await api.get('ordenes');
            if (dataOrd && Array.isArray(dataOrd)) setOrdenes(dataOrd);
            
            setHasLoaded(true);
        };
        loadComprasData();
    }, []);

    useEffect(() => {
        if (hasLoaded) {
            // 🛡️ PROTECCIÓN: No sincronizar si la lista está vacía (evita purgas)
            if (compras.length > 0) api.save('compras', compras);
        }
    }, [compras, hasLoaded]);

    useEffect(() => {
        if (hasLoaded) {
            // 🛡️ PROTECCIÓN: No sincronizar si la lista está vacía (evita purgas)
            if (ordenes.length > 0) api.save('ordenes', ordenes);
        }
    }, [ordenes, hasLoaded]);

    const registrarCompra = (nuevaCompra, detallesAsientoPersonalizado = null) => {
        const compraFinal = {
            ...nuevaCompra,
            id: Date.now().toString(),
            numeroInterno: `COM-${(compras.length + 1).toString().padStart(5, '0')}`,
            estado: nuevaCompra.condicion === 'Contado' ? 'Pagada' : 'Pendiente',
            fechaRegistro: new Date().toISOString()
        };

        // Asiento Contable
        let detallesAsiento = detallesAsientoPersonalizado;

        if (!detallesAsiento) {
            detallesAsiento = [];
            // Cuenta de Origen (Caja/Banco o CxP Proveedores)
            const cuentaPagoId = nuevaCompra.condicion === 'Contado' ? '110101' : '210101';

            // Crédito a la cuenta de Origen por el Total
            detallesAsiento.push({ cuentaId: cuentaPagoId, debito: 0, credito: nuevaCompra.total });

            // ITBIS Adelantado (Débito a Activo)
            if (nuevaCompra.itbis > 0) {
                detallesAsiento.push({ cuentaId: '110501', debito: nuevaCompra.itbis, credito: 0 }); // ITBIS por Adelantar (Activo)
            }

            // Débito a la cuenta de Gasto/Costo/Inventario por el Subtotal
            if (nuevaCompra.cuentaDestinoId) {
                detallesAsiento.push({ cuentaId: nuevaCompra.cuentaDestinoId, debito: nuevaCompra.subtotal, credito: 0 });
            } else if (nuevaCompra.articulos && nuevaCompra.articulos.length > 0) {
                let totalInventario = 0;
                nuevaCompra.articulos.forEach(item => {
                    totalInventario += (item.cantidad * item.costo);
                    ajustarStock(item.articuloId, item.cantidad, 'ENTRADA');
                });
                detallesAsiento.push({ cuentaId: '110401', debito: totalInventario, credito: 0 });
            }
        }

        let asientoGeneradoId = null;
        try {
            const nuevoAsiento = registrarAsiento(
                `Compra: NCF ${compraFinal.ncf} - Prov: ${compraFinal.proveedorNombre}`,
                detallesAsiento,
                nuevaCompra.fechaFactura || compraFinal.fechaRegistro,
                'Compras',
                compraFinal.numeroInterno
            );
            asientoGeneradoId = nuevoAsiento.id;
        } catch (e) {
            console.error("Error al generar asiento de compra:", e);
            alert("La compra se guardó pero hubo un error generando el asiento: " + e.message);
        }

        const compraConAsiento = { ...compraFinal, asientoId: asientoGeneradoId };
        setCompras(prev => [...prev, compraConAsiento]);

        return compraConAsiento;
    };

    const actualizarCompra = (id, dataActualizada) => {
        const compraAnterior = compras.find(c => c.id === id);
        if (!compraAnterior) return;

        // 1. Recalcular Asiento
        const detallesAsiento = [];
        const cuentaPagoId = dataActualizada.condicion === 'Contado' ? '110101' : '210101';

        detallesAsiento.push({ cuentaId: cuentaPagoId, debito: 0, credito: dataActualizada.total });

        if (dataActualizada.itbis > 0) {
            detallesAsiento.push({ cuentaId: '110501', debito: dataActualizada.itbis, credito: 0 });
        }

        if (dataActualizada.cuentaDestinoId) {
            detallesAsiento.push({ cuentaId: dataActualizada.cuentaDestinoId, debito: dataActualizada.subtotal, credito: 0 });
        } else if (compraAnterior.articulos) {
            // Si es una compra de inventario detallada, mantenemos la lógica anterior (simplificada aquí)
            let totalInventario = 0;
            compraAnterior.articulos.forEach(item => {
                totalInventario += (item.cantidad * item.costo);
            });
            detallesAsiento.push({ cuentaId: '110401', debito: totalInventario, credito: 0 });
        }

        // 2. Editar Asiento en Contabilidad
        if (compraAnterior.asientoId) {
            try {
                editarAsiento(
                    compraAnterior.asientoId,
                    `Compra (Editada): NCF ${dataActualizada.ncf} - Prov: ${dataActualizada.proveedorNombre}`,
                    detallesAsiento,
                    dataActualizada.fechaFactura || compraAnterior.fechaRegistro,
                    compraAnterior.numeroInterno
                );
            } catch (e) {
                console.error("Error al editar asiento:", e);
                alert("La compra se actualizó localmente pero el asiento dio error: " + e.message);
            }
        }

        // 3. Actualizar estado de compras
        setCompras(prev => prev.map(c => c.id === id ? {
            ...c,
            ...dataActualizada,
            estado: dataActualizada.condicion === 'Contado' ? 'Pagada' : 'Pendiente'
        } : c));
    };



    const eliminarCompra = (id) => {
        const compra = compras.find(c => c.id === id);
        if (!compra) return;

        // 1. Revertir Asiento
        if (compra.asientoId) {
            eliminarAsiento(compra.asientoId);
        }

        // 2. Revertir Inventario (Salida porque anulamos una entrada)
        if (compra.articulos) {
            compra.articulos.forEach(item => {
                ajustarStock(item.articuloId, item.cantidad, 'SALIDA');
            });
        }

        // 3. Eliminar Registro
        setCompras(compras.filter(c => c.id !== id));
    };

    return (
        <ComprasContext.Provider value={{
            compras,
            ordenes,
            registrarCompra,
            actualizarCompra,
            eliminarCompra,
            registrarOrden: (nuevaOrden) => {
                const ordenFinal = {
                    ...nuevaOrden,
                    id: Date.now().toString(),
                    numeroInterno: `ORD-${(ordenes.length + 1).toString().padStart(5, '0')}`,
                    estado: 'Pendiente',
                    fechaRegistro: new Date().toISOString()
                };
                setOrdenes(prev => [...prev, ordenFinal]);
                return ordenFinal;
            },
            cancelarOrden: (id) => {
                setOrdenes(prev => prev.map(o => o.id === id ? { ...o, estado: 'Cancelada' } : o));
            },
            convertirOrdenACompra: (ordenId, datosCompraExtra) => {
                const orden = ordenes.find(o => o.id === ordenId);
                if (!orden) return null;

                const compra = registrarCompra({
                    ...orden,
                    ...datosCompraExtra, // NCF, condicion, etc.
                    ordenOrigenId: ordenId
                });

                if (compra) {
                    setOrdenes(prev => prev.map(o => o.id === ordenId ? { ...o, estado: 'Convertida', compraId: compra.id } : o));
                }
                return compra;
            },
            registrarPagoCompra: (id, monto, cuentaBancoId = '110101') => {
                setCompras(prev => prev.map(c => {
                    if (c.id === id) {
                        const esPagoTotal = (monto >= c.total);
                        if (esPagoTotal) {
                            try {
                                const nombreProv = c.proveedor?.nombre || c.proveedorNombre || 'Proveedor';
                                registrarAsiento(
                                    `Recibo de Egreso: Pago Fac ${c.ncf} - ${nombreProv}`,
                                    [
                                        { cuentaId: '210101', debito: c.total, credito: 0 },
                                        { cuentaId: cuentaBancoId, debito: 0, credito: c.total }
                                    ],
                                    new Date().toISOString(),
                                    'Tesorería',
                                    c.numeroInterno
                                );
                            } catch (e) { console.error(e); }
                            return { ...c, estado: 'Pagada' };
                        }
                    }
                    return c;
                }));
            }
        }}>
            {children}
        </ComprasContext.Provider>
    );
};
