import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../utils/api';

const JuridicoContext = createContext();
export const useJuridico = () => useContext(JuridicoContext);

const initialContratos = [
    { id: 1, numero: 'CONT-2026-001', tipo: 'Servicio', descripcion: 'Contrato de mantenimiento y soporte de sistemas informáticos', contraparte: 'Tech Solutions SRL', monto: 120000, fechaInicio: '2026-01-01', fechaFin: '2026-12-31', estado: 'Vigente', alertaDias: 30 },
    { id: 2, numero: 'CONT-2025-015', tipo: 'Arrendamiento', descripcion: 'Contrato de arrendamiento local sucursal Norte', contraparte: 'Bienes Raíces Torres', monto: 45000, fechaInicio: '2025-03-01', fechaFin: '2026-03-01', estado: 'Por Vencer', alertaDias: 30 },
];

const initialDemandas = [
    { id: 1, numero: 'DEM-2025-003', tipo: 'Cobro Judicial', descripcion: 'Cobro de préstamo incumplido - Socio 8820', demandante: 'Cooperativa', demandado: 'José Ramírez', monto: 350000, tribunal: 'Juzgado de Primera Instancia Distrito Nacional', fechaInicio: '2025-09-15', estado: 'En Proceso', abogado: 'Lic. Carmen Soto', proxima: '2026-04-12' },
    { id: 2, numero: 'DEM-2026-001', tipo: 'Laboral', descripcion: 'Reclamación laboral ex-empleado', demandante: 'Pedro Gil', demandado: 'Cooperativa', monto: 180000, tribunal: 'Tribunal Contencioso Laboral', fechaInicio: '2026-01-20', estado: 'Nuevo', abogado: 'Lic. Luis Vargas', proxima: '2026-04-05' },
];

const initialDocumentos = [
    { id: 1, tipo: 'Poder Notarial', descripcion: 'Poder General Gerente General', beneficiario: 'Ana García', notario: 'Lic. Roberto Marte', fecha: '2025-03-10', vencimiento: '2027-03-10', estado: 'Vigente' },
    { id: 2, tipo: 'Acta Constitutiva', descripcion: 'Acta de Asamblea General Ordinaria 2025', beneficiario: 'Cooperativa', notario: 'Lic. María Jiménez', fecha: '2025-05-20', vencimiento: null, estado: 'Vigente' },
];

export const JuridicoProvider = ({ children }) => {
    const [contratos, setContratos] = useState(initialContratos);
    const [demandas, setDemandas] = useState(initialDemandas);
    const [documentos, setDocumentos] = useState(initialDocumentos);

    useEffect(() => {
        const loadData = async () => {
            const data = await api.get('juridico');
            if (data && data.contratos) {
                setContratos(data.contratos);
                setDemandas(data.demandas || initialDemandas);
                setDocumentos(data.documentos || initialDocumentos);
            }
        };
        loadData();
    }, []);

    const save = (c, d, doc) => api.save('juridico', { contratos: c, demandas: d, documentos: doc });

    const addContrato = (contrato) => {
        const num = `CONT-${new Date().getFullYear()}-${String(contratos.length + 1).padStart(3, '0')}`;
        const nuevo = { ...contrato, id: Date.now(), numero: num, estado: 'Vigente' };
        const updated = [...contratos, nuevo];
        setContratos(updated);
        save(updated, demandas, documentos);
    };

    const updateContrato = (id, data) => {
        const updated = contratos.map(c => c.id === id ? { ...c, ...data } : c);
        setContratos(updated);
        save(updated, demandas, documentos);
    };

    const addDemanda = (demanda) => {
        const num = `DEM-${new Date().getFullYear()}-${String(demandas.length + 1).padStart(3, '0')}`;
        const nueva = { ...demanda, id: Date.now(), numero: num, estado: 'Nuevo' };
        const updated = [...demandas, nueva];
        setDemandas(updated);
        save(contratos, updated, documentos);
    };

    const updateDemanda = (id, data) => {
        const updated = demandas.map(d => d.id === id ? { ...d, ...data } : d);
        setDemandas(updated);
        save(contratos, updated, documentos);
    };

    const addDocumento = (doc) => {
        const nuevo = { ...doc, id: Date.now(), estado: 'Vigente' };
        const updated = [...documentos, nuevo];
        setDocumentos(updated);
        save(contratos, demandas, updated);
    };

    return (
        <JuridicoContext.Provider value={{ contratos, demandas, documentos, addContrato, updateContrato, addDemanda, updateDemanda, addDocumento }}>
            {children}
        </JuridicoContext.Provider>
    );
};
