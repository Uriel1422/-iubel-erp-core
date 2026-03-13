import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../utils/api';
import { useContabilidad } from './ContabilidadContext';
import { useInventario } from './InventarioContext';
import { useNCF } from './NCFContext';

const FacturacionContext = createContext();

export const useFacturacion = () => {
    return useContext(FacturacionContext);
};

export const FacturacionProvider = ({ children }) => {
    const { registrarAsiento, eliminarAsiento } = useContabilidad();
    const { ajustarStock } = useInventario();
    const { generarSiguienteNCF } = useNCF();

    const [facturas, setFacturas] = useState([]);
    const [hasLoaded, setHasLoaded] = useState(false);

    useEffect(() => {
        const loadFacturacion = async () => {
            const dataFac = await api.get('facturas');
            if (dataFac && Array.isArray(dataFac)) {
                setFacturas(dataFac);
            }
            setHasLoaded(true);
        };
        loadFacturacion();
    }, []);

    useEffect(() => {
        if (hasLoaded) {
            // 🛡️ PROTECCIÓN: No sincronizar si la lista está vacía (evita purgas por fallos de red)
            // Solo se permite si el usuario explícitamente borra todo (futuro)
            if (facturas.length === 0) return; 
            api.save('facturas', facturas);
        }
    }, [facturas, hasLoaded]);

    const guardarFactura = (nuevaFactura, detallesCarrito) => {
        // 1. Generar NCF si aplica utilizando el NCFContext
        let ncfFinal = nuevaFactura.ncf;
        if (nuevaFactura.tipoComprobante) {
            try {
                ncfFinal = generarSiguienteNCF(nuevaFactura.tipoComprobante);
            } catch (e) {
                alert(e.message);
                throw e; // Detener guardado si no hay NCF
            }
        }

        const facturaFinal = {
            ...nuevaFactura,
            id: Date.now().toString(),
            numeroInterno: `FAC-${(facturas.length + 1).toString().padStart(5, '0')}`,
            ncf: ncfFinal,
            estado: nuevaFactura.condicion === 'Contado' ? 'Pagada' : 'Pendiente',
            fecha: nuevaFactura.fecha || new Date().toISOString(),
            // Guardar info de moneda para referencia
            monedaId: nuevaFactura.monedaId || '1',
            tasa: nuevaFactura.tasa || 1,
            // Valores en DOP para reportes fiscales
            subtotalDOP: (nuevaFactura.subtotal || 0) * (nuevaFactura.tasa || 1),
            itbisDOP: (nuevaFactura.itbis || 0) * (nuevaFactura.tasa || 1),
            totalDOP: (nuevaFactura.total || 0) * (nuevaFactura.tasa || 1)
        };

        // Factura guardada provisional (se actualizará con asientoId luego)

        // 2. Descontar Inventario
        detallesCarrito.forEach(item => {
            ajustarStock(item.articulo.id, item.cantidad, 'SALIDA');
        });

        // 3. Generar Asiento Contable Automático (Convertido a DOP)
        const tasa = Number(facturaFinal.tasa) || 1;

        let subtotalBase = 0;
        let totalItbisBase = 0;

        const detallesAsiento = [];

        // Agrupar ingresos y costos por cuenta configurada en los artículos
        const ingresosPorCuenta = {};
        const costoVentasPorCuenta = {};
        const inventarioPorCuenta = {};

        detallesCarrito.forEach(item => {
            const art = item.articulo;
            const lineaTotalBase = (item.cantidad * item.precio) * tasa;
            const lineaItbisBase = art.gravado ? lineaTotalBase * 0.18 : 0;
            const lineaCostoBase = (item.cantidad * art.costo); // El costo usualmente está en moneda base

            subtotalBase += lineaTotalBase;
            totalItbisBase += lineaItbisBase;

            // Agrupar Ventas (Crédito)
            if (art.cuentaIngresoId) {
                ingresosPorCuenta[art.cuentaIngresoId] = (ingresosPorCuenta[art.cuentaIngresoId] || 0) + lineaTotalBase;
            }

            // Agrupar Costos (Débito a Costo, Crédito a Inventario) -- Solo para Productos
            if (art.tipo === 'Producto' && art.cuentaCostoId && art.cuentaInventarioId) {
                costoVentasPorCuenta[art.cuentaCostoId] = (costoVentasPorCuenta[art.cuentaCostoId] || 0) + lineaCostoBase;
                inventarioPorCuenta[art.cuentaInventarioId] = (inventarioPorCuenta[art.cuentaInventarioId] || 0) + lineaCostoBase;
            }
        });

        const totalFacturaBase = subtotalBase + totalItbisBase;

        // Cuenta destino (Efectivo/Banco vs Cuentas x Cobrar)
        const cuentaCobroId = nuevaFactura.condicion === 'Contado' ? '110101' : '110201'; // Caja o CxC Clientes

        // Asiento de Venta
        // Débito a Caja/CxC
        detallesAsiento.push({ cuentaId: cuentaCobroId, debito: totalFacturaBase, credito: 0, cuentaCodigo: cuentaCobroId });

        // Crédito a ITBIS por Pagar (210301)
        if (totalItbisBase > 0) {
            detallesAsiento.push({ cuentaId: '210301', debito: 0, credito: totalItbisBase, cuentaCodigo: '210301' });
        }

        // Crédito a Ventas/Ingresos (Bruto)
        Object.keys(ingresosPorCuenta).forEach(ctaId => {
            detallesAsiento.push({ cuentaId: ctaId, debito: 0, credito: ingresosPorCuenta[ctaId], cuentaCodigo: ctaId });
        });

        // Débito a Descuentos en Ventas (4103)
        if (nuevaFactura.descuento > 0) {
            detallesAsiento.push({ cuentaId: '4103', debito: nuevaFactura.descuento * tasa, credito: 0, cuentaCodigo: '4103' });
        }

        // Asiento de Costo (Débito Costo, Crédito Inventario)
        Object.keys(costoVentasPorCuenta).forEach(ctaId => {
            detallesAsiento.push({ cuentaId: ctaId, debito: costoVentasPorCuenta[ctaId], credito: 0, cuentaCodigo: ctaId });
        });

        Object.keys(inventarioPorCuenta).forEach(ctaId => {
            detallesAsiento.push({ cuentaId: ctaId, debito: 0, credito: inventarioPorCuenta[ctaId], cuentaCodigo: ctaId });
        });

        // Registrar el asiento
        let asientoGeneradoId = null;
        try {
            const descMoneda = tasa !== 1 ? ` (Moneda Ext. tasa ${tasa})` : '';
            const nuevoAsiento = registrarAsiento(
                `Venta: Fac ${facturaFinal.numeroInterno} - Cliente: ${facturaFinal.clienteNombre}${descMoneda}`,
                detallesAsiento,
                facturaFinal.fecha,
                'Facturación',
                facturaFinal.numeroInterno
            );
            asientoGeneradoId = nuevoAsiento.id;
        } catch (e) {
            console.error("Error al generar asiento de factura:", e);
            alert("La factura se guardó pero hubo un error generando el asiento: " + e.message);
        }

        const facturaConAsiento = { ...facturaFinal, asientoId: asientoGeneradoId, detalles: detallesCarrito };
        setFacturas(prev => [...prev, facturaConAsiento]);

        return facturaConAsiento;
    };

    const eliminarFactura = (id) => {
        const factura = facturas.find(f => f.id === id);
        if (!factura) return;

        // 1. Revertir Asiento Contable Automático
        if (factura.asientoId) {
            eliminarAsiento(factura.asientoId);
        }

        // 2. Revertir Inventario (Entrada por devolución/anulación)
        if (factura.detalles) {
            factura.detalles.forEach(item => {
                ajustarStock(item.articulo.id, item.cantidad, 'ENTRADA');
            });
        }

        // 3. Eliminar Registro
        setFacturas(facturas.filter(f => f.id !== id));
    };

    return (
        <FacturacionContext.Provider value={{
            facturas,
            guardarFactura,
            eliminarFactura,
            registrarPagoFactura: (id, monto, cuentaBancoId = '110101') => {
                setFacturas(prev => prev.map(f => {
                    if (f.id === id) {
                        const esPagoTotal = (monto >= f.total);
                        if (esPagoTotal) {
                            try {
                                const nombreCliente = f.cliente?.nombre || f.clienteNombre || 'Cliente';
                                registrarAsiento(
                                    `Recibo de Ingreso: Pago Fac ${f.numeroInterno} - ${nombreCliente}`,
                                    [
                                        { cuentaId: cuentaBancoId, debito: f.total * (f.tasa || 1), credito: 0 },
                                        { cuentaId: '110201', debito: 0, credito: f.total * (f.tasa || 1) }
                                    ],
                                    new Date().toISOString(),
                                    'Tesorería',
                                    f.numeroInterno
                                );
                            } catch (e) { console.error(e); }
                            return { ...f, estado: 'Pagada' };
                        }
                    }
                    return f;
                }));
            }
        }}>
            {children}
        </FacturacionContext.Provider>
    );
};

export default FacturacionContext;
