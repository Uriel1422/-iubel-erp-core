import React, { useState, useEffect } from 'react';
import { X, Search, Plus, Trash2, ShoppingBag, PackagePlus } from 'lucide-react';
import { useInventario } from '../context/InventarioContext';
import { useCompras } from '../context/ComprasContext';
import ArticuloFormModal from './ArticuloFormModal';

const CompraAvanzadaModal = ({ isOpen, onClose }) => {
    const { articulos, actualizarPreciosDesdeCompra } = useInventario();
    const { registrarCompra } = useCompras();

    const [proveedorNombre, setProveedorNombre] = useState('');
    const [proveedorRnc, setProveedorRnc] = useState('');
    const [ncf, setNcf] = useState('');
    const [fechaFactura, setFechaFactura] = useState(new Date().toISOString().split('T')[0]);
    const [condicion, setCondicion] = useState('Contado');
    const [incluirItbisGeneral, setIncluirItbisGeneral] = useState(true);

    const [busqueda, setBusqueda] = useState('');
    const [carrito, setCarrito] = useState([]);
    const [showArticuloModal, setShowArticuloModal] = useState(false);

    // Filtramos solo productos activos (excluimos servicios puro si no tienen costo, pero dejémoslo general)
    const productosDisponibles = articulos.filter(a => a.activa && a.nombre.toLowerCase().includes(busqueda.toLowerCase())).slice(0, 5);

    // Reset al abrir
    useEffect(() => {
        if (isOpen) {
            setProveedorNombre('');
            setProveedorRnc('');
            setNcf('');
            setCondicion('Contado');
            setIncluirItbisGeneral(true);
            setCarrito([]);
            setBusqueda('');
            setFechaFactura(new Date().toISOString().split('T')[0]);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const agregarAlCarrito = (articulo) => {
        if (carrito.find(item => String(item.articulo.id) === String(articulo.id))) return;
        setCarrito([...carrito, {
            articulo,
            cantidad: 1,
            costoNuevo: articulo.costo || 0,
            precioNuevo: articulo.precio || 0,
            aplicaItbis: articulo.gravado && incluirItbisGeneral
        }]);
        setBusqueda('');
    };

    const actualizarLinea = (index, campo, valor) => {
        const nuevoCarrito = [...carrito];
        nuevoCarrito[index][campo] = valor;
        setCarrito(nuevoCarrito);
    };

    const eliminarLinea = (index) => {
        setCarrito(carrito.filter((_, i) => i !== index));
    };

    // Cálculos
    let subtotalCosto = 0;
    let totalItbis = 0;

    carrito.forEach(item => {
        const lineaCostoTotal = (Number(item.cantidad) || 0) * (Number(item.costoNuevo) || 0);
        subtotalCosto += lineaCostoTotal;
        if (item.aplicaItbis && item.articulo.gravado) {
            totalItbis += (lineaCostoTotal * 0.18);
        }
    });

    const totalFactura = subtotalCosto + totalItbis;

    const handleGuardar = (e) => {
        e.preventDefault();

        if (carrito.length === 0) {
            alert('Debe agregar al menos un artículo a la compra.');
            return;
        }

        // 1. Preparar datos para registrar la compra en ComprasContext
        const compraARegistrar = {
            proveedorNombre: proveedorNombre || 'Proveedor Genérico',
            proveedorRnc,
            ncf,
            fechaFactura,
            condicion,
            tipoGasto: '09', // 09 = Compras e Inversiones que forman parte del Costo
            subtotal: subtotalCosto,
            itbis: totalItbis,
            total: totalFactura,
            // Guardamos el detalle para que ComprasContext sepa mover el inventario
            articulos: carrito.map(item => ({
                articuloId: item.articulo.id,
                cantidad: Number(item.cantidad),
                costo: Number(item.costoNuevo)
            }))
        };

        // 2. Registrar la compra (Generará el asiento: Débito a Inventario/Itbis, Crédito a CxP/Banco)
        registrarCompra(compraARegistrar);

        // 3. Actualizar la metadata del maestro de inventario (Nuevos precios y costos)
        const updatesDePrecioYcosto = carrito.map(item => ({
            id: item.articulo.id,
            costoNuevo: Number(item.costoNuevo),
            precioNuevo: Number(item.precioNuevo)
        }));
        actualizarPreciosDesdeCompra(updatesDePrecioYcosto);

        alert('Compra registrada y precios actualizados exitosamente.');
        onClose();
    };

    const formatMoney = (amount) => {
        return new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP' }).format(amount);
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: '1000px', width: '95%' }}>
                <div className="modal-header">
                    <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <ShoppingBag className="text-primary" /> Entrada Avanzada de Inventario (Compra)
                    </h2>
                    <button className="btn" onClick={onClose} style={{ padding: '0.25rem' }}><X size={20} /></button>
                </div>

                <div className="modal-body" style={{ maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }}>
                    <form id="compraAvanzadaForm" onSubmit={handleGuardar}>

                        {/* Cabecera Proveedor */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem', padding: '1rem', background: 'var(--background)', borderRadius: 'var(--radius-md)' }}>
                            <div className="input-group">
                                <label className="input-label">Proveedor</label>
                                <input required type="text" className="input-field" value={proveedorNombre} onChange={(e) => setProveedorNombre(e.target.value)} placeholder="Nombre del proveedor" />
                            </div>
                            <div className="input-group">
                                <label className="input-label">RNC</label>
                                <input type="text" className="input-field" value={proveedorRnc} onChange={(e) => setProveedorRnc(e.target.value)} placeholder="Opcional" />
                            </div>
                            <div className="input-group">
                                <label className="input-label">NCF Recibido</label>
                                <input required type="text" className="input-field" value={ncf} onChange={(e) => setNcf(e.target.value)} placeholder="Ej: B01000..." maxLength="11" />
                            </div>
                            <div className="input-group">
                                <label className="input-label">Fecha Factura</label>
                                <input required type="date" className="input-field" value={fechaFactura} onChange={(e) => setFechaFactura(e.target.value)} />
                            </div>
                            <div className="input-group">
                                <label className="input-label">Condición de Pago</label>
                                <select className="input-field" value={condicion} onChange={(e) => setCondicion(e.target.value)}>
                                    <option value="Contado">Al Contado (Efectivo/Banco)</option>
                                    <option value="Credito">A Crédito (Cuentas por Pagar)</option>
                                </select>
                            </div>
                            <div className="input-group" style={{ gridColumn: 'span 3', display: 'flex', alignItems: 'center' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                    <input
                                        type="checkbox"
                                        checked={incluirItbisGeneral}
                                        onChange={(e) => setIncluirItbisGeneral(e.target.checked)}
                                        style={{ width: '18px', height: '18px' }}
                                    />
                                    <span>La factura general incluye ITBIS (Se calculará según producto gravado)</span>
                                </label>
                            </div>
                        </div>

                        {/* Buscador de artículos */}
                        <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
                            <div className="input-group" style={{ marginBottom: 0 }}>
                                <div style={{ position: 'relative' }}>
                                    <Search size={18} style={{ position: 'absolute', left: '1rem', top: '0.75rem', color: 'var(--text-muted)' }} />
                                    <input
                                        type="text"
                                        className="input-field"
                                        placeholder="Buscar producto a comprar para agregarlo..."
                                        value={busqueda}
                                        onChange={(e) => setBusqueda(e.target.value)}
                                        style={{ paddingLeft: '2.5rem' }}
                                    />
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={() => setShowArticuloModal(true)}
                                        style={{ position: 'absolute', right: '0.5rem', top: '0.35rem', height: '32px', background: 'var(--primary-light)', color: 'var(--primary)', borderColor: 'var(--primary)', fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                                    >
                                        <PackagePlus size={14} /> Nuevo
                                    </button>
                                </div>
                            </div>
                            {busqueda && (
                                <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', zIndex: 10, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                                    {productosDisponibles.map(art => (
                                        <div
                                            key={art.id}
                                            style={{ padding: '0.75rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', cursor: 'pointer' }}
                                            onClick={() => agregarAlCarrito(art)}
                                            className="hover-bg"
                                        >
                                            <div>
                                                <div style={{ fontWeight: 600 }}>{art.codigo} - {art.nombre}</div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Costo actual: {formatMoney(art.costo)} | Precio actual: {formatMoney(art.precio)}</div>
                                            </div>
                                            <button type="button" className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}><Plus size={14} /> Agregar</button>
                                        </div>
                                    ))}
                                    {productosDisponibles.length === 0 && (
                                        <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)' }}>No se encontraron artículos.</div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Tabla de detalle - AQUÍ ESTÁ LA MAGIA */}
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', marginBottom: '2rem' }}>
                            <thead>
                                <tr style={{ background: 'var(--background)', borderBottom: '1px solid var(--border)' }}>
                                    <th style={{ padding: '0.75rem', fontSize: '0.875rem' }}>Artículo</th>
                                    <th style={{ padding: '0.75rem', fontSize: '0.875rem', width: '100px', textAlign: 'center' }}>Cant.</th>
                                    <th style={{ padding: '0.75rem', fontSize: '0.875rem', width: '150px' }}>Nuevo Costo (RD$)</th>
                                    <th style={{ padding: '0.75rem', fontSize: '0.875rem', width: '150px' }}>Nuevo Precio Venta</th>
                                    <th style={{ padding: '0.75rem', fontSize: '0.875rem', width: '120px', textAlign: 'right' }}>Total Costo</th>
                                    <th style={{ padding: '0.75rem', fontSize: '0.875rem', width: '60px', textAlign: 'center' }}></th>
                                </tr>
                            </thead>
                            <tbody>
                                {carrito.map((item, idx) => (
                                    <tr key={idx} style={{ borderBottom: '1px solid var(--border)' }}>
                                        <td style={{ padding: '0.5rem' }}>
                                            <div style={{ fontWeight: 500 }}>{item.articulo.nombre}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.articulo.gravado ? 'Gravado (18%)' : 'Exento'}</div>
                                        </td>
                                        <td style={{ padding: '0.5rem' }}>
                                            <input
                                                required
                                                type="number"
                                                min="1"
                                                className="input-field"
                                                value={item.cantidad}
                                                onChange={(e) => actualizarLinea(idx, 'cantidad', e.target.value)}
                                                style={{ textAlign: 'center' }}
                                            />
                                        </td>
                                        <td style={{ padding: '0.5rem' }}>
                                            <input
                                                required
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                className="input-field"
                                                value={item.costoNuevo}
                                                onChange={(e) => actualizarLinea(idx, 'costoNuevo', e.target.value)}
                                            />
                                        </td>
                                        <td style={{ padding: '0.5rem' }}>
                                            <input
                                                required
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                className="input-field"
                                                value={item.precioNuevo}
                                                onChange={(e) => actualizarLinea(idx, 'precioNuevo', e.target.value)}
                                                style={{ border: '1px solid var(--primary)', background: 'var(--primary-light)', color: 'var(--text-main)' }}
                                                title="Actualizará el precio de venta en el catálogo."
                                            />
                                        </td>
                                        <td style={{ padding: '0.5rem', textAlign: 'right', fontWeight: 600 }}>
                                            {formatMoney((Number(item.cantidad) || 0) * (Number(item.costoNuevo) || 0))}
                                        </td>
                                        <td style={{ padding: '0.5rem', textAlign: 'center' }}>
                                            <button type="button" className="btn" style={{ padding: '0.25rem', color: 'var(--danger)' }} onClick={() => eliminarLinea(idx)}>
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {carrito.length === 0 && (
                                    <tr>
                                        <td colSpan="6" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                            Busque y agregue productos a la factura de compra.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>

                        {/* Totales */}
                        <div style={{ display: 'flex', justifyContent: 'flex-end', background: 'var(--primary-light)', padding: '1.5rem', borderRadius: 'var(--radius-md)' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem 3rem', alignItems: 'center' }}>
                                <div style={{ color: 'var(--text-muted)', textAlign: 'right' }}>Subtotal Inventario:</div>
                                <div style={{ fontWeight: 600, fontSize: '1.125rem', textAlign: 'right' }}>{formatMoney(subtotalCosto)}</div>

                                <div style={{ color: 'var(--text-muted)', textAlign: 'right' }}>Total ITBIS Adelantado:</div>
                                <div style={{ fontWeight: 600, fontSize: '1.125rem', textAlign: 'right' }}>{formatMoney(totalItbis)}</div>

                                <div style={{ color: 'var(--primary)', textAlign: 'right', fontWeight: 700, fontSize: '1.125rem' }}>Total Factura:</div>
                                <div style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '1.5rem', textAlign: 'right' }}>{formatMoney(totalFactura)}</div>
                            </div>
                        </div>

                        <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(56, 189, 248, 0.1)', border: '1px solid var(--primary)', borderRadius: 'var(--radius-md)', fontSize: '0.875rem' }}>
                            <strong>📌 Integración Contable:</strong> Al guardar, se sumará el stock, se afectará el Débito a Inventario (e ITBIS) y Crédito a la Condición de Pago seleccionada. Los Costos y Precios de Venta modificados se actualizarán globalmente.
                        </div>

                    </form>
                </div>

                <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
                    <button type="submit" form="compraAvanzadaForm" className="btn btn-primary">
                        Comprar y Actualizar Catálogo
                    </button>
                </div>
            </div>
            <ArticuloFormModal
                isOpen={showArticuloModal}
                onClose={() => setShowArticuloModal(false)}
            />
        </div>
    );
};

export default CompraAvanzadaModal;
