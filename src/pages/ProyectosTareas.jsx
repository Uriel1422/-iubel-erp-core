import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { Briefcase, Plus, CheckCircle2, Circle, Clock, Users, BarChart3, Trash2, Edit3, AlertTriangle, ChevronRight } from 'lucide-react';
import ConfirmModal from '../components/ConfirmModal';

const PRIORIDAD_STYLES = {
    alta:   { color: '#991b1b', bg: '#fee2e2', label: 'Alta' },
    media:  { color: '#92400e', bg: '#fef3c7', label: 'Media' },
    baja:   { color: '#065f46', bg: '#ecfdf5', label: 'Baja' },
};

const ESTADO_STYLES = {
    pendiente:   { color: '#1d4ed8', bg: '#eff6ff',  label: 'Pendiente',   Icon: Circle },
    en_progreso: { color: '#92400e', bg: '#fef3c7',  label: 'En Progreso', Icon: Clock },
    completado:  { color: '#065f46', bg: '#ecfdf5',  label: 'Completado',  Icon: CheckCircle2 },
    bloqueado:   { color: '#991b1b', bg: '#fee2e2',  label: 'Bloqueado',   Icon: AlertTriangle },
};

const ProyectosTareas = () => {
    const [proyectos, setProyectos] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // 🔄 API PERSISTENCE
    useEffect(() => {
        const loadProyectos = async () => {
            const data = await api.get('proyectos');
            if (data && Array.isArray(data)) setProyectos(data);
            setIsLoading(false);
        };
        loadProyectos();
    }, []);

    useEffect(() => {
        if (!isLoading) {
            api.save('proyectos', proyectos);
        }
    }, [proyectos, isLoading]);
    const [proyectoActivo, setProyectoActivo] = useState(null);
    const [showNuevoProyecto, setShowNuevoProyecto] = useState(false);
    const [showNuevaTarea, setShowNuevaTarea] = useState(false);
    const [confirmDel, setConfirmDel] = useState({ open: false, id: null });
    const [nuevoProyecto, setNuevoProyecto] = useState({ nombre: '', descripcion: '', prioridad: 'media', responsable: '', fechaFin: '' });
    const [nuevaTarea, setNuevaTarea] = useState({ titulo: '', responsable: '', estado: 'pendiente' });

    const statsGlobales = {
        total: proyectos.length,
        enProgreso: proyectos.filter(p => p.estado === 'en_progreso').length,
        completados: proyectos.filter(p => p.estado === 'completado').length,
        tareasTotal: proyectos.reduce((a, p) => a + p.tareas.length, 0),
        tareasComp: proyectos.reduce((a, p) => a + p.tareas.filter(t => t.estado === 'completado').length, 0),
    };

    const proyectoActualizado = proyectos.find(p => p.id === proyectoActivo?.id);

    const cambiarEstadoTarea = (proyId, tareaId, nuevoEstado) => {
        setProyectos(prev => prev.map(p => p.id === proyId ? {
            ...p,
            tareas: p.tareas.map(t => t.id === tareaId ? { ...t, estado: nuevoEstado } : t),
            progreso: Math.round((p.tareas.filter(t => t.id === tareaId ? nuevoEstado === 'completado' : t.estado === 'completado').length / p.tareas.length) * 100)
        } : p));
    };

    const handleNuevoProyecto = (e) => {
        e.preventDefault();
        const p = { id: Date.now().toString(), ...nuevoProyecto, estado: 'pendiente', progreso: 0, tareas: [] };
        setProyectos(prev => [...prev, p]);
        setShowNuevoProyecto(false);
        setNuevoProyecto({ nombre: '', descripcion: '', prioridad: 'media', responsable: '', fechaFin: '' });
    };

    const handleNuevaTarea = (e) => {
        e.preventDefault();
        setProyectos(prev => prev.map(p => p.id === proyectoActivo.id ? {
            ...p, tareas: [...p.tareas, { id: Date.now().toString(), ...nuevaTarea }]
        } : p));
        setShowNuevaTarea(false);
        setNuevaTarea({ titulo: '', responsable: '', estado: 'pendiente' });
    };

    return (
        <div className="animate-up">
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                    <div style={{ width: 44, height: 44, borderRadius: '12px', background: 'linear-gradient(135deg,#10b981,#059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 20px rgba(16,185,129,0.3)' }}>
                        <Briefcase size={22} color="white" />
                    </div>
                    <div>
                        <h1 className="page-title" style={{ margin: 0 }}>Proyectos & Tareas</h1>
                        <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.875rem' }}>Gestión de Proyectos Institucionales y seguimiento de tareas en equipo</p>
                    </div>
                </div>
                {!proyectoActivo && (
                    <button className="btn btn-primary" onClick={() => setShowNuevoProyecto(true)}>
                        <Plus size={18} /> Nuevo Proyecto
                    </button>
                )}
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px,1fr))', gap: '1rem', marginBottom: '2rem' }} className="stagger-children">
                {[
                    { label: 'Total Proyectos',  val: statsGlobales.total,      grad: 'linear-gradient(135deg,#6366f1,#8b5cf6)' },
                    { label: 'En Progreso',      val: statsGlobales.enProgreso, grad: 'linear-gradient(135deg,#f59e0b,#fbbf24)' },
                    { label: 'Completados',      val: statsGlobales.completados, grad: 'linear-gradient(135deg,#10b981,#34d399)' },
                    { label: 'Tareas Completadas', val: `${statsGlobales.tareasComp}/${statsGlobales.tareasTotal}`, grad: 'linear-gradient(135deg,#2563eb,#3b82f6)' },
                ].map(({ label, val, grad }) => (
                    <div key={label} className="card" style={{ padding: '1.25rem' }}>
                        <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>{label}</div>
                        <div style={{ fontSize: '1.75rem', fontWeight: 900, background: grad, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{val}</div>
                    </div>
                ))}
            </div>

            {/* Project Detail View */}
            {proyectoActivo ? (
                <div>
                    <button onClick={() => setProyectoActivo(null)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem', fontFamily: 'inherit' }}>
                        ← Volver a Proyectos
                    </button>
                    {proyectoActualizado && (
                        <div className="card">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                                <div>
                                    <h2 style={{ fontWeight: 800, fontSize: '1.35rem', marginBottom: '0.35rem' }}>{proyectoActualizado.nombre}</h2>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1rem' }}>{proyectoActualizado.descripcion}</p>
                                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                                        <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.2rem 0.625rem', borderRadius: '6px', ...PRIORIDAD_STYLES[proyectoActualizado.prioridad] }}>
                                            Prioridad: {PRIORIDAD_STYLES[proyectoActualizado.prioridad].label}
                                        </span>
                                        <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.2rem 0.625rem', borderRadius: '6px', background: 'var(--primary-light)', color: 'var(--primary)' }}>
                                            <Users size={11} style={{ marginRight: 3 }} />{proyectoActualizado.responsable}
                                        </span>
                                        <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.2rem 0.625rem', borderRadius: '6px', background: 'var(--background)', color: 'var(--text-muted)' }}>
                                            Fin: {proyectoActualizado.fechaFin}
                                        </span>
                                    </div>
                                </div>
                                <button className="btn btn-primary" style={{ flexShrink: 0 }} onClick={() => setShowNuevaTarea(true)}>
                                    <Plus size={16} /> Nueva Tarea
                                </button>
                            </div>

                            {/* Progress Bar */}
                            <div style={{ marginBottom: '2rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>Progreso General</span>
                                    <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--primary)' }}>{proyectoActualizado.progreso}%</span>
                                </div>
                                <div style={{ height: 10, background: 'var(--border)', borderRadius: '999px', overflow: 'hidden' }}>
                                    <div style={{ height: '100%', width: `${proyectoActualizado.progreso}%`, background: 'linear-gradient(90deg,#2563eb,#7c3aed)', borderRadius: '999px', transition: 'width 0.5s ease', boxShadow: '0 0 8px rgba(37,99,235,0.4)' }} />
                                </div>
                            </div>

                            {/* Tasks */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                                {proyectoActualizado.tareas.map(tarea => {
                                    const st = ESTADO_STYLES[tarea.estado] || ESTADO_STYLES.pendiente;
                                    const Icon = st.Icon;
                                    return (
                                        <div key={tarea.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.875rem 1rem', borderRadius: '10px', border: '1px solid var(--border)', background: tarea.estado === 'completado' ? 'var(--background)' : 'var(--bg-card)' }}>
                                            <Icon size={20} color={st.color} />
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontWeight: 600, fontSize: '0.9rem', textDecoration: tarea.estado === 'completado' ? 'line-through' : 'none', color: tarea.estado === 'completado' ? 'var(--text-muted)' : 'var(--text-main)' }}>{tarea.titulo}</div>
                                                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>Responsable: {tarea.responsable}</div>
                                            </div>
                                            <select value={tarea.estado} onChange={e => cambiarEstadoTarea(proyectoActualizado.id, tarea.id, e.target.value)} style={{ padding: '0.3rem 0.625rem', borderRadius: '6px', border: '1px solid var(--border)', background: st.bg, color: st.color, fontSize: '0.78rem', fontWeight: 700, fontFamily: 'inherit', outline: 'none', cursor: 'pointer' }}>
                                                {Object.entries(ESTADO_STYLES).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
                                            </select>
                                        </div>
                                    );
                                })}
                                {proyectoActualizado.tareas.length === 0 && (
                                    <div style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                                        No hay tareas. Añade la primera con "Nueva Tarea".
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                /* Project Grid */
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px,1fr))', gap: '1.5rem' }}>
                    {proyectos.map(p => {
                        const estadoSt = ESTADO_STYLES[p.estado] || ESTADO_STYLES.pendiente;
                        const priorSt = PRIORIDAD_STYLES[p.prioridad] || PRIORIDAD_STYLES.media;
                        const EIcon = estadoSt.Icon;
                        return (
                            <div 
                                key={p.id} 
                                className="card" 
                                style={{ 
                                    cursor: 'pointer', 
                                    padding: '1.75rem', 
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    border: '1px solid var(--border)',
                                    position: 'relative',
                                    overflow: 'hidden'
                                }} 
                                onClick={() => setProyectoActivo(p)}
                                onMouseEnter={e => {
                                    e.currentTarget.style.transform = 'translateY(-6px)';
                                    e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(59, 130, 246, 0.15), 0 8px 10px -6px rgba(59, 130, 246, 0.1)';
                                    e.currentTarget.style.borderColor = 'var(--primary)';
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = 'none';
                                    e.currentTarget.style.borderColor = 'var(--border)';
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', maxWidth: 'calc(100% - 80px)' }}>
                                        <div style={{ padding: '0.5rem', borderRadius: '10px', background: estadoSt.bg }}>
                                            <EIcon size={20} color={estadoSt.color} style={{ flexShrink: 0 }} />
                                        </div>
                                        <h3 style={{ fontWeight: 800, fontSize: '1.1rem', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text-main)' }}>{p.nombre}</h3>
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                                        <span style={{ padding: '0.25rem 0.625rem', borderRadius: '8px', fontSize: '0.7rem', fontWeight: 800, background: priorSt.bg, color: priorSt.color, textTransform: 'uppercase' }}>{priorSt.label}</span>
                                    </div>
                                </div>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.5rem', lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{p.descripcion}</p>
                                <div style={{ marginBottom: '1.25rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Estado de Avance</span>
                                        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary)' }}>{p.progreso}%</span>
                                    </div>
                                    <div style={{ height: 8, background: 'var(--border)', borderRadius: '999px', overflow: 'hidden' }}>
                                        <div style={{ height: '100%', width: `${p.progreso}%`, background: 'linear-gradient(90deg, #3b82f6, #6366f1)', borderRadius: '999px', transition: 'width 0.6s cubic-bezier(0.16, 1, 0.3, 1)' }} />
                                    </div>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: '1rem', marginTop: '0.5rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', background: 'var(--background)', padding: '0.2rem 0.5rem', borderRadius: '6px' }}>
                                            <Users size={14} /> {p.responsable || 'Sin asignar'}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', background: 'var(--background)', padding: '0.2rem 0.5rem', borderRadius: '6px' }}>
                                            <BarChart3 size={14} /> {p.tareas.filter(t=>t.estado==='completado').length}/{p.tareas.length}
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <button onClick={e => { e.stopPropagation(); setConfirmDel({ open: true, id: p.id, nombre: p.nombre }); }} style={{ padding: '0.4rem', borderRadius: '8px', border: 'none', background: 'rgba(239, 68, 68, 0.1)', cursor: 'pointer', color: 'var(--danger)', transition: 'background 0.2s' }}>
                                            <Trash2 size={16} />
                                        </button>
                                        <ChevronRight size={18} color="var(--text-muted)" />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Modal Nuevo Proyecto Elite */}
            {showNuevoProyecto && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
                    <div style={{ width: '100%', maxWidth: '600px', background: 'var(--card-bg)', borderRadius: '28px', border: '1px solid var(--border)', boxShadow: '0 32px 64px -12px rgba(0,0,0,0.4)', overflow: 'hidden', animation: 'scaleUp 0.3s ease-out' }}>
                        {/* Modal Header */}
                        <div style={{ padding: '2rem 2.5rem', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                                <div style={{ width: 48, height: 48, borderRadius: '14px', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
                                    <Briefcase size={24} color="white" />
                                </div>
                                <div>
                                    <h2 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 800, color: 'white' }}>Nuevo Proyecto Elite</h2>
                                    <p style={{ margin: 0, fontSize: '0.825rem', color: 'rgba(255,255,255,0.9)' }}>Define la arquitectura y el alcance del proyecto</p>
                                </div>
                            </div>
                            <button onClick={() => setShowNuevoProyecto(false)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white' }}>
                                <AlertTriangle size={20} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <form onSubmit={handleNuevoProyecto} style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div className="input-group" style={{ margin: 0 }}>
                                <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Briefcase size={14} color="var(--primary)" /> Nombre del Proyecto *
                                </label>
                                <input required className="input-field" placeholder="Ej: Expansión de Red de Sucursales" value={nuevoProyecto.nombre} onChange={e => setNuevoProyecto({...nuevoProyecto, nombre: e.target.value})} style={{ fontSize: '1rem', padding: '1rem' }} />
                            </div>

                            <div className="input-group" style={{ margin: 0 }}>
                                <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Edit3 size={14} color="var(--primary)" /> Descripción del Alcance
                                </label>
                                <textarea className="input-field" rows={3} placeholder="Describe detalladamente los objetivos y entregables esperados..." value={nuevoProyecto.descripcion} onChange={e => setNuevoProyecto({...nuevoProyecto, descripcion: e.target.value})} style={{ resize: 'vertical', padding: '1rem', lineHeight: 1.6 }} />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                <div className="input-group" style={{ margin: 0 }}>
                                    <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <Users size={14} color="var(--primary)" /> Líder de Proyecto
                                    </label>
                                    <input className="input-field" placeholder="Nombre completo" value={nuevoProyecto.responsable} onChange={e => setNuevoProyecto({...nuevoProyecto, responsable: e.target.value})} style={{ padding: '0.875rem' }} />
                                </div>
                                <div className="input-group" style={{ margin: 0 }}>
                                    <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <Calendar size={14} color="var(--primary)" /> Fecha de Cierre
                                    </label>
                                    <input type="date" className="input-field" value={nuevoProyecto.fechaFin} onChange={e => setNuevoProyecto({...nuevoProyecto, fechaFin: e.target.value})} style={{ padding: '0.875rem' }} />
                                </div>
                            </div>

                            {/* Priority Selection Pills */}
                            <div className="input-group" style={{ margin: 0 }}>
                                <label className="input-label">Nivel de Prioridad Estratégica</label>
                                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                                    {Object.entries(PRIORIDAD_STYLES).map(([key, style]) => (
                                        <button
                                            key={key}
                                            type="button"
                                            onClick={() => setNuevoProyecto({...nuevoProyecto, prioridad: key})}
                                            style={{ 
                                                flex: 1, 
                                                padding: '0.75rem', 
                                                borderRadius: '12px', 
                                                border: `2px solid ${nuevoProyecto.prioridad === key ? style.color : 'var(--border)'}`, 
                                                background: nuevoProyecto.prioridad === key ? style.bg : 'transparent', 
                                                color: nuevoProyecto.prioridad === key ? style.color : 'var(--text-muted)', 
                                                fontWeight: 800, 
                                                fontSize: '0.85rem', 
                                                cursor: 'pointer', 
                                                transition: 'all 0.2s',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '0.5rem'
                                            }}
                                        >
                                            <span style={{ width: 8, height: 8, borderRadius: '50%', background: style.color }} />
                                            {style.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '1.25rem', marginTop: '1rem' }}>
                                <button type="button" className="btn btn-secondary" style={{ flex: 1, padding: '1rem', borderRadius: '14px', border: '1px solid var(--border)' }} onClick={() => setShowNuevoProyecto(false)}>Cancelar</button>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1, padding: '1rem', borderRadius: '14px', background: 'linear-gradient(135deg, #10b981, #059669)', border: 'none', fontWeight: 800, boxShadow: '0 10px 20px -5px rgba(16,185,129,0.4)' }}>
                                    🚀 Lanzar Proyecto
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Nueva Tarea */}
            {showNuevaTarea && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
                    <div className="card glass" style={{ width: '100%', maxWidth: '420px' }}>
                        <h2 style={{ marginBottom: '1.5rem' }}><Plus size={20} color="var(--primary)" style={{ verticalAlign: 'middle', marginRight: 8 }} />Nueva Tarea</h2>
                        <form onSubmit={handleNuevaTarea}>
                            <div className="input-group"><label className="input-label">Título de la tarea</label><input required className="input-field" value={nuevaTarea.titulo} onChange={e => setNuevaTarea({...nuevaTarea, titulo: e.target.value})} /></div>
                            <div className="input-group"><label className="input-label">Responsable</label><input className="input-field" value={nuevaTarea.responsable} onChange={e => setNuevaTarea({...nuevaTarea, responsable: e.target.value})} /></div>
                            <div className="input-group"><label className="input-label">Estado Inicial</label>
                                <select className="input-field" value={nuevaTarea.estado} onChange={e => setNuevaTarea({...nuevaTarea, estado: e.target.value})}>
                                    {Object.entries(ESTADO_STYLES).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
                                </select>
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowNuevaTarea(false)}>Cancelar</button>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Añadir Tarea</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <ConfirmModal
                isOpen={confirmDel.open}
                onClose={() => setConfirmDel({ ...confirmDel, open: false })}
                onConfirm={() => setProyectos(prev => prev.filter(p => p.id !== confirmDel.id))}
                title="Eliminar Proyecto"
                message={`¿Eliminar "${confirmDel.nombre}" y todas sus tareas? Esta acción es permanente.`}
            />
        </div>
    );
};

export default ProyectosTareas;
