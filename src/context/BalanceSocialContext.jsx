import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../utils/api';

const BalanceSocialContext = createContext();
export const useBalanceSocial = () => useContext(BalanceSocialContext);

const anioActual = new Date().getFullYear();

const initialIndicadores = {
    anio: anioActual,
    socios: {
        total: 1248,
        activos: 1102,
        nuevos: 87,
        retirados: 22,
        generoFemenino: 612,
        generoMasculino: 636,
        menores35: 380,
        entre35y55: 520,
        mayores55: 348,
    },
    financiero: {
        capitalSocial: 45800000,
        excedentes: 8200000,
        retornoSocios: 3500000,
        totalActivos: 285000000,
        carteraPrestamos: 198000000,
        ahorros: 156000000,
    },
    empleo: {
        totalEmpleados: 38,
        empleadosFemeninos: 22,
        empleadosMasculinos: 16,
        nuevosEmpleos: 4,
        salarioPromedio: 52000,
        capacitacionesHoras: 480,
    },
    impactoSocial: {
        inversionSocial: 1200000,
        beneficiariosDirectos: 2800,
        proyectosComunitarios: 5,
        becariosApoyados: 12,
        doacionesONG: 350000,
        actividades: [
            { nombre: 'Feria de Salud Financiera', fecha: '2026-02-15', beneficiarios: 320 },
            { nombre: 'Capacitación "Ahorra para el Futuro"', fecha: '2026-03-01', beneficiarios: 150 },
        ],
    },
    servicios: {
        prestamosOtorgados: 245,
        montoPrestamoTotal: 68000000,
        ahorradoresActivos: 892,
        solicitudesAtendidas: 1580,
        tiempoPromedioAtencion: 18,
    }
};

export const BalanceSocialProvider = ({ children }) => {
    const [indicadores, setIndicadores] = useState(initialIndicadores);
    const [historico, setHistorico] = useState([]);

    useEffect(() => {
        const loadData = async () => {
            const data = await api.get('balance_social');
            if (data && data.indicadores) {
                setIndicadores(data.indicadores);
                setHistorico(data.historico || []);
            }
        };
        loadData();
    }, []);

    const updateIndicadores = (newData) => {
        const updated = { ...indicadores, ...newData };
        setIndicadores(updated);
        api.save('balance_social', { indicadores: updated, historico });
    };

    const cerrarAnio = () => {
        const hist = [...historico, { ...indicadores, cerradoEn: new Date().toISOString() }];
        const nuevo = { ...initialIndicadores, anio: anioActual + 1 };
        setHistorico(hist);
        setIndicadores(nuevo);
        api.save('balance_social', { indicadores: nuevo, historico: hist });
    };

    return (
        <BalanceSocialContext.Provider value={{ indicadores, historico, updateIndicadores, cerrarAnio }}>
            {children}
        </BalanceSocialContext.Provider>
    );
};
