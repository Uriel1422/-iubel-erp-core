import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../utils/api';

const SegmentacionContext = createContext();
export const useSegmentacion = () => useContext(SegmentacionContext);

const initialSegmentos = [
    { id: 1, nombre: 'Premium Elite', descripcion: 'Socios con > 5 años, saldo > RD$200k, al día', color: '#6366f1', criterios: { antiguedadMinAnios: 5, saldoMinimo: 200000, estadoCuenta: 'Al Día', edadMin: null, edadMax: null }, totalSocios: 142, beneficios: ['Tasa preferencial', 'Atención prioritaria', 'Línea de crédito automática'] },
    { id: 2, nombre: 'Consolidado', descripcion: 'Socios activos 2-5 años con buen historial', color: '#10b981', criterios: { antiguedadMinAnios: 2, saldoMinimo: 50000, estadoCuenta: 'Al Día', edadMin: null, edadMax: null }, totalSocios: 385, beneficios: ['Tasa estándar', 'Pre-aprobación de créditos', 'Descuento en servicios'] },
    { id: 3, nombre: 'En Formación', descripcion: 'Socios nuevos con menos de 2 años', color: '#f59e0b', criterios: { antiguedadMinAnios: 0, saldoMinimo: 0, estadoCuenta: 'Todos', edadMin: null, edadMax: null }, totalSocios: 263, beneficios: ['Orientación financiera', 'Crédito inicial', 'Programa de ahorro guiado'] },
    { id: 4, nombre: 'Juvenil', descripcion: 'Socios menores de 30 años', color: '#8b5cf6', criterios: { antiguedadMinAnios: 0, saldoMinimo: 0, estadoCuenta: 'Todos', edadMin: 18, edadMax: 30 }, totalSocios: 198, beneficios: ['Tasa reducida jóvenes', 'Mentoría financiera', 'Sorteos exclusivos'] },
    { id: 5, nombre: 'Recuperación', descripcion: 'Socios con cuotas vencidas', color: '#ef4444', criterios: { antiguedadMinAnios: null, saldoMinimo: null, estadoCuenta: 'Mora', edadMin: null, edadMax: null }, totalSocios: 114, beneficios: ['Plan de reestructuración', 'Asesoría crediticia'] },
];

const initialSociosSegmentados = [
    { socioId: 1001, nombre: 'Juan Pérez López', segmentoId: 1, puntuacion: 92, saldo: 285000, antiguedad: 7, riesgo: 'Bajo', ultimaActividad: '2026-03-01' },
    { socioId: 1002, nombre: 'María Santos Cruz', segmentoId: 2, puntuacion: 78, saldo: 85000, antiguedad: 3, riesgo: 'Bajo', ultimaActividad: '2026-02-28' },
    { socioId: 1003, nombre: 'Carlos Mejía Ureña', segmentoId: 3, puntuacion: 65, saldo: 32000, antiguedad: 1, riesgo: 'Medio', ultimaActividad: '2026-03-05' },
    { socioId: 1004, nombre: 'Ana Rodríguez Marte', segmentoId: 4, puntuacion: 71, saldo: 15000, antiguedad: 0.5, riesgo: 'Bajo', ultimaActividad: '2026-03-03' },
    { socioId: 1005, nombre: 'Roberto Núñez Díaz', segmentoId: 5, puntuacion: 35, saldo: 5000, antiguedad: 4, riesgo: 'Alto', ultimaActividad: '2025-12-15' },
];

export const SegmentacionProvider = ({ children }) => {
    const [segmentos, setSegmentos] = useState(initialSegmentos);
    const [sociosSegmentados, setSociosSegmentados] = useState(initialSociosSegmentados);

    useEffect(() => {
        const loadData = async () => {
            const data = await api.get('segmentacion');
            if (data && data.segmentos) {
                setSegmentos(data.segmentos);
                setSociosSegmentados(data.sociosSegmentados || initialSociosSegmentados);
            }
        };
        loadData();
    }, []);

    const save = (s, ss) => api.save('segmentacion', { segmentos: s, sociosSegmentados: ss });

    const addSegmento = (seg) => {
        const nuevo = { ...seg, id: Date.now(), totalSocios: 0 };
        const updated = [...segmentos, nuevo];
        setSegmentos(updated);
        save(updated, sociosSegmentados);
    };

    const updateSegmento = (id, data) => {
        const updated = segmentos.map(s => s.id === id ? { ...s, ...data } : s);
        setSegmentos(updated);
        save(updated, sociosSegmentados);
    };

    const reclasificarSocio = (socioId, newSegmentoId) => {
        const updated = sociosSegmentados.map(s => s.socioId === socioId ? { ...s, segmentoId: newSegmentoId } : s);
        setSociosSegmentados(updated);
        save(segmentos, updated);
    };

    const getSociosBySegmento = (segmentoId) => sociosSegmentados.filter(s => s.segmentoId === segmentoId);

    return (
        <SegmentacionContext.Provider value={{ segmentos, sociosSegmentados, addSegmento, updateSegmento, reclasificarSocio, getSociosBySegmento }}>
            {children}
        </SegmentacionContext.Provider>
    );
};
