import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../utils/api';

const AhorrosContext = createContext();

export const useAhorros = () => useContext(AhorrosContext);

const defaultCuentas = [];

const defaultMovimientos = [];

export const AhorrosProvider = ({ children }) => {
    const [cuentas, setCuentas] = useState([]);
    const [movimientos, setMovimientos] = useState([]);

    useEffect(() => {
        const loadData = async () => {
            const cData = await api.get('cuentas_ahorro');
            const mData = await api.get('movimientos_ahorro');

            if (cData && Array.isArray(cData)) {
                setCuentas(cData);
            }
            if (mData && Array.isArray(mData)) {
                setMovimientos(mData);
            }
        };
        loadData();
    }, []);

    useEffect(() => {
        if (cuentas.length > 0) api.save('cuentas_ahorro', cuentas);
        if (movimientos.length > 0) api.save('movimientos_ahorro', movimientos);
    }, [cuentas, movimientos]);

    const abrirCuenta = (datos) => {
        const nueva = {
            ...datos,
            id: Date.now().toString(),
            numero: `${datos.tipo.substring(0, 3).toUpperCase()}-${datos.socioId}-${Math.floor(Math.random() * 1000)}`,
            balance: Number(datos.montoInicial) || 0,
            estado: 'Activa',
            fechaApertura: new Date().toISOString()
        };
        setCuentas(prev => [...prev, nueva]);

        if (Number(datos.montoInicial) > 0) {
            registrarMovimiento(nueva.id, 'Deposito', datos.montoInicial, 'Apertura de cuenta');
        }
        return nueva;
    };

    const registrarMovimiento = (cuentaId, tipo, monto, nota) => {
        const nuevoM = {
            id: Date.now().toString(),
            cuentaId,
            tipo,
            monto: Number(monto),
            fecha: new Date().toISOString(),
            nota
        };
        setMovimientos(prev => [...prev, nuevoM]);

        setCuentas(prev => prev.map(c => {
            if (c.id === cuentaId) {
                const nuevoBalance = tipo === 'Deposito' ? c.balance + Number(monto) : c.balance - Number(monto);
                return { ...c, balance: nuevoBalance };
            }
            return c;
        }));
    };

    const calcularIntereses = (cuentaId = null) => {
        if (cuentaId) {
            const cuenta = cuentas.find(c => c.id === cuentaId);
            if (!cuenta || cuenta.tasa <= 0) return 0;
            const intereses = (cuenta.balance * (cuenta.tasa / 100)) / 12;
            return Math.round(intereses * 100) / 100;
        } else {
            // Proceso masivo
            let total = 0;
            cuentas.forEach(c => {
                if (c.tasa > 0) {
                    const int = (c.balance * (c.tasa / 100)) / 12;
                    total += Math.round(int * 100) / 100;
                }
            });
            return total;
        }
    };

    return (
        <AhorrosContext.Provider value={{
            cuentas,
            movimientos,
            abrirCuenta,
            registrarMovimiento,
            calcularIntereses
        }}>
            {children}
        </AhorrosContext.Provider>
    );
};
