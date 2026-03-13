import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSuperAdmin } from '../context/SuperAdminContext';
import {
    Activity, LogOut,
    Building2, CheckCircle2, XCircle, ShieldCheck,
    Search, TrendingUp, RefreshCw, Download, Filter,
    Users, DollarSign, Terminal, Globe, Server, AlertTriangle,
    Lock, MessageSquare, Zap, HardDrive, ShieldAlert,
    BookOpen, Package, FileText, ShoppingCart, 
    Calculator, PieChart, Landmark, ClipboardList,
    Briefcase, Calendar, Clock, Target, FilePlus,
    GitMerge, FileX, UserSquare, Banknote, BarChart2, CreditCard, Scale, Wallet,
    Brain, FolderOpen, Layers, UserCheck, Network, Repeat,
    Sparkles, Star, Cpu
} from 'lucide-react';
import { 
    ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
    BarChart, Bar, Cell, PieChart as RePie, Pie
} from 'recharts';
import AdminTerminal from '../components/AdminTerminal';
import { exportToExcel } from '../utils/exportUtils';

const SuperAdminDashboard = () => {
    const { 
        user, token, logout, 
        globalKillSwitch, setGlobalKillSwitch, 
        broadcastMessage, setBroadcastMessage 
    } = useSuperAdmin();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('tenants');
    const [empresas, setEmpresas] = useState([]);
    const [auditLogs, setAuditLogs] = useState([]);
    const [loadingTenants, setLoadingTenants] = useState(true);
    const [loadingAudit, setLoadingAudit] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [auditFilter, setAuditFilter] = useState('');
    const [selectingFeatures, setSelectingFeatures] = useState(null);
    const [deletingEmpresa, setDeletingEmpresa] = useState(null);
    const [confirmDeleteName, setConfirmDeleteName] = useState('');
    // const [globalKillSwitch, setGlobalKillSwitch] = useState(false); // Eliminado para usar context
    // const [broadcastMessage, setBroadcastMessage] = useState(''); // Eliminado para usar context
    const [localBroadcast, setLocalBroadcast] = useState('');
    const [sentinelAlarms, setSentinelAlarms] = useState([
        { id: 1, type: 'Brute Force', ip: '192.168.1.45', location: 'Kiev, UA', severity: 'high', time: 'Hace 2m' },
        { id: 2, type: 'Anomalous Entry', ip: '10.0.0.12', location: 'Santo Domingo, DO', severity: 'medium', time: 'Hace 15m' }
    ]);

    const FEATURE_CATEGORIES = [
        {
            name: 'Core Operations',
            color: '#3b82f6',
            features: [
                { id: 'core_facturacion', label: 'Facturación / Cotizaciones', icon: <FileText size={16} /> },
                { id: 'core_caja', label: 'Caja y Bóveda', icon: <Banknote size={16} /> },
                { id: 'core_banca', label: 'Bancos y Conciliación', icon: <Landmark size={16} /> },
                { id: 'core_prestamos', label: 'Módulo de Préstamos', icon: <CreditCard size={16} /> },
                { id: 'core_socios', label: 'Gestión de Socios', icon: <UserSquare size={16} /> },
                { id: 'core_contactos', label: 'Clientes / Proveedores', icon: <Users size={16} /> },
                { id: 'core_contabilidad', label: 'Contabilidad & Diario', icon: <Calculator size={16} /> },
                { id: 'core_inventario', label: 'Inventario & Stock', icon: <Package size={16} /> },
                { id: 'core_compras', label: 'Gestión de Compras', icon: <ShoppingCart size={16} /> },
                { id: 'core_fiscal', label: 'Impuestos (DGII)', icon: <ShieldCheck size={16} /> },
            ]
        },
        {
            name: 'Enterprise Power',
            color: '#8b5cf6',
            features: [
                { id: 'enterprise_reportes', label: 'Analytics & BI', icon: <PieChart size={16} /> },
                { id: 'enterprise_rrhh', label: 'Nómina & Talento', icon: <Briefcase size={16} /> },
                { id: 'enterprise_auditoria', label: 'Auditoría & Seguridad', icon: <ShieldAlert size={16} /> },
                { id: 'enterprise_activos', label: 'Activos Fijos', icon: <HardDrive size={16} /> },
            ]
        },
        {
            name: 'FinTech Elite (VIP)',
            color: '#0ea5e9',
            features: [
                { id: 'fintech_cards', label: 'Card Issuing (Mastercard)', icon: <CreditCard size={16} /> },
                { id: 'fintech_exchange', label: 'Exchange & Tokens', icon: <Repeat size={16} /> },
                { id: 'fintech_wealth', label: 'Wealth Management', icon: <TrendingUp size={16} /> },
                { id: 'fintech_datanode', label: 'Data Node Oracle', icon: <Network size={16} /> },
                { id: 'fintech_credit', label: 'Credit Intelligence', icon: <Brain size={16} /> },
                { id: 'fintech_sovereign', label: 'Sovereign Vault', icon: <Lock size={16} /> },
            ]
        },
        {
            name: 'AI Intelligence',
            color: '#ec4899',
            features: [
                { id: 'ai_copilot', label: 'Iubel Copilot AI', icon: <Sparkles size={16} /> },
            ]
        }
    ];

    const ALL_FEATURES = FEATURE_CATEGORIES.flatMap(c => c.features);


    const fetchEmpresas = useCallback(async () => {
        try {
            const res = await fetch('/api/superadmin/empresas', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) setEmpresas(await res.json());
        } catch (err) { console.error(err); }
        finally { setLoadingTenants(false); }
    }, [token]);

    const fetchAuditLogs = useCallback(async () => {
        setLoadingAudit(true);
        try {
            const res = await fetch('/api/auditoria', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setAuditLogs(Array.isArray(data) ? data : []);
            } else {
                setAuditLogs([]);
            }
        } catch { setAuditLogs([]); }
        finally { setLoadingAudit(false); }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token]);

    useEffect(() => {
        if (!token) { navigate('/superadmin/login'); return; }
        fetchEmpresas();
    }, [token, navigate, fetchEmpresas]);

    useEffect(() => {
        if (activeTab === 'auditoria') fetchAuditLogs();
    }, [activeTab, fetchAuditLogs]);

    const handleUpdateEmpresa = async (id, plan, activa, features) => {
        try {
            const res = await fetch(`/api/superadmin/empresas/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ plan, activa, features })
            });
            if (res.ok) setEmpresas(prev => prev.map(e => e.id === id ? { ...e, plan, activa, features } : e));
            else alert('Error al actualizar la empresa');
        } catch { alert('Error de red al actualizar'); }
    };

    const handleDeleteEmpresa = async (id) => {
        try {
            const res = await fetch(`/api/superadmin/empresas/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                setEmpresas(prev => prev.filter(e => e.id !== id));
                setDeletingEmpresa(null);
                setConfirmDeleteName('');
            } else {
                const data = await res.json();
                alert(data.error || 'Error al eliminar empresa');
            }
        } catch { alert('Error de red al eliminar'); }
    };

    const toggleFeature = (empresaId, featureId) => {
        const empresa = empresas.find(e => e.id === empresaId);
        const newFeatures = { ...(empresa.features || {}), [featureId]: !(empresa.features?.[featureId]) };
        handleUpdateEmpresa(empresa.id, empresa.plan, empresa.activa, newFeatures);
        setSelectingFeatures(prev => prev ? { ...prev, features: newFeatures } : prev);
    };

    const exportAuditCSV = () => {
        const data = filteredLogs.map(l => ({
            'Fecha / Hora': new Date(l.created_at).toLocaleString('es-DO'),
            'Acción': l.accion,
            'Módulo / Entidad': l.entidad || '—',
            'ID Registro': l.registro_id || '—',
            'Usuario': l.usuario_id || 'Sistema',
            'IP': l.ip || '—'
        }));
        exportToExcel(data, 'Auditoria_Global', 'Auditoria');
    };

    const filtradas = empresas.filter(e =>
        e.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || (e.rnc || '').includes(searchTerm));
    const activasCount = empresas.filter(e => e.activa).length;
    const mrr = empresas.reduce((acc, e) => acc + (e.plan === 'avanzado' ? 15000 : e.plan === 'intermedio' ? 8500 : 3500), 0);

    const filteredLogs = auditLogs.filter(l =>
        auditFilter === '' ||
        (l.accion || '').toUpperCase().includes(auditFilter.toUpperCase()) ||
        (l.entidad || '').toLowerCase().includes(auditFilter.toLowerCase()) ||
        (l.usuario_id || '').toLowerCase().includes(auditFilter.toLowerCase())
    );

    const accionStyle = (accion) => {
        const a = (accion || '').toUpperCase();
        if (a.includes('DELETE') || a.includes('ELIMINAR')) return { background: '#fee2e2', color: '#991b1b' };
        if (a.includes('UPDATE') || a.includes('ACTUALIZAR')) return { background: '#fef3c7', color: '#92400e' };
        if (a.includes('LOGIN') || a.includes('AUTH')) return { background: '#eff6ff', color: '#1d4ed8' };
        if (a.includes('EXPORT')) return { background: '#ecfdf5', color: '#065f46' };
        return { background: '#e0e7ff', color: '#3730a3' };
    };

    if (loadingTenants) return (
        <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', background: '#0f172a', color: 'white', gap: '1rem', fontSize: '1.1rem' }}>
            <div style={{ width: 24, height: 24, border: '3px solid #6366f1', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            <span>Cargando portal SaaS...</span>
        </div>
    );

    return (
        <div style={{ display: 'flex', height: '100vh', background: '#f0f4ff', overflow: 'hidden' }}>
            {/* Premium Sidebar */}
            <aside style={{ width: '264px', background: 'linear-gradient(160deg, #0f172a 0%, #1e1b4b 60%, #0f172a 100%)', color: 'white', display: 'flex', flexDirection: 'column', borderRight: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
                <div style={{ padding: '1.75rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.875rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                    <div style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', padding: '0.625rem', borderRadius: '10px', boxShadow: '0 4px 12px rgba(99,102,241,0.4)', display: 'flex' }}>
                        <ShieldCheck size={22} />
                    </div>
                    <div>
                        <h2 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, background: 'linear-gradient(135deg, #93c5fd, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>IUBEL ERP</h2>
                        <p style={{ fontSize: '0.62rem', color: '#64748b', margin: 0, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>GESTIÓN DE LA NUBE</p>
                    </div>
                </div>

                <nav style={{ padding: '1.25rem 1rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    {[
                        { tab: 'tenants', icon: <Building2 size={18} />, label: 'Inquilinos (Tenants)' },
                        { tab: 'sentinel', icon: <ShieldAlert size={18} />, label: 'Iubel Sentinel' },
                        { tab: 'terminal', icon: <Terminal size={18} />, label: 'Consola de Comando' },
                        { tab: 'bi', icon: <Globe size={18} />, label: 'BI SaaS Global' },
                        { tab: 'auditoria', icon: <Activity size={18} />, label: 'Auditoría Global' },
                        { tab: 'sovereign', icon: <ShieldCheck size={18} />, label: 'Iubel Sovereign (Elite Security)', action: () => navigate('/superadmin/sovereign') },
                    ].map(({ tab, icon, label, action }) => (
                        <button key={tab} onClick={() => action ? action() : setActiveTab(tab)} style={{
                            display: 'flex', alignItems: 'center', gap: '0.75rem',
                            padding: '0.75rem 1rem', border: 'none', textAlign: 'left',
                            background: activeTab === tab ? 'rgba(99,102,241,0.2)' : 'transparent',
                            color: activeTab === tab ? '#a5b4fc' : '#94a3b8',
                            borderRadius: '8px', cursor: 'pointer', fontWeight: 600, width: '100%',
                            fontSize: '0.875rem', borderLeft: activeTab === tab ? '3px solid #818cf8' : '3px solid transparent',
                            transition: 'all 0.2s', fontFamily: 'inherit'
                        }}>
                            {icon} {label}
                        </button>
                    ))}

                    <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(99,102,241,0.1)', borderRadius: '12px', border: '1px solid rgba(99,102,241,0.2)' }}>
                        <div style={{ fontSize: '0.6rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.3rem' }}>Ingresos Mensuales (MRR)</div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 900, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            {new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP', maximumFractionDigits: 0 }).format(mrr)}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '0.2rem' }}>{empresas.length} inquilinos</div>
                    </div>
                </nav>

                <div style={{ padding: '1.25rem 1rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.875rem' }}>
                        <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.75rem', flexShrink: 0 }}>SA</div>
                        <div style={{ overflow: 'hidden' }}>
                            <p style={{ margin: 0, fontWeight: 700, fontSize: '0.82rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.nombre}</p>
                            <p style={{ margin: 0, color: '#64748b', fontSize: '0.68rem' }}>Super Administrador</p>
                        </div>
                    </div>
                    <button onClick={() => { logout(); navigate('/superadmin/login'); }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', width: '100%', padding: '0.65rem', background: 'rgba(239,68,68,0.12)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.82rem', marginBottom: '0.5rem', fontFamily: 'inherit' }}>
                        <LogOut size={14} /> Cerrar Sesión
                    </button>
                    <button 
                        onClick={() => setActiveTab('nuclear')}
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', width: '100%', padding: '0.65rem', background: activeTab === 'nuclear' ? '#ef4444' : 'rgba(255,255,255,0.05)', color: activeTab === 'nuclear' ? 'white' : '#ef4444', border: '1px solid #ef444455', borderRadius: '8px', cursor: 'pointer', fontWeight: 800, fontSize: '0.8rem', fontFamily: 'inherit' }}
                    >
                        <Zap size={14} /> RESET MAESTRO
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>

                {/* ─── TAB: TENANTS ─── */}
                {activeTab === 'tenants' && (
                    <>
                        <header style={{ marginBottom: '2rem' }}>
                            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.25rem' }}>Panel de Control (SaaS)</h1>
                            <p style={{ color: '#64748b', margin: 0 }}>Monitorea y administra las cooperativas e instituciones registradas.</p>
                        </header>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
                            {[
                                { label: 'Total Tenants', val: empresas.length, Icon: Building2, bg: '#eff6ff', c: '#3b82f6' },
                                { label: 'Activas', val: activasCount, Icon: CheckCircle2, bg: '#f0fdf4', c: '#10b981' },
                                { label: 'Suspendidas', val: empresas.length - activasCount, Icon: XCircle, bg: '#fef2f2', c: '#ef4444' },
                                { label: 'MRR Estimado', val: `RD$${(mrr / 1000).toFixed(0)}K`, Icon: DollarSign, bg: '#f5f3ff', c: '#7c3aed' },
                            ].map(({ label, val, Icon, bg, c }) => (
                                <div key={label} className="card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                                    <div style={{ background: bg, color: c, padding: '0.875rem', borderRadius: '12px' }}><Icon size={22} /></div>
                                    <div className="notranslate">
                                        <p style={{ margin: 0, color: '#64748b', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</p>
                                        <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 900, color: '#0f172a' }}>{val}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h2 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Gestión de Instituciones</h2>
                                <div style={{ position: 'relative' }}>
                                    <Search size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                    <input type="text" placeholder="Buscar..." style={{ padding: '0.55rem 1rem 0.55rem 2.1rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem', width: '240px', outline: 'none' }}
                                        value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                                </div>
                            </div>
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                    <thead style={{ background: '#f8fafc' }}>
                                        <tr>
                                            {['Institución', 'RNC', 'Plan / Módulos', 'Estado', 'Acciones'].map(h => (
                                                <th key={h} style={{ padding: '0.875rem 1.25rem', color: '#64748b', fontWeight: 700, fontSize: '0.72rem', textTransform: 'uppercase', whiteSpace: 'nowrap', borderBottom: '2px solid #e2e8f0' }}>{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filtradas.map(emp => (
                                            <tr key={emp.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                                <td style={{ padding: '1rem 1.25rem' }}>
                                                    <div style={{ fontWeight: 700, color: '#0f172a' }}><span>{emp.nombre}</span></div>
                                                    <div style={{ fontSize: '0.76rem', color: '#64748b' }}><span>{emp.email}</span> · <span>{new Date(emp.created_at).toLocaleDateString()}</span></div>
                                                </td>
                                                <td style={{ padding: '1rem 1.25rem', fontFamily: 'monospace', fontSize: '0.82rem', color: '#475569' }}><span>{emp.rnc}</span></td>
                                                <td style={{ padding: '1rem 1.25rem' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                        <select value={emp.plan} onChange={e => handleUpdateEmpresa(emp.id, e.target.value, emp.activa, emp.features)}
                                                            style={{ padding: '0.35rem 0.625rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.8rem', background: 'white', fontWeight: 600, outline: 'none' }}>
                                                            <option value="basico">Básico</option>
                                                            <option value="intermedio">Intermedio</option>
                                                            <option value="avanzado">Avanzado</option>
                                                        </select>
                                                        <button onClick={() => setSelectingFeatures(emp)} style={{ padding: '0.35rem 0.625rem', borderRadius: '6px', border: '1px solid #6366f1', fontSize: '0.76rem', fontWeight: 700, cursor: 'pointer', background: '#f5f3ff', color: '#6366f1', fontFamily: 'inherit' }}>
                                                            Módulos
                                                        </button>
                                                    </div>
                                                </td>
                                                <td style={{ padding: '1rem 1.25rem' }}>
                                                    <span style={{ padding: '0.2rem 0.7rem', borderRadius: '999px', fontSize: '0.7rem', fontWeight: 700, background: emp.activa ? '#dcfce7' : '#fee2e2', color: emp.activa ? '#166534' : '#991b1b' }}>
                                                        {emp.activa ? '● Activa' : '● Suspendida'}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                                                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                                        <button onClick={() => handleUpdateEmpresa(emp.id, emp.plan, !emp.activa, emp.features)} style={{ padding: '0.35rem 0.75rem', borderRadius: '6px', border: 'none', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', background: emp.activa ? '#fef2f2' : '#eff6ff', color: emp.activa ? '#dc2626' : '#2563eb', fontFamily: 'inherit' }}>
                                                            {emp.activa ? 'Suspender' : 'Activar'}
                                                        </button>
                                                        <button 
                                                            onClick={() => setDeletingEmpresa(emp)}
                                                            style={{ padding: '0.35rem', borderRadius: '6px', border: '1px solid #fee2e2', background: 'white', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                            title="Eliminar permanentemente"
                                                        >
                                                            <XCircle size={14} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        {filtradas.length === 0 && (
                                            <tr><td colSpan={5} style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}><span>No se encontraron instituciones.</span></td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}

                {/* ─── TAB: SENTINEL ─── */}
                {activeTab === 'sentinel' && (
                    <div className="animate-fade-in">
                        <header style={{ marginBottom: '2rem' }}>
                            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <ShieldAlert size={32} color="#6366f1" /> Iubel Sentinel
                            </h1>
                            <p style={{ color: '#64748b' }}>Monitoreo preventivo de seguridad y detección de intrusos a nivel global.</p>
                        </header>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '1.5rem' }}>
                            <div className="card" style={{ padding: '1.5rem' }}>
                                <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Server size={18} /> Perímetro de Seguridad (Detecciones 24h)
                                </h3>
                                <div style={{ height: '300px' }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={[
                                            {t: '00:00', v: 45}, {t: '04:00', v: 30}, {t: '08:00', v: 85}, {t: '12:00', v: 95}, {t: '16:00', v: 70}, {t: '20:00', v: 50}
                                        ]}>
                                            <defs>
                                                <linearGradient id="colorSentinel" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                                                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                                            <XAxis dataKey="t" fontSize={12} stroke="#64748b" />
                                            <YAxis fontSize={12} stroke="#64748b" />
                                            <Tooltip />
                                            <Area type="monotone" dataKey="v" stroke="#6366f1" fill="url(#colorSentinel)" strokeWidth={3} />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            <div className="card" style={{ padding: '1.5rem', background: '#0f172a', color: 'white' }}>
                                <h3 style={{ margin: '0 0 1rem 0', fontSize: '0.9rem', color: '#a5b4fc', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <AlertTriangle size={18} color="#f59e0b" /> Alarmas Críticas
                                </h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    {sentinelAlarms.map(alarm => (
                                        <div key={alarm.id} style={{ padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: `1px solid ${alarm.severity === 'high' ? '#ef4444' : '#f59e0b'}55` }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                                                <span style={{ fontSize: '0.75rem', fontWeight: 800 }}>{alarm.type}</span>
                                                <span style={{ fontSize: '0.65rem', opacity: 0.6 }}>{alarm.time}</span>
                                            </div>
                                            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>IP: {alarm.ip} • <span style={{ color: '#6366f1' }}>{alarm.location}</span></div>
                                        </div>
                                    ))}
                                    <button style={{ width: '100%', padding: '0.6rem', background: '#dc2626', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 700, fontSize: '0.75rem', marginTop: '1rem', cursor: 'pointer' }}>
                                        BLOQUEAR TODAS LAS IPS SOSPECHOSAS
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Orquestación de Infraestructura */}
                        <div style={{ marginTop: '1.5rem', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
                            <div className="card" style={{ padding: '1.5rem', border: globalKillSwitch ? '2px solid #ef4444' : '1px solid #e2e8f0' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <Lock size={18} color="#ef4444" />
                                        <span style={{ fontWeight: 800, fontSize: '0.85rem' }}>KILL SWITCH GLOBAL</span>
                                    </div>
                                    <input type="checkbox" checked={globalKillSwitch} onChange={() => setGlobalKillSwitch(!globalKillSwitch)} style={{ width: 40, height: 20, accentColor: '#ef4444', cursor: 'pointer' }} />
                                </div>
                                <p style={{ fontSize: '0.7rem', color: '#64748b' }}>Suspende inmediatamente todas las operaciones de la plataforma. Usar solo en caso de emergencia extrema.</p>
                            </div>

                            <div className="card" style={{ padding: '1.5rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                                    <MessageSquare size={18} color="#6366f1" />
                                    <span style={{ fontWeight: 800, fontSize: '0.85rem' }}>BROADCAST GLOBAL</span>
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <input 
                                        type="text" 
                                        value={localBroadcast}
                                        onChange={e => setLocalBroadcast(e.target.value)}
                                        placeholder="Mensaje para todos..." 
                                        style={{ flex: 1, padding: '0.4rem 0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.8rem' }} 
                                    />
                                    <button 
                                        onClick={() => setBroadcastMessage(localBroadcast)}
                                        style={{ background: '#6366f1', color: 'white', border: 'none', padding: '0.4rem 0.75rem', borderRadius: '6px', fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer' }}
                                    >
                                        ENVIAR
                                    </button>
                                </div>
                                {broadcastMessage && (
                                    <button 
                                        onClick={() => { setBroadcastMessage(''); setLocalBroadcast(''); }}
                                        style={{ marginTop: '0.5rem', width: '100%', background: 'transparent', border: '1px dashed #6366f1', color: '#6366f1', fontSize: '0.65rem', padding: '0.25rem', cursor: 'pointer', borderRadius: '4px', fontWeight: 700 }}
                                    >
                                        REPETIR / QUITAR MENSAJE ACTUAL
                                    </button>
                                )}
                            </div>

                            <div className="card" style={{ padding: '1.5rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                                    <HardDrive size={18} color="#10b981" />
                                    <span style={{ fontWeight: 800, fontSize: '0.85rem' }}>ESTADO DE BASE DE DATOS</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{ flex: 1, height: 8, background: '#f1f5f9', borderRadius: '4px' }}>
                                        <div style={{ width: '42%', height: '100%', background: '#10b981', borderRadius: '4px' }}></div>
                                    </div>
                                    <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>42% Usage</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ─── TAB: TERMINAL ─── */}
                {activeTab === 'terminal' && (
                    <div className="animate-fade-in" style={{ height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }}>
                        <header style={{ marginBottom: '1.5rem' }}>
                            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <Terminal size={32} color="#1e293b" /> Consola de Comandos SA
                            </h1>
                            <p style={{ color: '#64748b' }}>Acceso de bajo nivel al Kernel de Iubel. Ejecución de scripts y mantenimiento.</p>
                        </header>
                        <AdminTerminal />
                    </div>
                )}

                {/* ─── TAB: BI SAAS GLOBAL ─── */}
                {activeTab === 'bi' && (
                    <div className="animate-fade-in">
                        <header style={{ marginBottom: '2rem' }}>
                            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <Globe size={32} color="#8b5cf6" /> BI SaaS Global
                            </h1>
                            <p style={{ color: '#64748b' }}>Inteligencia de negocios sobre el crecimiento y adopción de la plataforma.</p>
                        </header>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
                            <div className="card" style={{ padding: '1.5rem' }}>
                                <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1rem', fontWeight: 700 }}>Distribución por Plan</h3>
                                <div style={{ height: '250px' }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={[
                                            {name: 'Básico', v: 45}, {name: 'Intermedio', v: 82}, {name: 'Avanzado', v: 34}
                                        ]}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                            <XAxis dataKey="name" fontSize={12} />
                                            <YAxis fontSize={12} />
                                            <Tooltip />
                                            <Bar dataKey="v" radius={[4, 4, 0, 0]}>
                                                <Cell fill="#94a3b8" />
                                                <Cell fill="#6366f1" />
                                                <Cell fill="#8b5cf6" />
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                            <div className="card" style={{ padding: '1.5rem' }}>
                                <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1rem', fontWeight: 700 }}>Crecimiento de Usuarios (MAU)</h3>
                                <div style={{ height: '250px' }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={[
                                            {m: 'Ene', u: 1200}, {m: 'Feb', u: 1800}, {m: 'Mar', u: 2450}
                                        ]}>
                                            <XAxis dataKey="m" fontSize={12} />
                                            <YAxis fontSize={12} />
                                            <Tooltip />
                                            <Area type="monotone" dataKey="u" stroke="#10b981" fill="#10b98122" strokeWidth={3} />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>

                        <div className="card" style={{ marginTop: '1.5rem', padding: '1.5rem' }}>
                            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem', fontWeight: 700 }}>Top Tenants por Actividad</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {empresas.slice(0, 3).map((emp, i) => (
                                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: '#f8fafc', borderRadius: '12px' }}>
                                        <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#6366f1', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>{emp.nombre[0]}</div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{emp.nombre}</div>
                                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{emp.plan.toUpperCase()} · 1,450 Transacciones / hoy</div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ color: '#10b981', fontWeight: 700 }}>+8.4% Health Score</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* ─── TAB: AUDITORÍA GLOBAL ─── */}
                {activeTab === 'auditoria' && (
                    <>
                        <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                                    <div style={{ padding: '0.5rem', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', borderRadius: '10px', display: 'flex' }}>
                                        <Activity size={20} color="white" />
                                    </div>
                                    <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Auditoría Global</h1>
                                </div>
                                <p style={{ color: '#64748b', margin: 0 }}>Registro inmutable de todas las operaciones del sistema. Actualizado en tiempo real.</p>
                            </div>
                            <div style={{ display: 'flex', gap: '0.625rem' }}>
                                <button onClick={fetchAuditLogs} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: 'white', color: '#334155', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer', fontFamily: 'inherit' }}>
                                    <RefreshCw size={14} /> Actualizar
                                </button>
                                <button onClick={exportAuditCSV} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1rem', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: 'white', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer', fontFamily: 'inherit' }}>
                                    <Download size={14} /> Exportar Excel
                                </button>
                            </div>
                        </header>

                        {/* Audit KPIs */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(165px,1fr))', gap: '1rem', marginBottom: '1.75rem' }}>
                            {[
                                { label: 'Total Eventos', val: auditLogs.length, c: '#6366f1', bg: '#f5f3ff' },
                                { label: 'Logins', val: auditLogs.filter(l => (l.accion || '').includes('LOGIN')).length, c: '#2563eb', bg: '#eff6ff' },
                                { label: 'Creaciones', val: auditLogs.filter(l => (l.accion || '').includes('CREATE')).length, c: '#10b981', bg: '#f0fdf4' },
                                { label: 'Eliminaciones', val: auditLogs.filter(l => (l.accion || '').includes('DELETE')).length, c: '#ef4444', bg: '#fef2f2' },
                            ].map(k => (
                                <div key={k.label} style={{ background: k.bg, border: `1px solid ${k.c}22`, borderRadius: '12px', padding: '1rem 1.25rem' }}>
                                    <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.3rem' }}>{k.label}</div>
                                    <div style={{ fontSize: '1.75rem', fontWeight: 900, color: k.c }}>{k.val}</div>
                                </div>
                            ))}
                        </div>

                        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                            <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', gap: '0.875rem', alignItems: 'center', background: '#f8fafc', flexWrap: 'wrap' }}>
                                <Filter size={15} color="#64748b" />
                                <input type="text" placeholder="Filtrar por acción, módulo o usuario..." value={auditFilter}
                                    onChange={e => setAuditFilter(e.target.value)}
                                    style={{ flex: 1, padding: '0.5rem 0.875rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem', outline: 'none', maxWidth: '380px', fontFamily: 'inherit' }} />
                                {auditFilter && <button onClick={() => setAuditFilter('')} style={{ fontSize: '0.78rem', color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700, fontFamily: 'inherit' }}>✕ Limpiar</button>}
                                <span style={{ marginLeft: 'auto', fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>{filteredLogs.length} eventos</span>
                            </div>
                            <div style={{ overflowX: 'auto', maxHeight: 'calc(100vh - 450px)', overflowY: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                    <thead style={{ background: '#f8fafc', position: 'sticky', top: 0, zIndex: 10 }}>
                                        <tr>
                                            {['Fecha / Hora', 'Acción', 'Módulo / Entidad', 'ID Registro', 'Usuario', 'IP'].map(h => (
                                                <th key={h} style={{ padding: '0.875rem 1.25rem', fontSize: '0.7rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 700, whiteSpace: 'nowrap', borderBottom: '2px solid #e2e8f0' }}>{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {loadingAudit ? (
                                            <tr><td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>Cargando registros...</td></tr>
                                        ) : filteredLogs.length === 0 ? (
                                            <tr><td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>No se encontraron eventos.</td></tr>
                                        ) : filteredLogs.map((log, i) => {
                                            const st = accionStyle(log.accion);
                                            return (
                                                <tr key={log.id} style={{ borderBottom: '1px solid #f1f5f9', background: i % 2 === 0 ? 'white' : '#fafafa' }}>
                                                    <td style={{ padding: '0.875rem 1.25rem', whiteSpace: 'nowrap', fontSize: '0.8rem', color: '#475569' }}>{new Date(log.created_at).toLocaleString('es-DO')}</td>
                                                    <td style={{ padding: '0.875rem 1.25rem' }}>
                                                        <span style={{ padding: '0.2rem 0.625rem', borderRadius: '5px', fontSize: '0.7rem', fontWeight: 800, ...st }}>{log.accion}</span>
                                                    </td>
                                                    <td style={{ padding: '0.875rem 1.25rem', fontWeight: 600, color: '#334155' }}>{log.entidad || '—'}</td>
                                                    <td style={{ padding: '0.875rem 1.25rem', fontFamily: 'monospace', fontSize: '0.78rem', color: '#6366f1' }}>{log.registro_id || '—'}</td>
                                                    <td style={{ padding: '0.875rem 1.25rem', fontSize: '0.8rem' }}>{log.usuario_id || 'Sistema'}</td>
                                                    <td style={{ padding: '0.875rem 1.25rem', fontSize: '0.78rem', color: '#64748b', fontFamily: 'monospace' }}>{log.ip || '—'}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}

                {/* ─── TAB: NUCLEAR RESET ─── */}
                {activeTab === 'nuclear' && (
                    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', textAlign: 'center' }}>
                        <div style={{ width: 100, height: 100, background: '#fee2e2', color: '#ef4444', borderRadius: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '2rem', boxShadow: '0 20px 40px rgba(239,68,68,0.2)' }}>
                            <Zap size={50} fill="#ef4444" />
                        </div>
                        <h1 style={{ fontSize: '2.5rem', fontWeight: 900, color: '#0f172a', marginBottom: '1rem' }}>RESETEO MAESTRO NUCLEAR</h1>
                        <p style={{ maxWidth: '600px', color: '#64748b', fontSize: '1.1rem', lineHeight: 1.6, marginBottom: '2.5rem' }}>
                            Esta acción es <strong style={{ color: '#ef4444' }}>IRREVERSIBLE</strong>. Se eliminarán todas las empresas, todos los usuarios (excepto superadmins) y todas las tablas dinámicas de la base de datos. El sistema quedará vacío y listo para un nuevo despliegue.
                        </p>

                        <div className="card" style={{ padding: '2.5rem', width: '100%', maxWidth: '500px', border: '2px dashed #ef4444' }}>
                            <label style={{ display: 'block', fontWeight: 800, fontSize: '0.8rem', color: '#ef4444', textTransform: 'uppercase', marginBottom: '1rem' }}>
                                Escribe "IUBEL_NUCLEAR_REBOOT" para confirmar
                            </label>
                            <input 
                                type="text"
                                placeholder="..."
                                id="nuclear_code"
                                style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '2px solid #cbd5e1', textAlign: 'center', fontSize: '1.2rem', fontWeight: 700, marginBottom: '1.5rem', outline: 'none' }}
                            />
                            <button 
                                onClick={async () => {
                                    const code = document.getElementById('nuclear_code').value;
                                    if (code !== 'IUBEL_NUCLEAR_REBOOT') return alert('Código incorrecto');
                                    
                                    if (!window.confirm('¿ESTÁS ABSOLUTAMENTE SEGURO? Esta acción destruirá todos los datos de los inquilinos.')) return;

                                    try {
                                        const res = await fetch('/api/superadmin/system/deep-clean', {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                                            body: JSON.stringify({ confirmCode: code })
                                        });
                                        if (res.ok) {
                                            alert('Limpieza absoluta completada. Redirigiendo...');
                                            window.location.reload();
                                        } else {
                                            const data = await res.json();
                                            alert(data.error);
                                        }
                                    } catch (err) {
                                        alert('Error crítico de red');
                                    }
                                }}
                                style={{ width: '100%', padding: '1.25rem', background: '#ef4444', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 900, fontSize: '1.1rem', cursor: 'pointer', boxShadow: '0 10px 20px rgba(239,68,68,0.3)' }}
                            >
                                EJECUTAR LIMPIEZA NUCLEAR ☢️
                            </button>
                        </div>
                    </div>
                )}

                {/* Modal Módulos */}
                {selectingFeatures && (
                    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.95)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem' }}>
                        <div style={{ width: '680px', background: 'white', borderRadius: '24px', padding: '2rem', boxShadow: '0 40px 100px rgba(0,0,0,0.5)', maxHeight: '92vh', display: 'flex', flexDirection: 'column' }}>

                            <div style={{ marginBottom: '1.5rem' }}>
                                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
                                    Módulos Activos: <span style={{ color: '#6366f1' }}>{selectingFeatures.nombre}</span>
                                </h3>
                                <p style={{ margin: '0.4rem 0 0', color: '#64748b', fontSize: '0.875rem' }}>Activa funciones independientemente del plan contratado.</p>
                            </div>
                            <div style={{ overflowY: 'auto', paddingRight: '0.5rem', flex: 1 }}>
                                {FEATURE_CATEGORIES.map(cat => (
                                    <div key={cat.name} style={{ marginBottom: '1.5rem' }}>
                                        <div style={{ 
                                            fontSize: '0.65rem', 
                                            fontWeight: 900, 
                                            color: cat.color, 
                                            textTransform: 'uppercase', 
                                            letterSpacing: '0.1em',
                                            marginBottom: '0.75rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem'
                                        }}>
                                            <span>{cat.name}</span>
                                            <div style={{ flex: 1, height: '1px', background: `${cat.color}33` }} />
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                                            {cat.features.map(feat => {
                                                const active = !!(selectingFeatures.features?.[feat.id]);
                                                return (
                                                    <div 
                                                        key={feat.id} 
                                                        onClick={() => toggleFeature(selectingFeatures.id, feat.id)} 
                                                        style={{ 
                                                            display: 'flex', 
                                                            alignItems: 'center', 
                                                            gap: '0.6rem', 
                                                            padding: '0.6rem 0.8rem', 
                                                            borderRadius: '8px', 
                                                            border: `1px solid ${active ? cat.color : '#e2e8f0'}`, 
                                                            cursor: 'pointer', 
                                                            background: active ? `${cat.color}08` : '#fafafa', 
                                                            transition: 'all 0.15s' 
                                                        }}
                                                    >
                                                        <div style={{ color: active ? cat.color : '#94a3b8' }}>{feat.icon}</div>
                                                        <div style={{ flex: 1, fontWeight: 600, color: active ? '#1e1b4b' : '#64748b', fontSize: '0.7rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{feat.label}</div>
                                                        <div style={{ 
                                                            width: 16, height: 16, 
                                                            borderRadius: '4px', 
                                                            border: `2px solid ${active ? cat.color : '#cbd5e1'}`, 
                                                            background: active ? cat.color : 'transparent', 
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 
                                                        }}>
                                                            {active && <div style={{ width: 4, height: 7, borderRight: '2px solid white', borderBottom: '2px solid white', transform: 'rotate(45deg) translate(-1px,-1px)' }} />}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div style={{ marginTop: '1.5rem' }}>
                                <button onClick={() => setSelectingFeatures(null)} style={{ width: '100%', padding: '0.875rem', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', fontSize: '0.95rem', fontFamily: 'inherit' }}>
                                    Guardar y Cerrar
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Modal Borrado Nuclear */}
                {deletingEmpresa && (
                    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.92)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, padding: '1.5rem' }}>
                        <div style={{ width: '480px', background: 'white', borderRadius: '24px', padding: '2.5rem', boxShadow: '0 40px 100px rgba(0,0,0,0.5)', textAlign: 'center' }}>
                            <div style={{ width: 80, height: 80, background: '#fee2e2', color: '#ef4444', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                                <ShieldAlert size={40} />
                            </div>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0f172a', marginBottom: '1rem' }}>Operación Nuclear</h3>
                            <p style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '2rem' }}>
                                Estás a punto de eliminar permanentemente a <strong>{deletingEmpresa.nombre}</strong>. Todos los usuarios y datos maestros asociados desaparecerán para siempre.
                            </p>
                            
                            <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '16px', border: '1px solid #e2e8f0', marginBottom: '2rem' }}>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.75rem', textAlign: 'left' }}>
                                    Escribe el nombre de la empresa para confirmar:
                                </label>
                                <input 
                                    type="text"
                                    value={confirmDeleteName}
                                    onChange={e => setConfirmDeleteName(e.target.value)}
                                    placeholder={deletingEmpresa.nombre}
                                    style={{ width: '100%', padding: '0.875rem 1rem', borderRadius: '10px', border: '2px solid #cbd5e1', outline: 'none', fontSize: '1rem', fontWeight: 600, color: '#ef4444' }}
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button 
                                    onClick={() => { setDeletingEmpresa(null); setConfirmDeleteName(''); }}
                                    style={{ flex: 1, padding: '1rem', borderRadius: '12px', border: '1px solid #cbd5e1', background: 'white', color: '#475569', fontWeight: 700, cursor: 'pointer' }}
                                >
                                    Cancelar
                                </button>
                                <button 
                                    disabled={confirmDeleteName !== deletingEmpresa.nombre}
                                    onClick={() => handleDeleteEmpresa(deletingEmpresa.id)}
                                    style={{ 
                                        flex: 1, padding: '1rem', borderRadius: '12px', border: 'none', 
                                        background: confirmDeleteName === deletingEmpresa.nombre ? '#ef4444' : '#cbd5e1', 
                                        color: 'white', fontWeight: 700, cursor: confirmDeleteName === deletingEmpresa.nombre ? 'pointer' : 'not-allowed',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    ELIMINAR AHORA
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default SuperAdminDashboard;
