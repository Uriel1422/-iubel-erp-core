import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { api } from '../utils/api';
import { useContabilidad } from './ContabilidadContext';

const BancosContext = createContext();

export const useBancos = () => useContext(BancosContext);

export const BancosProvider = ({ children }) => {
    const { asientos } = useContabilidad();

    const [movimientosExtra, setMovimientosExtra] = useState([]);
    const [hasLoaded, setHasLoaded] = useState(false);

    useEffect(() => {
        const loadBancos = async () => {
            const data = await api.get('bancos_extra');
            if (data && Array.isArray(data)) {
                setMovimientosExtra(data);
            }
            setHasLoaded(true);
        };
        loadBancos();
    }, []);

    useEffect(() => {
        // 🛡️ IUBEL SOVEREIGN GUARD: Empty Sync Protection
        if (hasLoaded && movimientosExtra.length > 0) {
            api.save('bancos_extra', movimientosExtra);
        }
    }, [movimientosExtra, hasLoaded]);

    // Calcular saldo en libros (basado en asientos contables para la cuenta 110101)
    const saldoLibros = useMemo(() => {
        let total = 0;
        asientos.forEach(asiento => {
            (asiento.detalles || []).forEach(detalle => {
                if (detalle.cuentaId && (detalle.cuentaId.startsWith('1101') || detalle.cuentaId.startsWith('1102'))) {
                    total += (Number(detalle.debito) || 0) - (Number(detalle.credito) || 0);
                }
            });
        });
        return total;
    }, [asientos]);

    // Calcular saldo de banco (saldo libros + ajustes manuales de banco como comisiones no registradas)
    const saldoBancoReal = useMemo(() => {
        let total = saldoLibros;
        movimientosExtra.forEach(mov => {
            if (mov.tipo === 'debito') total -= mov.monto;
            if (mov.tipo === 'credito') total += mov.monto;
        });
        return total;
    }, [saldoLibros, movimientosExtra]);

    const agregarMovimientoBanco = (mov) => {
        setMovimientosExtra([...movimientosExtra, { ...mov, id: Date.now().toString(), fecha: new Date().toISOString() }]);
    };

    const eliminarMovimientoBanco = (id) => {
        setMovimientosExtra(movimientosExtra.filter(mov => mov.id !== id));
    };

    return (
        <BancosContext.Provider value={{
            saldoLibros,
            saldoBancoReal,
            movimientosExtra,
            agregarMovimientoBanco,
            eliminarMovimientoBanco
        }}>
            {children}
        </BancosContext.Provider>
    );
};
