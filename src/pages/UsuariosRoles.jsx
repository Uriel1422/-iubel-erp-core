import React, { useState } from 'react';
import {
    Users, Plus, Trash2, Edit3, Shield, Eye, EyeOff,
    CheckCircle, XCircle, Crown, UserCog, ClipboardList,
    Banknote, BarChart2, ShoppingCart, Package, BookOpen,
    Lock, X, Search
} from 'lucide-react';
import ConfirmModal from '../components/ConfirmModal';

// ──────────────────────────────────────────────────────────────────
// Role definitions
// ──────────────────────────────────────────────────────────────────
const ROLES = [
    {
        id: 'admin',
        label: 'Administrador',
        color: '#6366f1',
        bg: 'rgba(99,102,241,0.12)',
        icon: Crown,
        permisos: {
            dashboard: true, contactos: true, facturacion: true, compras: true,
            inventario: true, contabilidad: true, reportes: true, nomina: true,
            banking: true, fiscal: true, auditoria: true, activos: true,
            usuarios: true, caja: true, prestamos: true, ahorros: true,
        },
        descripcion: 'Acceso total al sistema. Puede crear usuarios y configurar permisos.'
    },
    {
        id: 'contador',
        label: 'Contador',
        color: '#2563eb',
        bg: 'rgba(37,99,235,0.12)',
        icon: ClipboardList,
        permisos: {
            dashboard: true, contactos: true, facturacion: true, compras: true,
            inventario: true, contabilidad: true, reportes: true, nomina: true,
            banking: true, fiscal: true, auditoria: false, activos: true,
            usuarios: false, caja: true, prestamos: false, ahorros: false,
        },
        descripcion: 'Acceso a toda la contabilidad, facturación y reportes financieros.'
    },
    {
        id: 'cajero',
        label: 'Cajero',
        color: '#059669',
        bg: 'rgba(5,150,105,0.12)',
        icon: Banknote,
        permisos: {
            dashboard: true, contactos: true, facturacion: true, compras: false,
            inventario: true, contabilidad: false, reportes: false, nomina: false,
            banking: false, fiscal: false, auditoria: false, activos: false,
            usuarios: false, caja: true, prestamos: false, ahorros: false,
        },
        descripcion: 'Solo puede operar la caja, facturar y consultar inventario.'
    },
    {
        id: 'auditor',
        label: 'Auditor',
        color: '#d97706',
        bg: 'rgba(217,119,6,0.12)',
        icon: Shield,
        permisos: {
            dashboard: true, contactos: true, facturacion: true, compras: true,
            inventario: true, contabilidad: true, reportes: true, nomina: false,
            banking: true, fiscal: true, auditoria: true, activos: true,
            usuarios: false, caja: false, prestamos: false, ahorros: false,
        },
        descripcion: 'Solo lectura. Puede revisar reportes, diarios y auditoria sin modificar nada.'
    },
    {
        id: 'auxiliar',
        label: 'Auxiliar',
        color: '#7c3aed',
        bg: 'rgba(124,58,237,0.12)',
        icon: UserCog,
        permisos: {
            dashboard: true, contactos: true, facturacion: false, compras: true,
            inventario: true, contabilidad: false, reportes: false, nomina: false,
            banking: false, fiscal: false, auditoria: false, activos: false,
            usuarios: false, caja: false, prestamos: false, ahorros: false,
        },
        descripcion: 'Apoyo operativo: compras, inventario y contactos.'
    },
];

const MODULOS = [
    { id: 'dashboard', label: 'Panel / Dashboard', icon: BarChart2 },
    { id: 'contactos', label: 'Clientes y Proveedores', icon: Users },
    { id: 'facturacion', label: 'Facturación y Ventas', icon: ClipboardList },
    { id: 'compras', label: 'Compras y Gastos', icon: ShoppingCart },
    { id: 'inventario', label: 'Inventario', icon: Package },
    { id: 'contabilidad', label: 'Contabilidad General', icon: BookOpen },
    { id: 'reportes', label: 'Reportes Financieros', icon: BarChart2 },
    { id: 'nomina', label: 'Nómina y RRHH', icon: UserCog },
    { id: 'banking', label: 'Banking / Tesorería', icon: Banknote },
    { id: 'fiscal', label: 'Fiscal / NCF / DGII', icon: Shield },
    { id: 'auditoria', label: 'Auditoría y Control', icon: Lock },
    { id: 'activos', label: 'Activos Fijos', icon: Package },
    { id: 'caja', label: 'Caja y Bóveda', icon: Banknote },
    { id: 'usuarios', label: 'Gestión de Usuarios', icon: Users },
];

// ──────────────────────────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────────────────────────
const UsuariosRoles = () => {
    const [usuarios, setUsuarios] = useState([
        { id: '1', nombre: 'Abel FJ', email: 'abel@empresa.com', role: 'admin', activo: true, creado: new Date().toISOString() }
    ]);
    const [busqueda, setBusqueda] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [showRoleDetail, setShowRoleDetail] = useState(null);
    const [confirmDelete, setConfirmDelete] = useState({ open: false, id: null });
    const [editingId, setEditingId] = useState(null);
    const [showPass, setShowPass] = useState(false);

    const [form, setForm] = useState({
        nombre: '', email: '', password: '', role: 'cajero', activo: true
    });

    const resetForm = () => setForm({ nombre: '', email: '', password: '', role: 'cajero', activo: true });

    const handleOpenModal = (u = null) => {
        if (u) {
            setEditingId(u.id);
            setForm({ nombre: u.nombre, email: u.email, password: '', role: u.role, activo: u.activo });
        } else {
            setEditingId(null);
            resetForm();
        }
        setShowModal(true);
    };

    const handleSave = (e) => {
        e.preventDefault();
        if (editingId) {
            setUsuarios(prev => prev.map(u => u.id === editingId
                ? { ...u, nombre: form.nombre, email: form.email, role: form.role, activo: form.activo }
                : u
            ));
        } else {
            setUsuarios(prev => [...prev, {
                id: Date.now().toString(),
                nombre: form.nombre,
                email: form.email,
                role: form.role,
                activo: form.activo,
                creado: new Date().toISOString()
            }]);
        }
        setShowModal(false);
        resetForm();
        setEditingId(null);
    };

    const handleDelete = () => {
        setUsuarios(prev => prev.filter(u => u.id !== confirmDelete.id));
        setConfirmDelete({ open: false, id: null });
    };

    const toggleActivo = (id) => {
        setUsuarios(prev => prev.map(u => u.id === id ? { ...u, activo: !u.activo } : u));
    };

    const getRoleObj = (roleId) => ROLES.find(r => r.id === roleId) || ROLES[0];

    const filtered = usuarios.filter(u =>
        u.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        u.email.toLowerCase().includes(busqueda.toLowerCase())
    );

    // ── Styles ─────────────────────────────────────────────────────
    const glassCard = {
        background: 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid rgba(255,255,255,0.6)',
        borderRadius: '20px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
    };

    return (
        <div className="animate-up" style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

            {/* ── Header ─────────────────────────────────────────── */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1 className="page-title" style={{ marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <Shield size={28} color="var(--primary)" /> Usuarios y Accesos
                    </h1>
                    <p style={{ color: 'var(--text-muted)' }}>Gestión de roles, permisos y seguridad del equipo de trabajo</p>
                </div>
                <button className="btn btn-primary" style={{ gap: '0.5rem', padding: '0.75rem 1.5rem' }} onClick={() => handleOpenModal()}>
                    <Plus size={18} /> Invitar Usuario
                </button>
            </div>

            {/* ── Role Cards ─────────────────────────────────────── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: '1rem' }}>
                {ROLES.map(role => {
                    const Icon = role.icon;
                    const count = usuarios.filter(u => u.role === role.id).length;
                    return (
                        <div
                            key={role.id}
                            style={{ ...glassCard, padding: '1.25rem', cursor: 'pointer', transition: 'all 0.2s' }}
                            onClick={() => setShowRoleDetail(showRoleDetail === role.id ? null : role.id)}
                            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px)'}
                            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                                <div style={{ width: 40, height: 40, borderRadius: '12px', background: role.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Icon size={20} color={role.color} />
                                </div>
                                <span style={{ fontSize: '1.75rem', fontWeight: 900, color: role.color }}>{count}</span>
                            </div>
                            <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)' }}>{role.label}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{count === 1 ? '1 usuario' : `${count} usuarios`}</div>
                        </div>
                    );
                })}
            </div>

            {/* ── Role Detail Expanded ──────────────────────────── */}
            {showRoleDetail && (() => {
                const role = getRoleObj(showRoleDetail);
                const Icon = role.icon;
                return (
                    <div style={{ ...glassCard, padding: '1.5rem', border: `2px solid ${role.color}30` }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
                            <div style={{ width: 48, height: 48, borderRadius: '14px', background: role.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Icon size={24} color={role.color} />
                            </div>
                            <div>
                                <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-main)' }}>{role.label}</div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{role.descripcion}</div>
                            </div>
                            <button onClick={() => setShowRoleDetail(null)} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={20} /></button>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.5rem' }}>
                            {MODULOS.map(mod => {
                                const hasP = role.permisos[mod.id];
                                const ModIcon = mod.icon;
                                return (
                                    <div key={mod.id} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.6rem 1rem', borderRadius: '10px', background: hasP ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.05)', border: `1px solid ${hasP ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.1)'}` }}>
                                        <ModIcon size={14} color={hasP ? '#16a34a' : '#ef4444'} />
                                        <span style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-main)', flex: 1 }}>{mod.label}</span>
                                        {hasP ? <CheckCircle size={14} color="#16a34a" /> : <XCircle size={14} color="#ef4444" />}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                );
            })()}

            {/* ── User Table ─────────────────────────────────────── */}
            <div style={{ ...glassCard, flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                {/* Table Header */}
                <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                    <div style={{ fontWeight: 700, fontSize: '1rem' }}>Equipo de la Empresa <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>({usuarios.length} usuarios)</span></div>
                    <div style={{ position: 'relative', minWidth: '240px' }}>
                        <Search size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input
                            className="input-field"
                            placeholder="Buscar usuario..."
                            style={{ paddingLeft: '2.25rem', height: '36px', fontSize: '0.85rem' }}
                            value={busqueda}
                            onChange={e => setBusqueda(e.target.value)}
                        />
                    </div>
                </div>

                {/* Table Body */}
                <div style={{ overflowY: 'auto', flex: 1 }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ background: 'rgba(248,250,252,0.8)', position: 'sticky', top: 0 }}>
                            <tr>
                                {['Usuario', 'Correo', 'Rol', 'Estado', 'Creado', 'Acciones'].map(h => (
                                    <th key={h} style={{ padding: '0.75rem 1.25rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(u => {
                                const role = getRoleObj(u.role);
                                const Icon = role.icon;
                                return (
                                    <tr key={u.id} style={{ borderBottom: '1px solid rgba(0,0,0,0.05)', transition: 'background 0.15s' }}
                                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(37,99,235,0.03)'}
                                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                        {/* Name */}
                                        <td style={{ padding: '1rem 1.25rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <div style={{ width: 38, height: 38, borderRadius: '10px', background: `linear-gradient(135deg, ${role.color}, ${role.color}99)`, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.85rem', flexShrink: 0 }}>
                                                    {u.nombre.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-main)' }}>{u.nombre}</div>
                                                </div>
                                            </div>
                                        </td>
                                        {/* Email */}
                                        <td style={{ padding: '1rem 1.25rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>{u.email}</td>
                                        {/* Role */}
                                        <td style={{ padding: '1rem 1.25rem' }}>
                                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.25rem 0.75rem', borderRadius: '20px', background: role.bg, color: role.color, fontSize: '0.78rem', fontWeight: 700 }}>
                                                <Icon size={12} /> {role.label}
                                            </span>
                                        </td>
                                        {/* Estado */}
                                        <td style={{ padding: '1rem 1.25rem' }}>
                                            <span
                                                onClick={() => toggleActivo(u.id)}
                                                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.25rem 0.75rem', borderRadius: '20px', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 700, background: u.activo ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', color: u.activo ? '#16a34a' : '#ef4444' }}>
                                                {u.activo ? <><CheckCircle size={12} /> Activo</> : <><XCircle size={12} /> Inactivo</>}
                                            </span>
                                        </td>
                                        {/* Fecha */}
                                        <td style={{ padding: '1rem 1.25rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                            {new Date(u.creado).toLocaleDateString('es-DO')}
                                        </td>
                                        {/* Actions */}
                                        <td style={{ padding: '1rem 1.25rem' }}>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <button onClick={() => handleOpenModal(u)} title="Editar" style={{ background: 'var(--primary-light)', border: 'none', borderRadius: '8px', padding: '0.5rem', cursor: 'pointer', color: 'var(--primary)', display: 'flex' }}>
                                                    <Edit3 size={15} />
                                                </button>
                                                <button onClick={() => setConfirmDelete({ open: true, id: u.id })} title="Eliminar" style={{ background: 'rgba(239,68,68,0.1)', border: 'none', borderRadius: '8px', padding: '0.5rem', cursor: 'pointer', color: '#ef4444', display: 'flex' }}>
                                                    <Trash2 size={15} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                            {filtered.length === 0 && (
                                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>No se encontraron usuarios</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ── Create / Edit Modal ─────────────────────────────── */}
            {showModal && (
                <div className="modal-overlay">
                    <div style={{ ...glassCard, width: '100%', maxWidth: '580px', padding: 0, zIndex: 2001, maxHeight: '90vh', overflowY: 'auto' }}>
                        {/* Modal Header */}
                        <div style={{ padding: '2rem 2rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
                                    {editingId ? 'Editar Usuario' : 'Invitar al Equipo'}
                                </h2>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                                    {editingId ? 'Modifica los datos o el rol asignado.' : 'Agrega un nuevo colaborador y asígnale un perfil de seguridad.'}
                                </p>
                            </div>
                            <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={22} /></button>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSave} style={{ padding: '1.5rem 2rem 2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <div className="input-group" style={{ marginBottom: 0 }}>
                                <label className="input-label">Nombre Completo</label>
                                <input className="input-field" placeholder="Ej: Ana García" required value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} />
                            </div>
                            <div className="input-group" style={{ marginBottom: 0 }}>
                                <label className="input-label">Correo Electrónico</label>
                                <input className="input-field" type="email" placeholder="usuario@empresa.com" required={!editingId} value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                            </div>
                            {!editingId && (
                                <div className="input-group" style={{ marginBottom: 0 }}>
                                    <label className="input-label">Contraseña Temporal</label>
                                    <div style={{ position: 'relative' }}>
                                        <input className="input-field" type={showPass ? 'text' : 'password'} placeholder="Mínimo 8 caracteres" required value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} style={{ paddingRight: '3rem' }} />
                                        <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                                            {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Role Selector */}
                            <div>
                                <label className="input-label">Perfil de Seguridad (Rol)</label>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '0.75rem', marginTop: '0.5rem' }}>
                                    {ROLES.map(r => {
                                        const Ic = r.icon;
                                        const sel = form.role === r.id;
                                        return (
                                            <div key={r.id} onClick={() => setForm({ ...form, role: r.id })}
                                                style={{ padding: '0.875rem', borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s', border: sel ? `2px solid ${r.color}` : '2px solid var(--border)', background: sel ? r.bg : 'transparent', textAlign: 'center' }}>
                                                <Ic size={20} color={sel ? r.color : 'var(--text-muted)'} style={{ margin: '0 auto 0.4rem' }} />
                                                <div style={{ fontSize: '0.78rem', fontWeight: sel ? 700 : 500, color: sel ? r.color : 'var(--text-muted)' }}>{r.label}</div>
                                            </div>
                                        );
                                    })}
                                </div>
                                {form.role && (
                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.75rem', padding: '0.75rem', background: 'var(--background)', borderRadius: '8px' }}>
                                        💡 {getRoleObj(form.role).descripcion}
                                    </p>
                                )}
                            </div>

                            {/* Estado */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <input type="checkbox" id="activo_check" checked={form.activo} onChange={e => setForm({ ...form, activo: e.target.checked })} style={{ width: 18, height: 18, cursor: 'pointer' }} />
                                <label htmlFor="activo_check" style={{ cursor: 'pointer', fontWeight: 500 }}>Usuario activo (puede iniciar sesión)</label>
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Cancelar</button>
                                <button type="submit" className="btn btn-primary" style={{ flex: 2 }}>
                                    {editingId ? 'Guardar Cambios' : 'Invitar al Equipo'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <ConfirmModal
                isOpen={confirmDelete.open}
                onClose={() => setConfirmDelete({ open: false, id: null })}
                onConfirm={handleDelete}
                title="Eliminar Usuario"
                message="¿Estás seguro de que deseas revocar el acceso a este usuario? Esta acción no puede deshacerse."
            />
        </div>
    );
};

export default UsuariosRoles;
