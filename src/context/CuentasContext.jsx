import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../utils/api';

// Cuentas Base Mínimas Requeridas
const defaultCuentas = [
    { id: '1', codigo: '1', nombre: 'ACTIVOS', tipo: 'Activo', subtipo: 'General', padreId: null, nivel: 1, activa: true },
    { id: '11', codigo: '11', nombre: 'Activos Circulantes', tipo: 'Activo', subtipo: 'Circulante', padreId: '1', nivel: 2, activa: true },
    { id: '1101', codigo: '1101', nombre: 'Efectivo en Caja y Banco', tipo: 'Activo', subtipo: 'Cuenta Control', padreId: '11', nivel: 3, activa: true },
    { id: '110101', codigo: '110101', nombre: 'Caja General', tipo: 'Activo', subtipo: 'Cuenta Detalle', padreId: '1101', nivel: 4, activa: true },
    { id: '110102', codigo: '110102', nombre: 'Caja Chica', tipo: 'Activo', subtipo: 'Cuenta Detalle', padreId: '1101', nivel: 4, activa: true },
    { id: '110103', codigo: '110103', nombre: 'Bancos Nacionales', tipo: 'Activo', subtipo: 'Cuenta Detalle', padreId: '1101', nivel: 4, activa: true },

    { id: '1102', codigo: '1102', nombre: 'Cuentas por Cobrar', tipo: 'Activo', subtipo: 'Cuenta Control', padreId: '11', nivel: 3, activa: true },
    { id: '110201', codigo: '110201', nombre: 'Clientes Locales', tipo: 'Activo', subtipo: 'Cuenta Detalle', padreId: '1102', nivel: 4, activa: true },

    { id: '1104', codigo: '1104', nombre: 'Inventarios', tipo: 'Activo', subtipo: 'Cuenta Control', padreId: '11', nivel: 3, activa: true },
    { id: '110401', codigo: '110401', nombre: 'Mercancía en Almacén', tipo: 'Activo', subtipo: 'Cuenta Detalle', padreId: '1104', nivel: 4, activa: true },

    { id: '1105', codigo: '1105', nombre: 'Impuestos y Retenciones Adelantadas', tipo: 'Activo', subtipo: 'Cuenta Control', padreId: '11', nivel: 3, activa: true },
    { id: '110501', codigo: '110501', nombre: 'ITBIS por Adelantar (Crédito Fiscal)', tipo: 'Activo', subtipo: 'Cuenta Detalle', padreId: '1105', nivel: 4, activa: true },

    { id: '12', codigo: '12', nombre: 'Activos Fijos', tipo: 'Activo', subtipo: 'Planta y Propiedad', padreId: '1', nivel: 2, activa: true },
    { id: '1201', codigo: '1201', nombre: 'Depreciación Acumulada', tipo: 'Activo', subtipo: 'Cuenta Control', padreId: '12', nivel: 3, activa: true },
    { id: '120101', codigo: '120101', nombre: 'Dep. Acum. Maquinaria y Equipos', tipo: 'Activo', subtipo: 'Cuenta Detalle', padreId: '1201', nivel: 4, activa: true },

    { id: '2', codigo: '2', nombre: 'PASIVOS', tipo: 'Pasivo', subtipo: 'General', padreId: null, nivel: 1, activa: true },
    { id: '21', codigo: '21', nombre: 'Pasivos Circulantes', tipo: 'Pasivo', subtipo: 'Circulante', padreId: '2', nivel: 2, activa: true },
    { id: '2101', codigo: '2101', nombre: 'Cuentas por Pagar', tipo: 'Pasivo', subtipo: 'Cuenta Control', padreId: '21', nivel: 3, activa: true },
    { id: '210101', codigo: '210101', nombre: 'Proveedores Locales', tipo: 'Pasivo', subtipo: 'Cuenta Detalle', padreId: '2101', nivel: 4, activa: true },

    { id: '2103', codigo: '2103', nombre: 'Impuestos por Pagar', tipo: 'Pasivo', subtipo: 'Cuenta Control', padreId: '21', nivel: 3, activa: true },
    { id: '210301', codigo: '210301', nombre: 'ITBIS por Pagar (Retenido)', tipo: 'Pasivo', subtipo: 'Cuenta Detalle', padreId: '2103', nivel: 4, activa: true },
    { id: '2105', codigo: '2105', nombre: 'Retenciones TSS por Pagar', tipo: 'Pasivo', subtipo: 'Cuenta Detalle', padreId: '21', nivel: 3, activa: true },
    { id: '2106', codigo: '2106', nombre: 'Retenciones ISR por Pagar', tipo: 'Pasivo', subtipo: 'Cuenta Detalle', padreId: '21', nivel: 3, activa: true },

    { id: '3', codigo: '3', nombre: 'CAPITAL', tipo: 'Capital', subtipo: 'General', padreId: null, nivel: 1, activa: true },
    { id: '31', codigo: '31', nombre: 'Capital Social', tipo: 'Capital', subtipo: 'Cuenta Control', padreId: '3', nivel: 2, activa: true },
    { id: '32', codigo: '32', nombre: 'Resultados', tipo: 'Capital', subtipo: 'Cuenta Control', padreId: '3', nivel: 2, activa: true },
    { id: '3201', codigo: '3201', nombre: 'Resultados Acumulados', tipo: 'Capital', subtipo: 'Cuenta Detalle', padreId: '32', nivel: 3, activa: true },
    { id: '3202', codigo: '3202', nombre: 'Resultados del Período', tipo: 'Capital', subtipo: 'Cuenta Detalle', padreId: '32', nivel: 3, activa: true },

    { id: '4', codigo: '4', nombre: 'INGRESOS', tipo: 'Ingreso', subtipo: 'General', padreId: null, nivel: 1, activa: true },
    { id: '41', codigo: '41', nombre: 'Ingresos Operacionales', tipo: 'Ingreso', subtipo: 'Cuenta Control', padreId: '4', nivel: 2, activa: true },
    { id: '4101', codigo: '4101', nombre: 'Ventas de Mercancía', tipo: 'Ingreso', subtipo: 'Cuenta Detalle', padreId: '41', nivel: 3, activa: true },
    { id: '4102', codigo: '4102', nombre: 'Devoluciones en Ventas', tipo: 'Ingreso', subtipo: 'Cuenta Detalle', padreId: '41', nivel: 3, activa: true },
    { id: '4103', codigo: '4103', nombre: 'Descuentos en Ventas', tipo: 'Ingreso', subtipo: 'Cuenta Detalle', padreId: '41', nivel: 3, activa: true },

    { id: '5', codigo: '5', nombre: 'COSTOS', tipo: 'Costo', subtipo: 'General', padreId: null, nivel: 1, activa: true },
    { id: '51', codigo: '51', nombre: 'Costos Directos', tipo: 'Costo', subtipo: 'Cuenta Control', padreId: '5', nivel: 2, activa: true },
    { id: '5101', codigo: '5101', nombre: 'Costo de Ventas', tipo: 'Costo', subtipo: 'Cuenta Detalle', padreId: '51', nivel: 3, activa: true },

    { id: '6', codigo: '6', nombre: 'GASTOS', tipo: 'Gasto', subtipo: 'General', padreId: null, nivel: 1, activa: true },
    { id: '61', codigo: '61', nombre: 'Gastos Generales y Administrativos', tipo: 'Gasto', subtipo: 'Cuenta Control', padreId: '6', nivel: 2, activa: true },
    { id: '6101', codigo: '6101', nombre: 'Sueldos y Salarios', tipo: 'Gasto', subtipo: 'Cuenta Detalle', padreId: '61', nivel: 3, activa: true },
    { id: '6102', codigo: '6102', nombre: 'Gastos de Depreciación', tipo: 'Gasto', subtipo: 'Cuenta Detalle', padreId: '61', nivel: 3, activa: true },
];

const CuentasContext = createContext();

export const useCuentas = () => {
    return useContext(CuentasContext);
};

export const CuentasProvider = ({ children }) => {
    const [cuentas, setCuentas] = useState([]);
    const [hasLoaded, setHasLoaded] = useState(false);

    useEffect(() => {
        const loadCuentas = async () => {
            const data = await api.get('cuentas');
            if (data && Array.isArray(data) && data.length > 0) {
                // Cuentas ya existen en MySQL — verificar si faltan defaults nuevos
                const existingCodigos = new Set(data.map(c => c.codigo));
                const missingDefaults = defaultCuentas.filter(d => !existingCodigos.has(d.codigo));
                if (missingDefaults.length > 0) {
                    setCuentas([...data, ...missingDefaults]);
                } else {
                    setCuentas(data);
                }
            } else {
                // Empresa nueva → sembrar catálogo por defecto en MySQL
                setCuentas(defaultCuentas);
                // Guardar inmediatamente en MySQL para esta empresa
                await api.save('cuentas', defaultCuentas);
            }
            setHasLoaded(true);
        };
        loadCuentas();
    }, []);

    // Sincronizar con servidor al cambiar
    useEffect(() => {
        if (hasLoaded) {
            api.save('cuentas', cuentas);
        }
    }, [cuentas, hasLoaded]);

    const addCuenta = (nuevaCuenta) => {
        setCuentas([...cuentas, { ...nuevaCuenta, id: Date.now().toString() }]);
    };

    const updateCuenta = (id, cuentaActualizada) => {
        setCuentas(cuentas.map(c => c.id === id ? { ...c, ...cuentaActualizada } : c));
    };

    const toggleStatusCuenta = (id) => {
        setCuentas(cuentas.map(c => c.id === id ? { ...c, activa: !c.activa } : c));
    };

    const eliminarCuenta = (id) => {
        // Prevent deleting root or level 2 accounts directly to maintain structure
        const cuentaTarget = cuentas.find(c => c.id === id);
        if (cuentaTarget && cuentaTarget.nivel <= 2) {
            alert("No se pueden eliminar las cuentas principales o de nivel control superior.");
            return;
        }

        // Check if it has children
        const hasChildren = cuentas.some(c => c.padreId === id);
        if (hasChildren) {
            alert("No se puede eliminar una cuenta que tiene subcuentas. Elimine las subcuentas primero.");
            return;
        }

        setCuentas(cuentas.filter(c => c.id !== id));
    };

    // Helper function to build a tree
    const buildTree = (cuentasFlat) => {
        // Sort by code first
        cuentasFlat.sort((a, b) => {
            const numA = parseFloat(a.codigo.replace(/\D/g, '')) || 0;
            const numB = parseFloat(b.codigo.replace(/\D/g, '')) || 0;
            return numA - numB || a.codigo.localeCompare(b.codigo);
        });

        let map = {}, node, roots = [], i;
        for (i = 0; i < cuentasFlat.length; i += 1) {
            map[cuentasFlat[i].id] = i;
            cuentasFlat[i].children = [];
        }

        for (i = 0; i < cuentasFlat.length; i += 1) {
            node = cuentasFlat[i];
            if (node.padreId !== null) {
                if (cuentasFlat[map[node.padreId]]) {
                    cuentasFlat[map[node.padreId]].children.push(node);
                }
            } else {
                roots.push(node);
            }
        }
        return roots;
    };

    const treeCuentas = buildTree(JSON.parse(JSON.stringify(cuentas)));

    return (
        <CuentasContext.Provider value={{
            cuentas,
            treeCuentas,
            addCuenta,
            updateCuenta,
            toggleStatusCuenta,
            eliminarCuenta
        }}>
            {children}
        </CuentasContext.Provider>
    );
};
