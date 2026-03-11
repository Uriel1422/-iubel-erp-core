import React, { useState } from 'react';
import { useCotizaciones } from '../context/CotizacionesContext';
import { useInventario } from '../context/InventarioContext';
import { useContactos } from '../context/ContactosContext';
import { FileText, Plus, Trash2, Send, ShoppingCart, User, CheckCircle, Clock } from 'lucide-react';

const Cotizaciones = () => {
    const { cotizaciones, agregarCotizacion, eliminarCotizacion, facturarCotizacion } = useCotizaciones();
    const { articulos } = useInventario();
    const { contactos } = useContactos();

    const [carrito, setCarrito] = useState([]);
    const [clienteId, setClienteId] = useState('');
    const [mostrarNuevo, setMostrarNuevo] = useState(false);

    const handleAgregarCarrito = (productoId) => {
        const prod = articulos.find(p => p.id === productoId);
        if (!prod) return;

        const existe = carrito.find(item => item.id === prod.id);
        if (existe) {
            setCarrito(carrito.map(item =>
                item.id === prod.id ? { ...item, cantidad: item.cantidad + 1, total: (item.cantidad + 1) * item.precioVenta } : item
            ));
        } else {
            setCarrito([...carrito, { ...prod, cantidad: 1, total: prod.precioVenta, precio: prod.precioVenta }]);
        }
    };

    const handleGuardar = () => {
        if (!clienteId || carrito.length === 0) return;

        const cliente = contactos.find(c => c.id === clienteId);
        const subtotal = carrito.reduce((acc, item) => acc + item.total, 0);
        const itbis = subtotal * 0.18;

        agregarCotizacion({
            cliente: cliente.nombre,
            rnc: cliente.rnc,
            detalles: carrito,
            subtotal: subtotal,
            itbis: itbis,
            total: subtotal + itbis
        });

        setCarrito([]);
        setClienteId('');
        setMostrarNuevo(false);
    };

    const formatMoney = (amount) => {
        return new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP' }).format(amount);
    };

    return (
        <div className="animate-up">
            <div style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <h1 className="page-title" style={{ marginBottom: '0.5rem' }}>Cotizaciones y Proformas</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Crea presupuestos para tus clientes que luego puedes convertir en facturas reales.</p>
                </div>
                <button className="btn btn-primary" onClick={() => setMostrarNuevo(!mostrarNuevo)}>
                    {mostrarNuevo ? 'Ver Listado' : <><Plus size={18} /> Nueva Cotización</>}
                </button>
            </div>

            {mostrarNuevo ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem' }}>
                    <div className="card">
                        <h3 style={{ marginBottom: '1.5rem' }}>Detalles del Presupuesto</h3>
                        <div className="input-group">
                            <label className="input-label">Seleccionar Cliente</label>
                            <select className="input-field" value={clienteId} onChange={(e) => setClienteId(e.target.value)}>
                                <option value="">-- Seleccionar Cliente --</option>
                                {contactos.map(c => (
                                    <option key={c.id} value={c.id}>{c.nombre} ({c.rnc})</option>
                                ))}
                            </select>
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label className="input-label">Agregar Productos / Servicios</label>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '1rem' }}>
                                {articulos.map(p => (
                                    <div
                                        key={p.id}
                                        className="card"
                                        style={{ padding: '0.75rem', cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s' }}
                                        onClick={() => handleAgregarCarrito(p.id)}
                                        onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
                                        onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
                                    >
                                        <div style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.25rem' }}>{p.nombre}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--primary)' }}>{formatMoney(p.precioVenta)}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
                                    <th style={{ padding: '1rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>Producto</th>
                                    <th style={{ padding: '1rem', fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center' }}>Cant.</th>
                                    <th style={{ padding: '1rem', fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'right' }}>Total</th>
                                    <th style={{ padding: '1rem', width: '50px' }}></th>
                                </tr>
                            </thead>
                            <tbody>
                                {carrito.map(item => (
                                    <tr key={item.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                        <td style={{ padding: '1rem', fontSize: '0.875rem' }}>{item.nombre}</td>
                                        <td style={{ padding: '1rem', fontSize: '0.875rem', textAlign: 'center' }}>{item.cantidad}</td>
                                        <td style={{ padding: '1rem', fontSize: '0.875rem', textAlign: 'right' }}>{formatMoney(item.total)}</td>
                                        <td style={{ padding: '1rem' }}>
                                            <button onClick={() => setCarrito(carrito.filter(c => c.id !== item.id))} style={{ color: 'var(--danger)', border: 'none', background: 'none' }}>
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="card glass">
                        <h3 style={{ marginBottom: '1.5rem' }}>Resumen</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>Subtotal</span>
                                <span>{formatMoney(carrito.reduce((acc, i) => acc + i.total, 0))}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>ITBIS (18%)</span>
                                <span>{formatMoney(carrito.reduce((acc, i) => acc + i.total, 0) * 0.18)}</span>
                            </div>
                            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '1.25rem' }}>
                                <span>Total</span>
                                <span style={{ color: 'var(--primary)' }}>{formatMoney(carrito.reduce((acc, i) => acc + i.total, 0) * 1.18)}</span>
                            </div>
                        </div>
                        <button
                            className="btn btn-primary"
                            style={{ width: '100%', marginTop: '2rem' }}
                            disabled={!clienteId || carrito.length === 0}
                            onClick={handleGuardar}
                        >
                            <Send size={18} /> Guardar Cotización
                        </button>
                    </div>
                </div>
            ) : (
                <div className="card">
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
                                    <th style={{ padding: '1rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>Número</th>
                                    <th style={{ padding: '1rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>Fecha</th>
                                    <th style={{ padding: '1rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>Cliente</th>
                                    <th style={{ padding: '1rem', fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'right' }}>Total</th>
                                    <th style={{ padding: '1rem', fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center' }}>Estado</th>
                                    <th style={{ padding: '1rem', textAlign: 'right' }}>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {cotizaciones.length === 0 ? (
                                    <tr><td colSpan="6" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No hay cotizaciones registradas.</td></tr>
                                ) : (
                                    cotizaciones.slice().reverse().map(cot => (
                                        <tr key={cot.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                            <td style={{ padding: '1rem', fontSize: '0.875rem', fontWeight: 600 }}>{cot.numero}</td>
                                            <td style={{ padding: '1rem', fontSize: '0.875rem' }}>{new Date(cot.fecha).toLocaleDateString()}</td>
                                            <td style={{ padding: '1rem', fontSize: '0.875rem' }}>{cot.cliente}</td>
                                            <td style={{ padding: '1rem', fontSize: '0.875rem', textAlign: 'right' }}>{formatMoney(cot.total)}</td>
                                            <td style={{ padding: '1rem', fontSize: '0.875rem', textAlign: 'center' }}>
                                                <span
                                                    style={{
                                                        padding: '0.25rem 0.5rem',
                                                        borderRadius: '6px',
                                                        fontSize: '0.7rem',
                                                        fontWeight: 700,
                                                        background: cot.estado === 'Facturada' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                                                        color: cot.estado === 'Facturada' ? 'var(--success)' : 'var(--warning)',
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        gap: '0.25rem'
                                                    }}
                                                >
                                                    {cot.estado === 'Facturada' ? <CheckCircle size={10} /> : <Clock size={10} />}
                                                    {cot.estado}
                                                </span>
                                            </td>
                                            <td style={{ padding: '1rem', textAlign: 'right' }}>
                                                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                                    {cot.estado === 'Pendiente' && (
                                                        <button
                                                            className="btn btn-secondary"
                                                            style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}
                                                            onClick={() => facturarCotizacion(cot.id)}
                                                        >
                                                            Facturar
                                                        </button>
                                                    )}
                                                    <button onClick={() => eliminarCotizacion(cot.id)} style={{ color: 'var(--danger)', border: 'none', background: 'none' }}>
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Cotizaciones;
