import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../utils/api';

const CajaContext = createContext();

export const useCaja = () => useContext(CajaContext);

export const CajaProvider = ({ children }) => {
    const [recibos, setRecibos] = useState([]);
    const [turnoActivo, setTurnoActivo] = useState(null);

    useEffect(() => {
        const loadCaja = async () => {
            const data = await api.get('caja_recibos');
            if (data && Array.isArray(data)) {
                setRecibos(data);
            }
        };
        loadCaja();
    }, []);

    useEffect(() => {
        if (recibos.length > 0) {
            api.save('caja_recibos', recibos);
        }
    }, [recibos]);

    const registrarRecibo = (reciboData) => {
        const nuevoRecibo = {
            ...reciboData,
            id: Date.now().toString(),
            fecha: new Date().toISOString(),
            numero: `REC-${(recibos.length + 1).toString().padStart(6, '0')}`,
            estado: 'Valido'
        };
        setRecibos(prev => [...prev, nuevoRecibo]);
        return nuevoRecibo;
    };

    const anularRecibo = (id, motivo) => {
        setRecibos(prev => prev.map(r =>
            r.id === id ? { ...r, estado: 'Anulado', motivoAnulacion: motivo, fechaAnulacion: new Date().toISOString() } : r
        ));
    };

    const abrirTurno = (cajero) => {
        setTurnoActivo({
            id: Date.now().toString(),
            cajero,
            fechaApertura: new Date().toISOString(),
            montoInicial: 0
        });
    };

    const cerrarTurno = () => {
        setTurnoActivo(null);
    };

    return (
        <CajaContext.Provider value={{
            recibos,
            turnoActivo,
            registrarRecibo,
            anularRecibo,
            abrirTurno,
            cerrarTurno
        }}>
            {children}
        </CajaContext.Provider>
    );
};
