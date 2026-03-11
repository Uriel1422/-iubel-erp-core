import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../utils/api';

const BovedaContext = createContext();

export const useBoveda = () => useContext(BovedaContext);

export const BovedaProvider = ({ children }) => {
    const [balanceTotal, setBalanceTotal] = useState(0); 
    const [movimientos, setMovimientos] = useState([]);

    useEffect(() => {
        const loadBoveda = async () => {
            const data = await api.get('boveda_movimientos');
            if (data && Array.isArray(data)) {
                setMovimientos(data);
                const total = data.reduce((acc, m) => m.tipo === 'Entrada' ? acc + m.monto : acc - m.monto, 0);
                setBalanceTotal(total);
            }
        };
        loadBoveda();
    }, []);

    const registrarMovimiento = (tipo, monto, concepto, destino = 'Bóveda Central') => {
        const nuevo = {
            id: Date.now().toString(),
            fecha: new Date().toISOString(),
            tipo, // Entrada / Salida
            monto: Number(monto),
            concepto,
            destino
        };

        const nuevosMovimientos = [...movimientos, nuevo];
        setMovimientos(nuevosMovimientos);
        setBalanceTotal(prev => tipo === 'Entrada' ? prev + Number(monto) : prev - Number(monto));

        api.save('boveda_movimientos', nuevosMovimientos);
    };

    return (
        <BovedaContext.Provider value={{
            balanceTotal,
            movimientos,
            registrarMovimiento
        }}>
            {children}
        </BovedaContext.Provider>
    );
};
