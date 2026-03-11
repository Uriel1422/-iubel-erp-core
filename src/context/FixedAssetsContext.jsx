import React, { createContext, useContext, useState, useEffect } from 'react';
import { useContabilidad } from './ContabilidadContext';
import { api } from '../utils/api';

const FixedAssetsContext = createContext();

export const useFixedAssets = () => useContext(FixedAssetsContext);

export const FixedAssetsProvider = ({ children }) => {
    const { registrarAsiento } = useContabilidad();
    const [activos, setActivos] = useState([]);

    useEffect(() => {
        const loadAssets = async () => {
            const data = await api.get('activos_fijos');
            if (data && Array.isArray(data)) {
                setActivos(data);
            }
        };
        loadAssets();
    }, []);

    useEffect(() => {
        if (activos.length > 0) {
            api.save('activos_fijos', activos);
        }
    }, [activos]);

    const agregarActivo = (activo) => {
        const nuevo = {
            ...activo,
            id: Date.now().toString(),
            fechaRegistro: new Date().toISOString(),
            residual: activo.valor - (activo.depreciacionAcumulada || 0)
        };
        setActivos(prev => [...prev, nuevo]);
    };

    const eliminarActivo = (id) => {
        setActivos(activos.filter(a => a.id !== id));
    };

    const procesarDepreciacionMensual = (fecha) => {
        const nuevosActivos = activos.map(activo => {
            // Lógica DGII RD:
            // Cat 1: 5% (Edificaciones)
            // Cat 2: 25% (Muebles, Equipos Oficina/Cómputo, Vehículos)
            // Cat 3: 15% (Otros)
            let tasaAnual = 0.15; // Default Cat 3
            if (activo.tipo === 'Edificaciones') tasaAnual = 0.05;
            else if (['Mobiliario', 'Vehiculos', 'Tecnologia'].includes(activo.tipo)) tasaAnual = 0.25;

            const cuotaMensual = (activo.valor * tasaAnual) / 12;
            
            if (activo.residual <= (activo.valorRescate || 0)) return activo;

            const depreciacionCouta = Math.min(cuotaMensual, activo.residual - (activo.valorRescate || 0));
            const nuevaAcumulada = (activo.depreciacionAcumulada || 0) + depreciacionCouta;

            // Generar asiento contable
            const detalles = [
                { cuentaId: activo.cuentaGastoDepreciacionId || '6102', debito: depreciacionCouta, credito: 0 },
                { cuentaId: activo.cuentaDepreciacionAcumuladaId || '120101', debito: 0, credito: depreciacionCouta }
            ];

            try {
                registrarAsiento(
                    `Depreciación Mensual Cat: ${activo.tipo} - ${activo.nombre} - ${fecha}`,
                    detalles,
                    new Date().toISOString(),
                    'Activos Fijos',
                    `DEP-${activo.id}-${Date.now()}`
                );
            } catch (e) {
                console.error("Error asientando depreciación:", e);
            }

            return {
                ...activo,
                depreciacionAcumulada: nuevaAcumulada,
                residual: activo.valor - nuevaAcumulada
            };
        });

        setActivos(nuevosActivos);
    };

    return (
        <FixedAssetsContext.Provider value={{
            activos,
            agregarActivo,
            procesarDepreciacionMensual,
            eliminarActivo
        }}>
            {children}
        </FixedAssetsContext.Provider>
    );
};
