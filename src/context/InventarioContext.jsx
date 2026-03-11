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
        setArticulos(articulos.map(a => {
            if (String(a.id) === String(id) && a.tipo === 'Producto') {
                const nuevaExistencia = tipoMovimiento === 'ENTRADA'
                    ? Number(a.existencia) + Number(cantidad)
                    : Number(a.existencia) - Number(cantidad);
                return { ...a, existencia: nuevaExistencia };
            }
            return a;
        }));
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
