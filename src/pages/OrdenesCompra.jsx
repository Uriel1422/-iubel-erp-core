import React, { useState } from 'react';
import { useCompras } from '../context/ComprasContext';
import { useContactos } from '../context/ContactosContext';
import { useInventario } from '../context/InventarioContext';
import { FilePlus, Search, Trash2, Send, CheckCircle, Package, ArrowRight, X } from 'lucide-react';
import ConfirmModal from '../components/ConfirmModal';

const OrdenesCompra = () => {
    const { ordenes, registrarOrden, cancelarOrden, convertirOrdenACompra } = useCompras();
    const { contactos } = useContactos();
    const { articulos } = useInventario();

    const [showNewModal, setShowNewModal] = useState(false);
    const [showConvertModal, setShowConvertModal] = useState({ open: false, orden: null });
    const [confirmCancel, setConfirmCancel] = useState({ open: false, id: null });

    // Estado del Formulario de Nueva Orden
    const [proveedorId, setProveedorId] = useState('');
    const [carrito, setCarrito] = useState([]);
    const [articuloId, setArticuloId] = useState('');
    const [cantidad, setCantidad] = useState(1);

    const proveedores = contactos.filter(c => c.tipo === 'Proveedor');

    const handleAgregarAlCarrito = () => {
        const art = articulos.find(a => a.id === articuloId);
        if (!art) return;
        setCarrito([...carrito, {
            articuloId: art.id,
            nombre: art.nombre,
            cantidad,
            costo: art.costo,
            gravado: art.gravado
        }]);
        setArticuloId('');
        setCantidad(1);
    };

    const handleRegistrarOrden = () => {
        if (!proveedorId || carrito.length === 0) return;
        const prov = proveedores.find(p => p.id === proveedorId);

        const subtotal = carrito.reduce((acc, i) => acc + (i.cantidad * i.costo), 0);
        const itbis = carrito.reduce((acc, i) => acc + (i.gravado ? (i.cantidad * i.costo) * 0.18 : 0), 0);

        registrarOrden({
            proveedorId,
            proveedorNombre: prov.nombre,
            proveedorRnc: prov.rnc,
            articulos: carrito,
            subtotal,
            itbis,
            total: subtotal + itbis
        });

        setShowNewModal(false);
        setCarrito([]);
        setProveedorId('');
    };

    const handleConvertir = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        convertirOrdenACompra(showConvertModal.orden.id, {
            ncf: formData.get('ncf'),
            condicion: formData.get('condicion'),
            cuentaDestinoId: formData.get('cuenta')
        });
        setShowConvertModal({ open: false, orden: null });
    };

    const formatMoney = (amount) => {
        return new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP' }).format(amount);
    };

    return (
        <div className="animate-up">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 className="page-title" style={{ marginBottom: '0.25rem' }}>Órdenes de Compra</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Gestiona los pedidos a proveedores antes de convertirlos en compras reales.</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowNewModal(true)}>
                    <FilePlus size={18} /> Nueva Orden de Compra
                </button>
            </div>

            <div className="card">
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--background)' }}>
                                <th style={{ padding: '1rem', textAlign: 'left' }}>Número</th>
                                <th style={{ padding: '1rem', textAlign: 'left' }}>Fecha</th>
                                <th style={{ padding: '1rem', textAlign: 'left' }}>Proveedor</th>
                                <th style={{ padding: '1rem', textAlign: 'right' }}>Total</th>
                                <th style={{ padding: '1rem', textAlign: 'center' }}>Estado</th>
                                <th style={{ padding: '1rem', textAlign: 'center' }}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {ordenes.length === 0 ? (
                                <tr><td colSpan="6" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>No hay órdenes registradas.</td></tr>
                            ) : (
                                [...ordenes].reverse().map(o => (
                                    <tr key={o.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                        <td style={{ padding: '1rem', fontWeight: 600 }}>{o.numeroInterno}</td>
                                        <td style={{ padding: '1rem' }}>{new Date(o.fechaRegistro).toLocaleDateString()}</td>
                                        <td style={{ padding: '1rem' }}>{o.proveedorNombre}</td>
                                        <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 600 }}>{formatMoney(o.total)}</td>
                                        <td style={{ padding: '1rem', textAlign: 'center' }}>
                                            <span style={{
                                                padding: '0.25rem 0.75rem',
                                                borderRadius: '1rem',
                                                fontSize: '0.75rem',
                                                fontWeight: 600,
                                                background: o.estado === 'Convertida' ? 'var(--success-light)' : o.estado === 'Cancelada' ? 'var(--danger-light)' : 'var(--primary-light)',
                                                color: o.estado === 'Convertida' ? 'var(--success)' : o.estado === 'Cancelada' ? 'var(--danger)' : 'var(--primary)'
                                            }}>
                                                {o.estado}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1rem', textAlign: 'center' }}>
                                            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                                                {o.estado === 'Pendiente' && (
                                                    <>
                                                        <button
                                                            className="btn"
                                                            style={{ color: 'var(--success)', padding: '0.25rem' }}
                                                            onClick={() => setShowConvertModal({ open: true, orden: o })}
                                                            title="Convertir a Compra"
                                                        >
                                                            <ArrowRight size={18} />
                                                        </button>
                                                        <button
                                                            className="btn"
                                                            style={{ color: 'var(--danger)', padding: '0.25rem' }}
                                                            onClick={() => setConfirmCancel({ open: true, id: o.id })}
                                                            title="Cancelar"
                                                        >
                                                            <X size={18} />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Nueva Orden */}
            {showNewModal && (
                <div className="modal-overlay">
                    <div className="card" style={{ width: '100%', maxWidth: '700px', padding: 0 }}>
                        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Crear Orden de Compra</h2>
                            <button onClick={() => setShowNewModal(false)}><X size={20} /></button>
                        </div>
                        <div style={{ padding: '1.5rem' }}>
                            <div className="input-group">
                                <label className="input-label">Proveedor</label>
                                <select className="input-field" value={proveedorId} onChange={(e) => setProveedorId(e.target.value)}>
                                    <option value="">-- Seleccionar Proveedor --</option>
                                    {proveedores.map(p => <option key={p.id} value={p.id}>{p.nombre} ({p.rnc})</option>)}
                                </select>
                            </div>

                            <div className="glass" style={{ padding: '1rem', marginBottom: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
                                <div className="input-group" style={{ flex: 1, marginBottom: 0 }}>
                                    <label className="input-label">Artículo</label>
                                    <select className="input-field" value={articuloId} onChange={(e) => setArticuloId(e.target.value)}>
                                        <option value="">-- Seleccionar --</option>
                                        {articulos.map(a => <option key={a.id} value={a.id}>{a.nombre}</option>)}
                                    </select>
                                </div>
                                <div className="input-group" style={{ width: '100px', marginBottom: 0 }}>
                                    <label className="input-label">Cant.</label>
                                    <input type="number" className="input-field" value={cantidad} onChange={(e) => setCantidad(e.target.value)} />
                                </div>
                                <button className="btn btn-secondary" onClick={handleAgregarAlCarrito}><FilePlus size={18} /> Añadir</button>
                            </div>

                            <table style={{ width: '100%', marginBottom: '1.5rem' }}>
                                <thead>
                                    <tr style={{ background: 'var(--background)', fontSize: '0.8rem' }}>
                                        <th style={{ padding: '0.5rem' }}>Item</th>
                                        <th style={{ padding: '0.5rem' }}>Cant.</th>
                                        <th style={{ padding: '0.5rem' }}>Costo Est.</th>
                                        <th style={{ padding: '0.5rem' }}>Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {carrito.map((item, idx) => (
                                        <tr key={idx} style={{ borderBottom: '1px solid var(--border)' }}>
                                            <td style={{ padding: '0.5rem' }}>{item.nombre}</td>
                                            <td style={{ padding: '0.5rem', textAlign: 'center' }}>{item.cantidad}</td>
                                            <td style={{ padding: '0.5rem', textAlign: 'right' }}>{formatMoney(item.costo)}</td>
                                            <td style={{ padding: '0.5rem', textAlign: 'right' }}>{formatMoney(item.cantidad * item.costo)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                                <button className="btn btn-secondary" onClick={() => setShowNewModal(false)}>Cancelar</button>
                                <button className="btn btn-primary" onClick={handleRegistrarOrden} disabled={carrito.length === 0 || !proveedorId}>
                                    Generar Orden de Compra
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Convertir a Compra */}
            {showConvertModal.open && (
                <div className="modal-overlay">
                    <div className="card" style={{ width: '100%', maxWidth: '500px', padding: 0 }}>
                        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)' }}>
                            <h2 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Convertir a Factura de Compra</h2>
                            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Esta acción registrará el gasto y afectará inventario/cuentas por pagar.</p>
                        </div>
                        <form onSubmit={handleConvertir} style={{ padding: '1.5rem' }}>
                            <div className="input-group">
                                <label className="input-label">NCF del Proveedor</label>
                                <input required name="ncf" className="input-field" placeholder="B0100000001" />
                            </div>
                            <div className="input-group">
                                <label className="input-label">Condición</label>
                                <select name="condicion" className="input-field">
                                    <option value="Contado">Contado</option>
                                    <option value="Credito">Crédito</option>
                                </select>
                            </div>
                            <div className="input-group">
                                <label className="input-label">Cuenta de Gasto/Destino</label>
                                <select name="cuenta" className="input-field">
                                    <option value="">-- Autodetectar (Inventario) --</option>
                                    <option value="610101">Gasto de Oficina</option>
                                    <option value="610105">Publicidad</option>
                                </select>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
                                <button type="button" className="btn btn-secondary" onClick={() => setShowConvertModal({ open: false, orden: null })}>Cancelar</button>
                                <button type="submit" className="btn btn-primary">Confirmar Registro</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <ConfirmModal
                isOpen={confirmCancel.open}
                onClose={() => setConfirmCancel({ open: false, id: null })}
                onConfirm={() => {
                    cancelarOrden(confirmCancel.id);
                    setConfirmCancel({ open: false, id: null });
                }}
                title="Cancelar Orden"
                message="¿Seguro que desea cancelar esta orden de compra? Esta acción no se puede deshacer."
            />
        </div>
    );
};

export default OrdenesCompra;
