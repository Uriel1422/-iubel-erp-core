import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    LayoutDashboard, BookOpen, Package, FileText, ShoppingCart, LogOut,
    Calculator, PieChart, Users, Landmark, ShieldCheck, ClipboardList,
    HardDrive, Briefcase, Calendar, Clock, Target, Activity, FilePlus,
    GitMerge, FileX, RefreshCw, UserSquare, Banknote, Lock, BarChart2, TrendingUp, CreditCard, DollarSign, Scale, Wallet, Server,
    Brain, FolderOpen, Layers, UserCheck, Network, Repeat,
    Sparkles, Star, Cpu
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
                { path: 'banking-hub', icon: <Activity className="nav-icon" />, label: 'Banking Hub', display: hasRole(['admin', 'contador']), featureId: 'core_banca' },
                { path: 'caja', icon: <Banknote className="nav-icon" />, label: 'Caja y Bóveda', display: hasRole(['admin', 'contador', 'cajero']), featureId: 'core_caja' },
                { path: 'prestamos', icon: <CreditCard className="nav-icon" />, label: 'Préstamos', display: hasRole(['admin', 'contador', 'auditor']), featureId: 'core_prestamos' },
                { path: 'socios', icon: <UserSquare className="nav-icon" />, label: 'Gestión de Socios', display: true, featureId: 'core_socios' },
                { path: 'contactos', icon: <Users className="nav-icon" />, label: 'Clientes / Prov.', display: true, featureId: 'core_contactos' },
                { path: 'cuentas', icon: <BookOpen className="nav-icon" />, label: 'Catálogo Cuentas', display: hasRole(['admin', 'contador', 'auditor']), featureId: 'core_contabilidad' },
                { path: 'inventario', icon: <Package className="nav-icon" />, label: 'Inventario', display: hasRole(['admin', 'contador', 'auxiliar', 'auditor']), featureId: 'core_inventario' },

            ].filter(i => i.display && hasAccess(i.featureId))
        },
        {
            label: 'Ventas y Compras',
            display: true,
            items: [
                { path: 'pos', icon: <ShoppingCart className="nav-icon" style={{color: '#6366f1'}} />, label: <span>Punto de Venta <span style={{ fontSize: '9px', background: '#6366f1', color: 'white', padding: '1px 4px', borderRadius: '4px', marginLeft: '4px' }}>ELITE</span></span>, display: true, featureId: 'core_pos' },
                { path: 'documentos', icon: <FolderOpen className="nav-icon" />, label: 'Gestión Documental', display: hasRole(['admin', 'contador', 'auditor']), featureId: 'enterprise_auditoria' },
                { path: 'proyectos', icon: <Layers className="nav-icon" />, label: 'Proyectos & Tareas', display: hasRole(['admin', 'contador']), featureId: 'enterprise_reportes' },
                { path: 'cotizaciones', icon: <ClipboardList className="nav-icon" />, label: 'Cotizaciones', display: hasRole(['admin', 'contador', 'cajero']), featureId: 'core_facturacion' },
                { path: 'facturas', icon: <FileText className="nav-icon" />, label: 'Facturación', display: hasRole(['admin', 'contador', 'cajero']), featureId: 'core_facturacion' },
                { path: 'cxc', icon: <CreditCard className="nav-icon" />, label: '💳 C. por Cobrar', display: hasRole(['admin', 'contador', 'cajero']), featureId: 'core_facturacion' },
                { path: 'cxp', icon: <Wallet className="nav-icon" />, label: '💸 C. por Pagar', display: hasRole(['admin', 'contador', 'auxiliar']), featureId: 'core_compras' },
                { path: 'notas', icon: <FileX className="nav-icon" />, label: 'Notas Cred./Déb.', display: hasRole(['admin', 'contador']), featureId: 'core_facturacion' },
                { path: 'ordenes', icon: <FilePlus className="nav-icon" />, label: 'Órdenes de Compra', display: hasRole(['admin', 'contador', 'auxiliar']), featureId: 'core_compras' },
                { path: 'compras', icon: <ShoppingCart className="nav-icon" />, label: 'Compras', display: hasRole(['admin', 'contador', 'auxiliar']), featureId: 'core_compras' },
                { path: 'estados-cuenta', icon: <UserSquare className="nav-icon" />, label: 'Estados de Cuenta', display: true, featureId: 'core_facturacion' },

            ].filter(i => i.display && hasAccess(i.featureId))
        },
        {
            label: 'Contabilidad',
            display: hasAccess('contabilidad'),
            items: [
                { path: 'bancos', icon: <Landmark className="nav-icon" />, label: 'Bancos', display: true, featureId: 'core_banca' },
                { path: 'conciliacion', icon: <GitMerge className="nav-icon" />, label: 'Conciliación Bancaria', display: hasRole(['admin', 'contador']), featureId: 'core_banca' },
                { path: 'diario', icon: <Calculator className="nav-icon" />, label: 'Entradas de Diario', display: hasRole(['admin', 'contador']), featureId: 'core_contabilidad' },
                { path: 'recurrentes', icon: <RefreshCw className="nav-icon" />, label: 'Recurrentes', display: true, featureId: 'core_contabilidad' },
                { path: 'mayor', icon: <Calendar className="nav-icon" />, label: 'Mayor General', display: true, featureId: 'core_contabilidad' },
                { path: 'aging', icon: <Clock className="nav-icon" />, label: 'Antigüedad CxC/CxP', display: true, featureId: 'core_contabilidad' },

            ].filter(i => i.display && hasAccess(i.featureId))
        },
        {
            label: 'Reportes y Análisis',
            display: hasAccess('reportes'),
            items: [
                { path: 'reportes', icon: <PieChart className="nav-icon" />, label: 'Estados Financieros', display: true, featureId: 'enterprise_reportes' },
                { path: 'niif', icon: <Landmark className="nav-icon" style={{color: '#f59e0b'}} />, label: <span>Estados NIIF <span style={{ fontSize: '9px', background: '#f59e0b', color: 'white', padding: '1px 4px', borderRadius: '4px', marginLeft: '4px' }}>PRO</span></span>, display: true, featureId: 'enterprise_reportes' },
                { path: 'efectivo', icon: <Activity className="nav-icon" />, label: 'Flujo de Efectivo', display: true, featureId: 'enterprise_reportes' },
                { path: 'presupuestos', icon: <Target className="nav-icon" />, label: 'Presupuestos', display: true, featureId: 'enterprise_reportes' },
                { path: 'centros-costo', icon: <BarChart2 className="nav-icon" />, label: 'Centros de Costo', display: true, featureId: 'core_contabilidad' },
                { path: 'indicadores', icon: <TrendingUp className="nav-icon" />, label: 'Indicadores (KPIs)', display: true, featureId: 'enterprise_reportes' },
                { path: 'fiscal', icon: <ShieldCheck className="nav-icon" />, label: 'Impuestos (DGII)', display: true, featureId: 'core_fiscal' },
                { path: 'analytics', icon: <Brain className="nav-icon" />, label: '🧠 Analytics & BI', display: hasRole(['admin', 'contador', 'auditor']), featureId: 'enterprise_reportes' },

            ].filter(i => i.display && hasAccess(i.featureId))
        },
        {
            label: 'Inteligencia IA',
            display: true,
            items: [
                { path: 'copilot', icon: <Brain className="nav-icon" style={{ color: '#8b5cf6' }} />, label: <span>🧠 Iubel Copilot <span style={{ fontSize: '9px', background: '#8b5cf6', color: 'white', padding: '1px 4px', borderRadius: '4px', marginLeft: '4px' }}>AI</span></span>, display: true, featureId: 'ai_copilot' },
                { path: 'analytics', icon: <PieChart className="nav-icon" style={{ color: '#10b981' }} />, label: 'Analytics & BI', display: hasRole(['admin', 'contador', 'auditor']), featureId: 'enterprise_reportes' },

            ].filter(i => i.display && hasAccess(i.featureId))
        },
        {
            label: 'FinTech Enterprise',
            display: true,
            items: [
                { path: 'sovereign-vault', icon: <ShieldCheck className="nav-icon" style={{ color: '#38bdf8' }} />, label: <span>Sovereign Vault <span style={{ fontSize: '9px', border: '1px solid #38bdf8', color: '#38bdf8', padding: '1px 4px', borderRadius: '4px', marginLeft: '4px' }}>VIP</span></span>, display: true, featureId: 'fintech_sovereign' },
                { path: 'wealth', icon: <TrendingUp className="nav-icon" style={{ color: '#10b981' }} />, label: 'Wealth Terminal', display: true, featureId: 'fintech_wealth' },
                { path: 'tarjetas', icon: <CreditCard className="nav-icon" style={{ color: '#0ea5e9' }} />, label: <span>Card Issuing <span style={{ fontSize: '9px', background: '#0ea5e9', color: 'white', padding: '1px 4px', borderRadius: '4px', marginLeft: '4px' }}>HOT</span></span>, display: true, featureId: 'fintech_cards' },
                { path: 'datanode', icon: <Network className="nav-icon" style={{ color: '#38bdf8' }} />, label: <span>Data Node <span style={{ fontSize: '9px', background: '#38bdf8', color: 'white', padding: '1px 4px', borderRadius: '4px', marginLeft: '4px' }}>GOLD</span></span>, display: true, featureId: 'fintech_datanode' },
                { path: 'exchange', icon: <Repeat className="nav-icon" style={{ color: '#facc15' }} />, label: <span>Exchange & Tokens <span style={{ fontSize: '9px', background: '#facc15', color: 'black', padding: '1px 4px', borderRadius: '4px', marginLeft: '4px' }}>NEW</span></span>, display: true, featureId: 'fintech_exchange' },
                { path: 'credit-intelligence', icon: <Brain className="nav-icon" style={{ color: '#8b5cf6' }} />, label: <span>Credit Intelligence <span style={{ fontSize: '9px', border: '1px solid #8b5cf6', color: '#8b5cf6', padding: '1px 4px', borderRadius: '4px', marginLeft: '4px' }}>ELITE</span></span>, display: true, featureId: 'fintech_credit' },

            ].filter(i => i.display && (i.featureId ? hasAccess(i.featureId) : true))
        },
        {
            label: 'Talento y RRHH',
            display: hasAccess('personal'),
            items: [
                { path: 'talento-humano', icon: <Briefcase className="nav-icon" />, label: 'Talento Humano', display: true, featureId: 'enterprise_rrhh' },
                { path: 'nomina', icon: <DollarSign className="nav-icon" />, label: 'Nómina (RD)', display: true, featureId: 'enterprise_rrhh' },
                { path: 'ahorros', icon: <Wallet className="nav-icon" />, label: 'Ahorros y Captaciones', display: true, featureId: 'core_banca' },
                { path: 'procesos', icon: <RefreshCw className="nav-icon" />, label: 'Procesos y Cierres', display: true, featureId: 'core_contabilidad' },
                { path: 'cobros', icon: <RefreshCw className="nav-icon" />, label: 'Cobros y Deducciones', display: true, featureId: 'enterprise_rrhh' },
                { path: 'segmentacion', icon: <Users className="nav-icon" />, label: 'Segmentación Socios', display: true, featureId: 'enterprise_rrhh' },
                { path: 'balance-social', icon: <TrendingUp className="nav-icon" />, label: 'Balance Social', display: true, featureId: 'enterprise_rrhh' },

            ].filter(i => i.display && hasAccess(i.featureId))
        },
        {
            label: 'Empresa y Cumplim.',
            display: hasAccess('contabilidad') || hasRole(['admin', 'auditor']),
            items: [
                { path: 'parametros-core', icon: <Server className="nav-icon" />, label: 'Parámetros del Core', display: true, featureId: 'core_contabilidad' },
                { path: 'activos', icon: <HardDrive className="nav-icon" />, label: 'Activos Fijos', display: true, featureId: 'enterprise_activos' },
                { path: 'control-interno', icon: <ShieldCheck className="nav-icon" />, label: 'Control Interno', display: true, featureId: 'enterprise_auditoria' },
                { path: 'juridico', icon: <Scale className="nav-icon" />, label: 'Gestión Jurídica', display: true, featureId: 'enterprise_auditoria' },
                { path: 'ncf', icon: <FileText className="nav-icon" />, label: 'Comprobantes NCF', display: hasRole(['admin', 'contador']), featureId: 'core_fiscal' },
                { path: 'cierre', icon: <Lock className="nav-icon" />, label: 'Cierre Fiscal', display: hasRole(['admin', 'contador']), featureId: 'core_contabilidad' },
                { path: 'auditoria', icon: <ShieldCheck className="nav-icon" />, label: 'Registro Auditoría', display: hasRole(['admin', 'auditor']), featureId: 'enterprise_auditoria' },
                { path: 'seguridad', icon: <UserCheck className="nav-icon" />, label: '👥 Usuarios y Roles', display: hasRole(['admin']), featureId: 'enterprise_auditoria' },

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

            {/* 🛰️ SOVEREIGN INTELLIGENCE NODE v3 - ELITE SECURITY */}
            <div style={{
                margin: '1.25rem',
                padding: '1.25rem',
                background: 'linear-gradient(145deg, #0f172a 0%, #1e1b4b 100%)',
                borderRadius: '20px',
                border: '1px solid rgba(99, 102, 241, 0.3)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.5), inset 0 0 20px rgba(99, 102, 241, 0.1)',
                position: 'relative',
                overflow: 'hidden'
            }}>
                {/* Scanline Effect */}
                <div style={{
                    position: 'absolute', top: 0, left: 0, width: '100%', height: '2px',
                    background: 'linear-gradient(90deg, transparent, rgba(99, 102, 241, 0.4), transparent)',
                    animation: 'scanline 4s linear infinite'
                }}></div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <div style={{ position: 'relative' }}>
                            <div style={{ width: '10px', height: '10px', background: '#4ade80', borderRadius: '50%', boxShadow: '0 0 15px #4ade80' }}></div>
                            <div style={{ position: 'absolute', top: 0, left: 0, width: '10px', height: '10px', background: '#4ade80', borderRadius: '50%', animation: 'sidebar-ping 1.5s infinite' }}></div>
                        </div>
                        <span style={{ fontSize: '0.65rem', fontWeight: 900, color: '#818cf8', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Sovereign Guard v3</span>
                    </div>
                    <ShieldCheck size={16} color="#4ade80" />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1rem' }}>
                    <div style={{ 
                        width: '40px', height: '40px', 
                        background: 'rgba(99, 102, 241, 0.15)', 
                        borderRadius: '12px', display: 'flex', 
                        alignItems: 'center', justifyContent: 'center',
                        border: '1px solid rgba(99, 102, 241, 0.2)'
                    }}>
                        <Brain size={22} color="#818cf8" className="animate-pulse" />
                    </div>
                    <div style={{ overflow: 'hidden' }}>
                        <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#f8fafc', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{user?.nombre}</div>
                        <div style={{ fontSize: '0.7rem', color: '#6366f1', fontWeight: 600 }}>ELITE ACCESS</div>
                    </div>
                </div>

                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.75rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '0.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                        <span style={{ fontSize: '0.6rem', color: '#94a3b8', fontWeight: 700 }}>SHADOW LEDGER</span>
                        <span style={{ fontSize: '0.6rem', color: '#4ade80', fontWeight: 800 }}>ACTIVE</span>
                    </div>
                    <div style={{ height: '3px', width: '100%', background: '#1e293b', borderRadius: '2px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: '100%', background: 'linear-gradient(90deg, #6366f1, #a855f7)', animation: 'progress-glow 2s ease-in-out infinite' }}></div>
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.6rem' }}>
                    <span style={{ color: '#475569' }}>SID: {empresa?.id?.slice(0, 8)}...</span>
                    <div style={{ display: 'flex', gap: '0.3rem', alignItems: 'center' }}>
                        <Cpu size={10} color="#6366f1" />
                        <span style={{ color: '#6366f1', fontWeight: 700 }}>VERIFIED</span>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes sidebar-ping { 75%, 100% { transform: scale(3); opacity: 0; } }
                @keyframes scanline { 0% { top: 0; } 100% { top: 100%; } }
                @keyframes progress-glow { 0%, 100% { opacity: 0.6; } 50% { opacity: 1; } }
            `}</style>
        </aside>
    );
};

export default Sidebar;
