import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../utils/api';

const CobrosContext = createContext();
export const useCobros = () => useContext(CobrosContext);

const initialCobros = [
    { id: 1, codigo: 'COB-001', socioId: 1001, socioNombre: 'Juan Pérez López', tipo: 'Cuota Préstamo', concepto: 'Préstamo PRE-2024-0045', monto: 8500, periodicidad: 'Mensual', diaDebito: 5, fechaInicio: '2024-06-05', fechaFin: '2027-06-05', estado: 'Activo', formaPago: 'Débito Automático', cuentaDebito: '100001', ultimoCobro: '2026-03-05', proximoCobro: '2026-04-05' },
    { id: 2, codigo: 'COB-002', socioId: 1002, socioNombre: 'María Santos Cruz', tipo: 'Ahorro Navideño', concepto: 'Plan Navidad 2026', monto: 2000, periodicidad: 'Mensual', diaDebito: 15, fechaInicio: '2026-01-15', fechaFin: '2026-12-15', estado: 'Activo', formaPago: 'Descuento Nómina', cuentaDebito: '', ultimoCobro: '2026-03-15', proximoCobro: '2026-04-15' },
    { id: 3, codigo: 'COB-003', socioId: 1003, socioNombre: 'Carlos Mejía Ureña', tipo: 'Aportación', concepto: 'Aportación mensual obligatoria', monto: 1000, periodicidad: 'Mensual', diaDebito: 1, fechaInicio: '2023-01-01', fechaFin: null, estado: 'Activo', formaPago: 'Débito Automático', cuentaDebito: '100003', ultimoCobro: '2026-03-01', proximoCobro: '2026-04-01' },
];

const initialDeducciones = [
    { id: 1, empleadoId: 2, empleadoNombre: 'Carlos Méndez', tipo: 'Préstamo Personal', concepto: 'Préstamo EMP-2025-012', monto: 4200, periodicidad: 'Quincenal', fechaInicio: '2025-09-01', fechaFin: '2026-09-01', estado: 'Activo', acumulado: 25200 },
    { id: 2, empleadoId: 3, empleadoNombre: 'María Torres', tipo: 'Seguro Médico', concepto: 'ARS Salud Segura', monto: 1800, periodicidad: 'Mensual', fechaInicio: '2022-06-01', fechaFin: null, estado: 'Activo', acumulado: 75600 },
];

const initialHistorialCobros = [
    { id: 1, cobroId: 1, fecha: '2026-03-05', monto: 8500, estado: 'Exitoso', referencia: 'TRF-850-001', notas: '' },
    { id: 2, cobroId: 2, fecha: '2026-03-15', monto: 2000, estado: 'Exitoso', referencia: 'NOM-200-015', notas: '' },
    { id: 3, cobroId: 1, fecha: '2026-02-05', monto: 8500, estado: 'Exitoso', referencia: 'TRF-849-001', notas: '' },
];

export const CobrosProvider = ({ children }) => {
    const [cobros, setCobros] = useState(initialCobros);
    const [deducciones, setDeducciones] = useState(initialDeducciones);
    const [historial, setHistorial] = useState(initialHistorialCobros);

    useEffect(() => {
        const loadData = async () => {
            const data = await api.get('cobros_deducciones');
            if (data && data.cobros) {
                setCobros(data.cobros);
                setDeducciones(data.deducciones || initialDeducciones);
                setHistorial(data.historial || initialHistorialCobros);
            }
        };
        loadData();
    }, []);

    const save = (c, d, h) => api.save('cobros_deducciones', { cobros: c, deducciones: d, historial: h });

    const addCobro = (cobro) => {
        const codigo = `COB-${String(cobros.length + 1).padStart(3, '0')}`;
        const nuevo = { ...cobro, id: Date.now(), codigo, estado: 'Activo' };
        const updated = [...cobros, nuevo];
        setCobros(updated);
        save(updated, deducciones, historial);
    };

    const updateCobro = (id, data) => {
        const updated = cobros.map(c => c.id === id ? { ...c, ...data } : c);
        setCobros(updated);
        save(updated, deducciones, historial);
    };

    const addDeduccion = (ded) => {
        const nuevo = { ...ded, id: Date.now(), acumulado: 0, estado: 'Activo' };
        const updated = [...deducciones, nuevo];
        setDeducciones(updated);
        save(cobros, updated, historial);
    };

    const procesarCobros = () => {
        const hoy = new Date().toISOString().split('T')[0];
        const nuevosHistorial = cobros
            .filter(c => c.estado === 'Activo' && c.proximoCobro === hoy)
            .map(c => ({ id: Date.now() + Math.random(), cobroId: c.id, fecha: hoy, monto: c.monto, estado: 'Exitoso', referencia: `PRO-${Date.now()}`, notas: 'Procesado automático' }));
        const updated = [...historial, ...nuevosHistorial];
        setHistorial(updated);
        save(cobros, deducciones, updated);
        return nuevosHistorial.length;
    };

    return (
        <CobrosContext.Provider value={{ cobros, deducciones, historial, addCobro, updateCobro, addDeduccion, procesarCobros }}>
            {children}
        </CobrosContext.Provider>
    );
};
