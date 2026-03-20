import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../utils/api';

const defaultArticulos = [];

const InventarioContext = createContext();

export const useInventario = () => {
    return useContext(InventarioContext);
};

export const InventarioProvider = ({ children }) => {
    const [articulos, setArticulos] = useState([]);
    const [hasLoaded, setHasLoaded] = useState(false);

    useEffect(() => {
        const loadInventario = async () => {
            const data = await api.get('inventario');
            if (data && Array.isArray(data)) {
                setArticulos(data);
            }
            setHasLoaded(true);
        };
        loadInventario();
    }, []);

// Removed auto-save useEffect

    const addArticulo = async (nuevoArticulo) => {
        const item = { ...nuevoArticulo, id: Date.now().toString() };
        setArticulos(prev => [...prev, item]);
        await api.save('inventario', item);
    };

    const updateArticulo = async (id, articuloActualizado) => {
        setArticulos(prev => prev.map(a => a.id === id ? { ...a, ...articuloActualizado } : a));
        await api.update('inventario', id, articuloActualizado);
    };

    const actualizarPreciosDesdeCompra = (itemsComprados) => {
        // itemsComprados = [{ id: '...', costoNuevo: 100, precioNuevo: 150 }, ...]
        const updatedItems = [];
        setArticulos(prevArticulos => prevArticulos.map(art => {
            const comprado = itemsComprados.find(i => String(i.id) === String(art.id));
            if (comprado) {
                const updated = {
                    ...art,
                    costo: Number(comprado.costoNuevo) || art.costo,
                    precioVenta: Number(comprado.precioNuevo) || art.precioVenta
                };
                updatedItems.push(updated);
                return updated;
            }
            return art;
        }));
        
        // Sincronización atómica en lote
        updatedItems.forEach(item => {
            api.update('inventario', item.id, item);
        });
    };

    const toggleStatusArticulo = async (id) => {
        const item = articulos.find(a => a.id === id);
        if(!item) return;
        const updated = { ...item, activa: !item.activa };
        setArticulos(prev => prev.map(a => a.id === id ? updated : a));
        await api.update('inventario', id, updated);
    };

    const eliminarArticulo = async (id) => {
        setArticulos(prev => prev.filter(a => a.id !== id));
        await api.delete('inventario', id);
    };

    // Función para mover stock (desde Compras o Facturación)
    const ajustarStock = (id, cantidad, tipoMovimiento) => { // 'ENTRADA' o 'SALIDA'
        console.log(`📦 [Stock Logic] ${tipoMovimiento}: ID ${id}, Qty ${cantidad}`);
        
        setArticulos(prevArticulos => {
            const index = prevArticulos.findIndex(a => String(a.id) === String(id));
            if (index === -1) {
                console.warn(`⚠️ [Stock Logic] Articulo ID ${id} no encontrado.`);
                return prevArticulos;
            }

            const a = prevArticulos[index];
            if (a.tipo !== 'Producto') {
                console.log(`ℹ️ [Stock Logic] El item ${a.nombre} es ${a.tipo}, no mueve stock.`);
                return prevArticulos;
            }

            const q = Number(cantidad) || 0;
            const ex = Number(a.existencia) || 0;
            const nuevaExistencia = tipoMovimiento === 'ENTRADA' ? ex + q : ex - q;

            console.log(`✅ [Stock Logic] ${a.nombre}: ${ex} -> ${nuevaExistencia}`);
            
            const nuevosArticulos = [...prevArticulos];
            const updatedArticulo = { ...a, existencia: nuevaExistencia };
            nuevosArticulos[index] = updatedArticulo;
            
            // Sincronización atómica
            api.update('inventario', a.id, { existencia: nuevaExistencia });
            
            return nuevosArticulos;
        });
    };

    return (
        <InventarioContext.Provider value={{
            articulos,
            addArticulo,
            updateArticulo,
            toggleStatusArticulo,
            eliminarArticulo,
            ajustarStock,
            actualizarPreciosDesdeCompra
        }}>
            {children}
        </InventarioContext.Provider>
    );
};
