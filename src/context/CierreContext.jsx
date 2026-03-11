import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../utils/api';
import { useContabilidad } from './ContabilidadContext';
import { useCuentas } from './CuentasContext';

const CierreContext = createContext();
export const useCierre = () => useContext(CierreContext);

export const CierreProvider = ({ children }) => {
    const { registrarAsiento, asientos } = useContabilidad();
    const { cuentas } = useCuentas();

    const [cierres, setCierres] = useState([]);
    const [saldosApertura, setSaldosApertura] = useState([]);

    // Cargar datos del servidor al iniciar
    useEffect(() => {
        const loadCierreData = async () => {
            const dataCie = await api.get('cierres');
            if (dataCie && Array.isArray(dataCie)) {
                setCierres(dataCie);
            }

            const dataApe = await api.get('saldos_apertura');
            if (dataApe && Array.isArray(dataApe)) {
                setSaldosApertura(dataApe);
            }
        };
        loadCierreData();
    }, []);

    // Sincronizar con el servidor al cambiar
    useEffect(() => {
        if (cierres.length > 0) {
            api.save('cierres', cierres);
        }
    }, [cierres]);

    useEffect(() => {
        if (saldosApertura.length > 0) {
            api.save('saldos_apertura', saldosApertura);
        }
    }, [saldosApertura]);

    // Calcular saldo de una cuenta
    const calcularSaldo = (cuentaId) => {
        let saldo = 0;
        asientos.forEach(a => {
            (a.detalles || []).forEach(d => {
                if (d.cuentaId === cuentaId) {
                    saldo += (Number(d.debito) || 0) - (Number(d.credito) || 0);
                }
            });
        });

        // Sumar saldo de apertura si existe
        const apertura = saldosApertura.find(s => s.cuentaId === cuentaId);
        if (apertura) saldo += (Number(apertura.monto) || 0);

        return saldo;
    };

    const realizarCierreMensual = (mes, anio) => {
        // Lógica simplificada: guardar el estado actual de los saldos
        const nuevoCierre = {
            id: Date.now().toString(),
            mes,
            anio,
            fecha: new Date().toISOString(),
            saldos: cuentas.map(c => ({
                cuentaId: c.id,
                codigo: c.codigo,
                nombre: c.nombre,
                saldo: calcularSaldo(c.id)
            }))
        };

        setCierres([...cierres, nuevoCierre]);
        return nuevoCierre;
    };

    const guardarSaldosApertura = (nuevosSaldos) => {
        setSaldosApertura(nuevosSaldos);
    };

    return (
        <CierreContext.Provider value={{
            cierres,
            saldosApertura,
            realizarCierreMensual,
            guardarSaldosApertura,
            calcularSaldo
        }}>
            {children}
        </CierreContext.Provider>
    );
};
