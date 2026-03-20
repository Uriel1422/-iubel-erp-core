import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../utils/api';
import { useContabilidad } from './ContabilidadContext';
import { useNCF } from './NCFContext';

const NotasContext = createContext();
export const useNotas = () => useContext(NotasContext);

export const NotasProvider = ({ children }) => {
    const { registrarAsiento } = useContabilidad();
    const { generarSiguienteNCF } = useNCF();

    const [notas, setNotas] = useState([]);
    const [hasLoaded, setHasLoaded] = useState(false);

    // Cargar datos del servidor al iniciar
    useEffect(() => {
        const loadNotas = async () => {
            const data = await api.get('notas');
            if (data && Array.isArray(data)) {
                setNotas(data);
            }
            setHasLoaded(true);
        };
        loadNotas();
    }, []);

    // Sincronizar con el servidor al cambiar
    useEffect(() => {
        if (hasLoaded) {
            // 🛡️ IUBEL SOVEREIGN GUARD: Empty Sync Protection
            if (notas.length === 0) return;
            api.save('notas', notas);
        }
    }, [notas, hasLoaded]);

    const registrarNota = (nuevaNota) => {
        // Generar NCF automáticamente si no viene uno manual
        let ncfFinal = nuevaNota.ncf;
        const tipoB = nuevaNota.tipoNota === 'credito' ? 'B04' : 'B03';

        try {
            if (!ncfFinal) {
                ncfFinal = generarSiguienteNCF(tipoB);
            }
        } catch (e) {
            console.warn("No se pudo generar NCF automático:", e.message);
            if (!ncfFinal) {
                alert(`Error: ${e.message}. Asegúrese de configurar un rango para ${tipoB}.`);
                return;
            }
        }

        const notaFull = {
            ...nuevaNota,
            id: Date.now().toString(),
            ncf: ncfFinal,
            fechaRegistro: new Date().toISOString(),
            estado: 'Aplicada'
        };

        // Asiento Contable Automático
        const detalles = [];
        const subtotal = Number(nuevaNota.subtotal) || 0;
        const itbis = Number(nuevaNota.itbis) || 0;
        const total = subtotal + itbis;

        if (nuevaNota.tipoNota === 'credito') {
            // DEVOLUCIÓN SOBRE VENTA
            // Débito a Devoluciones en Ventas (4102)
            detalles.push({ cuentaId: '4102', debito: subtotal, credito: 0, cuentaCodigo: '4102' });
            // Débito a ITBIS por Pagar (210301) - Reduciendo el ITBIS a pagar
            if (itbis > 0) {
                detalles.push({ cuentaId: '210301', debito: itbis, credito: 0, cuentaCodigo: '210301' });
            }
            // Crédito a CxC Clientes (110201) o Caja/Bancos (110101)
            const cuentaCreditoId = nuevaNota.cuentaContraId || '110201';
            detalles.push({ cuentaId: cuentaCreditoId, debito: 0, credito: total, cuentaCodigo: cuentaCreditoId });
        } else {
            // NOTA DE DÉBITO (Aumento de deuda/ingreso)
            // Débito a CxC Clientes (110201)
            detalles.push({ cuentaId: '110201', debito: total, credito: 0, cuentaCodigo: '110201' });
            // Crédito a ITBIS por Pagar (210301)
            if (itbis > 0) {
                detalles.push({ cuentaId: '210301', debito: 0, credito: itbis, cuentaCodigo: '210301' });
            }
            // Crédito a Ventas (4101)
            detalles.push({ cuentaId: '4101', debito: 0, credito: subtotal, cuentaCodigo: '4101' });
        }

        registrarAsiento(
            `Nota de ${nuevaNota.tipoNota === 'credito' ? 'Crédito' : 'Débito'}: ${ncfFinal} ref Fac ${nuevaNota.facturaRefId || 'S/N'}`,
            detalles,
            new Date().toISOString(),
            'Notas CD',
            `NT-${notaFull.id}`
        );

        setNotas(prev => [...prev, notaFull]);
        return notaFull;
    };

    return (
        <NotasContext.Provider value={{
            notas,
            registrarNota
        }}>
            {children}
        </NotasContext.Provider>
    );
};
