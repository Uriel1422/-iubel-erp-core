import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../utils/api';

const NCFContext = createContext();

export const useNCF = () => useContext(NCFContext);

export const NCFProvider = ({ children }) => {
    const [rangos, setRangos] = useState([]);

    const [hasLoaded, setHasLoaded] = useState(false);

    useEffect(() => {
        const loadNCF = async () => {
            const data = await api.get('ncf_rangos');
            if (data && Array.isArray(data)) {
                setRangos(data);
            }
            setHasLoaded(true);
        };
        loadNCF();
    }, []);

    useEffect(() => {
        if (hasLoaded && rangos.length > 0) {
            api.save('ncf_rangos', rangos);
        }
    }, [rangos, hasLoaded]);

    const agregarRango = (nuevoRango) => {
        const rangoFull = {
            ...nuevoRango,
            id: Date.now().toString(),
            actual: nuevoRango.inicio,
            activo: true,
            fechaRegistro: new Date().toISOString()
        };
        // Desactivar otros del mismo tipo
        setRangos(prev => [
            ...prev.map(r => r.tipo === nuevoRango.tipo ? { ...r, activo: false } : r),
            rangoFull
        ]);
    };

    const eliminarRango = (id) => {
        setRangos(prev => prev.filter(r => r.id !== id));
    };

    const generarSiguienteNCF = (tipo) => {
        const rangoIdx = rangos.findIndex(r => r.tipo === tipo && r.activo);
        if (rangoIdx === -1) {
            throw new Error(`No hay un rango activo configurado para el tipo ${tipo}.`);
        }

        const rango = rangos[rangoIdx];
        if (Number(rango.actual) > Number(rango.fin)) {
            throw new Error(`Se ha agotado el rango de comprobantes para ${tipo}. Por favor registre uno nuevo.`);
        }

        const ncfFormateado = `${tipo}${rango.actual.toString().padStart(8, '0')}`;

        // Incrementar actual
        setRangos(prev => prev.map((r, i) =>
            i === rangoIdx ? { ...r, actual: Number(r.actual) + 1 } : r
        ));

        return ncfFormateado;
    };

    const [alertas, setAlertas] = useState([]);
    
    useEffect(() => {
        const calculateAlerts = () => {
            const newAlerts = rangos
                .filter(r => r.activo)
                .map(r => {
                    const total = Number(r.fin) - Number(r.inicio) + 1;
                    const usado = Number(r.actual) - Number(r.inicio);
                    const restante = Number(r.fin) - Number(r.actual) + 1;
                    const porcRestante = (restante / total) * 100;

                    if (restante <= 0) return { tipo: r.tipo, msg: 'AGOTADO', critico: true };
                    if (restante < 50 || porcRestante < 5) return { tipo: r.tipo, msg: `${restante} restantes`, critico: true };
                    if (restante < 100 || porcRestante < 10) return { tipo: r.tipo, msg: 'Próximo a vencer', critico: false };
                    return null;
                })
                .filter(Boolean);
            setAlertas(newAlerts);
        };
        calculateAlerts();
    }, [rangos]);

    return (
        <NCFContext.Provider value={{
            rangos,
            alertas,
            agregarRango,
            eliminarRango,
            generarSiguienteNCF
        }}>
            {children}
        </NCFContext.Provider>
    );
};
