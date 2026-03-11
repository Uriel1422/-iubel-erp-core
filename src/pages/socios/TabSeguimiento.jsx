import React, { useState } from 'react';
import { Plus, Trash2, AlertTriangle, TrendingUp, CreditCard, Users, ShieldCheck, BookOpen } from 'lucide-react';
import { usePrestamos } from '../../context/PrestamosContext';

const subTabs = ['Seguimiento a Casos', 'Estado Financiero', 'Histórico de Ctas', 'Cuentas Avaladas', 'Disponibilidad', 'Talonarios'];

const blankCaso = { tipo: 'Consulta', descripcion: '', estado: 'Abierto', prioridad: 'Normal' };
const fmtMoney = n => new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP' }).format(Number(n) || 0);

const TabSeguimiento = ({ socio, onAgregarCaso, onEliminarCaso }) => {
    const [sub, setSub] = useState('Seguimiento a Casos');
    const [form, setForm] = useState(blankCaso);
    const [selC, setSelC] = useState(null);
    const { prestamos } = usePrestamos();

    if (!socio) return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Selecciona un socio en la pestaña Buscar</div>;

    const casos = socio.casos || [];
    const myPres = prestamos.filter(p => p.socioId === socio.id);

    // ── Seguimiento a Casos ─────────────────────────────────────────────────
    const renderCasos = () => (
        <div>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, display: 'grid', gridTemplateColumns: '100px 1fr 80px 70px 120px', gap: '0.25rem', padding: '0.35rem 0.5rem', background: 'var(--primary)', color: 'white', borderRadius: 'var(--radius-sm) var(--radius-sm) 0 0' }}>
                {['Tipo', 'Descripción', 'Estado', 'Prioridad', 'Fecha'].map(h => <span key={h}>{h}</span>)}
            </div>
            <div style={{ maxHeight: '160px', overflowY: 'auto', border: '1px solid var(--border)', borderTop: 0, marginBottom: '1rem' }}>
                {casos.length === 0 ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>Sin casos registrados</div>
                ) : casos.map(c => (
                    <div key={c.id} onClick={() => { setSelC(c.id); setForm(c); }}
                        style={{ display: 'grid', gridTemplateColumns: '100px 1fr 80px 70px 120px', gap: '0.25rem', padding: '0.35rem 0.5rem', fontSize: '0.75rem', background: selC === c.id ? 'var(--primary-light)' : 'transparent', cursor: 'pointer', borderBottom: '1px solid var(--border-light)' }}>
                        <span style={{ fontWeight: 600, color: 'var(--primary)' }}>{c.tipo}</span>
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.descripcion}</span>
                        <span>{c.estado}</span>
                        <span style={{ color: c.prioridad === 'Alta' ? 'var(--danger)' : c.prioridad === 'Media' ? 'var(--warning)' : 'inherit', fontWeight: 600 }}>{c.prioridad}</span>
                        <span>{c.fecha ? new Date(c.fecha).toLocaleDateString('es-DO') : '—'}</span>
                    </div>
                ))}
            </div>
            {/* Formulario nuevo caso */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '0.6rem', padding: '0.75rem', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
                {[['tipo', 'Tipo', ['Consulta', 'Reclamo', 'Queja', 'Sugerencia', 'Incidencia', 'Notificación'], 'select'],
                ['estado', 'Estado', ['Abierto', 'En Proceso', 'Resuelto', 'Cerrado'], 'select'],
                ['prioridad', 'Prioridad', ['Normal', 'Media', 'Alta', 'Urgente'], 'select']
                ].map(([f, l, opts, type]) => (
                    <div key={f} style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                        <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)' }}>{l.toUpperCase()}</label>
                        <select className="input-field" style={{ height: '2rem', fontSize: '0.82rem', padding: '0 0.4rem' }}
                            value={form[f] || ''} onChange={e => setForm(p => ({ ...p, [f]: e.target.value }))}>
                            {opts.map(o => <option key={o}>{o}</option>)}
                        </select>
                    </div>
                ))}
                <div />
                <div style={{ gridColumn: 'span 4', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                    <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)' }}>DESCRIPCIÓN</label>
                    <textarea className="input-field" style={{ height: '3rem', fontSize: '0.82rem', padding: '0.4rem 0.5rem', resize: 'none' }}
                        value={form.descripcion || ''} onChange={e => setForm(p => ({ ...p, descripcion: e.target.value }))} />
                </div>
                <div style={{ gridColumn: 'span 4', display: 'flex', gap: '0.5rem' }}>
                    <button className="btn btn-primary" style={{ fontSize: '0.78rem' }}
                        onClick={() => { onAgregarCaso(socio.id, form); setForm(blankCaso); setSelC(null); }}>
                        <Plus size={13} /> Agregar Caso
                    </button>
                    {selC && <button className="btn btn-secondary" style={{ fontSize: '0.78rem', color: 'var(--danger)' }}
                        onClick={() => { onEliminarCaso(socio.id, selC); setSelC(null); setForm(blankCaso); }}>
                        <Trash2 size={13} /> Eliminar
                    </button>}
                </div>
            </div>
        </div>
    );

    // ── Estado Financiero ───────────────────────────────────────────────────
    const renderEstadoFinanciero = () => (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1rem' }}>
            {[
                { label: 'Ahorros', value: socio.ahorros, icon: <TrendingUp size={20} />, color: 'var(--primary)' },
                { label: 'Préstamos', value: socio.prestamos, icon: <CreditCard size={20} />, color: 'var(--danger)' },
                { label: 'Aportaciones', value: socio.aportacion, icon: <ShieldCheck size={20} />, color: 'var(--success)' },
                { label: 'Ingreso Mensual', value: socio.ingresoMensual, icon: <Users size={20} />, color: 'var(--warning)' },
                { label: 'Prest. Activos', value: myPres.filter(p => p.estado === 'Activo').reduce((a, p) => a + (p.balance || 0), 0), icon: <CreditCard size={20} />, color: 'var(--danger)' },
                { label: 'Cuotas al Día', value: myPres.filter(p => p.estado === 'Activo').length + ' préstamo(s)', icon: <BookOpen size={20} />, color: 'var(--primary)', isText: true },
            ].map(({ label, value, icon, color, isText }) => (
                <div key={label} style={{ padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--bg-secondary)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color }}>
                        {icon}
                        <span style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase' }}>{label}</span>
                    </div>
                    <div style={{ fontSize: isText ? '1rem' : '1.25rem', fontWeight: 800, color }}>{isText ? value : fmtMoney(value)}</div>
                </div>
            ))}
        </div>
    );

    // ── Histórico de Cuentas ────────────────────────────────────────────────
    const renderHistorico = () => (
        <div>
            <div style={{ display: 'grid', gridTemplateColumns: '80px 100px 1fr 100px 100px 100px', gap: '0.25rem', padding: '0.35rem 0.5rem', background: 'var(--primary)', color: 'white', borderRadius: 'var(--radius-sm) var(--radius-sm) 0 0', fontSize: '0.72rem', fontWeight: 700 }}>
                {['Cuenta', 'Apertura', 'Descripción', 'Saldo', 'Cuota', 'Total'].map(h => <span key={h}>{h}</span>)}
            </div>
            <div style={{ border: '1px solid var(--border)', borderTop: 0, borderRadius: '0 0 var(--radius-sm) var(--radius-sm)', minHeight: '100px' }}>
                {myPres.length === 0 ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>Sin historial de préstamos</div>
                ) : myPres.map(p => (
                    <div key={p.id} style={{ display: 'grid', gridTemplateColumns: '80px 100px 1fr 100px 100px 100px', gap: '0.25rem', padding: '0.35rem 0.5rem', fontSize: '0.75rem', borderBottom: '1px solid var(--border-light)' }}>
                        <span style={{ fontWeight: 600, color: 'var(--primary)' }}>{p.id?.slice(-4)}</span>
                        <span>{p.fecha ? new Date(p.fecha).toLocaleDateString('es-DO') : '—'}</span>
                        <span>{p.concepto || 'Préstamo'}</span>
                        <span>{fmtMoney(p.balance)}</span>
                        <span>{fmtMoney(p.cuota)}</span>
                        <span>{fmtMoney((p.balance || 0) + (p.cuota || 0))}</span>
                    </div>
                ))}
            </div>
        </div>
    );

    // ── Disponibilidad ──────────────────────────────────────────────────────
    const renderDisponibilidad = () => {
        const capacidadPago = (socio.ingresoMensual || 0) * 0.3;
        const deudaTotal = socio.prestamos || 0;
        const dispAhorros = Math.max(0, (socio.ahorros || 0) - deudaTotal * 0.1);
        return (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', padding: '1rem' }}>
                <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '1.25rem' }}>
                    <h4 style={{ fontWeight: 700, marginBottom: '1rem', color: 'var(--primary)', fontSize: '0.9rem' }}>Capacidad de Pago</h4>
                    <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--success)' }}>{fmtMoney(capacidadPago)}</div>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>30% del ingreso mensual ({fmtMoney(socio.ingresoMensual)})</p>
                    <div style={{ marginTop: '1rem', height: '6px', background: 'var(--border)', borderRadius: '999px', overflow: 'hidden' }}>
                        <div style={{ width: `${Math.min(100, ((deudaTotal / (capacidadPago * 12)) * 100))}%`, height: '100%', background: 'linear-gradient(90deg, var(--success), var(--warning))' }} />
                    </div>
                    <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>Endeudamiento: {Math.round((deudaTotal / ((capacidadPago * 12) || 1)) * 100)}%</p>
                </div>
                <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '1.25rem' }}>
                    <h4 style={{ fontWeight: 700, marginBottom: '1rem', color: 'var(--primary)', fontSize: '0.9rem' }}>Disponibilidad de Ahorros</h4>
                    <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary)' }}>{fmtMoney(dispAhorros)}</div>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Total ahorros: {fmtMoney(socio.ahorros)}</p>
                    {deudaTotal > 0 && <p style={{ fontSize: '0.72rem', color: 'var(--warning)', marginTop: '0.4rem' }}>Reserva pignorada: {fmtMoney(deudaTotal * 0.1)}</p>}
                </div>
            </div>
        );
    };

    return (
        <div>
            <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid var(--border)', marginBottom: '1rem', overflowX: 'auto' }}>
                {subTabs.map(s => (
                    <button key={s} onClick={() => setSub(s)}
                        style={{ padding: '0.4rem 0.75rem', fontSize: '0.78rem', fontWeight: sub === s ? 700 : 500, borderBottom: sub === s ? '2px solid var(--primary)' : '2px solid transparent', color: sub === s ? 'var(--primary)' : 'var(--text-muted)', background: 'transparent', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                        {s}
                    </button>
                ))}
            </div>
            {sub === 'Seguimiento a Casos' && renderCasos()}
            {sub === 'Estado Financiero' && renderEstadoFinanciero()}
            {sub === 'Histórico de Ctas' && renderHistorico()}
            {sub === 'Cuentas Avaladas' && <div style={{ padding: '1rem', color: 'var(--text-muted)' }}>Sin cuentas avaladas registradas.</div>}
            {sub === 'Disponibilidad' && renderDisponibilidad()}
            {sub === 'Talonarios' && <div style={{ padding: '1rem', color: 'var(--text-muted)' }}>Módulo de Talonarios — próximamente.</div>}
        </div>
    );
};

export default TabSeguimiento;
