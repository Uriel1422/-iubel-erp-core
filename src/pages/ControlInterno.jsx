import React, { useState } from 'react';
import { useControlInterno } from '../context/ControlInternoContext';
import { Shield, AlertTriangle, CheckCircle, Search, Plus, X, FileText, Activity, TrendingUp, User, Clock, Check, XCircle, ArrowRight } from 'lucide-react';

const TABS = ['Aprobaciones (Cuatro Ojos)', 'Matriz de Riesgos', 'Hallazgos', 'Auditorías', 'Predictor AML (IA)'];

const nivelColor = (nivel) => {
    const map = { 'Crítico': '#dc2626', 'Alto': '#ef4444', 'Medio': '#f59e0b', 'Bajo': '#10b981' };
    return map[nivel] || '#64748b';
};

const estadoColor = (estado) => {
    const map = { 
        'Pendiente': '#f59e0b', 
        'En Proceso': '#2563eb', 
        'Resuelto': '#10b981', 
        'Completada': '#10b981', 
        'Planificada': '#8b5cf6', 
        'Monitoreado': '#10b981', 
        'En Mitigación': '#2563eb', 
        'Crítico': '#dc2626' 
    };
    return map[estado] || '#64748b';
};

const ControlInterno = () => {
    const { 
        hallazgos, auditorias, riesgos, aprobaciones,
        addHallazgo, updateHallazgo, addAuditoria, addRiesgo,
        probarPeticion, simularPeticionMaker
    } = useControlInterno();
    const [tab, setTab] = useState(0);
    const [search, setSearch] = useState('');
    const [modal, setModal] = useState(null);

    const criticos = riesgos.filter(r => r.nivelRiesgo === 'Crítico').length;
    const altos = riesgos.filter(r => r.nivelRiesgo === 'Alto').length;
    const pendientes = hallazgos.filter(h => h.estado === 'Pendiente').length;
    const apPendientes = aprobaciones?.filter(a => a.estado === 'Pendiente').length || 0;

    const formatMoney = (val) => new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP' }).format(Number(val) || 0);

    const handleAprobarRechazar = (id, esAprobado) => {
        const razon = window.prompt(`¿Cuál es el comentario de auditoría para ${esAprobado ? 'APROBAR' : 'RECHAZAR'} esta solicitud?`);
        if (razon !== null) { // if not cancelled
            probarPeticion(id, razon || (esAprobado ? 'Aprobado sin comentario adicional.' : 'Rechazado sin justificación.'), esAprobado);
        }
    };

    return (
        <div className="animate-up">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
                <div>
                    <h1 className="page-title" style={{ marginBottom: '0.25rem' }}>Control Interno</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Gestión de riesgos, aprobaciones (Maker-Checker), hallazgos y auditorías institucionales</p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    {tab === 0 && (
                        <button className="btn btn-secondary" onClick={simularPeticionMaker} style={{ gap: '0.5rem', borderColor: 'var(--warning)', color: 'var(--warning)' }}>
                            <Activity size={16} /> Simular Petición Maker
                        </button>
                    )}
                    <button className="btn btn-primary" onClick={() => setModal(tab === 1 ? 'riesgo' : tab === 2 ? 'hallazgo' : 'auditoria')}>
                        <Plus size={16} /> {tab === 1 ? 'Nuevo Riesgo' : tab === 2 ? 'Nuevo Hallazgo' : 'Nueva Auditoría'}
                    </button>
                </div>
            </div>

            {/* KPIs */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1.25rem', marginBottom: '2rem' }}>
                {[
                    { label: 'Alertas AML', value: 3, color: '#f97316', bg: 'rgba(249,115,22,0.1)', icon: <Shield size={22} /> },
                    { label: 'Aprobaciones Pendientes', value: apPendientes, color: 'var(--warning)', bg: 'rgba(245,158,11,0.1)', icon: <Clock size={22} /> },
                    { label: 'Riesgos Críticos', value: criticos, color: '#dc2626', bg: 'rgba(220,38,38,0.1)', icon: <AlertTriangle size={22} /> },
                    { label: 'Hallazgos Pendientes', value: pendientes, color: 'var(--primary)', bg: 'var(--primary-light)', icon: <FileText size={22} /> },
                    { label: 'Auditorías Activas', value: auditorias.filter(a => a.estado === 'En Proceso').length, color: 'var(--success)', bg: 'rgba(16,185,129,0.1)', icon: <CheckCircle size={22} /> },
                ].map((k, i) => (
                    <div key={i} className="card" style={{ display: 'flex', gap: '1rem', alignItems: 'center', padding: '1.25rem' }}>
                        <div style={{ width: 48, height: 48, borderRadius: '12px', background: k.bg, color: k.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{k.icon}</div>
                        <div><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{k.label}</div><div style={{ fontSize: '1.5rem', fontWeight: 800, color: k.color }}>{k.value}</div></div>
                    </div>
                ))}
            </div>

            {/* Tabs */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ display: 'flex', borderBottom: '2px solid var(--border)' }}>
                    {TABS.map((t, i) => (
                        <button key={i} onClick={() => setTab(i)} style={{ padding: '1rem 1.5rem', fontWeight: 600, fontSize: '0.875rem', borderBottom: tab === i ? '2px solid var(--primary)' : 'none', color: tab === i ? 'var(--primary)' : 'var(--text-muted)', background: 'none', cursor: 'pointer', marginBottom: '-2px' }}>{t}</button>
                    ))}
                </div>
                <div style={{ padding: '1.5rem' }}>
                    {tab === 0 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {aprobaciones && aprobaciones.length === 0 ? (
                                <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)', border: '1px dashed var(--border)', borderRadius: '12px' }}>
                                    <CheckCircle size={48} style={{ opacity: 0.2, margin: '0 auto 1rem' }} />
                                    <h3>Bandeja de Aprobaciones Vacía</h3>
                                    <p>No hay solicitudes pendientes de "Cuatro Ojos".</p>
                                </div>
                            ) : (
                                aprobaciones?.map(ap => (
                                    <div key={ap.id} className="card glass layout-card" style={{ padding: '1.5rem', borderLeft: `4px solid ${ap.estado === 'Pendiente' ? 'var(--warning)' : ap.estado === 'Aprobado' ? 'var(--success)' : 'var(--danger)'}`, display: 'flex', gap: '2rem', alignItems: 'center' }}>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <span className="badge" style={{ background: 'var(--background)' }}>{ap.ticketId}</span>
                                                    <span className="badge" style={{ background: ap.estado === 'Pendiente' ? 'rgba(245,158,11,0.1)' : ap.estado === 'Aprobado' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', color: ap.estado === 'Pendiente' ? 'var(--warning)' : ap.estado === 'Aprobado' ? 'var(--success)' : 'var(--danger)' }}>
                                                        {ap.estado}
                                                    </span>
                                                </div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                                    {new Date(ap.fechaSolicitud).toLocaleString()}
                                                </div>
                                            </div>
                                            
                                            <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem' }}>{ap.operacion}</h4>
                                            
                                            <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1rem', fontSize: '0.85rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)' }}>
                                                    <User size={14} /> <strong>Maker:</strong> {ap.maker}
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)' }}>
                                                    <Activity size={14} /> <strong>Módulo:</strong> {ap.modulo}
                                                </div>
                                                {ap.montoImpacto > 0 && (
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--danger)', fontWeight: 700 }}>
                                                        Impacto Financiero: {formatMoney(ap.montoImpacto)}
                                                    </div>
                                                )}
                                            </div>

                                            <div style={{ background: 'var(--background)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '1rem', alignItems: 'center', marginBottom: '0.75rem' }}>
                                                    <div style={{ padding: '0.75rem', background: 'rgba(239,68,68,0.05)', border: '1px dashed var(--danger)', borderRadius: '6px', fontSize: '0.85rem' }}>
                                                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.2rem' }}>Valor Original</div>
                                                        <div style={{ fontWeight: 600, color: 'var(--danger)' }}>{ap.detalleAntes}</div>
                                                    </div>
                                                    <ArrowRight size={20} color="var(--text-muted)" />
                                                    <div style={{ padding: '0.75rem', background: 'rgba(16,185,129,0.05)', border: '1px dashed var(--success)', borderRadius: '6px', fontSize: '0.85rem' }}>
                                                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.2rem' }}>Valor Solicitado</div>
                                                        <div style={{ fontWeight: 600, color: 'var(--success)' }}>{ap.detalleDespues}</div>
                                                    </div>
                                                </div>
                                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                                                    <span style={{ fontWeight: 600, color: 'var(--text-main)', fontStyle: 'normal' }}>Justificación del Maker:</span> "{ap.justificacion}"
                                                </div>
                                            </div>

                                            {ap.estado !== 'Pendiente' && (
                                                <div style={{ marginTop: '1rem', padding: '0.75rem', background: ap.estado === 'Aprobado' ? 'rgba(16,185,129,0.05)' : 'rgba(239,68,68,0.05)', borderRadius: '8px', fontSize: '0.8rem' }}>
                                                    <strong>Comentario Checker ({new Date(ap.fechaCierre).toLocaleString()}):</strong> {ap.comentarioCierre}
                                                </div>
                                            )}
                                        </div>

                                        {ap.estado === 'Pendiente' && (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '140px' }}>
                                                <button className="btn btn-primary" style={{ background: 'var(--success)', borderColor: 'var(--success)', justifyContent: 'center' }} onClick={() => handleAprobarRechazar(ap.id, true)}>
                                                    <Check size={16} /> Aprobar
                                                </button>
                                                <button className="btn btn-secondary" style={{ color: 'var(--danger)', borderColor: 'var(--danger)', justifyContent: 'center' }} onClick={() => handleAprobarRechazar(ap.id, false)}>
                                                    <XCircle size={16} /> Rechazar
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                    {tab === 1 && (
                        <div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', marginBottom: '1.5rem', padding: '1rem', background: 'var(--background)', borderRadius: '10px', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textAlign: 'center' }}>
                                {['Riesgo', 'Categoría', 'Probabilidad + Impacto', 'Nivel', 'Mitigación', 'Estado'].map(h => <div key={h}>{h}</div>)}
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {riesgos.map(r => (
                                    <div key={r.id} style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '0.75rem', alignItems: 'center', padding: '1rem', background: 'var(--background)', borderRadius: '10px', borderLeft: `4px solid ${nivelColor(r.nivelRiesgo)}` }}>
                                        <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>{r.nombre}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{r.categoria}</div>
                                        <div style={{ fontSize: '0.8rem' }}>{r.probabilidad} / {r.impacto}</div>
                                        <div><span className="badge" style={{ background: `${nivelColor(r.nivelRiesgo)}20`, color: nivelColor(r.nivelRiesgo), fontWeight: 700 }}>{r.nivelRiesgo}</span></div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{r.mitigacion}</div>
                                        <div><span className="badge" style={{ background: `${estadoColor(r.estado)}20`, color: estadoColor(r.estado) }}>{r.estado}</span></div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    {tab === 2 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {hallazgos.map(h => (
                                <div key={h.id} style={{ padding: '1.25rem', background: 'var(--background)', borderRadius: '12px', borderLeft: `4px solid ${nivelColor(h.nivelRiesgo)}` }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                                        <div>
                                            <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 700, marginBottom: '0.25rem', display: 'block' }}>{h.numero}</span>
                                            <h4 style={{ fontWeight: 700 }}>{h.titulo}</h4>
                                        </div>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <span className="badge" style={{ background: `${nivelColor(h.nivelRiesgo)}20`, color: nivelColor(h.nivelRiesgo) }}>{h.nivelRiesgo}</span>
                                            <span className="badge" style={{ background: `${estadoColor(h.estado)}20`, color: estadoColor(h.estado) }}>{h.estado}</span>
                                        </div>
                                    </div>
                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>{h.descripcion}</p>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', fontSize: '0.8rem' }}>
                                        <div><span style={{ color: 'var(--text-muted)' }}>Área: </span><strong>{h.area}</strong></div>
                                        <div><span style={{ color: 'var(--text-muted)' }}>Responsable: </span><strong>{h.responsable}</strong></div>
                                        <div><span style={{ color: 'var(--text-muted)' }}>Límite: </span><strong>{h.fechaLimite}</strong></div>
                                    </div>
                                    <div style={{ marginTop: '0.75rem', padding: '0.75rem', background: 'rgba(37,99,235,0.05)', borderRadius: '8px', fontSize: '0.8rem' }}>
                                        <span style={{ color: 'var(--primary)', fontWeight: 700 }}>💡 Recomendación: </span>{h.recomendacion}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    {tab === 3 && (
                        <div>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead><tr style={{ borderBottom: '2px solid var(--border)' }}>
                                    {['N°', 'Tipo', 'Alcance', 'Auditor', 'Período', 'Hallazgos', 'Estado'].map(h => <th key={h} style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>{h}</th>)}
                                </tr></thead>
                                <tbody>
                                    {auditorias.map(a => (
                                        <tr key={a.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                            <td style={{ padding: '1rem', fontWeight: 700, color: 'var(--primary)' }}>{a.numero}</td>
                                            <td style={{ padding: '1rem' }}><span className="badge badge-info">{a.tipo}</span></td>
                                            <td style={{ padding: '1rem', fontSize: '0.875rem' }}>{a.alcance}</td>
                                            <td style={{ padding: '1rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>{a.auditor}</td>
                                            <td style={{ padding: '1rem', fontSize: '0.85rem' }}>{a.fechaInicio} → {a.fechaFin}</td>
                                            <td style={{ padding: '1rem', fontWeight: 700, color: a.hallazgos > 0 ? 'var(--warning)' : 'var(--success)' }}>{a.hallazgos}</td>
                                            <td style={{ padding: '1rem' }}><span className="badge" style={{ background: `${estadoColor(a.estado)}20`, color: estadoColor(a.estado) }}>{a.estado}</span></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                    {tab === 4 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <div>
                                    <h3 style={{ margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#1e293b' }}>
                                        <Activity className="text-primary" /> Radar Predictivo AML
                                    </h3>
                                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>Módulo de Inteligencia Artificial que perfila las transacciones en tiempo real en busca de Lavado de Activos.</p>
                                </div>
                                <div className="badge" style={{ background: 'rgba(16,185,129,0.1)', color: 'var(--success)', padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
                                    <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: 'var(--success)', marginRight: '0.5rem', animation: 'pulse 2s infinite' }}></span> Motor IA Activo
                                </div>
                            </div>
                            
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ borderBottom: '2px solid var(--border)' }}>
                                        <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Txn Hash</th>
                                        <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Cliente</th>
                                        <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Operación</th>
                                        <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Manejo de Patrón</th>
                                        <th style={{ padding: '0.75rem', textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Score de Riesgo</th>
                                        <th style={{ padding: '0.75rem', textAlign: 'right', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Acción</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {[
                                        { hash: 'TX-992A-XB', cliente: 'Juan P. (104-***09)', op: 'Depósito Efectivo Cajas ($9,500)', pat: 'Fraccionamiento (Smurfing)', score: 92, status: 'Critico' },
                                        { hash: 'TX-817B-YZ', cliente: 'Betacorp LLC', op: 'Ojeado SWIFT ($45,000 Bahamas)', pat: 'Paraíso Fiscal / Cambio Patrón', score: 85, status: 'Alto' },
                                        { hash: 'TX-105C-LL', cliente: 'María López', op: 'Pago Extraord. Préstamo ($1,200)', pat: 'Normal (+10% Promedio)', score: 15, status: 'Bajo' }
                                    ].map((txn, idx) => (
                                        <tr key={idx} style={{ borderBottom: '1px solid var(--border)' }}>
                                            <td style={{ padding: '1rem', fontFamily: 'monospace', fontSize: '0.85rem' }}>{txn.hash}</td>
                                            <td style={{ padding: '1rem', fontWeight: 600 }}>{txn.cliente}</td>
                                            <td style={{ padding: '1rem', fontSize: '0.85rem' }}>{txn.op}</td>
                                            <td style={{ padding: '1rem', fontSize: '0.85rem', color: txn.status !== 'Bajo' ? 'var(--danger)' : 'var(--text-muted)' }}>
                                                {txn.status !== 'Bajo' && <AlertTriangle size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />}
                                                {txn.pat}
                                            </td>
                                            <td style={{ padding: '1rem', textAlign: 'center' }}>
                                                <div style={{ 
                                                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 40, height: 40, borderRadius: '50%',
                                                    background: txn.status === 'Critico' ? 'rgba(220,38,38,0.1)' : txn.status === 'Alto' ? 'rgba(249,115,22,0.1)' : 'rgba(16,185,129,0.1)',
                                                    border: `2px solid ${txn.status === 'Critico' ? 'var(--danger)' : txn.status === 'Alto' ? '#f97316' : 'var(--success)'}`,
                                                    color: txn.status === 'Critico' ? 'var(--danger)' : txn.status === 'Alto' ? '#ea580c' : 'var(--success)',
                                                    fontWeight: 800, fontSize: '0.9rem'
                                                }}>
                                                    {txn.score}
                                                </div>
                                            </td>
                                            <td style={{ padding: '1rem', textAlign: 'right' }}>
                                                <button className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', borderColor: txn.status === 'Bajo' ? 'var(--border)' : 'var(--danger)', color: txn.status === 'Bajo' ? 'var(--text-main)' : 'var(--danger)' }}>
                                                    {txn.status === 'Bajo' ? 'Auditar' : 'Detener y Reportar'}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ControlInterno;
