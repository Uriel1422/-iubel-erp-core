import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    LayoutDashboard, BookOpen, Package, FileText, ShoppingCart, LogOut,
    Calculator, PieChart, Users, Landmark, ShieldCheck, ClipboardList,
    HardDrive, Briefcase, Calendar, Clock, Target, Activity, FilePlus,
    GitMerge, FileX, RefreshCw, UserSquare, Banknote, Lock, BarChart2, TrendingUp, CreditCard, DollarSign, Scale, Wallet, Server,
    Brain, FolderOpen, Layers, UserCheck, Network, Repeat,
    Sparkles, Star, Cpu, ShieldCheck
} from 'lucide-react';

const Sidebar = () => {
    const { user, empresa, hasAccess, logout } = useAuth();
    const role = user?.role || 'contador';

    // Roles: admin, contador, auditor, cajero, auxiliar
    const hasRole = (roles) => roles.includes(role);

    const sections = [
        {
            label: 'Operaciones',
            display: true,
            items: [
                { path: '/erp', icon: <LayoutDashboard className="nav-icon" />, label: 'Panel', exact: true, display: true, featureId: 'dashboard' },
                { path: 'banking-hub', icon: <Activity className="nav-icon" />, label: 'Banking Hub', display: hasRole(['admin', 'contador']), featureId: 'banking' },
                { path: 'caja', icon: <Banknote className="nav-icon" />, label: 'Caja y Bóveda', display: hasRole(['admin', 'contador', 'cajero']), featureId: 'caja' },
                { path: 'prestamos', icon: <CreditCard className="nav-icon" />, label: 'Préstamos', display: hasRole(['admin', 'contador', 'auditor']), featureId: 'prestamos' },
                { path: 'socios', icon: <UserSquare className="nav-icon" />, label: 'Gestión de Socios', display: true, featureId: 'banking' },
                { path: 'contactos', icon: <Users className="nav-icon" />, label: 'Clientes / Prov.', display: true, featureId: 'contactos' },
                { path: 'cuentas', icon: <BookOpen className="nav-icon" />, label: 'Catálogo Cuentas', display: hasRole(['admin', 'contador', 'auditor']), featureId: 'contabilidad' },
                { path: 'inventario', icon: <Package className="nav-icon" />, label: 'Inventario', display: hasRole(['admin', 'contador', 'auxiliar', 'auditor']), featureId: 'inventario' },
            ].filter(i => i.display && hasAccess(i.featureId))
        },
        {
            label: 'Ventas y Compras',
            display: true,
            items: [
                { path: 'documentos', icon: <FolderOpen className="nav-icon" />, label: 'Gestión Documental', display: hasRole(['admin', 'contador', 'auditor']), featureId: 'auditoria' },
                { path: 'proyectos', icon: <Layers className="nav-icon" />, label: 'Proyectos & Tareas', display: hasRole(['admin', 'contador']), featureId: 'reportes' },
                { path: 'cotizaciones', icon: <ClipboardList className="nav-icon" />, label: 'Cotizaciones', display: hasRole(['admin', 'contador', 'cajero']), featureId: 'facturacion' },
                { path: 'facturas', icon: <FileText className="nav-icon" />, label: 'Facturación', display: hasRole(['admin', 'contador', 'cajero']), featureId: 'facturacion' },
                { path: 'cxc', icon: <CreditCard className="nav-icon" />, label: '💳 C. por Cobrar', display: hasRole(['admin', 'contador', 'cajero']), featureId: 'facturacion' },
                { path: 'cxp', icon: <Wallet className="nav-icon" />, label: '💸 C. por Pagar', display: hasRole(['admin', 'contador', 'auxiliar']), featureId: 'compras' },
                { path: 'notas', icon: <FileX className="nav-icon" />, label: 'Notas Cred./Déb.', display: hasRole(['admin', 'contador']), featureId: 'facturacion' },
                { path: 'ordenes', icon: <FilePlus className="nav-icon" />, label: 'Órdenes de Compra', display: hasRole(['admin', 'contador', 'auxiliar']), featureId: 'compras' },
                { path: 'compras', icon: <ShoppingCart className="nav-icon" />, label: 'Compras', display: hasRole(['admin', 'contador', 'auxiliar']), featureId: 'compras' },
                { path: 'estados-cuenta', icon: <UserSquare className="nav-icon" />, label: 'Estados de Cuenta', display: true, featureId: 'facturacion' },
            ].filter(i => i.display && hasAccess(i.featureId))
        },
        {
            label: 'Contabilidad',
            display: hasAccess('contabilidad'),
            items: [
                { path: 'bancos', icon: <Landmark className="nav-icon" />, label: 'Bancos', display: true, featureId: 'banking' },
                { path: 'conciliacion', icon: <GitMerge className="nav-icon" />, label: 'Conciliación Bancaria', display: hasRole(['admin', 'contador']), featureId: 'banking' },
                { path: 'diario', icon: <Calculator className="nav-icon" />, label: 'Entradas de Diario', display: hasRole(['admin', 'contador']), featureId: 'contabilidad' },
                { path: 'recurrentes', icon: <RefreshCw className="nav-icon" />, label: 'Recurrentes', display: true, featureId: 'contabilidad' },
                { path: 'mayor', icon: <Calendar className="nav-icon" />, label: 'Mayor General', display: true, featureId: 'contabilidad' },
                { path: 'aging', icon: <Clock className="nav-icon" />, label: 'Antigüedad CxC/CxP', display: true, featureId: 'contabilidad' },
            ].filter(i => i.display && hasAccess(i.featureId))
        },
        {
            label: 'Reportes y Análisis',
            display: hasAccess('reportes'),
            items: [
                { path: 'reportes', icon: <PieChart className="nav-icon" />, label: 'Estados Financieros', display: true, featureId: 'reportes' },
                { path: 'efectivo', icon: <Activity className="nav-icon" />, label: 'Flujo de Efectivo', display: true, featureId: 'reportes' },
                { path: 'presupuestos', icon: <Target className="nav-icon" />, label: 'Presupuestos', display: true, featureId: 'reportes' },
                { path: 'centros-costo', icon: <BarChart2 className="nav-icon" />, label: 'Centros de Costo', display: true, featureId: 'contabilidad' },
                { path: 'indicadores', icon: <TrendingUp className="nav-icon" />, label: 'Indicadores (KPIs)', display: true, featureId: 'reportes' },
                { path: 'fiscal', icon: <ShieldCheck className="nav-icon" />, label: 'Impuestos (DGII)', display: true, featureId: 'fiscal' },
                { path: 'analytics', icon: <Brain className="nav-icon" />, label: '🧠 Analytics & BI', display: hasRole(['admin', 'contador', 'auditor']), featureId: 'reportes' },
            ].filter(i => i.display && hasAccess(i.featureId))
        },
        {
            label: 'Inteligencia IA',
            display: true,
            items: [
                { path: 'copilot', icon: <Brain className="nav-icon" style={{ color: '#8b5cf6' }} />, label: <span>🧠 Iubel Copilot <span style={{ fontSize: '9px', background: '#8b5cf6', color: 'white', padding: '1px 4px', borderRadius: '4px', marginLeft: '4px' }}>AI</span></span>, display: true, featureId: 'dashboard' },
                { path: 'analytics', icon: <PieChart className="nav-icon" style={{ color: '#10b981' }} />, label: 'Analytics & BI', display: hasRole(['admin', 'contador', 'auditor']), featureId: 'reportes' },
            ].filter(i => i.display && hasAccess(i.featureId))
        },
        {
            label: 'FinTech Enterprise',
            display: true,
            items: [
                { path: 'sovereign-vault', icon: <ShieldCheck className="nav-icon" style={{ color: '#38bdf8' }} />, label: <span>Sovereign Vault <span style={{ fontSize: '9px', border: '1px solid #38bdf8', color: '#38bdf8', padding: '1px 4px', borderRadius: '4px', marginLeft: '4px' }}>VIP</span></span>, display: true },
                { path: 'wealth', icon: <TrendingUp className="nav-icon" style={{ color: '#10b981' }} />, label: 'Wealth Terminal', display: true, featureId: 'banking' },
                { path: 'tarjetas', icon: <CreditCard className="nav-icon" style={{ color: '#0ea5e9' }} />, label: <span>Card Issuing <span style={{ fontSize: '9px', background: '#0ea5e9', color: 'white', padding: '1px 4px', borderRadius: '4px', marginLeft: '4px' }}>HOT</span></span>, display: true, featureId: 'banking' },
                { path: 'datanode', icon: <Network className="nav-icon" style={{ color: '#38bdf8' }} />, label: <span>Data Node <span style={{ fontSize: '9px', background: '#38bdf8', color: 'white', padding: '1px 4px', borderRadius: '4px', marginLeft: '4px' }}>GOLD</span></span>, display: true, featureId: 'banking' },
                { path: 'exchange', icon: <Repeat className="nav-icon" style={{ color: '#facc15' }} />, label: <span>Exchange & Tokens <span style={{ fontSize: '9px', background: '#facc15', color: 'black', padding: '1px 4px', borderRadius: '4px', marginLeft: '4px' }}>NEW</span></span>, display: true, featureId: 'banking' },
            ].filter(i => i.display && (i.featureId ? hasAccess(i.featureId) : true))
        },
        {
            label: 'Talento y RRHH',
            display: hasAccess('personal'),
            items: [
                { path: 'talento-humano', icon: <Briefcase className="nav-icon" />, label: 'Talento Humano', display: true, featureId: 'personal' },
                { path: 'nomina', icon: <DollarSign className="nav-icon" />, label: 'Nómina (RD)', display: true, featureId: 'personal' },
                { path: 'ahorros', icon: <Wallet className="nav-icon" />, label: 'Ahorros y Captaciones', display: true, featureId: 'ahorros' },
                { path: 'procesos', icon: <RefreshCw className="nav-icon" />, label: 'Procesos y Cierres', display: true, featureId: 'contabilidad' },
                { path: 'cobros', icon: <RefreshCw className="nav-icon" />, label: 'Cobros y Deducciones', display: true, featureId: 'personal' },
                { path: 'segmentacion', icon: <Users className="nav-icon" />, label: 'Segmentación Socios', display: true, featureId: 'personal' },
                { path: 'balance-social', icon: <TrendingUp className="nav-icon" />, label: 'Balance Social', display: true, featureId: 'personal' },
            ].filter(i => i.display && hasAccess(i.featureId))
        },
        {
            label: 'Empresa y Cumplim.',
            display: hasAccess('contabilidad') || hasRole(['admin', 'auditor']),
            items: [
                { path: 'parametros-core', icon: <Server className="nav-icon" />, label: 'Parámetros del Core', display: true, featureId: 'contabilidad' },
                { path: 'activos', icon: <HardDrive className="nav-icon" />, label: 'Activos Fijos', display: true, featureId: 'activos' },
                { path: 'control-interno', icon: <ShieldCheck className="nav-icon" />, label: 'Control Interno', display: true, featureId: 'auditoria' },
                { path: 'juridico', icon: <Scale className="nav-icon" />, label: 'Gestión Jurídica', display: true, featureId: 'auditoria' },
                { path: 'ncf', icon: <FileText className="nav-icon" />, label: 'Comprobantes NCF', display: hasRole(['admin', 'contador']), featureId: 'fiscal' },
                { path: 'cierre', icon: <Lock className="nav-icon" />, label: 'Cierre Fiscal', display: hasRole(['admin', 'contador']), featureId: 'contabilidad' },
                { path: 'auditoria', icon: <ShieldCheck className="nav-icon" />, label: 'Registro Auditoría', display: hasRole(['admin', 'auditor']), featureId: 'auditoria' },
                { path: 'seguridad', icon: <UserCheck className="nav-icon" />, label: '👥 Usuarios y Roles', display: hasRole(['admin']), featureId: 'auditoria' },
            ].filter(i => i.display && hasAccess(i.featureId))
        },
        {
            label: 'Sistema y Sesión',
            display: true,
            items: [
                { 
                    path: '#logout', 
                    icon: <LogOut className="nav-icon" style={{ color: '#fca5a5' }} />, 
                    label: <span style={{ color: '#fca5a5' }}>Cerrar Sesión</span>, 
                    display: true, 
                    action: logout 
                },
            ].filter(i => i.display)
        }
    ].filter(s => s.display && s.items.length > 0);

    return (
        <aside className="sidebar">
            <div className="sidebar-header"><span>Iubel ERP</span></div>
            <nav className="sidebar-nav">
                {sections.map((section, sidx) => (
                    <div key={`side-sec-${sidx}`} style={{ marginBottom: '0.5rem' }}>
                        <div style={{
                            padding: '0.75rem 1.25rem 0.35rem',
                            fontSize: '0.65rem',
                            fontWeight: 800,
                            letterSpacing: '0.1em',
                            textTransform: 'uppercase',
                            color: 'rgba(148, 163, 184, 0.5)'
                        }}>
                            <span>{section.label}</span>
                        </div>
                        {section.items.map((item, iidx) => (
                            <NavLink
                                key={`side-item-${sidx}-${iidx}`}
                                to={item.path}
                                end={item.exact}
                                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                                onClick={item.action ? (e) => { e.preventDefault(); item.action(); } : undefined}
                            >
                                {item.icon}
                                <span>{item.label}</span>
                            </NavLink>
                        ))}
                    </div>
                ))}
            </nav>

            {/* 🛰️ SOVEREIGN INTELLIGENCE NODE STATUS */}
            <div style={{
                margin: '1.25rem',
                padding: '1rem',
                background: 'linear-gradient(145deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.8) 100%)',
                borderRadius: '16px',
                border: '1px solid rgba(56, 189, 248, 0.2)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
                fontFamily: 'system-ui, -apple-system, sans-serif'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <div style={{ position: 'relative' }}>
                            <div style={{ width: '8px', height: '8px', background: '#22c55e', borderRadius: '50%', boxShadow: '0 0 10px #22c55e' }}></div>
                            <div style={{ position: 'absolute', top: 0, left: 0, width: '8px', height: '8px', background: '#22c55e', borderRadius: '50%', animation: 'sidebar-ping 2s cubic-bezier(0, 0, 0.2, 1) infinite' }}></div>
                        </div>
                        <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Sovereign Node v2</span>
                    </div>
                    <Cpu size={14} color="#38bdf8" style={{ opacity: 0.7 }} />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '0.8rem' }}>
                    <div style={{ width: '36px', height: '36px', background: 'rgba(56, 189, 248, 0.1)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <UserSquare size={20} color="#38bdf8" />
                    </div>
                    <div style={{ overflow: 'hidden' }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f8fafc', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{user?.nombre}</div>
                        <div style={{ fontSize: '0.65rem', color: '#64748b' }}>{empresa?.nombre}</div>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '0.5rem' }}>
                    <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.5rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <div style={{ fontSize: '0.6rem', color: '#64748b', fontWeight: 600, marginBottom: '0.2rem' }}>TIER PLAN</div>
                        <div style={{ fontSize: '0.8rem', fontWeight: 900, color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                            <Star size={10} fill="#fbbf24" stroke="none" />
                            {empresa?.plan?.toUpperCase() || 'CORE'}
                        </div>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.5rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <div style={{ fontSize: '0.6rem', color: '#64748b', fontWeight: 600, marginBottom: '0.2rem' }}>FEATURES</div>
                        <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#22c55e' }}>Interconnected</div>
                    </div>
                </div>

                <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: '0.55rem', color: '#475569', letterSpacing: '0.02em' }}>
                        SID: {empresa?.id?.slice(0, 12)}...
                    </div>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <Activity size={10} color="#22c55e" />
                        <ShieldCheck size={10} color="#22c55e" />
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes sidebar-ping {
                    75%, 100% { transform: scale(3); opacity: 0; }
                }
            `}</style>
        </aside>
    );
};

export default Sidebar;
