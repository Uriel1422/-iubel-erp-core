import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../utils/api';

const ContabilidadContext = createContext();

export const useContabilidad = () => {
    return useContext(ContabilidadContext);
};

export const ContabilidadProvider = ({ children }) => {
    const [asientos, setAsientos] = useState([]);
    const [hasLoaded, setHasLoaded] = useState(false);

    useEffect(() => {
        const loadAsientos = async () => {
            const data = await api.get('asientos');
            if (data && Array.isArray(data)) {
                setAsientos(data);
            }
            setHasLoaded(true);
        };
        loadAsientos();
    }, []);

    // Sincronizar con el servidor al cambiar
    useEffect(() => {
        if (hasLoaded) {
            // 🛡️ IUBEL SOVEREIGN GUARD: Empty Sync Protection
            if (asientos.length === 0) return;
            api.save('asientos', asientos);
        }
    }, [asientos, hasLoaded]);

    // Registra un nuevo asiento en el diario general
    // detalles: [{ cuentaId, debito, credito }]
    // origen: 'Facturacion', 'Manual', 'Compras', etc.
    const registrarAsiento = (descripcion, detalles, fecha = new Date().toISOString(), origen = 'Manual', referencia = '') => {
        // Validar partida doble
        const totalDebito = detalles.reduce((acc, curr) => acc + (Number(curr.debito) || 0), 0);
        const totalCredito = detalles.reduce((acc, curr) => acc + (Number(curr.credito) || 0), 0);

        // Permitir un margen pequeñito de diferencia por redondeos (.01)
        if (Math.abs(totalDebito - totalCredito) > 0.05) {
            throw new Error(`Asiento descuadrado. Débitos: ${totalDebito}, Créditos: ${totalCredito}`);
        }

        const nuevoAsiento = {
            id: Date.now().toString(),
            numero: `AS-${(asientos.length + 1).toString().padStart(5, '0')}`,
            fecha,
            descripcion,
            referencia,
            origen,
            detalles: detalles.filter(d => Number(d.debito) > 0 || Number(d.credito) > 0) // limpiar ceros
        };

        setAsientos(prev => [...prev, nuevoAsiento]);
        return nuevoAsiento;
    };

    const eliminarAsiento = (id) => {
        setAsientos(asientos.filter(a => a.id !== id));
    };

    const editarAsiento = (id, descripcion, detalles, fecha, referencia) => {
        const totalDebito = detalles.reduce((acc, curr) => acc + (Number(curr.debito) || 0), 0);
        const totalCredito = detalles.reduce((acc, curr) => acc + (Number(curr.credito) || 0), 0);
        if (Math.abs(totalDebito - totalCredito) > 0.05) {
            throw new Error(`Asiento descuadrado. Débitos: ${totalDebito}, Créditos: ${totalCredito}`);
        }
        setAsientos(prev => prev.map(a => a.id === id ? {
            ...a,
            descripcion,
            fecha,
            referencia,
            detalles: detalles.filter(d => Number(d.debito) > 0 || Number(d.credito) > 0)
        } : a));
    };

    return (
        <ContabilidadContext.Provider value={{
            asientos,
            registrarAsiento,
            eliminarAsiento,
            editarAsiento
        }}>
            {children}
        </ContabilidadContext.Provider>
    );
};
