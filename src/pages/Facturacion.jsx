import React, { useState } from 'react';
import { useInventario } from '../context/InventarioContext';
import { useFacturacion } from '../context/FacturacionContext';
import { useMoneda } from '../context/MonedaContext';
import { useContactos } from '../context/ContactosContext';
import {
    ShoppingCart, Plus, Trash2, CheckCircle, Globe,
    FileText, Users, ClipboardList, Package, CreditCard, BarChart
} from 'lucide-react';
import ConfirmModal from '../components/ConfirmModal';

const TABS = [
    { id: 'facturacion', label: 'Facturación', icon: FileText },
    { id: 'vendedores', label: 'Vendedores', icon: Users },
    { id: 'cotizaciones', label: 'Cotizaciones', icon: ClipboardList },
    { id: 'pedidos', label: 'Pedidos', icon: Package },
    { id: 'clientes', label: 'Clientes', icon: Users },
    { id: 'pagos', label: 'Pagos', icon: CreditCard },
    { id: 'informes', label: 'Informes', icon: BarChart },
];

const Facturacion = () => {
    const { articulos } = useInventario();
    const { guardarFactura, facturas, eliminarFactura } = useFacturacion();
    const { monedas } = useMoneda();
    const { contactos } = useContactos();

    const clientes = contactos.filter(c => c.tipo === 'Cliente');

    const [activeTab, setActiveTab] = useState('facturacion');

    // ── Delete Confirmation ──────────────────────────────────────────
    const [confirmDelete, setConfirmDelete] = useState({ open: false, id: null });

    const handleDeleteFactura = (id) => setConfirmDelete({ open: true, id });
    const confirmDeleteAction = () => {
        if (confirmDelete.id) {
            eliminarFactura(confirmDelete.id);
            setConfirmDelete({ open: false, id: null });
        }
    };

    // ── Form Fields ──────────────────────────────────────────────────
    const [clienteNombre, setClienteNombre] = useState('');
    const [clienteRnc, setClienteRnc] = useState('');
    const [tipoComprobante, setTipoComprobante] = useState('B02');
    const [condicion, setCondicion] = useState('Contado');
    const [monedaId, setMonedaId] = useState('1');
    const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
    const [descuentoGlobal, setDescuentoGlobal] = useState('0');

    // ── Cart State ────────────────────────────────────────────────────
    const [carrito, setCarrito] = useState([]);
    const [articuloId, setArticuloId] = useState('');
    const [cantidadInput, setCantidadInput] = useState('1');
    const [facturaGuardada, setFacturaGuardada] = useState(null);
    const [errorMsg, setErrorMsg] = useState('');

    const activosParaVenta = articulos.filter(a => a.activa);

    // ── AGREGAR AL CARRITO ─────────────────────────────────────────────
    const handleAgregarAlCarrito = () => {
        setErrorMsg('');
        if (!articuloId) return setErrorMsg('Seleccione un artículo de la lista.');

        const cantidad = parseInt(cantidadInput, 10);
        if (isNaN(cantidad) || cantidad <= 0) return setErrorMsg('La cantidad debe ser un número mayor a 0.');

        const articulo = articulos.find(a => String(a.id) === String(articuloId));
        if (!articulo) return setErrorMsg('Artículo no encontrado.');

        if (articulo.tipo === 'Producto') {
            const existencia = Number(articulo.existencia) || 0;
            const yaEnCarrito = carrito.find(i => String(i.articulo.id) === String(articuloId));
            const totalTrasAgregar = (yaEnCarrito ? Number(yaEnCarrito.cantidad) : 0) + cantidad;
            if (totalTrasAgregar > existencia) {
                return setErrorMsg(`Existencia insuficiente (${existencia} disponibles).`);
            }
        }

        setCarrito(prev => {
            const idx = prev.findIndex(i => String(i.articulo.id) === String(articuloId));
            if (idx >= 0) {
                const updated = [...prev];
                updated[idx] = { ...updated[idx], cantidad: Number(updated[idx].cantidad) + cantidad };
                return updated;
            }
            return [...prev, { articulo: { ...articulo }, cantidad, precio: Number(articulo.precioVenta) || 0 }];
        });

        setArticuloId('');
        setCantidadInput('1');
    };

    const handleRemoverDelCarrito = (artId) => setCarrito(prev => prev.filter(i => String(i.articulo.id) !== String(artId)));

    // ── TOTALS ─────────────────────────────────────────────────────────
    const subtotal = carrito.reduce((acc, item) => acc + (Number(item.cantidad) * Number(item.precio)), 0);
    const montoDescuento = parseFloat(descuentoGlobal) || 0;
    const subtotalConDescuento = Math.max(0, subtotal - montoDescuento);
    const totalItbis = carrito.reduce((acc, item) => {
        if (!item.articulo.gravado) return acc;
        // El ITBIS se calcula sobre el precio tras aplicar el descuento proporcional
        const proporcion = subtotal > 0 ? (item.cantidad * item.precio) / subtotal : 0;
        const descuentoLinea = montoDescuento * proporcion;
        return acc + ((item.cantidad * item.precio) - descuentoLinea) * 0.18;
    }, 0);
    const totalGeneral = subtotalConDescuento + totalItbis;

    const selectedMoneda = monedas.find(m => String(m.id) === String(monedaId)) || monedas[0] || { codigo: 'DOP', simbolo: 'RD$', tasa: 1 };
    const formatMoney = (amount, m = selectedMoneda) => {
        try {
            return new Intl.NumberFormat('es-DO', { style: 'currency', currency: m.codigo, currencyDisplay: 'symbol' }).format(amount);
        } catch {
            return `${m.simbolo || 'RD$'}${Number(amount).toFixed(2)}`;
        }
    };

    // ── GUARDAR FACTURA ────────────────────────────────────────────────
    const handleGuardarFactura = () => {
        if (carrito.length === 0) return alert('Debe agregar al menos un artículo.');
        const data = { 
            clienteNombre: clienteNombre.trim() || 'Cliente Genérico', 
            clienteRnc, 
            tipoComprobante, 
            condicion, 
            fecha,
            subtotal, 
            descuento: montoDescuento,
            itbis: totalItbis, 
            total: totalGeneral, 
            monedaId, 
            tasa: selectedMoneda.tasa || 1 
        };
        setFacturaGuardada(guardarFactura(data, carrito));
        setCarrito([]); setClienteNombre(''); setClienteRnc(''); setArticuloId(''); setCantidadInput('1'); setDescuentoGlobal('0');
    };

    const renderEmptyCatalog = (title, desc) => {
        const Icon = TABS.find(t => t.id === activeTab)?.icon;
        return (
            <div className="animate-fade-in" style={{ padding: '3rem', textAlign: 'center' }}>
                <div style={{ width: 64, height: 64, margin: '0 auto 1.5rem', background: 'var(--primary-light)', color: 'var(--primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {Icon && <Icon size={32} />}
                </div>
                <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{title}</h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>{desc}</p>
                <button className="btn btn-primary" onClick={() => window.location.href = `/${activeTab}`}>Ir a {title} ⇾</button>
            </div>
        );
    };

    return (
        <div className="animate-up" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                <div>
                    <h1 className="page-title" style={{ marginBottom: '0.25rem' }}>Facturación y Ventas</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Módulo Comercial para la gestión integral de ventas, cobros y clientes</p>
                </div>
            </div>

            {/* Ribbon-like Tabs */}
            <div className="card scrollable-tabs" style={{ padding: '0.5rem', marginBottom: '1.5rem', display: 'flex', gap: '0.5rem', overflowX: 'auto', whiteSpace: 'nowrap' }}>
                {TABS.map(tab => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => { setActiveTab(tab.id); setFacturaGuardada(null); }}
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '0.75rem 1.25rem',
                                border: 'none',
                                background: isActive ? 'var(--primary-light)' : 'transparent',
                                color: isActive ? 'var(--primary)' : 'var(--text-muted)',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                minWidth: '110px'
                            }}
                        >
                            <Icon size={24} strokeWidth={isActive ? 2.5 : 1.5} />
                            <span style={{ fontSize: '0.75rem', fontWeight: isActive ? 700 : 500 }}>{tab.label}</span>
                        </button>
                    );
                })}
            </div>

            {/* Tab Contents */}
            <div className="card" style={{ flex: 1, overflowY: 'auto', padding: activeTab === 'facturacion' ? '1.5rem' : 0 }}>
                {activeTab === 'facturacion' && (
                    <div className="animate-fade-in">
                        {facturaGuardada ? (
                            <div style={{ padding: '3rem', textAlign: 'center' }}>
                                <CheckCircle size={64} color="var(--success)" style={{ margin: '0 auto 1rem auto' }} />
                                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>¡Factura Creada Exitosamente!</h2>
                                <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Asiento contable y descargo de inventario generados automáticamente.</p>
                                <div style={{ background: 'var(--background)', padding: '1.5rem', borderRadius: '12px', display: 'inline-block', textAlign: 'left', marginBottom: '2rem' }}>
                                    <p><strong>N° Interno:</strong> {facturaGuardada.numeroInterno}</p>
                                    <p><strong>NCF:</strong> {facturaGuardada.ncf}</p>
                                    <p><strong>Total:</strong> {formatMoney(facturaGuardada.total)}</p>
                                </div>
                                <div><button className="btn btn-primary" onClick={() => setFacturaGuardada(null)}>Nueva Factura</button></div>
                            </div>
                        ) : (
                            <div className="facturacion-grid">
                                {/* Formulario Izquierdo */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', minWidth: 0 }}>
                                    {/* Datos Cliente */}
                                    <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
                                        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>Datos del Cliente</h3>
                                        
                                        <div className="input-group" style={{ marginBottom: '1rem' }}>
                                            <label className="input-label" style={{ color: 'var(--primary)', fontWeight: 700 }}>Seleccionar Cliente Registrado</label>
                                            <select 
                                                className="input-field" 
                                                style={{ border: '1px solid var(--primary)', background: 'var(--primary-light)' }}
                                                onChange={e => {
                                                    const c = clientes.find(cl => cl.id === e.target.value);
                                                    if (c) {
                                                        setClienteNombre(c.nombre);
                                                        setClienteRnc(c.rnc || '');
                                                    }
                                                }}
                                                defaultValue=""
                                            >
                                                <option value="">-- Buscar cliente habitual --</option>
                                                {clientes.map(c => (
                                                    <option key={c.id} value={c.id}>{c.nombre} ({c.rnc || 'Sin RNC'})</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                            <div className="input-group" style={{ marginBottom: 0 }}>
                                                <label className="input-label">Cliente</label>
                                                <input type="text" className="input-field" value={clienteNombre} onChange={e => setClienteNombre(e.target.value)} placeholder="Ej: Juan Pérez" />
                                            </div>
                                            <div className="input-group" style={{ marginBottom: 0 }}>
                                                <label className="input-label">RNC o Cédula</label>
                                                <input type="text" className="input-field" value={clienteRnc} onChange={e => setClienteRnc(e.target.value)} />
                                            </div>
                                            <div className="input-group" style={{ marginBottom: 0 }}>
                                                <label className="input-label">Tipo NCF (Comprobante)</label>
                                                <select className="input-field" value={tipoComprobante} onChange={e => setTipoComprobante(e.target.value)}>
                                                    <option value="B02">Consumo Final (B02)</option>
                                                    <option value="B01">Crédito Fiscal (B01)</option>
                                                    <option value="B03">Nota de Débito (B03)</option>
                                                    <option value="B04">Nota de Crédito (B04)</option>
                                                    <option value="B11">Proveedor Informal (B11)</option>
                                                    <option value="B12">Registro Único de Ingresos (B12)</option>
                                                    <option value="B13">Gastos Menores (B13)</option>
                                                    <option value="B14">Regímenes Especiales (B14)</option>
                                                    <option value="B15">Gubernamental (B15)</option>
                                                </select>
                                            </div>
                                            <div className="input-group" style={{ marginBottom: 0 }}>
                                                <label className="input-label">Moneda</label>
                                                <select className="input-field" value={monedaId} onChange={e => setMonedaId(e.target.value)}>
                                                    {monedas.map(m => <option key={m.id} value={m.id}>{m.codigo} - {m.simbolo}</option>)}
                                                </select>
                                            </div>
                                            <div className="input-group" style={{ marginBottom: 0 }}>
                                                <label className="input-label">Fecha de Factura</label>
                                                <input type="date" className="input-field" value={fecha} onChange={e => setFecha(e.target.value)} />
                                            </div>
                                            <div className="input-group" style={{ marginBottom: 0 }}>
                                                <label className="input-label">Condición</label>
                                                <select className="input-field" value={condicion} onChange={e => setCondicion(e.target.value)}>
                                                    <option value="Contado">Al Contado</option>
                                                    <option value="Credito">A Crédito</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Agregar Artículos */}
                                    <div style={{ background: 'var(--background)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
                                        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>Agregar Conceptos</h3>
                                        {errorMsg && <div style={{ background: '#fee2e2', color: '#dc2626', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.85rem' }}>{errorMsg}</div>}

                                        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-end', marginBottom: '1rem' }}>
                                            <div className="input-group" style={{ flex: 1, marginBottom: 0 }}>
                                                <label className="input-label">Artículo</label>
                                                <select className="input-field" value={articuloId} onChange={e => { setArticuloId(e.target.value); setErrorMsg(''); }}>
                                                    <option value="">-- Seleccione --</option>
                                                    {activosParaVenta.map(a => <option key={a.id} value={a.id}>{a.codigo} - {a.nombre} ({formatMoney(a.precioVenta)})</option>)}
                                                </select>
                                            </div>
                                            <div className="input-group" style={{ width: '100px', marginBottom: 0 }}>
                                                <label className="input-label">Cantidad</label>
                                                <input type="number" min="1" className="input-field" value={cantidadInput} onChange={e => setCantidadInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAgregarAlCarrito()} />
                                            </div>
                                            <button type="button" className="btn btn-secondary" style={{ height: '38px', background: 'var(--primary)', color: 'white', border: 'none' }} onClick={handleAgregarAlCarrito}><Plus size={18} /></button>
                                        </div>

                                        {/* Carrito Resumen Mini */}
                                        <div style={{ border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}>
                                            <table style={{ width: '100%', fontSize: '0.85rem' }}>
                                                <thead style={{ background: '#f1f5f9' }}>
                                                    <tr>
                                                        <th style={{ padding: '0.5rem', textAlign: 'center' }}>Cant.</th>
                                                        <th style={{ padding: '0.5rem', textAlign: 'left' }}>Descripción</th>
                                                        <th style={{ padding: '0.5rem', textAlign: 'right' }}>Total</th>
                                                        <th style={{ padding: '0.5rem', textAlign: 'center' }}></th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {carrito.map((item, idx) => (
                                                        <tr key={idx} style={{ borderTop: '1px solid var(--border)' }}>
                                                            <td style={{ padding: '0.5rem', textAlign: 'center', fontWeight: 700 }}>{item.cantidad}</td>
                                                            <td style={{ padding: '0.5rem' }}>{item.articulo.nombre}</td>
                                                            <td style={{ padding: '0.5rem', textAlign: 'right', fontWeight: 600 }}>{formatMoney(item.cantidad * item.precio)}</td>
                                                            <td style={{ padding: '0.5rem', textAlign: 'center' }}><button onClick={() => handleRemoverDelCarrito(item.articulo.id)} style={{ color: 'var(--danger)', background: 'none', border: 'none', cursor: 'pointer' }}><Trash2 size={14} /></button></td>
                                                        </tr>
                                                    ))}
                                                    {carrito.length === 0 && <tr><td colSpan={4} style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)' }}>No hay artículos en la factura</td></tr>}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}


                        {/* Historial rápido (solo si no se acaba de guardar) */}
                        {!facturaGuardada && facturas.length > 0 && (
                            <div style={{ marginTop: '2rem' }}>
                                <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--text-muted)' }}>Últimas Facturas Emitidas</h3>
                                <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                                    {[...facturas].reverse().slice(0, 4).map(f => (
                                        <div key={f.id} style={{ minWidth: '220px', border: '1px solid var(--border)', borderRadius: '12px', padding: '1rem', background: 'var(--background)' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                                <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>{f.numeroInterno}</span>
                                                <span style={{ color: 'var(--success)', fontSize: '0.75rem', fontWeight: 700 }}>Valida</span>
                                            </div>
                                            <div style={{ fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{f.clienteNombre}</div>
                                            <div style={{ fontWeight: 800, color: 'var(--primary)', marginTop: '0.5rem' }}>{formatMoney(f.total, monedas.find(m => String(m.id) === String(f.monedaId)))}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'vendedores' && renderEmptyCatalog('Fuerza de Ventas', 'Control de vendedores, cálculo de comisiones y zonas asignadas.')}
                {activeTab === 'cotizaciones' && renderEmptyCatalog('Cotizaciones', 'Gestión de cotizaciones, proformas y conversión a facturas firmes.')}
                {activeTab === 'pedidos' && renderEmptyCatalog('Pedidos y Despacho', 'Control de órdenes de entrega, logística y facturación parcial.')}
                {activeTab === 'clientes' && renderEmptyCatalog('Cartera de Clientes', 'Gestión de cuentas por cobrar (CXC), condiciones de crédito y cupos.')}
                {activeTab === 'pagos' && renderEmptyCatalog('Recibos de Ingreso (Pagos)', 'Aplicación de abonos a facturas de crédito y cruce de notas de crédito.')}
                {activeTab === 'informes' && renderEmptyCatalog('Análisis de Ventas', 'Métricas de facturación por producto, 606/607 fiscales y ranking de artículos.')}
            </div>

            {/* ── FLOAT FOOTER REAL-TIME SUMMARY ──────────────────────────────── */}
            {!facturaGuardada && activeTab === 'facturacion' && (
                <div className="facturacion-footer-bar">
                    <div className="footer-totals">
                        <div className="footer-total-item">
                            <span className="footer-total-label">Subtotal</span>
                            <span className="footer-total-value">{formatMoney(subtotal)}</span>
                        </div>
                        <div className="footer-total-item" style={{ minWidth: '120px' }}>
                            <span className="footer-total-label">Descuento Global</span>
                            <input 
                                type="number" 
                                className="input-field-mini" 
                                style={{ width: '80px', height: '24px', textAlign: 'right', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', padding: '0 5px', borderRadius: '4px' }} 
                                value={descuentoGlobal} 
                                onChange={e => setDescuentoGlobal(e.target.value)}
                                min="0" step="0.01"
                            />
                        </div>
                        <div className="footer-total-item">
                            <span className="footer-total-label">ITBIS (18%)</span>
                            <span className="footer-total-value">{formatMoney(totalItbis)}</span>
                        </div>
                        <div className="footer-total-item">
                            <span className="footer-total-label">Total Neto</span>
                            <span className="footer-total-value accent">{formatMoney(totalGeneral)}</span>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button 
                            className="btn btn-emit" 
                            onClick={handleGuardarFactura} 
                            disabled={carrito.length === 0}
                        >
                            <CheckCircle size={22} /> Guardar y emitir factura (F2)
                        </button>
                    </div>
                </div>
            )}

            <ConfirmModal isOpen={confirmDelete.open} onClose={() => setConfirmDelete({ open: false, id: null })} onConfirm={confirmDeleteAction} title="Anular Factura" message="¿Desea anular esta factura fiscal? (Se creará una entrada de diario de reversión)" />
        </div>
    );
};

export default Facturacion;
