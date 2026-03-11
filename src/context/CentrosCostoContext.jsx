import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../utils/api';

const CentrosCostoContext = createContext();
export const useCentrosCosto = () => useContext(CentrosCostoContext);

export const CentrosCostoProvider = ({ children }) => {
    const [centros, setCentros] = useState([]);

    useEffect(() => {
        const loadCentros = async () => {
            const data = await api.get('centros_costo');
            if (data && Array.isArray(data) && data.length > 0) {
                setCentros(data);
            } else {
                const defaultCentros = [
                    { id: 'ADM', codigo: 'ADM', nombre: 'Administración', color: '#2563eb', activo: true },
                    { id: 'VTA', codigo: 'VTA', nombre: 'Ventas', color: '#10b981', activo: true },
                    { id: 'OPE', codigo: 'OPE', nombre: 'Operaciones', color: '#f59e0b', activo: true },
                ];
                setCentros(defaultCentros);
                await api.save('centros_costo', defaultCentros);
            }
        };
        loadCentros();
    }, []);

    // Sincronizar con el servidor y localStorage al cambiar
    useEffect(() => {
        if (centros.length > 0) {
            api.save('centros_costo', centros);
        }
    }, [centros]);

    const crearCentro = (c) => {
        const id = c.codigo.toUpperCase().replace(/\s/g, '-');
        setCentros(prev => [...prev, { ...c, id, activo: true }]);
    };

    const toggleCentro = (id) => {
        setCentros(prev => prev.map(c => c.id === id ? { ...c, activo: !c.activo } : c));
    };

    const eliminarCentro = (id) => {
        setCentros(prev => prev.filter(c => c.id !== id));
    };

    return (
        <CentrosCostoContext.Provider value={{ centros, crearCentro, toggleCentro, eliminarCentro }}>
            {children}
        </CentrosCostoContext.Provider>
    );
};
