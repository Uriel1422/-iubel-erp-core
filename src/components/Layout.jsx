import React, { useState, useEffect, useRef } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import ErrorBoundary from './ErrorBoundary';
import { Search, Bell, Settings, HelpCircle, User, LogOut, Check, Building2, Calendar, ArrowLeft } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';
import { useSettings } from '../context/SettingsContext';
import { useAuth } from '../context/AuthContext';
import { useCuentas } from '../context/CuentasContext';
import { useContactos } from '../context/ContactosContext';
import { useFacturacion } from '../context/FacturacionContext';
import { useInventario } from '../context/InventarioContext';
import { useSuperAdmin } from '../context/SuperAdminContext';
import { ShieldAlert } from 'lucide-react';

const Layout = () => {
    useEffect(() => {
        const style = document.createElement('style');
        style.innerHTML = `
            @keyframes pulse {
                0% { transform: scale(1); opacity: 0.8; }
                50% { transform: scale(1.05); opacity: 1; }
                100% { transform: scale(1); opacity: 0.8; }
            }
        `;
        document.head.appendChild(style);
        return () => document.head.removeChild(style);
    }, []);
    const navigate = useNavigate();
    const { notifications, unreadCount, markAsRead, clearAll } = useNotifications();
    const { settings } = useSettings();
    const { user, empresa, logout } = useAuth();
    const { cuentas } = useCuentas();
    const { contactos } = useContactos();
    const { facturas } = useFacturacion();
    const { articulos } = useInventario();
    const { globalKillSwitch, broadcastMessage } = useSuperAdmin();

    const [showNotifications, setShowNotifications] = useState(false);
    const [showProfile, setShowProfile] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [showResults, setShowResults] = useState(false);

    const searchRef = useRef(null);
    const profileRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowResults(false);
            }
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setShowProfile(false);
            }
        };

        const handleEsc = (event) => {
            if (event.key === 'Escape') {
                setShowResults(false);
                setShowProfile(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleEsc);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEsc);
        };
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const userInitials = user?.nombre
        ? user.nombre.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
        : 'IU';

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    // Global Search Logic
    const handleSearch = (e) => {
        const query = e.target.value;
        setSearchTerm(query);

        if (!query.trim()) {
            setSearchResults([]);
            setShowResults(false);
            return;
        }

        const lowerQuery = query.toLowerCase();
        const results = [];

        // Search in Cuentas
        const filteredCuentas = (cuentas || []).filter(c =>
            c.nombre.toLowerCase().includes(lowerQuery) ||
            c.codigo.toLowerCase().includes(lowerQuery)
        ).slice(0, 5).map(c => ({ ...c, type: 'cuenta', icon: <Check size={14} />, path: '/erp/cuentas' }));
        results.push(...filteredCuentas);

        // Search in Contactos
        const filteredContactos = (contactos || []).filter(c =>
            c.nombre.toLowerCase().includes(lowerQuery) ||
            (c.rnc && c.rnc.includes(lowerQuery))
        ).slice(0, 5).map(c => ({ ...c, type: 'contacto', icon: <User size={14} />, path: '/erp/contactos' }));
        results.push(...filteredContactos);

        // Search in Inventario
        const filteredArticulos = (articulos || []).filter(a =>
            a.nombre.toLowerCase().includes(lowerQuery) ||
            (a.codigo && a.codigo.toLowerCase().includes(lowerQuery))
        ).slice(0, 5).map(a => ({ ...a, type: 'articulo', icon: <Check size={14} />, path: '/erp/inventario' }));
        results.push(...filteredArticulos);

        // Search in Facturas
        const filteredFacturas = (facturas || []).filter(f =>
            (f.numero && f.numero.toLowerCase().includes(lowerQuery)) ||
            (f.clienteNombre && f.clienteNombre.toLowerCase().includes(lowerQuery))
        ).slice(0, 5).map(f => ({ ...f, type: 'factura', icon: <Calendar size={14} />, path: '/erp/facturas' }));
        results.push(...filteredFacturas);

        setSearchResults(results);
        setShowResults(results.length > 0);
    };

    const handleResultClick = (path) => {
        navigate(path);
        setSearchTerm('');
        setShowResults(false);
    };


    return (
        <div className={`app-container ${settings.preferencias.modoOscuro ? 'dark-theme' : ''}`}>
            <Sidebar />
            <main className="main-content">
                <header className="top-header" style={{ zIndex: 9999, position: 'sticky', top: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                        <button 
                            className="btn btn-secondary" 
                            onClick={() => navigate(-1)}
                            style={{ padding: '0.5rem', borderRadius: '10px', width: '40px', height: '40px' }}
                            title="Regresar"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        
                        <div ref={searchRef} style={{ position: 'relative', width: '350px' }}>
                            <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input
                                type="text"
                                className="input-field"
                                placeholder="Buscar en Iubel ERP..."
                                style={{ paddingLeft: '32.17%rem', width: '100%' }}
                                value={searchTerm}
                                onChange={handleSearch}
                                onFocus={() => searchTerm && setShowResults(true)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && searchResults.length > 0) {
                                        handleResultClick(searchResults[0].path);
                                    }
                                }}
                            />
                            {showResults && (
                                <div className="dropdown-menu" style={{ width: '100%', top: '120%', maxHeight: '400px', overflowY: 'auto', zIndex: 100000 }}>
                                    {searchResults.length > 0 ? (
                                        searchResults.map((res, idx) => (
                                            <div
                                                key={idx}
                                                className="dropdown-item"
                                                onClick={() => handleResultClick(res.path)}
                                                style={{ borderBottom: '1px solid var(--border-light)' }}
                                            >
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                    <div style={{ color: 'var(--primary)' }}>{res.icon}</div>
                                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                        <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{res.nombre || res.numero || res.id}</span>
                                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>{res.type} {res.codigo || res.rnc || ''}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                                            <span>No se encontraron resultados para "</span><span>{searchTerm}</span><span>"</span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Company + Period badge */}
                    {empresa && (
                        <div key="layout-org-badges" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.35rem 0.9rem', background: 'var(--primary-light)', borderRadius: '8px', fontSize: '0.78rem', fontWeight: 700, color: 'var(--primary)' }}>
                                <Building2 size={13} /> <span>{empresa.nombre}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.35rem 0.9rem', background: 'rgba(139,92,246,0.1)', borderRadius: '8px', fontSize: '0.78rem', fontWeight: 700, color: '#8b5cf6' }}>
                                <Calendar size={13} /> <span>Período </span><span>{empresa.periodoFiscal || new Date().getFullYear()}</span>
                            </div>
                        </div>
                    )}

                    <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                        <div style={{ display: 'flex', gap: '1.25rem', color: 'var(--text-muted)', alignItems: 'center' }}>
                            {/* Campana de Notificaciones */}
                            <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => { setShowNotifications(!showNotifications); setShowProfile(false); }}>
                                <Bell size={20} color={showNotifications ? 'var(--primary)' : 'currentColor'} />
                                {unreadCount > 0 && <span className="notification-badge"><span>{unreadCount}</span></span>}

                                {showNotifications && (
                                    <div className="dropdown-menu" style={{ zIndex: 100000, border: '2px solid var(--primary)', boxShadow: '0 20px 50px rgba(0,0,0,0.5)', background: 'var(--bg-card)', right: 0 }}>
                                        <div className="dropdown-header" style={{ borderBottom: '2px solid var(--border)', background: 'var(--primary-light)' }}>
                                            <span style={{ fontWeight: 800, color: 'var(--primary)' }}>Notificaciones (<span>{unreadCount}</span>)</span>
                                            <button style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 700, padding: '0.25rem 0.5rem', background: 'white', borderRadius: '6px', border: '1px solid var(--primary)' }} onClick={(e) => { e.stopPropagation(); clearAll(); }}><span>Limpiar todo</span></button>
                                        </div>
                                        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                            {notifications.length === 0 ? (
                                                <div style={{ padding: '3rem 2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                                                    <Bell size={40} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                                                    <p>Sin notificaciones pendientes</p>
                                                </div>
                                            ) : (
                                                notifications.map(n => (
                                                    <div
                                                        key={`notif-${n.id}`}
                                                        className={`dropdown-item ${n.read ? '' : 'unread'}`}
                                                        onClick={(e) => { e.stopPropagation(); markAsRead(n.id); }}
                                                        style={{ borderBottom: '1px solid var(--border)', padding: '1.25rem' }}
                                                    >
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                                            <span style={{ fontWeight: 700, fontSize: '0.9rem', color: n.read ? 'var(--text-main)' : 'var(--primary)' }}>{n.title}</span>
                                                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{formatTime(n.date)}</span>
                                                        </div>
                                                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0, lineHeight: '1.4' }}><span>{n.message}</span></p>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Ayuda */}
                            <HelpCircle size={20} style={{ cursor: 'pointer' }} onClick={() => navigate('/erp/ayuda')} />

                            {/* Ajustes */}
                            <Settings size={20} style={{ cursor: 'pointer' }} onClick={() => navigate('/erp/config')} />
                        </div>

                        <div style={{ height: '32px', width: '1px', background: 'var(--border)' }}></div>

                        {/* Perfil de Usuario */}
                        <div ref={profileRef} style={{ position: 'relative' }}>
                            <div className="user-profile" onClick={() => { setShowProfile(!showProfile); setShowNotifications(false); }} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div
                                    style={{
                                        width: '40px', height: '40px', borderRadius: '12px',
                                        background: 'linear-gradient(135deg, var(--primary), #1d4ed8)',
                                        color: 'white', display: 'flex', alignItems: 'center',
                                        justifyContent: 'center', fontWeight: '700', fontSize: '14px',
                                        boxShadow: '0 4px 10px rgba(37, 99, 235, 0.2)'
                                    }}
                                >
                                    <span>{userInitials}</span>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <span style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-main)' }}>{user?.nombre || 'Usuario'}</span>
                                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{user?.role || 'Admin'}</span>
                                </div>
                            </div>

                            {showProfile && (
                                <div className="dropdown-menu" style={{ width: '220px' }}>
                                    <div className="dropdown-item" onClick={() => navigate('/erp/config')}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <User size={16} /> <span>Mi Perfil</span>
                                        </div>
                                    </div>
                                    <div className="dropdown-item" onClick={() => navigate('/erp/config')}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <Settings size={16} /> <span>Ajustes</span>
                                        </div>
                                    </div>
                                    <div style={{ borderTop: '1px solid var(--border)', marginTop: '0.5rem', paddingTop: '0.5rem' }}>
                                        <div className="dropdown-item" style={{ color: 'var(--danger)' }} onClick={handleLogout}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <LogOut size={16} /> <span>Cerrar Sesión</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </header>
                <div className="page-content">
                    <ErrorBoundary>
                        <Outlet />
                    </ErrorBoundary>
                </div>
            </main>
        </div>
    );
};

export default Layout;
