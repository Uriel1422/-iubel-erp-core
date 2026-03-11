import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../utils/api';
import { useContabilidad } from './ContabilidadContext';

const NominaContext = createContext();

export const useNomina = () => useContext(NominaContext);

// Constantes de Ley RD (Ajustables según DGII/TSS)
const TSS_AFP_EMP = 0.0287; // 2.87% (Empleado)
const TSS_SFS_EMP = 0.0304; // 3.04% (Empleado)

// Cargas Patronales (Nivel Empresarial - Agrega valor al software)
const TSS_AFP_PAT = 0.0710; // 7.10%
const TSS_SFS_PAT = 0.0709; // 7.09%
const TSS_ARL = 0.0110;    // 1.10% (Riesgos Laborales promedio)
const INFOTEP = 0.0100;   // 1.00% 

export const NominaProvider = ({ children }) => {
    const { registrarAsiento } = useContabilidad();
    const [empleados, setEmpleados] = useState([]);
    const [nominasProcesadas, setNominasProcesadas] = useState([]);

    // ... (useEffect loadData sin cambios)

    // Función para calcular ISR (Escala RD 2024)
    const calcularISR = (sueldoNetoTSS) => {
        const anual = sueldoNetoTSS * 12;
        let impuestoAnual = 0;

        if (anual <= 416220.00) {
            impuestoAnual = 0;
        } else if (anual <= 624329.00) {
            impuestoAnual = (anual - 416220.01) * 0.15;
        } else if (anual <= 867123.00) {
            impuestoAnual = 31216.00 + ((anual - 624329.01) * 0.20);
        } else {
            impuestoAnual = 79776.00 + ((anual - 867123.01) * 0.25);
        }

        return impuestoAnual / 12;
    };

    const calcularDetalleNomina = (empleado) => {
        const sueldo = Number(empleado.sueldo);
        // Retenciones Empleado
        const afp = sueldo * TSS_AFP_EMP;
        const sfs = sueldo * TSS_SFS_EMP;
        const sueldoNetoTSS = sueldo - afp - sfs;
        const isr = calcularISR(sueldoNetoTSS);
        const sueldoNeto = sueldo - afp - sfs - isr;

        // Cargas Patronales (Lo que le cuesta a la empresa realmente)
        const afpPatron = sueldo * TSS_AFP_PAT;
        const sfsPatron = sueldo * TSS_SFS_PAT;
        const arl = sueldo * TSS_ARL;
        const infotep = sueldo * INFOTEP;
        const costoTotalEmpresa = sueldo + afpPatron + sfsPatron + arl + infotep;

        return {
            sueldoBruto: sueldo,
            afp, sfs, isr,
            sueldoNeto,
            patronal: { afpPatron, sfsPatron, arl, infotep },
            costoTotalEmpresa
        };
    };

    const procesarNominaMes = (mes) => {
        const detalle = empleados.filter(e => e.activo).map(e => ({
            ...e,
            calculos: calcularDetalleNomina(e)
        }));

        const totalSueldos = detalle.reduce((acc, d) => acc + d.sueldo, 0);
        const totalNeto = detalle.reduce((acc, d) => acc + d.calculos.sueldoNeto, 0);
        const totalAFP = detalle.reduce((acc, d) => acc + d.calculos.afp, 0);
        const totalSFS = detalle.reduce((acc, d) => acc + d.calculos.sfs, 0);
        const totalISR = detalle.reduce((acc, d) => acc + d.calculos.isr, 0);

        const totalPatronal = detalle.reduce((acc, d) =>
            acc + d.calculos.patronal.afpPatron + d.calculos.patronal.sfsPatron + d.calculos.patronal.arl, 0);

        const nuevaNomina = {
            id: Date.now().toString(),
            mes,
            fecha: new Date().toISOString(),
            detalle,
            totales: { totalSueldos, totalNeto, totalAFP, totalSFS, totalISR, totalPatronal }
        };

        setNominasProcesadas(prev => [...prev, nuevaNomina]);

        // Asiento Contable Automático (Fase Enterprise: Incluye Gastos Patronales)
        const detallesContables = [
            { cuentaId: '6101', cuentaCodigo: '6101', debito: totalSueldos, credito: 0, descripcion: 'Gasto de Sueldos y Salarios' },
            { cuentaId: '6102', cuentaCodigo: '6102', debito: totalPatronal, credito: 0, descripcion: 'Gasto Seguridad Social Patronal' },
            { cuentaId: '2105', cuentaCodigo: '2105', debito: 0, credito: totalAFP + totalSFS + totalPatronal, descripcion: 'Retenciones y Cargas TSS por Pagar' },
            { cuentaId: '2106', cuentaCodigo: '2106', debito: 0, credito: totalISR, descripcion: 'Retenciones ISR por Pagar' },
            { cuentaId: '110101', cuentaCodigo: '110101', debito: 0, credito: totalNeto, descripcion: 'Pago de Nómina (Banco)' }
        ];

        registrarAsiento(
            `Nómina Enterprise - ${mes}`,
            detallesContables,
            new Date().toISOString(),
            'RRHH',
            `NOM-${nuevaNomina.id}`
        );

        return nuevaNomina;
    };

    const exportarTSS = async () => {
        // En un futuro estos se conectará a un endpoint real en server.js
        const csv = "RNC;Cedula;Sueldo;AFP_Emp;SFS_Emp;ISR\n" +
            empleados.map(e => {
                const c = calcularDetalleNomina(e);
                return `101;${e.cedula};${e.sueldo};${c.afp.toFixed(2)};${c.sfs.toFixed(2)};${c.isr.toFixed(2)}`;
            }).join("\n");

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `SUIR_TSS_${new Date().toISOString().slice(0, 7)}.csv`;
        a.click();
    };

    const agregarEmpleado = (empleado) => {
        setEmpleados(prev => [...prev, { ...empleado, id: Date.now().toString(), activo: true }]);
    };

    const eliminarEmpleado = (id) => {
        setEmpleados(empleados.filter(e => e.id !== id));
    };

    const eliminarNomina = (id) => {
        setNominasProcesadas(nominasProcesadas.filter(n => n.id !== id));
    };

    return (
        <NominaContext.Provider value={{
            empleados,
            nominasProcesadas,
            procesarNominaMes,
            agregarEmpleado,
            eliminarEmpleado,
            eliminarNomina,
            calcularDetalleNomina,
            exportarTSS
        }}>
            {children}
        </NominaContext.Provider>
    );
};
