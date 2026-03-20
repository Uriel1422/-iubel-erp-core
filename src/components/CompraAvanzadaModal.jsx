import React, { useState, useEffect } from 'react';
import { X, Search, Plus, Trash2, ShoppingBag, PackagePlus, Users, FileText, Calendar, CreditCard, AlertTriangle } from 'lucide-react';
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
            <div style={{ width: '100%', maxWidth: '1000px', background: 'var(--card-bg)', borderRadius: '24px', position: 'relative', border: '1px solid var(--border)', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', overflow: 'hidden', animation: 'scaleUp 0.3s ease-out' }}>
                <div style={{ padding: '1.5rem 2rem', background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ width: 42, height: 42, borderRadius: '12px', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
                            <ShoppingBag color="white" size={24} />
                        </div>
                        <div>
                            <h2 style={{ margin: 0, color: 'white', fontSize: '1.25rem', fontWeight: 800 }}>Registro de Compra Avanzada</h2>
                            <p style={{ margin: 0, color: 'rgba(255,255,255,0.8)', fontSize: '0.8rem' }}>Actualización masiva de inventario y precios</p>
                        </div>
                    </div>
                    <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white' }}>
                        <X size={20} />
                    </button>
                </div>

                <div className="modal-body" style={{ maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }}>
                    <form id="compraAvanzadaForm" onSubmit={handleGuardar}>

                        {/* Cabecera de Compra Elite */}
                        <div style={{ marginBottom: '2.5rem', padding: '1.75rem', background: 'var(--background)', borderRadius: '20px', border: '1px solid var(--border)', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}>
                            <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.6rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
                                <Users size={16} /> Información del Proveedor y Comprobante
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
                                <div className="input-group" style={{ margin: 0 }}>
                                    <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                        <Search size={14} color="var(--primary)" /> Proveedor
                                    </label>
                                    <input required type="text" className="input-field" value={proveedorNombre} onChange={(e) => setProveedorNombre(e.target.value)} placeholder="Nombre del proveedor" />
                                </div>
                                <div className="input-group" style={{ margin: 0 }}>
                                    <label className="input-label">RNC / Cédula</label>
                                    <input required type="text" className="input-field" value={proveedorRnc} onChange={(e) => setProveedorRnc(e.target.value)} placeholder="001-0000000-0" />
                                </div>
                                <div className="input-group" style={{ margin: 0 }}>
                                    <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                        <FileText size={14} color="var(--primary)" /> NCF (Comprobante)
                                    </label>
                                    <input required type="text" className="input-field" value={ncf} onChange={(e) => setNcf(e.target.value)} placeholder="B0100000001" maxLength="11" />
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr', gap: '1.5rem', alignItems: 'end' }}>
                                <div className="input-group" style={{ margin: 0 }}>
                                    <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                        <Calendar size={14} color="var(--primary)" /> Fecha Factura
                                    </label>
                                    <input required type="date" className="input-field" value={fechaFactura} onChange={(e) => setFechaFactura(e.target.value)} />
                                </div>
                                <div className="input-group" style={{ margin: 0 }}>
                                    <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                        <CreditCard size={14} color="var(--primary)" /> Condición
                                    </label>
                                    <select className="input-field" value={condicion} onChange={(e) => setCondicion(e.target.value)}>
                                        <option value="Contado">💵 Contado</option>
                                        <option value="Crédito">⏳ Crédito</option>
                                    </select>
                                </div>
                                <div className="input-group" style={{ margin: 0, display: 'flex', alignItems: 'center' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', padding: '0.75rem 1rem', background: incluirItbisGeneral ? 'rgba(59,130,246,0.1)' : 'var(--background)', borderRadius: '12px', border: `1px solid ${incluirItbisGeneral ? 'var(--primary)' : 'var(--border)'}`, width: '100%', transition: 'all 0.2s', marginBottom: 0 }}>
                                        <input
                                            type="checkbox"
                                            checked={incluirItbisGeneral}
                                            onChange={(e) => setIncluirItbisGeneral(e.target.checked)}
                                            style={{ width: '18px', height: '18px', accentColor: 'var(--primary)', cursor: 'pointer' }}
                                        />
                                        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>Incluye ITBIS General (18%)</span>
                                    </label>
                                </div>
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

                        <div style={{ marginTop: '2rem', padding: '1.25rem', background: 'rgba(59, 130, 246, 0.05)', border: '1px solid rgba(59, 130, 246, 0.2)', borderRadius: '16px', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                            <div style={{ width: 40, height: 40, borderRadius: '10px', background: 'rgba(59, 130, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <AlertTriangle size={20} color="#3b82f6" />
                            </div>
                            <div style={{ fontSize: '0.82rem', lineHeight: 1.5, color: 'var(--text-muted)' }}>
                                <strong style={{ color: 'var(--text-main)', display: 'block', marginBottom: '0.2rem' }}>📌 Integración Contable y Catálogo:</strong> 
                                Al guardar, se sumará el stock automáticamente, el sistema generará los débitos a Inventario/ITBIS y los créditos a Caja/Proveedores. Los Costos y Precios de Venta modificados se actualizarán globalmente en el catálogo.
                            </div>
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
