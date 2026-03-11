import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../utils/api';

const ControlInternoContext = createContext();
export const useControlInterno = () => useContext(ControlInternoContext);

const initialHallazgos = [
    { id: 1, numero: 'HLZ-2026-001', titulo: 'Falta de conciliación bancaria mensual', area: 'Tesorería', nivelRiesgo: 'Alto', tipo: 'Operacional', descripcion: 'No se realizó la conciliación bancaria del mes de diciembre 2025', recomendacion: 'Implementar proceso de conciliación bancaria mensual obligatoria', responsable: 'Gerente de Tesorería', fechaDeteccion: '2026-01-15', fechaLimite: '2026-02-15', estado: 'En Proceso', evidencia: '' },
    { id: 2, numero: 'HLZ-2026-002', titulo: 'Préstamos sin garantías registradas', area: 'Crédito', nivelRiesgo: 'Medio', tipo: 'Crediticio', descripcion: '5 expedientes de préstamo no tienen garantías documentadas en el sistema', recomendacion: 'Actualizar expedientes de préstamo con documentación de garantías', responsable: 'Oficial de Crédito', fechaDeteccion: '2026-02-01', fechaLimite: '2026-03-01', estado: 'Pendiente', evidencia: '' },
];

const initialAuditorias = [
    { id: 1, numero: 'AUD-2026-001', tipo: 'Interna', alcance: 'Área de Crédito y Cobranza', auditor: 'Comité de Auditoría', fechaInicio: '2026-01-10', fechaFin: '2026-01-20', estado: 'Completada', hallazgos: 3, observaciones: 'Proceso de aprobación de créditos requiere mejoras' },
    { id: 2, numero: 'AUD-2026-002', tipo: 'Externa', alcance: 'Estados Financieros 2025', auditor: 'KPMG República Dominicana', fechaInicio: '2026-03-01', fechaFin: '2026-04-30', estado: 'En Proceso', hallazgos: 0, observaciones: '' },
];

const initialRiesgos = [
    { id: 1, nombre: 'Riesgo de Liquidez', categoria: 'Financiero', probabilidad: 'Media', impacto: 'Alto', nivelRiesgo: 'Alto', mitigacion: 'Mantener reservas de liquidez mínimas del 15%', responsable: 'Gerencia General', ultimaRevision: '2026-02-01', estado: 'Monitoreado' },
    { id: 2, nombre: 'Riesgo de Crédito', categoria: 'Crediticio', probabilidad: 'Alta', impacto: 'Alto', nivelRiesgo: 'Crítico', mitigacion: 'Implementar scoring crediticio y análisis de capacidad de pago', responsable: 'Comité de Crédito', ultimaRevision: '2026-02-15', estado: 'En Mitigación' },
    { id: 3, nombre: 'Riesgo Cibernético', categoria: 'Tecnológico', probabilidad: 'Baja', impacto: 'Alto', nivelRiesgo: 'Medio', mitigacion: 'Actualización anual de sistemas de seguridad y backups', responsable: 'IT', ultimaRevision: '2026-01-20', estado: 'Monitoreado' },
];

const initialAprobaciones = [
    { id: 1, ticketId: 'REQ-2026-001', maker: 'Pedro Perez (Oficial de Negocios)',  modulo: 'Préstamos', operacion: 'Aprobación Excepción de Crédito', detalleAntes: 'Score Requerido: 650', detalleDespues: 'Score Excepción: 620', montoImpacto: 1500000, fechaSolicitud: new Date().toISOString(), estado: 'Pendiente', justificacion: 'Cliente con garantías líquidas al 100%' },
    { id: 2, ticketId: 'REQ-2026-002', maker: 'Maria Garcia (Tesorera)',  modulo: 'Configuración Core', operacion: 'Cambio Tasa Base Hipotecaria', detalleAntes: 'Tasa: 12.5%', detalleDespues: 'Tasa: 11.5%', montoImpacto: 0, fechaSolicitud: new Date(Date.now() - 86400000).toISOString(), estado: 'Pendiente', justificacion: 'Ajuste por reducción de la tasa monetaria del Banco Central' }
];

export const ControlInternoProvider = ({ children }) => {
    const [hallazgos, setHallazgos] = useState(initialHallazgos);
    const [auditorias, setAuditorias] = useState(initialAuditorias);
    const [riesgos, setRiesgos] = useState(initialRiesgos);
    const [aprobaciones, setAprobaciones] = useState(initialAprobaciones);

    useEffect(() => {
        const loadData = async () => {
            const data = await api.get('control_interno');
            if (data && data.hallazgos) {
                setHallazgos(data.hallazgos);
                setAuditorias(data.auditorias || initialAuditorias);
                setRiesgos(data.riesgos || initialRiesgos);
            }
        };
        loadData();
    }, []);

    const save = (h, a, r, ap = aprobaciones) => api.save('control_interno', { hallazgos: h, auditorias: a, riesgos: r, aprobaciones: ap });

    const addHallazgo = (hallazgo) => {
        const num = `HLZ-${new Date().getFullYear()}-${String(hallazgos.length + 1).padStart(3, '0')}`;
        const nuevo = { ...hallazgo, id: Date.now(), numero: num, estado: 'Pendiente', fechaDeteccion: new Date().toISOString().split('T')[0] };
        const updated = [...hallazgos, nuevo];
        setHallazgos(updated);
        save(updated, auditorias, riesgos);
    };

    const updateHallazgo = (id, data) => {
        const updated = hallazgos.map(h => h.id === id ? { ...h, ...data } : h);
        setHallazgos(updated);
        save(updated, auditorias, riesgos);
    };

    const addAuditoria = (audit) => {
        const num = `AUD-${new Date().getFullYear()}-${String(auditorias.length + 1).padStart(3, '0')}`;
        const nueva = { ...audit, id: Date.now(), numero: num, estado: 'Planificada', hallazgos: 0 };
        const updated = [...auditorias, nueva];
        setAuditorias(updated);
        save(hallazgos, updated, riesgos);
    };

    const addRiesgo = (riesgo) => {
        const nuevo = { ...riesgo, id: Date.now(), ultimaRevision: new Date().toISOString().split('T')[0] };
        const updated = [...riesgos, nuevo];
        setRiesgos(updated);
        save(hallazgos, auditorias, updated);
    };

    const updateRiesgo = (id, data) => {
        const updated = riesgos.map(r => r.id === id ? { ...r, ...data } : r);
        setRiesgos(updated);
        save(hallazgos, auditorias, updated);
    };

    // --- Maker-Checker Funciones ---
    const probarPeticion = (id, comentario, esAprobado) => {
        const updated = aprobaciones.map(a => 
            a.id === id ? { ...a, estado: esAprobado ? 'Aprobado' : 'Rechazado', comentarioCierre: comentario, fechaCierre: new Date().toISOString() } : a
        );
        setAprobaciones(updated);
        save(hallazgos, auditorias, riesgos, updated);
    };

    const simularPeticionMaker = () => {
        const num = `REQ-${new Date().getFullYear()}-${String(aprobaciones.length + 1).padStart(3, '0')}`;
        const nueva = {
            id: Date.now(),
            ticketId: num,
            maker: 'Cajero Principal (Sucursal Base)',
            modulo: 'Bóveda',
            operacion: 'Pase de Efectivo Mayorista',
            detalleAntes: 'Bóveda Origen: 10,000,000',
            detalleDespues: 'Pase Solicitado: 5,000,000',
            montoImpacto: 5000000,
            fechaSolicitud: new Date().toISOString(),
            estado: 'Pendiente',
            justificacion: 'Reabastecimiento urgente por alta demanda en cajeros ATM zona central.'
        };
        const updated = [nueva, ...aprobaciones];
        setAprobaciones(updated);
        save(hallazgos, auditorias, riesgos, updated);
    };

    return (
        <ControlInternoContext.Provider value={{ 
            hallazgos, auditorias, riesgos, aprobaciones,
            addHallazgo, updateHallazgo, addAuditoria, addRiesgo, updateRiesgo,
            probarPeticion, simularPeticionMaker
        }}>
            {children}
        </ControlInternoContext.Provider>
    );
};
