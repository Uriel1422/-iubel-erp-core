import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../utils/api';

const PrestamosContext = createContext();

export const usePrestamos = () => useContext(PrestamosContext);

export const PrestamosProvider = ({ children }) => {
    const [prestamos, setPrestamos] = useState([]);
    const [loading, setLoading] = useState(false);

    const loadPrestamos = useCallback(async () => {
        setLoading(true);
        const data = await api.get('finanzas/prestamos');
        if (data && Array.isArray(data)) {
            setPrestamos(data);
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        loadPrestamos();
    }, [loadPrestamos]);

    // Generar Tabla de Amortización (Solo Preview Frontend)
    const generarAmortizacion = (monto, tasaAnual, meses, sistema = 'Frances') => {
        const tasaMensual = (tasaAnual / 100) / 12;
        let balance = parseFloat(monto);
        const tabla = [];

        if (sistema === 'Frances') {
            const cuota = (monto * tasaMensual) / (1 - Math.pow(1 + tasaMensual, -meses));
            for (let i = 1; i <= meses; i++) {
                const interes = balance * tasaMensual;
                const capital = cuota - interes;
                balance -= capital;
                tabla.push({
                    mes: i,
                    cuota: Math.round(cuota * 100) / 100,
                    interes: Math.round(interes * 100) / 100,
                    capital: Math.round(capital * 100) / 100,
                    balance: Math.max(0, Math.round(balance * 100) / 100)
                });
            }
        } else {
            const capitalFijo = monto / meses;
            for (let i = 1; i <= meses; i++) {
                const interes = balance * tasaMensual;
                const cuota = capitalFijo + interes;
                balance -= capitalFijo;
                tabla.push({
                    mes: i,
                    cuota: Math.round(cuota * 100) / 100,
                    interes: Math.round(interes * 100) / 100,
                    capital: Math.round(capitalFijo * 100) / 100,
                    balance: Math.max(0, Math.round(balance * 100) / 100)
                });
            }
        }

        return {
            tabla,
            cuotaPromedio: tabla.reduce((acc, curr) => acc + curr.cuota, 0) / meses,
            totalInteres: tabla.reduce((acc, curr) => acc + curr.interes, 0)
        };
    };

    const registrarPrestamo = async (datos) => {
        const result = await api.save('finanzas/prestamos', {
            cliente_id: datos.socioId,
            cliente_nombre: datos.socioNombre,
            monto: datos.monto,
            tasa_interes: datos.tasa,
            plazo_meses: datos.plazo,
            tipo_amortizacion: datos.sistema || 'Frances'
        });

        if (result.success) {
            await loadPrestamos(); // Refrescar lista
            return true;
        }
        throw new Error(result.error || 'Error al procesar el préstamo');
    };

    const obtenerCuotas = async (prestamoId) => {
        return await api.get(`finanzas/prestamos/${prestamoId}/cuotas`);
    };

    const pagarCuota = async (prestamoId, cuotaId, montoPagado) => {
        const result = await api.save(`finanzas/prestamos/${prestamoId}/pagar`, {
            cuota_id: cuotaId,
            monto_pagado: montoPagado
        });

        if (result.success) {
            await loadPrestamos(); // Refrescar balances y estados
            return true;
        }
        throw new Error(result.error || 'Error procesando el pago');
    };


    return (
        <PrestamosContext.Provider value={{
            prestamos,
            loading,
            generarAmortizacion,
            registrarPrestamo,
            obtenerCuotas,
            pagarCuota,
            refreshPrestamos: loadPrestamos
        }}>
            {children}
        </PrestamosContext.Provider>
    );
};
