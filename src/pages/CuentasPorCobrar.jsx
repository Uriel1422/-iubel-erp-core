import React, { useState, useMemo } from 'react';
import { useFacturacion } from '../context/FacturacionContext';
import { useContactos } from '../context/ContactosContext';
import {
    DollarSign, Clock, CheckCircle, AlertTriangle, TrendingUp, FileText,
    Search, Filter, ChevronDown, ChevronUp, CreditCard, Printer, X,
    BarChart2, Users, Calendar, Eye, Send
} from 'lucide-react';
import ConfirmModal from '../components/ConfirmModal';

const fmt = (n) => new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP' }).format(n || 0);
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('es-DO') : '—';
const daysBetween = (d) => d ? Math.ceil(Math.abs(new Date() - new Date(d)) / 86400000) : 0;

const BUCKET_CONFIGS = [
    { key: '0-30',   label: '0 - 30 días',  color: '#22c55e', bg: 'rgba(34,197,94,0.10)',   min: 0,  max: 30  },
    { key: '31-60',  label: '31 - 60 días', color: '#f59e0b', bg: 'rgba(245,158,11,0.10)',  min: 31, max: 60  },
    { key: '61-90',  label: '61 - 90 días', color: '#f97316', bg: 'rgba(249,115,22,0.10)',  min: 61, max: 90  },
    { key: '90+',    label: '+90 días',      color: '#ef4444', bg: 'rgba(239,68,68,0.10)',   min: 91, max: 9999 },
];

const getBucket = (days) => BUCKET_CONFIGS.find(b => days >= b.min && days <= b.max) || BUCKET_CONFIGS[3];

// ─────────────────────────────────────────────────────────────────
const CuentasPorCobrar = () => {
    const { facturas, registrarPagoFactura } = useFacturacion();
    const { contactos } = useContactos();

    const [busqueda, setBusqueda] = useState('');
    const [filtroEstado, setFiltroEstado] = useState('Pendiente');
    const [filtroOrden, setFiltroOrden] = useState('dias_desc');
    const [selectedFactura, setSelectedFactura] = useState(null);
    const [showPayModal, setShowPayModal] = useState(false);
    const [showReceiptModal, setShowReceiptModal] = useState(null);
    const [pagoMonto, setPagoMonto] = useState('');
    const [pagoParcial, setPagoParcial] = useState(false);
    const [confirmPago, setConfirmPago] = useState(false);
    const [expandedCliente, setExpandedCliente] = useState(null);

    // ── KPI calculations ─────────────────────────────────────────
    const pendientes = facturas.filter(f => f.estado === 'Pendiente');
    const pagadas    = facturas.filter(f => f.estado === 'Pagada');
    const totalPendiente = pendientes.reduce((s, f) => s + (f.totalDOP || f.total || 0), 0);
    const totalCobrado   = pagadas.reduce((s, f) => s + (f.totalDOP || f.total || 0), 0);

    const bucketTotals = useMemo(() => {
        const totals = {};
        BUCKET_CONFIGS.forEach(b => { totals[b.key] = { total: 0, count: 0 }; });
        pendientes.forEach(f => {
            const days = daysBetween(f.fecha || f.fechaRegistro);
            const b = getBucket(days);
            totals[b.key].total += (f.totalDOP || f.total || 0);
            totals[b.key].count++;
        });
        return totals;
    }, [pendientes]);

    const vencidas90 = bucketTotals['90+']?.total || 0;

    // ── Per-client grouping ───────────────────────────────────────
    const clienteMap = useMemo(() => {
        const map = {};
        facturas.forEach(f => {
            const key = f.clienteNombre || 'Sin nombre';
            if (!map[key]) map[key] = { nombre: key, rnc: f.clienteRnc, facturas: [], pendiente: 0, cobrado: 0 };
            map[key].facturas.push(f);
            if (f.estado === 'Pendiente') map[key].pendiente += (f.totalDOP || f.total || 0);
            else map[key].cobrado += (f.totalDOP || f.total || 0);
        });
        return Object.values(map);
    }, [facturas]);

    // ── Filtered list ─────────────────────────────────────────────
    const listaFiltrada = useMemo(() => {
        let lista = filtroEstado === 'Todas' ? facturas : facturas.filter(f => f.estado === filtroEstado);
        if (busqueda) lista = lista.filter(f =>
            (f.clienteNombre || '').toLowerCase().includes(busqueda.toLowerCase()) ||
            (f.numeroInterno || '').toLowerCase().includes(busqueda.toLowerCase()) ||
            (f.ncf || '').toLowerCase().includes(busqueda.toLowerCase())
        );
        lista = [...lista].sort((a, b) => {
            if (filtroOrden === 'dias_desc')  return daysBetween(b.fecha || b.fechaRegistro) - daysBetween(a.fecha || a.fechaRegistro);
            if (filtroOrden === 'dias_asc')   return daysBetween(a.fecha || a.fechaRegistro) - daysBetween(b.fecha || b.fechaRegistro);
            if (filtroOrden === 'monto_desc') return (b.totalDOP || b.total || 0) - (a.totalDOP || a.total || 0);
            if (filtroOrden === 'monto_asc')  return (a.totalDOP || a.total || 0) - (b.totalDOP || b.total || 0);
            return 0;
        });
        return lista;
    }, [facturas, filtroEstado, busqueda, filtroOrden]);

    // ── Payment ───────────────────────────────────────────────────
    const handleProcessPago = () => {
        if (!selectedFactura) return;
        const monto = pagoParcial ? Number(pagoMonto) : (selectedFactura.totalDOP || selectedFactura.total);
        registrarPagoFactura(selectedFactura.id, monto);
        setShowPayModal(false);
        setShowReceiptModal({ factura: selectedFactura, monto, fecha: new Date().toLocaleDateString('es-DO'), ref: `REC-${Date.now()}` });
        setSelectedFactura(null);
        setPagoMonto('');
        setPagoParcial(false);
    };

    // ── Styles ────────────────────────────────────────────────────
    const glassCard = {
        background: 'rgba(255,255,255,0.9)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.6)',
        borderRadius: '20px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.07)',
    };

    return (
        <div className="animate-up" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

            {/* ── Page Header ──────────────────────────────────── */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1 className="page-title" style={{ marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <CreditCard size={28} color="var(--primary)" /> Cuentas por Cobrar
                    </h1>
                    <p style={{ color: 'var(--text-muted)' }}>Control de cobros, recibos de pago y antigüedad de saldos de clientes</p>
                </div>
            </div>

            {/* ── KPI Cards ────────────────────────────────────── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: '1rem' }}>
                {[
                    { label: 'Total por Cobrar', value: fmt(totalPendiente), icon: DollarSign, color: '#2563eb', bg: 'rgba(37,99,235,0.1)', sub: `${pendientes.length} facturas pendientes` },
                    { label: 'Cobrado este Período', value: fmt(totalCobrado), icon: CheckCircle, color: '#16a34a', bg: 'rgba(34,197,94,0.1)', sub: `${pagadas.length} facturas pagadas` },
                    { label: 'Vencidas +90 días', value: fmt(vencidas90), icon: AlertTriangle, color: '#ef4444', bg: 'rgba(239,68,68,0.1)', sub: `${bucketTotals['90+']?.count || 0} documentos críticos` },
                    { label: 'Clientes con Saldo', value: clienteMap.filter(c => c.pendiente > 0).length, icon: Users, color: '#7c3aed', bg: 'rgba(124,58,237,0.1)', sub: `de ${clienteMap.length} clientes totales` },
                ].map((kpi, i) => {
                    const Icon = kpi.icon;
                    return (
                        <div key={i} style={{ ...glassCard, padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div style={{ width: 40, height: 40, borderRadius: '12px', background: kpi.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Icon size={20} color={kpi.color} />
                                </div>
                            </div>
                            <div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>{kpi.value}</div>
                                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)', marginTop: '0.1rem' }}>{kpi.label}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>{kpi.sub}</div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* ── Aging Matrix ─────────────────────────────────── */}
            <div style={{ ...glassCard, padding: '1.5rem' }}>
                <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Clock size={18} color="var(--primary)" /> Matriz de Antigüedad de Saldos
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1rem' }}>
                    {BUCKET_CONFIGS.map(b => {
                        const data = bucketTotals[b.key] || { total: 0, count: 0 };
                        const pct = totalPendiente > 0 ? Math.round((data.total / totalPendiente) * 100) : 0;
                        return (
                            <div key={b.key} style={{ padding: '1.25rem', borderRadius: '14px', background: b.bg, border: `1px solid ${b.color}30`, textAlign: 'center' }}>
                                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: b.color, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>{b.label}</div>
                                <div style={{ fontSize: '1.4rem', fontWeight: 900, color: b.color }}>{fmt(data.total)}</div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{data.count} doc · {pct}%</div>
                                <div style={{ marginTop: '0.75rem', height: '6px', borderRadius: '3px', background: 'rgba(0,0,0,0.08)' }}>
                                    <div style={{ height: '100%', borderRadius: '3px', background: b.color, width: `${pct}%`, transition: 'width 0.6s ease' }} />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* ── Resumen por Cliente ──────────────────────────── */}
            <div style={{ ...glassCard, padding: '1.5rem' }}>
                <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Users size={18} color="var(--primary)" /> Estado de Cuenta por Cliente
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {clienteMap.filter(c => c.pendiente > 0 || c.cobrado > 0).slice(0, 8).map((cliente, idx) => (
                        <div key={idx}>
                            <div
                                onClick={() => setExpandedCliente(expandedCliente === idx ? null : idx)}
                                style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.875rem 1rem', borderRadius: '12px', background: expandedCliente === idx ? 'rgba(37,99,235,0.05)' : 'var(--background)', cursor: 'pointer', border: expandedCliente === idx ? '1px solid rgba(37,99,235,0.2)' : '1px solid transparent', transition: 'all 0.2s' }}
                            >
                                <div style={{ width: 36, height: 36, borderRadius: '10px', background: 'linear-gradient(135deg, var(--primary), #1d4ed8)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.8rem', flexShrink: 0 }}>
                                    {(cliente.nombre || '?').slice(0, 2).toUpperCase()}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{cliente.nombre}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>RNC: {cliente.rnc || 'N/A'} · {cliente.facturas.length} facturas</div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontWeight: 700, color: cliente.pendiente > 0 ? '#ef4444' : '#16a34a', fontSize: '0.9rem' }}>{fmt(cliente.pendiente)}</div>
                                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>pendiente</div>
                                </div>
                                <div style={{ textAlign: 'right', minWidth: '100px' }}>
                                    <div style={{ fontWeight: 600, color: '#16a34a', fontSize: '0.85rem' }}>{fmt(cliente.cobrado)}</div>
                                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>cobrado</div>
                                </div>
                                {expandedCliente === idx ? <ChevronUp size={16} color="var(--text-muted)" /> : <ChevronDown size={16} color="var(--text-muted)" />}
                            </div>
                            {expandedCliente === idx && (
                                <div style={{ margin: '0.25rem 0 0.25rem 3.5rem', padding: '1rem', background: 'rgba(37,99,235,0.04)', borderRadius: '10px', borderLeft: '3px solid var(--primary)' }}>
                                    <table style={{ width: '100%', fontSize: '0.8rem', borderCollapse: 'collapse' }}>
                                        <thead><tr style={{ color: 'var(--text-muted)', textAlign: 'left' }}>
                                            <th style={{ padding: '0.25rem 0.5rem' }}>Num</th>
                                            <th style={{ padding: '0.25rem 0.5rem' }}>Fecha</th>
                                            <th style={{ padding: '0.25rem 0.5rem', textAlign: 'right' }}>Monto</th>
                                            <th style={{ padding: '0.25rem 0.5rem', textAlign: 'center' }}>Estado</th>
                                            <th style={{ padding: '0.25rem 0.5rem', textAlign: 'center' }}>Acción</th>
                                        </tr></thead>
                                        <tbody>
                                            {cliente.facturas.map(f => (
                                                <tr key={f.id} style={{ borderTop: '1px solid rgba(0,0,0,0.05)' }}>
                                                    <td style={{ padding: '0.4rem 0.5rem', fontWeight: 600, color: 'var(--primary)' }}>{f.numeroInterno}</td>
                                                    <td style={{ padding: '0.4rem 0.5rem' }}>{fmtDate(f.fecha || f.fechaRegistro)}</td>
                                                    <td style={{ padding: '0.4rem 0.5rem', textAlign: 'right', fontWeight: 600 }}>{fmt(f.totalDOP || f.total)}</td>
                                                    <td style={{ padding: '0.4rem 0.5rem', textAlign: 'center' }}>
                                                        <span style={{ fontSize: '0.72rem', padding: '0.2rem 0.6rem', borderRadius: '20px', fontWeight: 700, background: f.estado === 'Pendiente' ? 'rgba(239,68,68,0.1)' : 'rgba(34,197,94,0.1)', color: f.estado === 'Pendiente' ? '#ef4444' : '#16a34a' }}>{f.estado}</span>
                                                    </td>
                                                    <td style={{ padding: '0.4rem 0.5rem', textAlign: 'center' }}>
                                                        {f.estado === 'Pendiente' && (
                                                            <button onClick={() => { setSelectedFactura(f); setShowPayModal(true); }} style={{ fontSize: '0.72rem', padding: '0.2rem 0.6rem', background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>
                                                                Cobrar
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    ))}
                    {clienteMap.filter(c => c.pendiente > 0 || c.cobrado > 0).length === 0 && (
                        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>No hay clientes con saldos registrados.</div>
                    )}
                </div>
            </div>

            {/* ── Full Facturas Table ──────────────────────────── */}
            <div style={{ ...glassCard, overflow: 'hidden' }}>
                {/* Table Controls */}
                <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ fontWeight: 700, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <FileText size={18} color="var(--primary)" /> Historial de Facturas
                        <span style={{ fontWeight: 400, color: 'var(--text-muted)', fontSize: '0.85rem' }}>({listaFiltrada.length})</span>
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
                        {/* Estado filter */}
                        <div style={{ display: 'flex', gap: '0.25rem', background: 'var(--background)', padding: '0.2rem', borderRadius: '10px' }}>
                            {['Todas', 'Pendiente', 'Pagada'].map(e => (
                                <button key={e} onClick={() => setFiltroEstado(e)} style={{ padding: '0.35rem 0.85rem', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, background: filtroEstado === e ? 'var(--primary)' : 'transparent', color: filtroEstado === e ? '#fff' : 'var(--text-muted)', transition: 'all 0.2s' }}>{e}</button>
                            ))}
                        </div>
                        {/* Order filter */}
                        <select className="input-field" style={{ height: '36px', fontSize: '0.8rem', paddingTop: 0, paddingBottom: 0, minWidth: '160px' }} value={filtroOrden} onChange={e => setFiltroOrden(e.target.value)}>
                            <option value="dias_desc">Más antiguos primero</option>
                            <option value="dias_asc">Más recientes primero</option>
                            <option value="monto_desc">Mayor monto primero</option>
                            <option value="monto_asc">Menor monto primero</option>
                        </select>
                        {/* Search */}
                        <div style={{ position: 'relative' }}>
                            <Search size={14} style={{ position: 'absolute', left: '0.7rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input className="input-field" placeholder="Buscar..." style={{ paddingLeft: '2.1rem', height: '36px', fontSize: '0.8rem', width: '180px' }} value={busqueda} onChange={e => setBusqueda(e.target.value)} />
                        </div>
                    </div>
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                        <thead>
                            <tr style={{ background: 'rgba(248,250,252,0.9)' }}>
                                {['#', 'Cliente', 'NCF', 'Fecha', 'Días', 'Total', 'Estado', 'Acción'].map(h => (
                                    <th key={h} style={{ padding: '0.75rem 1rem', textAlign: h === 'Total' ? 'right' : 'left', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {listaFiltrada.map(f => {
                                const days = daysBetween(f.fecha || f.fechaRegistro);
                                const bucket = getBucket(days);
                                return (
                                    <tr key={f.id} style={{ borderBottom: '1px solid rgba(0,0,0,0.04)', transition: 'background 0.15s' }}
                                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(37,99,235,0.03)'}
                                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                        <td style={{ padding: '0.875rem 1rem', fontWeight: 600, color: 'var(--primary)' }}>{f.numeroInterno}</td>
                                        <td style={{ padding: '0.875rem 1rem' }}>
                                            <div style={{ fontWeight: 600 }}>{f.clienteNombre || '—'}</div>
                                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{f.clienteRnc || ''}</div>
                                        </td>
                                        <td style={{ padding: '0.875rem 1rem', color: 'var(--text-muted)' }}>{f.ncf || '—'}</td>
                                        <td style={{ padding: '0.875rem 1rem' }}>{fmtDate(f.fecha || f.fechaRegistro)}</td>
                                        <td style={{ padding: '0.875rem 1rem' }}>
                                            {f.estado === 'Pendiente'
                                                ? <span style={{ padding: '0.2rem 0.6rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, background: bucket.bg, color: bucket.color }}>{days} días</span>
                                                : <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>—</span>
                                            }
                                        </td>
                                        <td style={{ padding: '0.875rem 1rem', textAlign: 'right', fontWeight: 700 }}>{fmt(f.totalDOP || f.total)}</td>
                                        <td style={{ padding: '0.875rem 1rem' }}>
                                            <span style={{ padding: '0.25rem 0.7rem', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 700, background: f.estado === 'Pendiente' ? 'rgba(239,68,68,0.1)' : 'rgba(34,197,94,0.1)', color: f.estado === 'Pendiente' ? '#ef4444' : '#16a34a' }}>{f.estado}</span>
                                        </td>
                                        <td style={{ padding: '0.875rem 1rem' }}>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                {f.estado === 'Pendiente' && (
                                                    <button onClick={() => { setSelectedFactura(f); setShowPayModal(true); }} title="Registrar Cobro" style={{ background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: '8px', padding: '0.4rem 0.75rem', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                        <CreditCard size={13} /> Cobrar
                                                    </button>
                                                )}
                                                <button title="Ver Detalle" onClick={() => setShowReceiptModal({ factura: f, monto: f.totalDOP || f.total, fecha: fmtDate(f.fecha || f.fechaRegistro), ref: f.numeroInterno })} style={{ background: 'rgba(37,99,235,0.1)', color: 'var(--primary)', border: 'none', borderRadius: '8px', padding: '0.4rem', cursor: 'pointer', display: 'flex' }}>
                                                    <Eye size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                            {listaFiltrada.length === 0 && (
                                <tr><td colSpan={8} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>No hay facturas con los filtros seleccionados.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ── Payment Modal ────────────────────────────────── */}
            {showPayModal && selectedFactura && (
                <div className="modal-overlay">
                    <div style={{ background: '#fff', borderRadius: '20px', width: '100%', maxWidth: '500px', padding: 0, boxShadow: '0 40px 80px rgba(0,0,0,0.2)', zIndex: 2001, overflow: 'hidden' }}>
                        {/* Header gradient */}
                        <div style={{ background: 'linear-gradient(135deg, var(--primary) 0%, #1d4ed8 100%)', padding: '1.5rem 2rem', color: '#fff', position: 'relative' }}>
                            <button onClick={() => setShowPayModal(false)} style={{ position: 'absolute', right: '1.25rem', top: '1.25rem', background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '8px', color: '#fff', cursor: 'pointer', padding: '0.3rem', display: 'flex' }}><X size={18} /></button>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                                <CreditCard size={22} />
                                <span style={{ fontWeight: 800, fontSize: '1.2rem' }}>Registrar Cobro</span>
                            </div>
                            <div style={{ fontSize: '0.875rem', opacity: 0.85 }}>{selectedFactura.clienteNombre}</div>
                            <div style={{ fontSize: '2rem', fontWeight: 900, marginTop: '0.5rem' }}>{fmt(selectedFactura.totalDOP || selectedFactura.total)}</div>
                            <div style={{ fontSize: '0.78rem', opacity: 0.7, marginTop: '0.25rem' }}>{selectedFactura.numeroInterno} · {fmtDate(selectedFactura.fecha || selectedFactura.fechaRegistro)}</div>
                        </div>

                        <div style={{ padding: '1.5rem 2rem 2rem' }}>
                            {/* Toggle pago parcial */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', padding: '1rem', background: 'var(--background)', borderRadius: '12px' }}>
                                <input type="checkbox" id="parcial" checked={pagoParcial} onChange={e => setPagoParcial(e.target.checked)} style={{ width: 18, height: 18, cursor: 'pointer' }} />
                                <label htmlFor="parcial" style={{ fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem' }}>Pago Parcial (abono a cuenta)</label>
                            </div>
                            {pagoParcial && (
                                <div className="input-group" style={{ marginBottom: '1.25rem' }}>
                                    <label className="input-label">Monto a Cobrar (DOP)</label>
                                    <input type="number" className="input-field" placeholder="0.00" value={pagoMonto} onChange={e => setPagoMonto(e.target.value)} step="0.01" min="0" max={selectedFactura.totalDOP || selectedFactura.total} />
                                </div>
                            )}
                            <div style={{ padding: '1rem', background: 'rgba(34,197,94,0.08)', borderRadius: '10px', border: '1px solid rgba(34,197,94,0.2)', fontSize: '0.85rem', color: '#166534', marginBottom: '1.5rem', lineHeight: 1.6 }}>
                                💡 Al procesar, se generará un <strong>asiento contable automático</strong> que acreditará Cuentas por Cobrar y debitará Caja/Banco.
                            </div>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button onClick={() => setShowPayModal(false)} className="btn btn-secondary" style={{ flex: 1 }}>Cancelar</button>
                                <button onClick={handleProcessPago} className="btn btn-primary" style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                    <CheckCircle size={18} /> Confirmar Cobro
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Receipt Modal ────────────────────────────────── */}
            {showReceiptModal && (
                <div className="modal-overlay">
                    <div style={{ background: '#fff', borderRadius: '20px', width: '100%', maxWidth: '460px', boxShadow: '0 40px 80px rgba(0,0,0,0.2)', zIndex: 2001, overflow: 'hidden' }}>
                        {/* Receipt body */}
                        <div style={{ padding: '2.5rem', textAlign: 'center', borderBottom: '2px dashed #e5e7eb' }}>
                            <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(34,197,94,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                                <CheckCircle size={28} color="#16a34a" />
                            </div>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.5rem' }}>Recibo de Cobro</h2>
                            <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#16a34a', letterSpacing: '-0.03em' }}>{fmt(showReceiptModal.monto)}</div>
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.5rem' }}>Ref: {showReceiptModal.ref} · {showReceiptModal.fecha}</div>
                        </div>
                        <div style={{ padding: '1.5rem 2.5rem' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
                                {[
                                    ['Cliente', showReceiptModal.factura?.clienteNombre],
                                    ['RNC/Cédula', showReceiptModal.factura?.clienteRnc || '—'],
                                    ['Factura #', showReceiptModal.factura?.numeroInterno],
                                    ['NCF', showReceiptModal.factura?.ncf || '—'],
                                    ['Estado', showReceiptModal.factura?.estado],
                                ].map(([k, v]) => (
                                    <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', padding: '0.4rem 0', borderBottom: '1px solid var(--border)' }}>
                                        <span style={{ color: 'var(--text-muted)' }}>{k}</span>
                                        <span style={{ fontWeight: 600 }}>{v}</span>
                                    </div>
                                ))}
                            </div>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button onClick={() => { setShowReceiptModal(null); window.print(); }} className="btn btn-secondary" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                    <Printer size={16} /> Imprimir
                                </button>
                                <button onClick={() => setShowReceiptModal(null)} className="btn btn-primary" style={{ flex: 1 }}>Cerrar</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CuentasPorCobrar;
