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

    useEffect(() => {
        if (hasLoaded) {
            // 🛡️ IUBEL SOVEREIGN GUARD: Empty Sync Protection
            // No sincronizar si la lista está vacía (evita purgas accidentales por fallos de carga)
            if (articulos.length === 0) return;
            api.save('inventario', articulos);
        }
    }, [articulos, hasLoaded]);

    const addArticulo = (nuevoArticulo) => {
        setArticulos([...articulos, { ...nuevoArticulo, id: Date.now().toString() }]);
    };

    const updateArticulo = (id, articuloActualizado) => {
        setArticulos(articulos.map(a => a.id === id ? { ...a, ...articuloActualizado } : a));
    };

    const actualizarPreciosDesdeCompra = (itemsComprados) => {
        // itemsComprados = [{ id: '...', costoNuevo: 100, precioNuevo: 150 }, ...]
        setArticulos(prevArticulos => prevArticulos.map(art => {
            const comprado = itemsComprados.find(i => String(i.id) === String(art.id));
            if (comprado) {
                return {
                    ...art,
                    costo: Number(comprado.costoNuevo) || art.costo,
                    precioVenta: Number(comprado.precioNuevo) || art.precioVenta
                };
            }
            return art;
        }));
    };

    const toggleStatusArticulo = (id) => {
        setArticulos(articulos.map(a => a.id === id ? { ...a, activa: !a.activa } : a));
    };

    const eliminarArticulo = (id) => {
        setArticulos(articulos.filter(a => a.id !== id));
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
            nuevosArticulos[index] = { ...a, existencia: nuevaExistencia };
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
