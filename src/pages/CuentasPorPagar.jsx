import React, { useState, useMemo } from 'react';
import { useCompras } from '../context/ComprasContext';
import {
    ShoppingCart, Clock, CheckCircle, AlertTriangle, TrendingUp, FileText,
    Search, ChevronDown, ChevronUp, Banknote, Printer, X,
    BarChart2, Users, Calendar, Eye, Send, Wallet, Building2
} from 'lucide-react';
import ConfirmModal from '../components/ConfirmModal';

const fmt = (n) => new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP' }).format(n || 0);
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('es-DO') : '—';

const calcVencimiento = (c) => {
    const dueDate = c.fechaVencimiento ? new Date(c.fechaVencimiento) : new Date(c.fecha || c.fechaRegistro);
    const today = new Date();
    dueDate.setHours(0,0,0,0);
    today.setHours(0,0,0,0);
    return Math.ceil((today - dueDate) / 86400000); // positivo = vencido
};

const BUCKET_CONFIGS = [
    { key: 'al-dia', label: 'Al día o Faltan', color: '#16a34a', bg: 'rgba(22,163,74,0.1)', min: -9999, max: 0 },
    { key: '1-30',   label: '1 - 30 días v.',   color: '#eab308', bg: 'rgba(234,179,8,0.1)', min: 1, max: 30 },
    { key: '31-60',  label: '31 - 60 días v.',  color: '#ea580c', bg: 'rgba(234,88,12,0.1)', min: 31, max: 60 },
    { key: '61+',    label: '+61 días v.',      color: '#dc2626', bg: 'rgba(220,38,38,0.1)', min: 61, max: 9999 }
];

const getBucket = (days) => BUCKET_CONFIGS.find(b => days >= b.min && days <= b.max) || BUCKET_CONFIGS[3];

const getStatusBadge = (days) => {
    if (days < 0) return { bg: 'rgba(22,163,74,0.1)', color: '#16a34a', text: `Vence en ${Math.abs(days)}d` };
    if (days === 0) return { bg: 'rgba(234,179,8,0.1)', color: '#eab308', text: 'Vence HOY' };
    return { bg: 'rgba(220,38,38,0.1)', color: '#dc2626', text: `Vencida ${days}d` };
};

// ─────────────────────────────────────────────────────────────────
const CuentasPorPagar = () => {
    const { compras, registrarPagoCompra } = useCompras();

    const [busqueda, setBusqueda] = useState('');
    const [filtroEstado, setFiltroEstado] = useState('Pendiente');
    const [filtroOrden, setFiltroOrden] = useState('dias_desc');
    const [selectedCompra, setSelectedCompra] = useState(null);
    const [showPayModal, setShowPayModal] = useState(false);
    const [showReceiptModal, setShowReceiptModal] = useState(null);
    const [pagoMonto, setPagoMonto] = useState('');
    const [pagoParcial, setPagoParcial] = useState(false);
    const [expandedProveedor, setExpandedProveedor] = useState(null);
    const [metodoPago, setMetodoPago] = useState('Transferencia');
    const [referencia, setReferencia] = useState('');

    // ── KPIs ─────────────────────────────────────────────────────
    const pendientes = compras.filter(c => c.estado === 'Pendiente');
    const pagadas    = compras.filter(c => c.estado === 'Pagada');
    const totalPendiente = pendientes.reduce((s, c) => s + (c.total || 0), 0);
    const totalPagado    = pagadas.reduce((s, c) => s + (c.total || 0), 0);

    const bucketTotals = useMemo(() => {
        const totals = {};
        BUCKET_CONFIGS.forEach(b => { totals[b.key] = { total: 0, count: 0 }; });
        pendientes.forEach(c => {
            const days = calcVencimiento(c);
            const b = getBucket(days);
            totals[b.key].total += (c.total || 0);
            totals[b.key].count++;
        });
        return totals;
    }, [pendientes]);

    const vencidas61 = bucketTotals['61+']?.total || 0;

    // ── Per-supplier grouping ─────────────────────────────────────
    const proveedorMap = useMemo(() => {
        const map = {};
        compras.forEach(c => {
            const key = c.proveedorNombre || 'Sin proveedor';
            if (!map[key]) map[key] = { nombre: key, ncf: c.proveedorRnc, compras: [], pendiente: 0, pagado: 0 };
            map[key].compras.push(c);
            if (c.estado === 'Pendiente') map[key].pendiente += (c.total || 0);
            else map[key].pagado += (c.total || 0);
        });
        return Object.values(map);
    }, [compras]);

    // ── Filtered list ─────────────────────────────────────────────
    const listaFiltrada = useMemo(() => {
        let lista = filtroEstado === 'Todas' ? compras : compras.filter(c => c.estado === filtroEstado);
        if (busqueda) lista = lista.filter(c =>
            (c.proveedorNombre || '').toLowerCase().includes(busqueda.toLowerCase()) ||
            (c.numeroInterno || '').toLowerCase().includes(busqueda.toLowerCase()) ||
            (c.ncf || '').toLowerCase().includes(busqueda.toLowerCase())
        );
        lista = [...lista].sort((a, b) => {
            if (filtroOrden === 'dias_desc')  return calcVencimiento(b) - calcVencimiento(a);
            if (filtroOrden === 'dias_asc')   return calcVencimiento(a) - calcVencimiento(b);
            if (filtroOrden === 'monto_desc') return (b.total || 0) - (a.total || 0);
            if (filtroOrden === 'monto_asc')  return (a.total || 0) - (b.total || 0);
            return 0;
        });
        return lista;
    }, [compras, filtroEstado, busqueda, filtroOrden]);

    // ── Payment processing ────────────────────────────────────────
    const handleProcessPago = () => {
        if (!selectedCompra) return;
        const monto = pagoParcial ? Number(pagoMonto) : (selectedCompra.total || 0);
        registrarPagoCompra(selectedCompra.id, monto);
        const receipt = {
            compra: selectedCompra,
            monto,
            fecha: new Date().toLocaleDateString('es-DO'),
            ref: `PAG-${Date.now()}`,
            metodo: metodoPago,
            referencia: referencia
        };
        setShowPayModal(false);
        setShowReceiptModal(receipt);
        setSelectedCompra(null);
        setPagoMonto('');
        setPagoParcial(false);
        setReferencia('');
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

            {/* ── Header ───────────────────────────────────────── */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1 className="page-title" style={{ marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <Wallet size={28} color="var(--primary)" /> Cuentas por Pagar
                    </h1>
                    <p style={{ color: 'var(--text-muted)' }}>Control de obligaciones con proveedores, programación de pagos y antigüedad de saldos</p>
                </div>
            </div>

            {/* ── KPI Cards ────────────────────────────────────── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: '1rem' }}>
                {[
                    { label: 'Total por Pagar', value: fmt(totalPendiente), icon: Wallet, color: '#dc2626', bg: 'rgba(220,38,38,0.1)', sub: `${pendientes.length} facturas pendientes` },
                    { label: 'Pagado este Período', value: fmt(totalPagado), icon: CheckCircle, color: '#16a34a', bg: 'rgba(34,197,94,0.1)', sub: `${pagadas.length} facturas pagadas` },
                    { label: 'Vencidas Críticas (+60)', value: fmt(vencidas61), icon: AlertTriangle, color: '#ef4444', bg: 'rgba(239,68,68,0.1)', sub: `${bucketTotals['61+']?.count || 0} docs críticos` },
                    { label: 'Proveedores con Deuda', value: proveedorMap.filter(p => p.pendiente > 0).length, icon: Building2, color: '#7c3aed', bg: 'rgba(124,58,237,0.1)', sub: `de ${proveedorMap.length} proveedores totales` },
                ].map((kpi, i) => {
                    const Icon = kpi.icon;
                    return (
                        <div key={i} style={{ ...glassCard, padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <div style={{ width: 40, height: 40, borderRadius: '12px', background: kpi.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Icon size={20} color={kpi.color} />
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

            {/* ── Widget de Alertas Críticas ─────────────────── */}
            {pendientes.some(c => calcVencimiento(c) > -7) && (
                <div style={{ ...glassCard, padding: '1.25rem 1.5rem', background: 'linear-gradient(90deg, #fff1f2, #ffe4e6)', borderLeft: '4px solid #e11d48' }}>
                    <div style={{ fontWeight: 800, color: '#be123c', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        <AlertTriangle size={18} /> Vencimientos Próximos o Críticos
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
                        {pendientes
                            .map(c => ({ ...c, calcDays: calcVencimiento(c) }))
                            .filter(c => c.calcDays > -7)
                            .sort((a,b) => b.calcDays - a.calcDays)
                            .slice(0, 5)
                            .map(c => {
                                const vBadge = getStatusBadge(c.calcDays);
                                return (
                                    <div key={c.id} style={{ background: 'rgba(255,255,255,0.7)', padding: '0.75rem 1rem', borderRadius: '10px', boxShadow: '0 2px 8px rgba(225,29,72,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{c.proveedorNombre || 'Proveedor Cta.'}</div>
                                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Doc. {c.numeroInterno}</div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontWeight: 800, color: '#be123c', fontSize: '0.9rem' }}>{fmt(c.total)}</div>
                                            <div style={{ fontSize: '0.65rem', padding: '0.15rem 0.5rem', borderRadius: '12px', background: vBadge.bg, color: vBadge.color, fontWeight: 800, textTransform: 'uppercase', marginTop: '0.15rem', display: 'inline-block' }}>{vBadge.text}</div>
                                        </div>
                                    </div>
                                );
                            })
                        }
                    </div>
                </div>
            )}

            {/* ── Aging Matrix ─────────────────────────────────── */}
            <div style={{ ...glassCard, padding: '1.5rem' }}>
                <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Clock size={18} color="var(--primary)" /> Matriz de Antigüedad de Saldos (CXP)
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

            {/* ── Resumen por Proveedor ────────────────────────── */}
            <div style={{ ...glassCard, padding: '1.5rem' }}>
                <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Building2 size={18} color="var(--primary)" /> Estado de Cuenta por Proveedor
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {proveedorMap.filter(p => p.pendiente > 0 || p.pagado > 0).slice(0, 8).map((proveedor, idx) => (
                        <div key={idx}>
                            <div
                                onClick={() => setExpandedProveedor(expandedProveedor === idx ? null : idx)}
                                style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.875rem 1rem', borderRadius: '12px', background: expandedProveedor === idx ? 'rgba(220,38,38,0.04)' : 'var(--background)', cursor: 'pointer', border: expandedProveedor === idx ? '1px solid rgba(220,38,38,0.2)' : '1px solid transparent', transition: 'all 0.2s' }}
                            >
                                <div style={{ width: 36, height: 36, borderRadius: '10px', background: 'linear-gradient(135deg, #dc2626, #b91c1c)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.8rem', flexShrink: 0 }}>
                                    {(proveedor.nombre || '?').slice(0, 2).toUpperCase()}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{proveedor.nombre}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>RNC: {proveedor.ncf || 'N/A'} · {proveedor.compras.length} compras</div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontWeight: 700, color: proveedor.pendiente > 0 ? '#ef4444' : '#16a34a', fontSize: '0.9rem' }}>{fmt(proveedor.pendiente)}</div>
                                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>pendiente</div>
                                </div>
                                <div style={{ textAlign: 'right', minWidth: '100px' }}>
                                    <div style={{ fontWeight: 600, color: '#16a34a', fontSize: '0.85rem' }}>{fmt(proveedor.pagado)}</div>
                                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>pagado</div>
                                </div>
                                {expandedProveedor === idx ? <ChevronUp size={16} color="var(--text-muted)" /> : <ChevronDown size={16} color="var(--text-muted)" />}
                            </div>
                            {expandedProveedor === idx && (
                                <div style={{ margin: '0.25rem 0 0.25rem 3.5rem', padding: '1rem', background: 'rgba(220,38,38,0.03)', borderRadius: '10px', borderLeft: '3px solid #dc2626' }}>
                                    <table style={{ width: '100%', fontSize: '0.8rem', borderCollapse: 'collapse' }}>
                                        <thead><tr style={{ color: 'var(--text-muted)', textAlign: 'left' }}>
                                            <th style={{ padding: '0.25rem 0.5rem' }}>Num</th>
                                            <th style={{ padding: '0.25rem 0.5rem' }}>Fecha</th>
                                            <th style={{ padding: '0.25rem 0.5rem' }}>NCF</th>
                                            <th style={{ padding: '0.25rem 0.5rem', textAlign: 'right' }}>Total</th>
                                            <th style={{ padding: '0.25rem 0.5rem', textAlign: 'center' }}>Estado</th>
                                            <th style={{ padding: '0.25rem 0.5rem', textAlign: 'center' }}>Acción</th>
                                        </tr></thead>
                                        <tbody>
                                            {proveedor.compras.map(c => {
                                                const days = calcVencimiento(c);
                                                const vBadge = getStatusBadge(days);
                                                return (
                                                    <tr key={c.id} style={{ borderTop: '1px solid rgba(0,0,0,0.05)' }}>
                                                        <td style={{ padding: '0.4rem 0.5rem', fontWeight: 600, color: '#dc2626' }}>{c.numeroInterno}</td>
                                                        <td style={{ padding: '0.4rem 0.5rem' }}>
                                                            <div>{fmtDate(c.fecha || c.fechaRegistro)}</div>
                                                            {c.estado === 'Pendiente' && <div style={{ fontSize: '0.65rem', color: vBadge.color, fontWeight: 700, marginTop: '2px' }}>{vBadge.text}</div>}
                                                        </td>
                                                        <td style={{ padding: '0.4rem 0.5rem', color: 'var(--text-muted)' }}>{c.ncf || '—'}</td>
                                                        <td style={{ padding: '0.4rem 0.5rem', textAlign: 'right', fontWeight: 600 }}>{fmt(c.total)}</td>
                                                        <td style={{ padding: '0.4rem 0.5rem', textAlign: 'center' }}>
                                                            <span style={{ fontSize: '0.72rem', padding: '0.2rem 0.6rem', borderRadius: '20px', fontWeight: 700, background: c.estado === 'Pendiente' ? 'rgba(239,68,68,0.1)' : 'rgba(34,197,94,0.1)', color: c.estado === 'Pendiente' ? '#ef4444' : '#16a34a' }}>{c.estado}</span>
                                                        </td>
                                                        <td style={{ padding: '0.4rem 0.5rem', textAlign: 'center' }}>
                                                            {c.estado === 'Pendiente' && (
                                                                <button onClick={() => { setSelectedCompra(c); setShowPayModal(true); }} style={{ fontSize: '0.72rem', padding: '0.2rem 0.6rem', background: '#dc2626', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>
                                                                    Pagar
                                                                </button>
                                                            )}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    ))}
                    {proveedorMap.filter(p => p.pendiente > 0 || p.pagado > 0).length === 0 && (
                        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>No hay proveedores con saldos registrados.</div>
                    )}
                </div>
            </div>

            {/* ── Historial Table ──────────────────────────────── */}
            <div style={{ ...glassCard, overflow: 'hidden' }}>
                <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ fontWeight: 700, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <FileText size={18} color="var(--primary)" /> Historial de Compras y Gastos
                        <span style={{ fontWeight: 400, color: 'var(--text-muted)', fontSize: '0.85rem' }}>({listaFiltrada.length})</span>
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
                        <div style={{ display: 'flex', gap: '0.25rem', background: 'var(--background)', padding: '0.2rem', borderRadius: '10px' }}>
                            {['Todas', 'Pendiente', 'Pagada'].map(e => (
                                <button key={e} onClick={() => setFiltroEstado(e)} style={{ padding: '0.35rem 0.85rem', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, background: filtroEstado === e ? '#dc2626' : 'transparent', color: filtroEstado === e ? '#fff' : 'var(--text-muted)', transition: 'all 0.2s' }}>{e}</button>
                            ))}
                        </div>
                        <select className="input-field" style={{ height: '36px', fontSize: '0.8rem', paddingTop: 0, paddingBottom: 0, minWidth: '160px' }} value={filtroOrden} onChange={e => setFiltroOrden(e.target.value)}>
                            <option value="dias_desc">Más antiguos primero</option>
                            <option value="dias_asc">Más recientes primero</option>
                            <option value="monto_desc">Mayor monto primero</option>
                            <option value="monto_asc">Menor monto primero</option>
                        </select>
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
                                {['#', 'Proveedor', 'NCF', 'Emisión', 'Vencimiento', 'Subtotal', 'ITBIS', 'Total', 'Estado', 'Acción'].map(h => (
                                    <th key={h} style={{ padding: '0.75rem 1rem', textAlign: ['Subtotal','ITBIS','Total'].includes(h) ? 'right' : 'left', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {listaFiltrada.map(c => {
                                const days = calcVencimiento(c);
                                const vBadge = getStatusBadge(days);
                                return (
                                    <tr key={c.id} style={{ borderBottom: '1px solid rgba(0,0,0,0.04)', transition: 'background 0.15s' }}
                                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(220,38,38,0.02)'}
                                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                        <td style={{ padding: '0.875rem 1rem', fontWeight: 600, color: '#dc2626' }}>{c.numeroInterno}</td>
                                        <td style={{ padding: '0.875rem 1rem' }}>
                                            <div style={{ fontWeight: 600 }}>{c.proveedorNombre || '—'}</div>
                                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{c.proveedorRnc || ''}</div>
                                        </td>
                                        <td style={{ padding: '0.875rem 1rem', color: 'var(--text-muted)', fontSize: '0.78rem' }}>{c.ncf || '—'}</td>
                                        <td style={{ padding: '0.875rem 1rem' }}>{fmtDate(c.fecha || c.fechaRegistro)}</td>
                                        <td style={{ padding: '0.875rem 1rem' }}>
                                            {c.estado === 'Pendiente' ? (
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                                                    <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{fmtDate(c.fechaVencimiento || c.fecha || c.fechaRegistro)}</span>
                                                    <span style={{ alignSelf: 'flex-start', padding: '0.2rem 0.5rem', borderRadius: '20px', fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', background: vBadge.bg, color: vBadge.color }}>{vBadge.text}</span>
                                                </div>
                                            ) : (
                                                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>—</span>
                                            )}
                                        </td>
                                        <td style={{ padding: '0.875rem 1rem', textAlign: 'right', color: 'var(--text-muted)' }}>{fmt(c.subtotal)}</td>
                                        <td style={{ padding: '0.875rem 1rem', textAlign: 'right', color: 'var(--text-muted)' }}>{fmt(c.itbis)}</td>
                                        <td style={{ padding: '0.875rem 1rem', textAlign: 'right', fontWeight: 700 }}>{fmt(c.total)}</td>
                                        <td style={{ padding: '0.875rem 1rem' }}>
                                            <span style={{ padding: '0.25rem 0.7rem', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 700, background: c.estado === 'Pendiente' ? 'rgba(239,68,68,0.1)' : 'rgba(34,197,94,0.1)', color: c.estado === 'Pendiente' ? '#ef4444' : '#16a34a' }}>{c.estado}</span>
                                        </td>
                                        <td style={{ padding: '0.875rem 1rem' }}>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                {c.estado === 'Pendiente' && (
                                                    <button onClick={() => { setSelectedCompra(c); setShowPayModal(true); }} style={{ background: '#dc2626', color: '#fff', border: 'none', borderRadius: '8px', padding: '0.4rem 0.75rem', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                        <Banknote size={13} /> Pagar
                                                    </button>
                                                )}
                                                <button onClick={() => setShowReceiptModal({ compra: c, monto: c.total, fecha: fmtDate(c.fecha || c.fechaRegistro), ref: c.numeroInterno, metodo: '—', referencia: '—' })} style={{ background: 'rgba(220,38,38,0.1)', color: '#dc2626', border: 'none', borderRadius: '8px', padding: '0.4rem', cursor: 'pointer', display: 'flex' }}>
                                                    <Eye size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                            {listaFiltrada.length === 0 && (
                                <tr><td colSpan={10} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>No hay compras con los filtros seleccionados.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ── Payment Modal ────────────────────────────────── */}
            {showPayModal && selectedCompra && (
                <div className="modal-overlay">
                    <div style={{ background: '#fff', borderRadius: '20px', width: '100%', maxWidth: '520px', padding: 0, boxShadow: '0 40px 80px rgba(0,0,0,0.2)', zIndex: 2001, overflow: 'hidden' }}>
                        <div style={{ background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)', padding: '1.5rem 2rem', color: '#fff', position: 'relative' }}>
                            <button onClick={() => setShowPayModal(false)} style={{ position: 'absolute', right: '1.25rem', top: '1.25rem', background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '8px', color: '#fff', cursor: 'pointer', padding: '0.3rem', display: 'flex' }}><X size={18} /></button>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                                <Banknote size={22} /> <span style={{ fontWeight: 800, fontSize: '1.2rem' }}>Registrar Pago</span>
                            </div>
                            <div style={{ fontSize: '0.875rem', opacity: 0.85 }}>{selectedCompra.proveedorNombre || 'Proveedor'}</div>
                            <div style={{ fontSize: '2rem', fontWeight: 900, marginTop: '0.5rem' }}>{fmt(selectedCompra.total)}</div>
                            <div style={{ fontSize: '0.78rem', opacity: 0.7, marginTop: '0.25rem' }}>{selectedCompra.numeroInterno} · {fmtDate(selectedCompra.fecha || selectedCompra.fechaRegistro)}</div>
                        </div>
                        <div style={{ padding: '1.5rem 2rem 2rem', display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                            {/* Método de pago */}
                            <div>
                                <label className="input-label">Método de Pago</label>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '0.5rem', marginTop: '0.5rem' }}>
                                    {['Transferencia', 'Cheque', 'Efectivo'].map(m => (
                                        <div key={m} onClick={() => setMetodoPago(m)} style={{ padding: '0.6rem', borderRadius: '10px', cursor: 'pointer', textAlign: 'center', fontSize: '0.8rem', fontWeight: 600, border: `2px solid ${metodoPago === m ? '#dc2626' : 'var(--border)'}`, background: metodoPago === m ? 'rgba(220,38,38,0.08)' : 'transparent', color: metodoPago === m ? '#dc2626' : 'var(--text-muted)', transition: 'all 0.2s' }}>{m}</div>
                                    ))}
                                </div>
                            </div>
                            {/* Referencia */}
                            <div className="input-group" style={{ marginBottom: 0 }}>
                                <label className="input-label">No. Referencia / Cheque (opcional)</label>
                                <input className="input-field" placeholder="Ej: TRF-2024-001" value={referencia} onChange={e => setReferencia(e.target.value)} />
                            </div>
                            {/* Pago parcial */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.875rem', background: 'var(--background)', borderRadius: '12px' }}>
                                <input type="checkbox" id="parcial_cxp" checked={pagoParcial} onChange={e => setPagoParcial(e.target.checked)} style={{ width: 18, height: 18, cursor: 'pointer' }} />
                                <label htmlFor="parcial_cxp" style={{ fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem' }}>Pago Parcial (abono a cuenta)</label>
                            </div>
                            {pagoParcial && (
                                <div className="input-group" style={{ marginBottom: 0 }}>
                                    <label className="input-label">Monto a Pagar (DOP)</label>
                                    <input type="number" className="input-field" placeholder="0.00" value={pagoMonto} onChange={e => setPagoMonto(e.target.value)} step="0.01" min="0" max={selectedCompra.total} />
                                </div>
                            )}
                            <div style={{ padding: '0.875rem', background: 'rgba(239,68,68,0.06)', borderRadius: '10px', border: '1px solid rgba(239,68,68,0.15)', fontSize: '0.82rem', color: '#991b1b', lineHeight: 1.6 }}>
                                💡 Al procesar, se actualizará el estado del documento y se registrará el <strong>asiento de cancelación de CXP</strong> en el Diario General.
                            </div>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button onClick={() => setShowPayModal(false)} className="btn btn-secondary" style={{ flex: 1 }}>Cancelar</button>
                                <button onClick={handleProcessPago} style={{ flex: 2, padding: '0.875rem', background: '#dc2626', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                    <CheckCircle size={18} /> Confirmar Pago
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Receipt / Detail Modal ───────────────────────── */}
            {showReceiptModal && (
                <div className="modal-overlay">
                    <div style={{ background: '#fff', borderRadius: '20px', width: '100%', maxWidth: '460px', boxShadow: '0 40px 80px rgba(0,0,0,0.2)', zIndex: 2001, overflow: 'hidden' }}>
                        <div style={{ padding: '2.5rem', textAlign: 'center', borderBottom: '2px dashed #e5e7eb' }}>
                            <div style={{ width: 56, height: 56, borderRadius: '50%', background: showReceiptModal.compra?.estado === 'Pagada' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                                {showReceiptModal.compra?.estado === 'Pagada' ? <CheckCircle size={28} color="#16a34a" /> : <Banknote size={28} color="#dc2626" />}
                            </div>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.5rem' }}>
                                {showReceiptModal.compra?.estado === 'Pagada' ? 'Comprobante de Pago' : 'Detalle de Compra Pendiente'}
                            </h2>
                            <div style={{ fontSize: '2.5rem', fontWeight: 900, color: showReceiptModal.compra?.estado === 'Pagada' ? '#16a34a' : '#dc2626', letterSpacing: '-0.03em' }}>{fmt(showReceiptModal.monto)}</div>
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.5rem' }}>Ref: {showReceiptModal.ref} · {showReceiptModal.fecha}</div>
                        </div>
                        <div style={{ padding: '1.5rem 2.5rem' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
                                {[
                                    ['Proveedor', showReceiptModal.compra?.proveedorNombre],
                                    ['RNC', showReceiptModal.compra?.proveedorRnc || '—'],
                                    ['Compra #', showReceiptModal.compra?.numeroInterno],
                                    ['NCF', showReceiptModal.compra?.ncf || '—'],
                                    ['Subtotal', fmt(showReceiptModal.compra?.subtotal)],
                                    ['ITBIS', fmt(showReceiptModal.compra?.itbis)],
                                    ['Total', fmt(showReceiptModal.compra?.total)],
                                    ['Método', showReceiptModal.metodo || '—'],
                                    ['Estado', showReceiptModal.compra?.estado],
                                ].map(([k, v]) => (
                                    <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', padding: '0.35rem 0', borderBottom: '1px solid var(--border)' }}>
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

export default CuentasPorPagar;
