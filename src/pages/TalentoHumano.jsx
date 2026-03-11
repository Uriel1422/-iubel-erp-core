import React, { useState } from 'react';
import { useTalentoHumano } from '../context/TalentoHumanoContext';
import {
    Users, UserPlus, Calendar, Award, BookOpen, Search, Plus, X, Edit2, Trash2,
    Phone, Mail, Check, Clock, AlertTriangle, ChevronRight, BarChart3, Star
} from 'lucide-react';

const TABS = ['Empleados', 'Vacaciones y Permisos', 'Evaluaciones', 'Capacitaciones'];

const InfoBadge = ({ label, value, color = 'var(--primary)' }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
        <span style={{ fontWeight: 700, color, fontSize: '0.9rem' }}>{value}</span>
    </div>
);

const EmpleadoModal = ({ onClose, onSave, inicial }) => {
    const [form, setForm] = useState(inicial || {
        nombre: '', cedula: '', cargo: '', departamento: 'Administración', tipoContrato: 'Indefinido',
        salario: '', fechaIngreso: '', email: '', telefono: '', genero: 'Femenino', nivelEducativo: 'Licenciatura'
    });
    const s = k => e => setForm({ ...form, [k]: e.target.value });
    return (
        <div className="modal-overlay">
            <div className="card" style={{ width: '100%', maxWidth: '620px', padding: 0, maxHeight: '90vh', overflowY: 'auto' }}>
                <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: 'var(--bg-card)', zIndex: 1 }}>
                    <h2 style={{ fontWeight: 700, fontSize: '1.15rem' }}>{inicial ? 'Editar Empleado' : 'Nuevo Empleado'}</h2>
                    <button onClick={onClose}><X size={20} /></button>
                </div>
                <form onSubmit={e => { e.preventDefault(); onSave(form); onClose(); }} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div><label className="input-label">Nombre Completo *</label><input required className="input-field" value={form.nombre} onChange={s('nombre')} placeholder="Ej: Ana García" /></div>
                        <div><label className="input-label">Cédula *</label><input required className="input-field" value={form.cedula} onChange={s('cedula')} placeholder="001-0000000-0" /></div>
                        <div><label className="input-label">Cargo *</label><input required className="input-field" value={form.cargo} onChange={s('cargo')} placeholder="Ej: Oficial de Crédito" /></div>
                        <div><label className="input-label">Departamento</label>
                            <select className="input-field" value={form.departamento} onChange={s('departamento')}>
                                {['Administración', 'Crédito y Cobranza', 'Caja y Tesorería', 'Contabilidad', 'Tecnología', 'Recursos Humanos', 'Cumplimiento', 'Gerencia'].map(d => <option key={d}>{d}</option>)}
                            </select>
                        </div>
                        <div><label className="input-label">Tipo de Contrato</label>
                            <select className="input-field" value={form.tipoContrato} onChange={s('tipoContrato')}>
                                {['Indefinido', 'Fijo', 'Temporal', 'Pasantía'].map(t => <option key={t}>{t}</option>)}
                            </select>
                        </div>
                        <div><label className="input-label">Salario Mensual (RD$) *</label><input required type="number" className="input-field" value={form.salario} onChange={s('salario')} placeholder="50000" /></div>
                        <div><label className="input-label">Fecha de Ingreso *</label><input required type="date" className="input-field" value={form.fechaIngreso} onChange={s('fechaIngreso')} /></div>
                        <div><label className="input-label">Género</label>
                            <select className="input-field" value={form.genero} onChange={s('genero')}>
                                <option>Femenino</option><option>Masculino</option><option>Otro</option>
                            </select>
                        </div>
                        <div><label className="input-label">Email</label><input type="email" className="input-field" value={form.email} onChange={s('email')} placeholder="empleado@empresa.com" /></div>
                        <div><label className="input-label">Teléfono</label><input className="input-field" value={form.telefono} onChange={s('telefono')} placeholder="809-000-0000" /></div>
                        <div><label className="input-label">Nivel Educativo</label>
                            <select className="input-field" value={form.nivelEducativo} onChange={s('nivelEducativo')}>
                                {['Bachiller', 'Técnico', 'Licenciatura', 'Maestría', 'Doctorado'].map(n => <option key={n}>{n}</option>)}
                            </select>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
                        <button type="submit" className="btn btn-primary">💾 Guardar Empleado</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const TalentoHumano = () => {
    const { empleados, vacaciones, evaluaciones, capacitaciones, addEmpleado, updateEmpleado, deleteEmpleado, addVacacion, aprobarVacacion } = useTalentoHumano();
    const [tab, setTab] = useState(0);
    const [search, setSearch] = useState('');
    const [modal, setModal] = useState(null);
    const [editEmp, setEditEmp] = useState(null);

    const f = v => new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP', maximumFractionDigits: 0 }).format(v);
    const activos = empleados.filter(e => e.estado === 'Activo').length;
    const masMujeres = empleados.filter(e => e.genero === 'Femenino').length;
    const masHombres = empleados.filter(e => e.genero === 'Masculino').length;
    const nomina = empleados.filter(e => e.estado === 'Activo').reduce((acc, e) => acc + Number(e.salario || 0), 0);

    const filtrados = empleados.filter(e =>
        e.nombre.toLowerCase().includes(search.toLowerCase()) ||
        e.cargo?.toLowerCase().includes(search.toLowerCase()) ||
        e.departamento?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="animate-up">
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
                <div>
                    <h1 className="page-title" style={{ marginBottom: '0.25rem' }}>Talento Humano</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Gestión de personal, contratos, vacaciones y desarrollo</p>
                </div>
                <button className="btn btn-primary" onClick={() => setModal('new')}><UserPlus size={18} /> Nuevo Empleado</button>
            </div>

            {/* KPIs */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem', marginBottom: '2rem' }}>
                {[
                    { label: 'Total Empleados', value: empleados.length, icon: <Users size={22} />, color: 'var(--primary)', bg: 'var(--primary-light)' },
                    { label: 'Activos', value: activos, icon: <Check size={22} />, color: 'var(--success)', bg: 'rgba(16,185,129,0.1)' },
                    { label: 'Nómina Mensual', value: f(nomina), icon: <BarChart3 size={22} />, color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)' },
                    { label: 'Solicitudes Pendientes', value: vacaciones.filter(v => v.estado === 'Pendiente').length, icon: <Clock size={22} />, color: 'var(--warning)', bg: 'rgba(245,158,11,0.1)' },
                ].map((k, i) => (
                    <div key={i} className="card" style={{ display: 'flex', gap: '1rem', alignItems: 'center', padding: '1.25rem' }}>
                        <div style={{ width: 48, height: 48, borderRadius: '12px', background: k.bg, color: k.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{k.icon}</div>
                        <div><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>{k.label}</div>
                            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: k.color }}>{k.value}</div></div>
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
                        <>
                            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                                <div style={{ position: 'relative', flex: 1 }}>
                                    <Search size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                    <input className="input-field" style={{ paddingLeft: '2.75rem' }} placeholder="Buscar empleado, cargo, departamento..." value={search} onChange={e => setSearch(e.target.value)} />
                                </div>
                            </div>
                            <div style={{ display: 'grid', gap: '0.75rem' }}>
                                {filtrados.map(emp => (
                                    <div key={emp.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: 'var(--background)', borderRadius: '12px', transition: 'all 0.2s' }}
                                        onMouseEnter={e => e.currentTarget.style.boxShadow = 'var(--shadow-md)'}
                                        onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}>
                                        <div style={{ width: 48, height: 48, borderRadius: '12px', background: 'linear-gradient(135deg, var(--primary), #8b5cf6)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1.1rem', flexShrink: 0 }}>{emp.nombre.split(' ').map(n => n[0]).join('').slice(0, 2)}</div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{emp.nombre}</div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{emp.cargo} • {emp.departamento}</div>
                                        </div>
                                        <InfoBadge label="Salario" value={f(emp.salario)} color="var(--success)" />
                                        <InfoBadge label="Contrato" value={emp.tipoContrato} />
                                        <InfoBadge label="Ingreso" value={emp.fechaIngreso} />
                                        <span className="badge" style={{ background: emp.estado === 'Activo' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', color: emp.estado === 'Activo' ? 'var(--success)' : 'var(--danger)' }}>{emp.estado}</span>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button className="btn" style={{ padding: '0.4rem', color: 'var(--primary)' }} onClick={() => { setEditEmp(emp); setModal('edit'); }}><Edit2 size={15} /></button>
                                            <button className="btn" style={{ padding: '0.4rem', color: 'var(--danger)' }} onClick={() => deleteEmpleado(emp.id)}><Trash2 size={15} /></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}

                    {tab === 1 && (
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
                                <button className="btn btn-primary" onClick={() => setModal('vac')}><Plus size={16} /> Solicitar Permiso/Vacación</button>
                            </div>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead><tr style={{ borderBottom: '2px solid var(--border)' }}>
                                    {['Empleado', 'Tipo', 'Inicio', 'Fin', 'Días', 'Motivo', 'Estado', 'Acción'].map(h => <th key={h} style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>{h}</th>)}
                                </tr></thead>
                                <tbody>
                                    {vacaciones.map(v => (
                                        <tr key={v.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                            <td style={{ padding: '0.875rem', fontWeight: 600 }}>{v.empleadoNombre}</td>
                                            <td style={{ padding: '0.875rem' }}>{v.tipo}</td>
                                            <td style={{ padding: '0.875rem', fontSize: '0.85rem' }}>{v.fechaInicio}</td>
                                            <td style={{ padding: '0.875rem', fontSize: '0.85rem' }}>{v.fechaFin}</td>
                                            <td style={{ padding: '0.875rem', fontWeight: 700, color: 'var(--primary)' }}>{v.dias}</td>
                                            <td style={{ padding: '0.875rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>{v.motivo}</td>
                                            <td style={{ padding: '0.875rem' }}><span className="badge" style={{ background: v.estado === 'Aprobada' ? 'rgba(16,185,129,0.1)' : v.estado === 'Pendiente' ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.1)', color: v.estado === 'Aprobada' ? 'var(--success)' : v.estado === 'Pendiente' ? 'var(--warning)' : 'var(--danger)' }}>{v.estado}</span></td>
                                            <td style={{ padding: '0.875rem' }}>
                                                {v.estado === 'Pendiente' && <button className="btn btn-primary" style={{ padding: '0.3rem 0.75rem', fontSize: '0.8rem' }} onClick={() => aprobarVacacion(v.id, 'Gerencia')}>Aprobar</button>}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {tab === 2 && (
                        <div style={{ display: 'grid', gap: '1rem' }}>
                            {evaluaciones.map(ev => (
                                <div key={ev.id} style={{ padding: '1.25rem', background: 'var(--background)', borderRadius: '12px', display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                                    <div style={{ width: 56, height: 56, borderRadius: '50%', background: ev.calificacion >= 90 ? 'rgba(16,185,129,0.15)' : ev.calificacion >= 75 ? 'rgba(37,99,235,0.15)' : 'rgba(245,158,11,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                                        <span style={{ fontWeight: 800, fontSize: '1.1rem', color: ev.calificacion >= 90 ? 'var(--success)' : ev.calificacion >= 75 ? 'var(--primary)' : 'var(--warning)' }}>{ev.calificacion}</span>
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 700 }}>{ev.empleadoNombre} <span className="badge badge-info" style={{ marginLeft: '0.5rem' }}>{ev.nivel}</span></div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Período: {ev.periodo} • Evaluador: {ev.evaluadoPor}</div>
                                        <div style={{ marginTop: '0.5rem', display: 'flex', gap: '1.5rem' }}>
                                            <div><span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Fortalezas: </span><span style={{ fontSize: '0.8rem' }}>{ev.fortalezas}</span></div>
                                            <div><span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Mejora: </span><span style={{ fontSize: '0.8rem' }}>{ev.areasMejora}</span></div>
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right', fontSize: '0.8rem', color: 'var(--text-muted)' }}>{ev.fecha}</div>
                                </div>
                            ))}
                        </div>
                    )}

                    {tab === 3 && (
                        <div style={{ display: 'grid', gap: '1rem' }}>
                            {capacitaciones.map(cap => (
                                <div key={cap.id} style={{ padding: '1.25rem', background: 'var(--background)', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                                    <div style={{ width: 48, height: 48, borderRadius: '12px', background: 'rgba(139,92,246,0.1)', color: '#8b5cf6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><BookOpen size={22} /></div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 700 }}>{cap.nombre} <span className={`badge ${cap.tipo === 'Obligatoria' ? 'badge-danger' : 'badge-info'}`}>{cap.tipo}</span></div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{cap.proveedor} • {cap.duracionHoras}h • {cap.fechaInicio}</div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Inscritos: <strong>{cap.empleadosInscritos.length}</strong></div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>RD${cap.costo.toLocaleString()}</div>
                                    </div>
                                    <span className="badge" style={{ background: cap.estado === 'Completada' ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)', color: cap.estado === 'Completada' ? 'var(--success)' : 'var(--warning)' }}>{cap.estado}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {(modal === 'new' || modal === 'edit') && (
                <EmpleadoModal
                    onClose={() => { setModal(null); setEditEmp(null); }}
                    onSave={data => { if (modal === 'edit' && editEmp) { updateEmpleado(editEmp.id, data); } else { addEmpleado(data); } }}
                    inicial={editEmp}
                />
            )}
        </div>
    );
};

export default TalentoHumano;
