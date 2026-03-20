import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../utils/api';

const SociosContext = createContext();

export const useSocios = () => useContext(SociosContext);

// ─── DEFAULT SEED DATA ────────────────────────────────────────────────────────
const defaultSocios = [];

export const SociosProvider = ({ children }) => {
    const [socios, setSocios] = useState([]);
    const [hasLoaded, setHasLoaded] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            const sData = await api.get('socios');
            if (sData && Array.isArray(sData)) {
                setSocios(sData);
            }
            setHasLoaded(true);
        };
        loadData();
    }, []);

    // Removed auto-save useEffect

    // ── Helper Atómico ────────────────────────────────────────────────────────
    const atomicUpdate = async (socioId, mutatorFn) => {
        let updatedSocio;
        setSocios(prev => prev.map(s => {
            if (s.id === socioId) {
                updatedSocio = mutatorFn(s);
                return updatedSocio;
            }
            return s;
        }));
        if (updatedSocio) await api.update('socios', socioId, updatedSocio);
    };

    const agregarSocio = async (socio) => {
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
        await api.save('socios', nuevo);
        return nuevo;
    };

    const actualizarSocio = (id, datos) => atomicUpdate(id, s => ({ ...s, ...datos }));

    const eliminarSocio = async (id) => {
        setSocios(prev => prev.filter(s => s.id !== id));
        await api.delete('socios', id);
    };

    const actualizarBalance = (id, tipo, monto) => atomicUpdate(id, s => ({ ...s, [tipo]: Number(s[tipo]) + Number(monto) }));

    // ── Inmuebles ──────────────────────────────────────────────────────────────
    const agregarInmueble = (socioId, inmueble) => atomicUpdate(socioId, s => ({ ...s, inmuebles: [...(s.inmuebles || []), { ...inmueble, id: Date.now().toString() }] }));
    const eliminarInmueble = (socioId, inmuebleId) => atomicUpdate(socioId, s => ({ ...s, inmuebles: (s.inmuebles || []).filter(i => i.id !== inmuebleId) }));

    // ── Vehículos ─────────────────────────────────────────────────────────────
    const agregarVehiculo = (socioId, vehiculo) => atomicUpdate(socioId, s => ({ ...s, vehiculos: [...(s.vehiculos || []), { ...vehiculo, id: Date.now().toString() }] }));
    const eliminarVehiculo = (socioId, vehiculoId) => atomicUpdate(socioId, s => ({ ...s, vehiculos: (s.vehiculos || []).filter(v => v.id !== vehiculoId) }));

    // ── Referencias ───────────────────────────────────────────────────────────
    const agregarReferencia = (socioId, ref) => atomicUpdate(socioId, s => ({ ...s, referencias: [...(s.referencias || []), { ...ref, id: Date.now().toString() }] }));
    const eliminarReferencia = (socioId, refId) => atomicUpdate(socioId, s => ({ ...s, referencias: (s.referencias || []).filter(r => r.id !== refId) }));

    // ── Dependientes ──────────────────────────────────────────────────────────
    const agregarDependiente = (socioId, dep) => atomicUpdate(socioId, s => ({ ...s, dependientes: [...(s.dependientes || []), { ...dep, id: Date.now().toString() }] }));
    const eliminarDependiente = (socioId, depId) => atomicUpdate(socioId, s => ({ ...s, dependientes: (s.dependientes || []).filter(d => d.id !== depId) }));

    // ── Beneficiarios ─────────────────────────────────────────────────────────
    const agregarBeneficiario = (socioId, ben) => atomicUpdate(socioId, s => ({ ...s, beneficiarios: [...(s.beneficiarios || []), { ...ben, id: Date.now().toString() }] }));
    const eliminarBeneficiario = (socioId, benId) => atomicUpdate(socioId, s => ({ ...s, beneficiarios: (s.beneficiarios || []).filter(b => b.id !== benId) }));

    // ── Casos de Seguimiento ──────────────────────────────────────────────────
    const agregarCaso = (socioId, caso) => atomicUpdate(socioId, s => ({ ...s, casos: [...(s.casos || []), { ...caso, id: Date.now().toString(), fecha: new Date().toISOString() }] }));
    const eliminarCaso = (socioId, casoId) => atomicUpdate(socioId, s => ({ ...s, casos: (s.casos || []).filter(c => c.id !== casoId) }));


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
