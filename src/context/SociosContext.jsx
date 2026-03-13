import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../utils/api';

const SociosContext = createContext();

export const useSocios = () => useContext(SociosContext);

// ─── DEFAULT SEED DATA ────────────────────────────────────────────────────────
const defaultSocios = [];

export const SociosProvider = ({ children }) => {
    const [socios, setSocios] = useState([]);

    useEffect(() => {
        const loadData = async () => {
            const sData = await api.get('socios');
            if (sData && Array.isArray(sData)) {
                setSocios(sData);
            }
        };
        loadData();
    }, []);

    useEffect(() => {
        // 🛡️ PROTECCIÓN: No sincronizar si la lista está vacía (evita purgas por fallos de red)
        if (socios.length > 0) {
            api.save('socios', socios);
        }
    }, [socios]);

    const agregarSocio = (socio) => {
        const nuevo = {
            ...getDefaultSocio(),
            ...socio,
            id: Date.now().toString(),
            codigo: `SOC-${String(socios.length + 1).padStart(4, '0')}`,
            ahorros: Number(socio.ahorros) || 0,
            prestamos: Number(socio.prestamos) || 0,
            aportacion: Number(socio.aportacion) || 0,
            ingresoMensual: Number(socio.ingresoMensual) || 0,
        };
        setSocios(prev => [...prev, nuevo]);
        return nuevo;
    };

    const actualizarSocio = (id, datos) => {
        setSocios(prev => prev.map(s => s.id === id ? { ...s, ...datos } : s));
    };

    const eliminarSocio = (id) => {
        setSocios(prev => prev.filter(s => s.id !== id));
    };

    const actualizarBalance = (id, tipo, monto) => {
        setSocios(prev => prev.map(s => {
            if (s.id === id) {
                return { ...s, [tipo]: Number(s[tipo]) + Number(monto) };
            }
            return s;
        }));
    };

    // ── Inmuebles ──────────────────────────────────────────────────────────────
    const agregarInmueble = (socioId, inmueble) => {
        setSocios(prev => prev.map(s => s.id === socioId ? {
            ...s, inmuebles: [...(s.inmuebles || []), { ...inmueble, id: Date.now().toString() }]
        } : s));
    };
    const eliminarInmueble = (socioId, inmuebleId) => {
        setSocios(prev => prev.map(s => s.id === socioId ? {
            ...s, inmuebles: (s.inmuebles || []).filter(i => i.id !== inmuebleId)
        } : s));
    };

    // ── Vehículos ─────────────────────────────────────────────────────────────
    const agregarVehiculo = (socioId, vehiculo) => {
        setSocios(prev => prev.map(s => s.id === socioId ? {
            ...s, vehiculos: [...(s.vehiculos || []), { ...vehiculo, id: Date.now().toString() }]
        } : s));
    };
    const eliminarVehiculo = (socioId, vehiculoId) => {
        setSocios(prev => prev.map(s => s.id === socioId ? {
            ...s, vehiculos: (s.vehiculos || []).filter(v => v.id !== vehiculoId)
        } : s));
    };

    // ── Referencias ───────────────────────────────────────────────────────────
    const agregarReferencia = (socioId, ref) => {
        setSocios(prev => prev.map(s => s.id === socioId ? {
            ...s, referencias: [...(s.referencias || []), { ...ref, id: Date.now().toString() }]
        } : s));
    };
    const eliminarReferencia = (socioId, refId) => {
        setSocios(prev => prev.map(s => s.id === socioId ? {
            ...s, referencias: (s.referencias || []).filter(r => r.id !== refId)
        } : s));
    };

    // ── Dependientes ──────────────────────────────────────────────────────────
    const agregarDependiente = (socioId, dep) => {
        setSocios(prev => prev.map(s => s.id === socioId ? {
            ...s, dependientes: [...(s.dependientes || []), { ...dep, id: Date.now().toString() }]
        } : s));
    };
    const eliminarDependiente = (socioId, depId) => {
        setSocios(prev => prev.map(s => s.id === socioId ? {
            ...s, dependientes: (s.dependientes || []).filter(d => d.id !== depId)
        } : s));
    };

    // ── Beneficiarios ─────────────────────────────────────────────────────────
    const agregarBeneficiario = (socioId, ben) => {
        setSocios(prev => prev.map(s => s.id === socioId ? {
            ...s, beneficiarios: [...(s.beneficiarios || []), { ...ben, id: Date.now().toString() }]
        } : s));
    };
    const eliminarBeneficiario = (socioId, benId) => {
        setSocios(prev => prev.map(s => s.id === socioId ? {
            ...s, beneficiarios: (s.beneficiarios || []).filter(b => b.id !== benId)
        } : s));
    };

    // ── Casos de Seguimiento ──────────────────────────────────────────────────
    const agregarCaso = (socioId, caso) => {
        setSocios(prev => prev.map(s => s.id === socioId ? {
            ...s, casos: [...(s.casos || []), { ...caso, id: Date.now().toString(), fecha: new Date().toISOString() }]
        } : s));
    };
    const eliminarCaso = (socioId, casoId) => {
        setSocios(prev => prev.map(s => s.id === socioId ? {
            ...s, casos: (s.casos || []).filter(c => c.id !== casoId)
        } : s));
    };

    const calcularSocioScore = (socio) => {
        if (!socio) return 0;
        let score = 70; // Puntaje Base

        // Ahorros (Fomento del ahorro)
        if (socio.ahorros > 200000) score += 15;
        else if (socio.ahorros > 50000) score += 10;
        else if (socio.ahorros > 0) score += 5;

        // Estabilidad (Antigüedad)
        const fechaIng = new Date(socio.fechaIngreso || '2024-01-01');
        const meses = (new Date() - fechaIng) / (1000 * 60 * 60 * 24 * 30);
        if (meses > 24) score += 15;
        else if (meses > 12) score += 10;
        else if (meses > 6) score += 5;

        // Deuda (Relación Deuda/Ahorro)
        if (socio.prestamos > 0) {
            const ratio = socio.prestamos / (socio.ahorros || 1);
            if (ratio > 5) score -= 20;
            else if (ratio > 2) score -= 10;
        } else if (socio.ahorros > 1000) {
            score += 10; // Capacidad crediticia limpia
        }

        return Math.max(0, Math.min(100, score));
    };

    return (
        <SociosContext.Provider value={{
            socios,
            agregarSocio,
            actualizarSocio,
            eliminarSocio,
            actualizarBalance,
            agregarInmueble, eliminarInmueble,
            agregarVehiculo, eliminarVehiculo,
            agregarReferencia, eliminarReferencia,
            agregarDependiente, eliminarDependiente,
            agregarBeneficiario, eliminarBeneficiario,
            agregarCaso, eliminarCaso,
            calcularSocioScore,
        }}>
            {children}
        </SociosContext.Provider>
    );
};

function getDefaultSocio() {
    return {
        persona: 'Fisica', codigo: '', ficha: '', cedula: '', ingCoop: '', pasaporte: '',
        nombre: '', estado: 'Activo', oficial: '', condicion: 'Regular', esSocio: true,
        fechaNac: '', sexo: '', actividadEconomica: '', profesion: '', educacion: '', estadoCivil: '',
        celular: '', telefono: '', email: '',
        vivienda: '', pais: 'República Dominicana', distrito: '', nacionalidad: 'Dominicana',
        area: '', region: '', ciudad: '', municipio: '', sector: '', seccion: '', numCasa: '', direccion: '',
        empresa: '', frecNominal: 'Mensual', fechaIngreso: '', ingresoMensual: 0,
        direccionTrabajo: '', lugarTrabajo: '', cargoTrabajo: '', emailTrabajo: '', ctaBancaria: '', vacaciones: '',
        ahorros: 0, prestamos: 0, aportacion: 0,
        inmuebles: [], vehiculos: [], referencias: [], dependientes: [], beneficiarios: [], casos: [],
        foto: null, firma: null,
    };
}

export { getDefaultSocio };
