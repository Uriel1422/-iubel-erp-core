import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../utils/api';

const MonedaContext = createContext();

export const useMoneda = () => useContext(MonedaContext);

export const MonedaProvider = ({ children }) => {
    const [monedas, setMonedas] = useState([]);

    useEffect(() => {
        const loadMonedas = async () => {
            const data = await api.get('monedas');
            if (data && Array.isArray(data) && data.length > 0) {
                setMonedas(data);
            } else {
                const defaultCurrencies = [
                    { id: '1', nombre: 'Pesos Dominicanos', simbolo: 'RD$', codigo: 'DOP', tasa: 1, esBase: true },
                    { id: '2', nombre: 'Dólares Estadounidenses', simbolo: 'US$', codigo: 'USD', tasa: 58.50, esBase: false },
                    { id: '3', nombre: 'Euros', simbolo: '€', codigo: 'EUR', tasa: 63.20, esBase: false }
                ];
                setMonedas(defaultCurrencies);
                await api.save('monedas', defaultCurrencies);
            }
        };
        loadMonedas();
    }, []);

    useEffect(() => {
        if (monedas.length > 0) {
            api.save('monedas', monedas);
        }
    }, [monedas]);

    const updateTasa = (id, nuevaTasa) => {
        setMonedas(monedas.map(m => m.id === id ? { ...m, tasa: Number(nuevaTasa) } : m));
    };

    const convertToBase = (amount, monedaId) => {
        const moneda = monedas.find(m => m.id === monedaId);
        if (!moneda) return amount;
        return amount * moneda.tasa;
    };

    const convertFromBase = (amount, targetMonedaId) => {
        const moneda = monedas.find(m => m.id === targetMonedaId);
        if (!moneda || moneda.tasa === 0) return amount;
        return amount / moneda.tasa;
    };

    return (
        <MonedaContext.Provider value={{
            monedas,
            updateTasa,
            convertToBase,
            convertFromBase
        }}>
            {children}
        </MonedaContext.Provider>
    );
};
