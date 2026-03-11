import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../utils/api';

const TalentoHumanoContext = createContext();
export const useTalentoHumano = () => useContext(TalentoHumanoContext);

const initialEmpleados = [
    { id: 1, codigo: 'EMP-001', nombre: 'Ana García', cedula: '001-1234567-8', cargo: 'Gerente de Operaciones', departamento: 'Administración', tipoContrato: 'Indefinido', salario: 75000, fechaIngreso: '2020-03-15', email: 'ana.garcia@empresa.com', telefono: '809-555-0001', estado: 'Activo', genero: 'Femenino', nivelEducativo: 'Maestría', foto: '' },
    { id: 2, codigo: 'EMP-002', nombre: 'Carlos Méndez', cedula: '001-9876543-2', cargo: 'Oficial de Crédito', departamento: 'Crédito y Cobranza', tipoContrato: 'Indefinido', salario: 55000, fechaIngreso: '2021-06-01', email: 'carlos.mendez@empresa.com', telefono: '809-555-0002', estado: 'Activo', genero: 'Masculino', nivelEducativo: 'Licenciatura', foto: '' },
    { id: 3, codigo: 'EMP-003', nombre: 'María Torres', cedula: '002-3456789-1', cargo: 'Cajera', departamento: 'Caja y Tesorería', tipoContrato: 'Indefinido', salario: 38000, fechaIngreso: '2022-01-10', email: 'maria.torres@empresa.com', telefono: '809-555-0003', estado: 'Activo', genero: 'Femenino', nivelEducativo: 'Técnico', foto: '' },
];

const initialVacaciones = [
    { id: 1, empleadoId: 1, empleadoNombre: 'Ana García', tipo: 'Vacaciones', fechaInicio: '2026-04-07', fechaFin: '2026-04-18', dias: 14, estado: 'Aprobada', motivo: 'Vacaciones anuales', aprobadoPor: 'Gerencia' },
    { id: 2, empleadoId: 2, empleadoNombre: 'Carlos Méndez', tipo: 'Permiso Médico', fechaInicio: '2026-03-15', fechaFin: '2026-03-17', dias: 3, estado: 'Pendiente', motivo: 'Cita médica', aprobadoPor: '' },
];

const initialEvaluaciones = [
    { id: 1, empleadoId: 1, empleadoNombre: 'Ana García', periodo: '2025-Q4', calificacion: 92, nivel: 'Excelente', fortalezas: 'Liderazgo, gestión de equipo', areasMejora: 'Delegación de tareas', evaluadoPor: 'Dirección', fecha: '2026-01-15' },
    { id: 2, empleadoId: 2, empleadoNombre: 'Carlos Méndez', periodo: '2025-Q4', calificacion: 85, nivel: 'Muy Bueno', fortalezas: 'Análisis crediticio', areasMejora: 'Comunicación con clientes', evaluadoPor: 'Gerencia', fecha: '2026-01-16' },
];

const initialCapacitaciones = [
    { id: 1, nombre: 'Prevención de Lavado de Activos', tipo: 'Obligatoria', fechaInicio: '2026-02-10', fechaFin: '2026-02-12', duracionHoras: 16, proveedor: 'SIB-RD', costo: 12000, empleadosInscritos: [1, 2, 3], estado: 'Completada' },
    { id: 2, nombre: 'Atención al Cliente de Excelencia', tipo: 'Electiva', fechaInicio: '2026-04-20', fechaFin: '2026-04-21', duracionHoras: 8, proveedor: 'Instituto Cooperativo', costo: 8000, empleadosInscritos: [3], estado: 'Planificada' },
];

export const TalentoHumanoProvider = ({ children }) => {
    const [empleados, setEmpleados] = useState(initialEmpleados);
    const [vacaciones, setVacaciones] = useState(initialVacaciones);
    const [evaluaciones, setEvaluaciones] = useState(initialEvaluaciones);
    const [capacitaciones, setCapacitaciones] = useState(initialCapacitaciones);

    useEffect(() => {
        const loadData = async () => {
            const data = await api.get('talento_humano');
            if (data && data.empleados) {
                setEmpleados(data.empleados);
                setVacaciones(data.vacaciones || initialVacaciones);
                setEvaluaciones(data.evaluaciones || initialEvaluaciones);
                setCapacitaciones(data.capacitaciones || initialCapacitaciones);
            }
        };
        loadData();
    }, []);

    const saveAll = async (emp, vac, eva, cap) => {
        await api.save('talento_humano', { empleados: emp, vacaciones: vac, evaluaciones: eva, capacitaciones: cap });
    };

    const addEmpleado = (emp) => {
        const newEmp = { ...emp, id: Date.now(), codigo: `EMP-${String(empleados.length + 1).padStart(3, '0')}`, estado: 'Activo' };
        const updated = [...empleados, newEmp];
        setEmpleados(updated);
        saveAll(updated, vacaciones, evaluaciones, capacitaciones);
    };

    const updateEmpleado = (id, data) => {
        const updated = empleados.map(e => e.id === id ? { ...e, ...data } : e);
        setEmpleados(updated);
        saveAll(updated, vacaciones, evaluaciones, capacitaciones);
    };

    const deleteEmpleado = (id) => {
        const updated = empleados.filter(e => e.id !== id);
        setEmpleados(updated);
        saveAll(updated, vacaciones, evaluaciones, capacitaciones);
    };

    const addVacacion = (vac) => {
        const newVac = { ...vac, id: Date.now(), estado: 'Pendiente' };
        const updated = [...vacaciones, newVac];
        setVacaciones(updated);
        saveAll(empleados, updated, evaluaciones, capacitaciones);
    };

    const aprobarVacacion = (id, aprobadoPor) => {
        const updated = vacaciones.map(v => v.id === id ? { ...v, estado: 'Aprobada', aprobadoPor } : v);
        setVacaciones(updated);
        saveAll(empleados, updated, evaluaciones, capacitaciones);
    };

    return (
        <TalentoHumanoContext.Provider value={{ empleados, vacaciones, evaluaciones, capacitaciones, addEmpleado, updateEmpleado, deleteEmpleado, addVacacion, aprobarVacacion }}>
            {children}
        </TalentoHumanoContext.Provider>
    );
};
