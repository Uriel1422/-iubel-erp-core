import React, { useState } from 'react';
import { useJuridico } from '../context/JuridicoContext';
import { FileText, Scale, Shield, AlertTriangle, Plus, Calendar, X, ExternalLink, Clock } from 'lucide-react';

const TABS = ['Contratos', 'Demandas Activas', 'Documentos Legales'];

const diasHasta = (fecha) => {
    if (!fecha) return null;
    const diff = Math.ceil((new Date(fecha) - new Date()) / (1000 * 60 * 60 * 24));
    return diff;
};

const Juridico = () => {
    const { contratos, demandas, documentos, addContrato, updateContrato, addDemanda, updateDemanda, addDocumento } = useJuridico();
    const [tab, setTab] = useState(0);
    const [modal, setModal] = useState(false);

    const formInit = { tipo: 'Servicio', descripcion: '', contraparte: '', monto: '', fechaInicio: '', fechaFin: '', alertaDias: 30 };
    const [form, setForm] = useState(formInit);
    const s = k => e => setForm({ ...form, [k]: e.target.value });

    const f = v => new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP', maximumFractionDigits: 0 }).format(Number(v) || 0);
    const porVencer = contratos.filter(c => { const d = diasHasta(c.fechaFin); return d !== null && d >= 0 && d <= 60; }).length;
    const demActivas = demandas.filter(d => d.estado !== 'Cerrada').length;
    const montoRiesgo = demandas.filter(d => d.estado !== 'Cerrada').reduce((acc, d) => acc + Number(d.monto || 0), 0);

    const estadoContratoColor = (est) => est === 'Vigente' ? 'var(--success)' : est === 'Por Vencer' ? 'var(--warning)' : 'var(--danger)';

    return (
        <div className="animate-up">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
                <div>
                    <h1 className="page-title" style={{ marginBottom: '0.25rem' }}>Gestión Jurídica</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Contratos, demandas, poderes notariales y documentos legales</p>
                </div>
                <button className="btn btn-primary" onClick={() => setModal(true)}><Plus size={16} /> Nuevo Contrato</button>
            </div>

            {/* KPIs */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem', marginBottom: '2rem' }}>
                {[
                    { label: 'Contratos Vigentes', value: contratos.filter(c => c.estado === 'Vigente').length, icon: <FileText size={22} />, color: 'var(--primary)', bg: 'var(--primary-light)' },
                    { label: 'Por Vencer (60 días)', value: porVencer, icon: <Clock size={22} />, color: 'var(--warning)', bg: 'rgba(245,158,11,0.1)' },
                    { label: 'Demandas Activas', value: demActivas, icon: <Scale size={22} />, color: 'var(--danger)', bg: 'rgba(239,68,68,0.1)' },
                    { label: 'Monto en Riesgo', value: f(montoRiesgo), icon: <AlertTriangle size={22} />, color: '#dc2626', bg: 'rgba(220,38,38,0.1)' },
                ].map((k, i) => (
                    <div key={i} className="card" style={{ display: 'flex', gap: '1rem', alignItems: 'center', padding: '1.25rem' }}>
                        <div style={{ width: 48, height: 48, borderRadius: '12px', background: k.bg, color: k.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{k.icon}</div>
                        <div><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{k.label}</div><div style={{ fontSize: '1.15rem', fontWeight: 800, color: k.color }}>{k.value}</div></div>
                    </div>
                ))}
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ display: 'flex', borderBottom: '2px solid var(--border)' }}>
                    {TABS.map((t, i) => (
                        <button key={i} onClick={() => setTab(i)} style={{ padding: '1rem 1.5rem', fontWeight: 600, fontSize: '0.875rem', borderBottom: tab === i ? '2px solid var(--primary)' : 'none', color: tab === i ? 'var(--primary)' : 'var(--text-muted)', background: 'none', cursor: 'pointer', marginBottom: '-2px' }}>{t}</button>
                    ))}
                </div>
                <div style={{ padding: '1.5rem' }}>
                    {tab === 0 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {contratos.map(c => {
                                const dias = diasHasta(c.fechaFin);
                                return (
                                    <div key={c.id} style={{ padding: '1.25rem', background: 'var(--background)', borderRadius: '12px', borderLeft: `4px solid ${estadoContratoColor(c.estado)}` }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                                            <div>
                                                <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 700 }}>{c.numero}</span>
                                                <div style={{ fontWeight: 700, fontSize: '0.95rem', marginTop: '0.15rem' }}>{c.descripcion}</div>
                                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Contraparte: <strong>{c.contraparte}</strong></div>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <span className="badge" style={{ background: `${estadoContratoColor(c.estado)}20`, color: estadoContratoColor(c.estado) }}>{c.estado}</span>
                                                {dias !== null && dias <= 60 && dias >= 0 && (
                                                    <div style={{ fontSize: '0.75rem', color: 'var(--warning)', marginTop: '0.4rem', fontWeight: 700 }}>⚠️ Vence en {dias} días</div>
                                                )}
                                            </div>
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem', fontSize: '0.8rem' }}>
                                            <div><span style={{ color: 'var(--text-muted)' }}>Tipo: </span><strong>{c.tipo}</strong></div>
                                            <div><span style={{ color: 'var(--text-muted)' }}>Monto: </span><strong style={{ color: 'var(--primary)' }}>{f(c.monto)}</strong></div>
                                            <div><span style={{ color: 'var(--text-muted)' }}>Inicio: </span><strong>{c.fechaInicio}</strong></div>
                                            <div><span style={{ color: 'var(--text-muted)' }}>Fin: </span><strong>{c.fechaFin || 'Indefinido'}</strong></div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {tab === 1 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {demandas.map(d => (
                                <div key={d.id} style={{ padding: '1.25rem', background: 'var(--background)', borderRadius: '12px', borderLeft: `4px solid ${d.tipo === 'Cobro Judicial' ? 'var(--primary)' : 'var(--danger)'}` }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                                        <div>
                                            <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 700 }}>{d.numero}</span>
                                            <div style={{ fontWeight: 700, marginTop: '0.15rem' }}>{d.descripcion}</div>
                                        </div>
                                        <span className="badge badge-info">{d.tipo}</span>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem', fontSize: '0.8rem', marginBottom: '0.75rem' }}>
                                        <div><span style={{ color: 'var(--text-muted)' }}>Demandante: </span><strong>{d.demandante}</strong></div>
                                        <div><span style={{ color: 'var(--text-muted)' }}>Demandado: </span><strong>{d.demandado}</strong></div>
                                        <div><span style={{ color: 'var(--text-muted)' }}>Monto: </span><strong style={{ color: 'var(--danger)' }}>{f(d.monto)}</strong></div>
                                        <div><span style={{ color: 'var(--text-muted)' }}>Próxima: </span><strong>{d.proxima}</strong></div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.8rem' }}>
                                        <div><span style={{ color: 'var(--text-muted)' }}>Tribunal: </span>{d.tribunal}</div>
                                        <div><span style={{ color: 'var(--text-muted)' }}>Abogado: </span><strong>{d.abogado}</strong></div>
                                        <div style={{ marginLeft: 'auto' }}><span className="badge" style={{ background: d.estado === 'En Proceso' ? 'rgba(37,99,235,0.1)' : d.estado === 'Nuevo' ? 'rgba(245,158,11,0.1)' : 'rgba(16,185,129,0.1)', color: d.estado === 'En Proceso' ? 'var(--primary)' : d.estado === 'Nuevo' ? 'var(--warning)' : 'var(--success)' }}>{d.estado}</span></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {tab === 2 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {documentos.map(doc => {
                                const dias = diasHasta(doc.vencimiento);
                                return (
                                    <div key={doc.id} style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr 1fr 1fr 100px', gap: '1rem', alignItems: 'center', padding: '1rem', background: 'var(--background)', borderRadius: '10px' }}>
                                        <div><span className="badge badge-info" style={{ fontSize: '0.75rem' }}>{doc.tipo}</span></div>
                                        <div>
                                            <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{doc.descripcion}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Notario: {doc.notario}</div>
                                        </div>
                                        <div style={{ fontSize: '0.8rem' }}><span style={{ color: 'var(--text-muted)' }}>Beneficiario: </span>{doc.beneficiario}</div>
                                        <div style={{ fontSize: '0.8rem' }}>{doc.fecha}</div>
                                        <div style={{ fontSize: '0.8rem' }}>
                                            {doc.vencimiento ? (
                                                <span style={{ color: dias !== null && dias <= 30 ? 'var(--warning)' : 'var(--text-muted)' }}>{doc.vencimiento} {dias !== null && dias <= 30 && `(${dias}d)`}</span>
                                            ) : 'Sin vencimiento'}
                                        </div>
                                        <span className="badge" style={{ background: doc.estado === 'Vigente' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', color: doc.estado === 'Vigente' ? 'var(--success)' : 'var(--danger)' }}>{doc.estado}</span>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Modal Contrato */}
            {modal && (
                <div className="modal-overlay">
                    <div className="card" style={{ width: '100%', maxWidth: '560px', padding: 0, overflowY: 'auto', maxHeight: '90vh' }}>
                        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: 'var(--bg-card)', zIndex: 1 }}>
                            <h3 style={{ fontWeight: 700 }}>Nuevo Contrato</h3>
                            <button onClick={() => setModal(false)}><X size={18} /></button>
                        </div>
                        <form onSubmit={e => { e.preventDefault(); addContrato(form); setForm(formInit); setModal(false); }} style={{ padding: '1.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div><label className="input-label">Tipo *</label>
                                <select required className="input-field" value={form.tipo} onChange={s('tipo')}>
                                    {['Servicio', 'Arrendamiento', 'Consultoría', 'Proveedor', 'Laboral', 'Otro'].map(t => <option key={t}>{t}</option>)}
                                </select>
                            </div>
                            <div><label className="input-label">Monto Contractual</label><input type="number" className="input-field" value={form.monto} onChange={s('monto')} placeholder="120000" /></div>
                            <div style={{ gridColumn: '1/-1' }}><label className="input-label">Descripción *</label><input required className="input-field" value={form.descripcion} onChange={s('descripcion')} placeholder="Describe el objeto del contrato" /></div>
                            <div><label className="input-label">Contraparte *</label><input required className="input-field" value={form.contraparte} onChange={s('contraparte')} placeholder="Nombre empresa/persona" /></div>
                            <div><label className="input-label">Alerta (días antes)</label><input type="number" className="input-field" value={form.alertaDias} onChange={s('alertaDias')} /></div>
                            <div><label className="input-label">Fecha de Inicio *</label><input required type="date" className="input-field" value={form.fechaInicio} onChange={s('fechaInicio')} /></div>
                            <div><label className="input-label">Fecha de Fin</label><input type="date" className="input-field" value={form.fechaFin} onChange={s('fechaFin')} /></div>
                            <div style={{ gridColumn: '1/-1', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                                <button type="button" className="btn btn-secondary" onClick={() => setModal(false)}>Cancelar</button>
                                <button type="submit" className="btn btn-primary">💾 Guardar Contrato</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Juridico;
