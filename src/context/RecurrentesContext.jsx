import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../utils/api';

const RecurrentesContext = createContext();
export const useRecurrentes = () => useContext(RecurrentesContext);

export const RecurrentesProvider = ({ children }) => {
    const [plantillas, setPlantillas] = useState([]);

    useEffect(() => {
        const loadRecurrentes = async () => {
            const data = await api.get('recurrentes');
            if (data && Array.isArray(data)) {
                setPlantillas(data);
            }
        };
        loadRecurrentes();
    }, []);

    useEffect(() => {
        if (plantillas.length > 0) {
            api.save('recurrentes', plantillas);
        }
    }, [plantillas]);

    const crearPlantilla = (p) => {
        setPlantillas(prev => [...prev, {
            ...p,
            id: Date.now().toString(),
            fechaCreacion: new Date().toISOString(),
            activa: true,
            vecesEjecutada: 0
        }]);
    };

    const togglePlantilla = (id) => {
        setPlantillas(prev => prev.map(p => p.id === id ? { ...p, activa: !p.activa } : p));
    };

    const eliminarPlantilla = (id) => {
        setPlantillas(prev => prev.filter(p => p.id !== id));
    };

    const marcarEjecucion = (id) => {
        setPlantillas(prev => prev.map(p => p.id === id
            ? { ...p, vecesEjecutada: p.vecesEjecutada + 1, ultimaEjecucion: new Date().toISOString() }
            : p
        ));
    };

    return (
        <RecurrentesContext.Provider value={{ plantillas, crearPlantilla, togglePlantilla, eliminarPlantilla, marcarEjecucion }}>
            {children}
        </RecurrentesContext.Provider>
    );
};
