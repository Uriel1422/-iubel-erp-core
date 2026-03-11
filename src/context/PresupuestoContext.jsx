import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../utils/api';
import { useCuentas } from './CuentasContext';

const PresupuestoContext = createContext();

export const usePresupuesto = () => useContext(PresupuestoContext);

export const PresupuestoProvider = ({ children }) => {
    // Estructura: { [periodo]: { [cuentaId]: monto } }
    // Ejemplo: { '2024-03': { '4101': 500000 } }
    const [presupuestos, setPresupuestos] = useState({});

    useEffect(() => {
        const loadPresupuestos = async () => {
            const data = await api.get('presupuestos');
            if (data && !Array.isArray(data) && Object.keys(data).length > 0) {
                setPresupuestos(data);
            }
        };
        loadPresupuestos();
    }, []);

    useEffect(() => {
        api.save('presupuestos', presupuestos);
    }, [presupuestos]);

    const guardarPresupuesto = (periodo, cuentaId, monto) => {
        setPresupuestos(prev => ({
            ...prev,
            [periodo]: {
                ...(prev[periodo] || {}),
                [cuentaId]: parseFloat(monto) || 0
            }
        }));
    };

    const obtenerPresupuesto = (periodo, cuentaId) => {
        return presupuestos[periodo]?.[cuentaId] || 0;
    };

    const obtenerPresupuestoPeriodo = (periodo) => {
        return presupuestos[periodo] || {};
    };

    return (
        <PresupuestoContext.Provider value={{
            presupuestos,
            guardarPresupuesto,
            obtenerPresupuesto,
            obtenerPresupuestoPeriodo
        }}>
            {children}
        </PresupuestoContext.Provider>
    );
};
