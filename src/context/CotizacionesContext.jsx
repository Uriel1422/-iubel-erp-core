import React, { createContext, useContext, useState, useEffect } from 'react';
import { useFacturacion } from './FacturacionContext';
import { api } from '../utils/api';

const CotizacionesContext = createContext();

export const useCotizaciones = () => useContext(CotizacionesContext);

export const CotizacionesProvider = ({ children }) => {
    const { guardarFactura } = useFacturacion();
    const [cotizaciones, setCotizaciones] = useState([]);

    useEffect(() => {
        const loadCotizaciones = async () => {
            const data = await api.get('cotizaciones');
            if (data && Array.isArray(data)) {
                setCotizaciones(data);
            }
        };
        loadCotizaciones();
    }, []);

    useEffect(() => {
        if (cotizaciones.length > 0) {
            api.save('cotizaciones', cotizaciones);
        }
    }, [cotizaciones]);

    const agregarCotizacion = (cotizacion) => {
        const nueva = {
            ...cotizacion,
            id: Date.now().toString(),
            fecha: new Date().toISOString(),
            numero: `COT-${(cotizaciones.length + 1).toString().padStart(4, '0')}`,
            estado: 'Pendiente'
        };
        setCotizaciones([...cotizaciones, nueva]);
    };

    const eliminarCotizacion = (id) => {
        setCotizaciones(cotizaciones.filter(c => c.id !== id));
    };

    const facturarCotizacion = (id) => {
        const cotizacion = cotizaciones.find(c => c.id === id);
        if (!cotizacion || cotizacion.estado === 'Facturada') return;

        try {
            guardarFactura({
                ...cotizacion,
                fecha: new Date().toISOString(),
                condicion: 'Crédito', // Por defecto a crédito para facturar cotizaciones
            }, cotizacion.items);

            setCotizaciones(prev => prev.map(c =>
                c.id === id ? { ...c, estado: 'Facturada' } : c
            ));
        } catch (e) {
            console.error("Error al facturar cotización:", e);
        }
    };

    return (
        <CotizacionesContext.Provider value={{
            cotizaciones,
            agregarCotizacion,
            eliminarCotizacion,
            facturarCotizacion
        }}>
            {children}
        </CotizacionesContext.Provider>
    );
};
