import React, { useState, useEffect } from 'react';
import { useSettings } from '../context/SettingsContext';
import { useMoneda } from '../context/MonedaContext';
import { useAuth } from '../context/AuthContext';
import { Settings as SettingsIcon, Building, CreditCard, Shield, Sliders, DollarSign, Euro, Trash2, UserPlus, Fingerprint, ShieldAlert, BadgeCheck, Code, Key, Copy, Check, Database, DownloadCloud, HardDrive, RefreshCw, Clock, ShieldCheck } from 'lucide-react';

const Settings = () => {
    const { settings, updateEmpresa, toggleDarkMode } = useSettings();
    const { monedas, updateTasa } = useMoneda();
    const { token, user } = useAuth();
    const [activeTab, setActiveTab] = useState('empresa');

    const [usuarios, setUsuarios] = useState([]);
    const [newUser, setNewUser] = useState({ nombre: '', email: '', password: '', role: 'contador' });
    const [loadingUsers, setLoadingUsers] = useState(false);
    
    // 2FA State
    const [is2FAEnabled, setIs2FAEnabled] = useState(localStorage.getItem('iubel_2fa_enabled') === 'true');
    const [setup2FA, setSetup2FA] = useState(false);
    const [qrCodeValidating, setQrCodeValidating] = useState(false);
    const [testCode, setTestCode] = useState('');

    // API Keys State
    const [apiKeys, setApiKeys] = useState(() => {
        const saved = localStorage.getItem('iubel_api_keys');
        return saved ? JSON.parse(saved) : [
            { id: '1', name: 'WooCommerce Store', keyPreview: 'iubel_sk_live_...9A4F', createdAt: '2023-11-15T10:00:00Z', lastUsed: '2023-11-20T15:30:00Z' }
        ];
    });
    const [newKeyName, setNewKeyName] = useState('');
    const [generatedKey, setGeneratedKey] = useState(null);
    const [copied, setCopied] = useState(false);

    // Backup State
    const [backups, setBackups] = useState(() => {
        const saved = localStorage.getItem('iubel_backups');
        return saved ? JSON.parse(saved) : [
            { id: '1', date: '2023-11-20T08:00:00Z', size: '12.4 MB', type: 'Automático' }
        ];
    });
    const [isBackingUp, setIsBackingUp] = useState(false);
    const [backupStatusText, setBackupStatusText] = useState('');

    useEffect(() => {
        if (activeTab === 'seguridad' && user.role === 'admin') {
            fetchUsuarios();
        }
    }, [activeTab]);

    const handleEmpresaChange = (e) => {
        const { name, value } = e.target;
        updateEmpresa({ [name]: value });
    };

    const fetchUsuarios = async () => {
        setLoadingUsers(true);
        try {
            const res = await fetch('http://localhost:3001/api/auth/usuarios', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setUsuarios(data.filter(u => u.activo));
            }
        } catch (err) {
            console.error('Error cargando usuarios:', err);
        } finally {
            setLoadingUsers(false);
        }
    };

    const handleAddUser = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('http://localhost:3001/api/auth/usuarios', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(newUser)
            });
            if (res.ok) {
                setNewUser({ nombre: '', email: '', password: '', role: 'contador' });
                fetchUsuarios();
            } else {
                const data = await res.json();
                alert(data.error);
            }
        } catch (err) {
            alert('Error al crear usuario.');
        }
    };

    const handleDeleteUser = async (id) => {
        if (!window.confirm('¿Eliminar este usuario del sistema?')) return;
        try {
            const res = await fetch(`http://localhost:3001/api/auth/usuarios/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) fetchUsuarios();
        } catch (err) {
            alert('Error al eliminar.');
        }
    };

    const handleGenerateApiKey = (e) => {
        e.preventDefault();
        if (!newKeyName.trim()) return;

        // Generate a random valid looking sk
        const randStr = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        const newKey = `iubel_sk_live_${randStr}`;
        const keyPreview = `iubel_sk_live_...${newKey.slice(-4)}`;

        const addedKey = {
            id: Date.now().toString(),
            name: newKeyName,
            keyPreview,
            createdAt: new Date().toISOString(),
            lastUsed: null
        };

        const updatedKeys = [addedKey, ...apiKeys];
        setApiKeys(updatedKeys);
        localStorage.setItem('iubel_api_keys', JSON.stringify(updatedKeys));
        
        setGeneratedKey(newKey);
        setNewKeyName(''); // Reset input
    };

    const handleDeleteApiKey = (id) => {
        if (!window.confirm('¿Está seguro de revocar esta API Key? Las aplicaciones que la usen perderán el acceso inmediatamente.')) return;
        const updatedKeys = apiKeys.filter(k => k.id !== id);
        setApiKeys(updatedKeys);
        localStorage.setItem('iubel_api_keys', JSON.stringify(updatedKeys));
        if (apiKeys.length === 1 && generatedKey) setGeneratedKey(null); // Optional sanity check
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleGenerateBackup = () => {
        if (!window.confirm("¿Desea generar un archivo de copia de seguridad con todos los datos actuales de la empresa?")) return;
        
        setIsBackingUp(true);
        setBackupStatusText('Comprimiendo base de datos...');
        
        // Simulating the backup process
        setTimeout(() => setBackupStatusText('Cifrando información con AES-256...'), 1500);
        setTimeout(() => setBackupStatusText('Generando archivo de respaldo...'), 3000);
        
        setTimeout(() => {
            // Generate a fake local backup definition
            const newBackup = {
                id: Date.now().toString(),
                date: new Date().toISOString(),
                size: (Math.random() * (45 - 2) + 2).toFixed(1) + ' MB',
                type: 'Manual'
            };
            
            const updatedBackups = [newBackup, ...backups];
            setBackups(updatedBackups);
            localStorage.setItem('iubel_backups', JSON.stringify(updatedBackups));
            
            // "Download" the file (Simulated by downloading a small JSON)
            const backupData = {
                timestamp: newBackup.date,
                empresa: settings.empresa,
                monedas: monedas,
                metadata: "Datos simulados para el respaldo."
            };
            const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `iubel_backup_${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            setIsBackingUp(false);
            setBackupStatusText('');
        }, 4500);
    };

    const handleDownloadBackupFile = (b) => {
        const blob = new Blob([JSON.stringify({ note: 'Copia histórica', data: b }, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `historical_backup_${b.date.split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="animate-up">
            <div style={{ marginBottom: '2rem' }}>
                <h1 className="page-title" style={{ marginBottom: '0.25rem' }}>Configuración del Sistema</h1>
                <p style={{ color: 'var(--text-muted)' }}>Personaliza la identidad de tu empresa y las preferencias del ERP.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '2rem' }}>
                {/* Navegación de Ajustes */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <button
                        className="btn btn-secondary"
                        onClick={() => setActiveTab('empresa')}
                        style={{
                            justifyContent: 'flex-start',
                            background: activeTab === 'empresa' ? 'var(--primary-light)' : 'transparent',
                            color: activeTab === 'empresa' ? 'var(--primary)' : 'var(--text-main)',
                            borderColor: activeTab === 'empresa' ? 'var(--primary-light)' : 'transparent'
                        }}
                    >
                        <Building size={18} /> Datos de la Empresa
                    </button>
                    <button
                        className="btn btn-secondary"
                        onClick={() => setActiveTab('moneda')}
                        style={{
                            justifyContent: 'flex-start',
                            background: activeTab === 'moneda' ? 'var(--primary-light)' : 'transparent',
                            color: activeTab === 'moneda' ? 'var(--primary)' : 'var(--text-main)',
                            borderColor: activeTab === 'moneda' ? 'var(--primary-light)' : 'transparent'
                        }}
                    >
                        <CreditCard size={18} /> Moneda y Fiscalidad
                    </button>
                    {user.role === 'admin' && (
                        <button
                            className="btn btn-secondary"
                            onClick={() => setActiveTab('seguridad')}
                            style={{
                                justifyContent: 'flex-start',
                                background: activeTab === 'seguridad' ? 'var(--primary-light)' : 'transparent',
                                color: activeTab === 'seguridad' ? 'var(--primary)' : 'var(--text-main)',
                                borderColor: activeTab === 'seguridad' ? 'var(--primary-light)' : 'transparent'
                            }}
                        >
                            <Shield size={18} /> Seguridad y Accesos
                        </button>
                    )}
                    <button className="btn btn-secondary" style={{ justifyContent: 'flex-start', opacity: 0.6 }} disabled>
                        <Sliders size={18} /> Preferencias UI
                    </button>
                    <button
                        className="btn btn-secondary"
                        onClick={() => setActiveTab('perfil')}
                        style={{
                            justifyContent: 'flex-start', marginTop: '1rem',
                            background: activeTab === 'perfil' ? 'var(--primary-light)' : 'transparent',
                            color: activeTab === 'perfil' ? 'var(--primary)' : 'var(--text-main)',
                            borderColor: activeTab === 'perfil' ? 'var(--primary-light)' : 'transparent'
                        }}
                    >
                        <Fingerprint size={18} /> Mi Perfil y 2FA
                    </button>
                    {user.role === 'admin' && (
                        <button
                            className="btn btn-secondary"
                            onClick={() => { setActiveTab('apikeys'); setGeneratedKey(null); }}
                            style={{
                                justifyContent: 'flex-start',
                                background: activeTab === 'apikeys' ? 'var(--primary-light)' : 'transparent',
                                color: activeTab === 'apikeys' ? 'var(--primary)' : 'var(--text-main)',
                                borderColor: activeTab === 'apikeys' ? 'var(--primary-light)' : 'transparent'
                            }}
                        >
                            <Code size={18} /> Ecosistema API
                        </button>
                    )}
                    {user.role === 'admin' && (
                        <button
                            className="btn btn-secondary"
                            onClick={() => setActiveTab('backups')}
                            style={{
                                justifyContent: 'flex-start',
                                background: activeTab === 'backups' ? 'var(--primary-light)' : 'transparent',
                                color: activeTab === 'backups' ? 'var(--primary)' : 'var(--text-main)',
                                borderColor: activeTab === 'backups' ? 'var(--primary-light)' : 'transparent'
                            }}
                        >
                            <Database size={18} /> Centro de Backups
                        </button>
                    )}
                </div>

                {/* Formulario Principal */}
                <div className="card" style={{ padding: '2rem' }}>
                    {activeTab === 'empresa' && (
                        <>
                            <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Building size={20} color="var(--primary)" /> Perfil Corporativo
                            </h2>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                <div className="input-group">
                                    <label className="input-label">Nombre Legal de la Empresa</label>
                                    <input
                                        type="text"
                                        className="input-field"
                                        name="nombre"
                                        value={settings.empresa.nombre}
                                        onChange={handleEmpresaChange}
                                    />
                                </div>
                                <div className="input-group">
                                    <label className="input-label">RNC o Cédula</label>
                                    <input
                                        type="text"
                                        className="input-field"
                                        name="rnc"
                                        value={settings.empresa.rnc}
                                        onChange={handleEmpresaChange}
                                    />
                                </div>
                                <div className="input-group">
                                    <label className="input-label">Correo Electrónico</label>
                                    <input
                                        type="email"
                                        className="input-field"
                                        name="email"
                                        value={settings.empresa.email}
                                        onChange={handleEmpresaChange}
                                    />
                                </div>
                                <div className="input-group">
                                    <label className="input-label">Teléfono de Contacto</label>
                                    <input
                                        type="text"
                                        className="input-field"
                                        name="telefono"
                                        value={settings.empresa.telefono}
                                        onChange={handleEmpresaChange}
                                    />
                                </div>
                                <div className="input-group" style={{ gridColumn: 'span 2' }}>
                                    <label className="input-label">Dirección Fiscal</label>
                                    <input
                                        type="text"
                                        className="input-field"
                                        name="direccion"
                                        value={settings.empresa.direccion}
                                        onChange={handleEmpresaChange}
                                    />
                                </div>
                            </div>

                            <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <h3 style={{ fontSize: '1rem', marginBottom: '0.25rem' }}>Modo Oscuro (Beta)</h3>
                                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Cambia la apariencia del sistema a tonos oscuros.</p>
                                </div>
                                <div
                                    onClick={toggleDarkMode}
                                    style={{
                                        width: '50px',
                                        height: '26px',
                                        background: settings.preferencias.modoOscuro ? 'var(--primary)' : '#cbd5e1',
                                        borderRadius: '13px',
                                        position: 'relative',
                                        cursor: 'pointer',
                                        transition: '0.3s'
                                    }}
                                >
                                    <div style={{
                                        width: '20px',
                                        height: '20px',
                                        background: 'white',
                                        borderRadius: '50%',
                                        position: 'absolute',
                                        top: '3px',
                                        left: settings.preferencias.modoOscuro ? '27px' : '3px',
                                        transition: '0.3s',
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                    }}></div>
                                </div>
                            </div>
                        </>
                    )}

                    {activeTab === 'moneda' && (
                        <>
                            <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <DollarSign size={20} color="var(--primary)" /> Gestión de Divisas
                            </h2>
                            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Configure las tasas de cambio para transacciones multimoneda.</p>

                            <div style={{ display: 'grid', gap: '1.5rem' }}>
                                {monedas.map(moneda => (
                                    <div key={moneda.id} className="glass" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid var(--border)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                                                {moneda.codigo === 'USD' ? '$' : moneda.codigo === 'EUR' ? '€' : 'RD$'}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 600 }}>{moneda.nombre} ({moneda.simbolo})</div>
                                                <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{moneda.esBase ? 'Moneda Base del Sistema' : `1 ${moneda.codigo} = RD$ ${moneda.tasa}`}</div>
                                            </div>
                                        </div>
                                        {!moneda.esBase && (
                                            <div className="input-group" style={{ marginBottom: 0, width: '150px' }}>
                                                <label className="input-label">Tasa de Cambio</label>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    className="input-field"
                                                    value={moneda.tasa}
                                                    onChange={(e) => updateTasa(moneda.id, e.target.value)}
                                                />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </>
                    )}

                    {activeTab === 'seguridad' && user.role === 'admin' && (
                        <>
                            <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Shield size={20} color="var(--primary)" /> Accesos y Roles
                            </h2>
                            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Administre los usuarios que tienen acceso a la plataforma.</p>

                            <form onSubmit={handleAddUser} style={{ background: 'var(--background)', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem', border: '1px solid var(--border)' }}>
                                <h4>Agregar Usuario</h4>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
                                    <div>
                                        <label className="input-label">Nombre Completo</label>
                                        <input type="text" className="input-field" required value={newUser.nombre} onChange={e => setNewUser({ ...newUser, nombre: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="input-label">Correo Electrónico</label>
                                        <input type="email" className="input-field" required value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="input-label">Contraseña</label>
                                        <input type="password" className="input-field" required minLength={6} value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="input-label">Rol del Sistema</label>
                                        <select className="input-field" value={newUser.role} onChange={e => setNewUser({ ...newUser, role: e.target.value })}>
                                            <option value="admin">Administrador (Total)</option>
                                            <option value="contador">Contador (Módulos contables)</option>
                                            <option value="auditor">Auditor (Solo lectura y Auditoría)</option>
                                            <option value="cajero">Cajero (Solo Facturación/Caja)</option>
                                            <option value="auxiliar">Auxiliar (Limitado)</option>
                                        </select>
                                    </div>
                                </div>
                                <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <UserPlus size={16} /> Crear Cuenta
                                </button>
                            </form>

                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                <thead>
                                    <tr style={{ background: 'var(--background)' }}>
                                        <th style={{ padding: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>USUARIO</th>
                                        <th style={{ padding: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>ROL</th>
                                        <th style={{ padding: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>ÚLTIMO ACCESO</th>
                                        <th style={{ padding: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'right' }}>ACCIONES</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loadingUsers ? (
                                        <tr><td colSpan={4} style={{ padding: '2rem', textAlign: 'center' }}>Cargando...</td></tr>
                                    ) : (
                                        usuarios.map(u => (
                                            <tr key={u.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                                <td style={{ padding: '1rem' }}>
                                                    <strong>{u.nombre}</strong><br />
                                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{u.email}</span>
                                                </td>
                                                <td style={{ padding: '1rem', textTransform: 'capitalize' }}>{u.role}</td>
                                                <td style={{ padding: '1rem', fontSize: '0.8rem' }}>
                                                    {u.ultimo_acceso ? new Date(u.ultimo_acceso).toLocaleString() : 'Nunca'}
                                                </td>
                                                <td style={{ padding: '1rem', textAlign: 'right' }}>
                                                    <button onClick={() => handleDeleteUser(u.id)} className="btn" style={{ padding: '0.5rem', color: 'var(--danger)', background: 'transparent', border: 'none' }} disabled={u.id === user.id}>
                                                        <Trash2 size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </>
                    )}

                    {activeTab === 'perfil' && (
                        <div className="animate-fade-in">
                            <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Fingerprint size={20} color="var(--primary)" /> Mi Perfil y Seguridad
                            </h2>
                            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Ajustes exclusivos para su cuenta conectada ({user?.email}).</p>

                            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(200px, 1fr) 2fr', gap: '2rem' }}>
                                
                                <div className="card glass" style={{ padding: '1.5rem', border: '1px solid var(--border)', textAlign: 'center' }}>
                                    <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--accent, #8b5cf6))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '2rem', fontWeight: 800, margin: '0 auto 1rem', boxShadow: '0 10px 20px rgba(37,99,235,0.2)' }}>
                                        {user?.nombre?.charAt(0) || 'U'}
                                    </div>
                                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>{user?.nombre}</h3>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '0.25rem 0 1rem 0' }}>{user?.email}</p>
                                    <span className="badge" style={{ background: 'var(--primary-light)', color: 'var(--primary)', fontWeight: 700, textTransform: 'capitalize' }}>
                                        Rol: {user?.role || 'Usuario'}
                                    </span>
                                </div>

                                <div className="card" style={{ padding: '1.5rem', border: '1px solid var(--border)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                                        <div>
                                            <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.05rem', margin: '0 0 0.5rem' }}>
                                                {is2FAEnabled ? <BadgeCheck size={18} color="var(--success)" /> : <ShieldAlert size={18} color="var(--warning)" />}
                                                Autenticación de 2 Pasos (2FA)
                                            </h4>
                                            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Capa adicional de seguridad usando una app como Google Authenticator o Authy.</p>
                                        </div>
                                        <div 
                                            onClick={() => {
                                                if(is2FAEnabled) {
                                                    setIs2FAEnabled(false);
                                                    localStorage.removeItem('iubel_2fa_enabled');
                                                    alert("Autenticación 2FA ha sido desactivada.");
                                                } else {
                                                    setSetup2FA(true);
                                                }
                                            }}
                                            style={{
                                                width: '50px', height: '26px', borderRadius: '13px', position: 'relative', cursor: 'pointer', transition: '0.3s',
                                                background: is2FAEnabled ? 'var(--success)' : '#cbd5e1'
                                            }}
                                        >
                                            <div style={{
                                                width: '20px', height: '20px', background: 'white', borderRadius: '50%', position: 'absolute', top: '3px', transition: '0.3s', boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                                left: is2FAEnabled ? '27px' : '3px'
                                            }}></div>
                                        </div>
                                    </div>

                                    {setup2FA && !is2FAEnabled && (
                                        <div className="animate-fade-in" style={{ padding: '1.5rem', background: 'var(--background)', borderRadius: '12px', border: '1px dashed var(--border)' }}>
                                            <ol style={{ fontSize: '0.85rem', margin: '0 0 1.5rem', paddingLeft: '1.2rem', color: 'var(--text-main)', lineHeight: 1.6 }}>
                                                <li>Instale Google Authenticator o Authy en su móvil.</li>
                                                <li>Escanee este código QR (Simulado para entorno local).</li>
                                                <li>Ingrese el código de prueba <strong style={{color:'var(--primary)'}}>123456</strong> para confirmar.</li>
                                            </ol>
                                            
                                            <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                                                <div style={{ width: 120, height: 120, background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px', border: '4px solid white', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                                                    {/* Simulating QR Code */}
                                                    <div style={{ width: '100%', height: '100%', background: 'conic-gradient(from 90deg, #000 25%, #fff 25%, #fff 50%, #000 50%, #000 75%, #fff 75%, #fff)', backgroundSize: '10px 10px', opacity: 0.8 }}></div>
                                                </div>
                                                <div style={{ flex: 1 }}>
                                                    <label className="input-label">Código de la Aplicación</label>
                                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                        <input type="text" maxLength={6} className="input-field" placeholder="000000" style={{ letterSpacing: '0.2em', fontWeight: 700 }} value={testCode} onChange={e => setTestCode(e.target.value.replace(/\D/g, ''))} />
                                                        <button 
                                                            className="btn btn-primary" 
                                                            disabled={testCode.length < 6 || qrCodeValidating}
                                                            onClick={() => {
                                                                setQrCodeValidating(true);
                                                                setTimeout(() => {
                                                                    if (testCode === '123456') {
                                                                        setIs2FAEnabled(true);
                                                                        localStorage.setItem('iubel_2fa_enabled', 'true');
                                                                        setSetup2FA(false);
                                                                        setTestCode('');
                                                                    } else {
                                                                        alert("Código incorrecto, el test es 123456");
                                                                    }
                                                                    setQrCodeValidating(false);
                                                                }, 800);
                                                            }}
                                                        >
                                                            {qrCodeValidating ? 'Validando...' : 'Activar'}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'apikeys' && user.role === 'admin' && (
                        <div className="animate-fade-in">
                            <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Code size={20} color="var(--primary)" /> Ecosistema de Integración API
                            </h2>
                            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Genera tokens de acceso para conectar Iubel ERP con aplicaciones externas (tiendas online, CRMs, etc).</p>

                            {generatedKey && (
                                <div className="animate-fade-in" style={{ padding: '1.5rem', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid var(--success)', borderRadius: '12px', marginBottom: '2rem' }}>
                                    <h4 style={{ color: 'var(--success)', margin: '0 0 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <BadgeCheck size={18} /> ¡API Key Generada con Éxito!
                                    </h4>
                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-main)', marginBottom: '1rem' }}>
                                        Por motivos de seguridad, <strong>esta es la única vez</strong> que podrá ver la clave completa. Cópiela y guárdela en un lugar seguro.
                                    </p>
                                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'stretch' }}>
                                        <code style={{ flex: 1, padding: '0.75rem 1rem', background: 'var(--background)', borderRadius: '8px', border: '1px dashed var(--border)', fontSize: '1.1rem', wordBreak: 'break-all' }}>
                                            {generatedKey}
                                        </code>
                                        <button 
                                            onClick={() => copyToClipboard(generatedKey)}
                                            className="btn" 
                                            style={{ background: copied ? 'var(--success)' : 'var(--primary)', color: 'white', border: 'none', padding: '0 1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                                        >
                                            {copied ? <><Check size={16} /> Copiado</> : <><Copy size={16} /> Copiar</>}
                                        </button>
                                    </div>
                                    <button className="btn btn-secondary" style={{ marginTop: '1rem', width: '100%' }} onClick={() => setGeneratedKey(null)}>
                                        Ya la he guardado
                                    </button>
                                </div>
                            )}

                            {!generatedKey && (
                            <form onSubmit={handleGenerateApiKey} style={{ background: 'var(--background)', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem', border: '1px solid var(--border)' }}>
                                <h4>Nueva Clave de API</h4>
                                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', alignItems: 'flex-end' }}>
                                    <div style={{ flex: 1 }}>
                                        <label className="input-label">Identificador / Nombre de la Aplicación</label>
                                        <input 
                                            type="text" 
                                            className="input-field" 
                                            placeholder="Ej. WooCommerce Store Principal"
                                            required 
                                            value={newKeyName} 
                                            onChange={e => setNewKeyName(e.target.value)} 
                                        />
                                    </div>
                                    <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <Key size={16} /> Generar Key
                                    </button>
                                </div>
                            </form>
                            )}

                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                <thead>
                                    <tr style={{ background: 'var(--background)' }}>
                                        <th style={{ padding: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>NOMBRE / APLICACIÓN</th>
                                        <th style={{ padding: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>CLAVE</th>
                                        <th style={{ padding: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>CREACIÓN</th>
                                        <th style={{ padding: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>ÚLTIMO USO</th>
                                        <th style={{ padding: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'right' }}>ACCIONES</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {apiKeys.length === 0 ? (
                                        <tr><td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No hay claves API generadas.</td></tr>
                                    ) : (
                                        apiKeys.map(k => (
                                            <tr key={k.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                                <td style={{ padding: '1rem', fontWeight: 600 }}>{k.name}</td>
                                                <td style={{ padding: '1rem' }}><code style={{ background: 'var(--background)', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.85rem' }}>{k.keyPreview}</code></td>
                                                <td style={{ padding: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                                    {new Date(k.createdAt).toLocaleDateString()}
                                                </td>
                                                <td style={{ padding: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                                    {k.lastUsed ? new Date(k.lastUsed).toLocaleDateString() : 'Nunca'}
                                                </td>
                                                <td style={{ padding: '1rem', textAlign: 'right' }}>
                                                    <button onClick={() => handleDeleteApiKey(k.id)} className="btn" style={{ padding: '0.5rem', color: 'var(--danger)', background: 'transparent', border: 'none' }} title="Revocar Key">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {activeTab === 'backups' && user.role === 'admin' && (
                        <div className="animate-fade-in">
                            <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Database size={20} color="var(--primary)" /> Centro de Backups Empresarial
                            </h2>
                            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Asegure la continuidad de su negocio descargando copias locales de todas sus transacciones, registros y configuraciones.</p>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                                <div className="card glass layout-card" style={{ padding: '1.5rem', textAlign: 'center' }}>
                                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.5rem', color: 'var(--primary)' }}>
                                        <Clock size={24} />
                                    </div>
                                    <div style={{ fontSize: '1.25rem', fontWeight: 600 }}>{backups.length ? new Date(backups[0].date).toLocaleDateString() : 'Nunca'}</div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Último Respaldo</div>
                                </div>
                                <div className="card glass layout-card" style={{ padding: '1.5rem', textAlign: 'center' }}>
                                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.5rem', color: 'var(--primary)' }}>
                                        <HardDrive size={24} />
                                    </div>
                                    <div style={{ fontSize: '1.25rem', fontWeight: 600 }}>{backups.length ? backups[0].size : '0 MB'}</div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Tamaño BD</div>
                                </div>
                                <div className="card glass layout-card" style={{ padding: '1.5rem', textAlign: 'center' }}>
                                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.5rem', color: 'var(--success)' }}>
                                        <ShieldCheck size={24} />
                                    </div>
                                    <div style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--success)' }}>Óptimo</div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Estado Salud</div>
                                </div>
                            </div>

                            <div style={{ background: 'var(--background)', padding: '2rem', borderRadius: '12px', textAlign: 'center', border: '1px dashed var(--primary)', marginBottom: '2rem', position: 'relative', overflow: 'hidden' }}>
                                {isBackingUp && (
                                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(255, 255, 255, 0.9)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
                                        <RefreshCw size={32} color="var(--primary)" className="spin" style={{ marginBottom: '1rem' }} />
                                        <h4 style={{ margin: 0 }}>Generando Respaldo Seguro</h4>
                                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{backupStatusText}</p>
                                    </div>
                                )}
                                
                                <Database size={48} color="var(--primary)" style={{ opacity: 0.2, margin: '0 auto 1rem' }} />
                                <h3 style={{ margin: '0 0 0.5rem' }}>Respaldo Manual en la Nube</h3>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '400px', margin: '0 auto 1.5rem' }}>Crea un archivo ZIP cifrado al instante conteniendo toda la metadata, perfiles, transacciones y configuraciones de la empresa.</p>
                                <button 
                                    className="btn btn-primary" 
                                    style={{ padding: '0.75rem 2rem', fontSize: '1.05rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 6px rgba(37, 99, 235, 0.2)' }}
                                    onClick={handleGenerateBackup}
                                    disabled={isBackingUp}
                                >
                                    <DownloadCloud size={20} /> Generar Copia de Seguridad
                                </button>
                            </div>

                            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>Punto de Restauración Histórico</h3>
                            
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                <thead>
                                    <tr style={{ background: 'var(--background)' }}>
                                        <th style={{ padding: '0.75rem 1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>FECHA DE OCURRENCIA</th>
                                        <th style={{ padding: '0.75rem 1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>ORIGEN</th>
                                        <th style={{ padding: '0.75rem 1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>TAMAÑO</th>
                                        <th style={{ padding: '0.75rem 1rem', fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'right' }}>ACCIONES</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {backups.length === 0 ? (
                                        <tr><td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No hay históricos de respaldo.</td></tr>
                                    ) : (
                                        backups.map(b => (
                                            <tr key={b.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                                <td style={{ padding: '1rem', fontWeight: 500 }}>
                                                    {new Date(b.date).toLocaleDateString()} <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginLeft: '0.5rem' }}>{new Date(b.date).toLocaleTimeString()}</span>
                                                </td>
                                                <td style={{ padding: '1rem' }}>
                                                    <span className="badge" style={{ background: b.type === 'Automático' ? 'var(--background)' : 'rgba(37,99,235,0.1)', color: b.type === 'Automático' ? 'var(--text-muted)' : 'var(--primary)' }}>
                                                        {b.type}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '1rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>{b.size}</td>
                                                <td style={{ padding: '1rem', textAlign: 'right' }}>
                                                    <button onClick={() => handleDownloadBackupFile(b)} className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                                                        <DownloadCloud size={14} /> Bajar File
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {activeTab !== 'seguridad' && activeTab !== 'perfil' && activeTab !== 'apikeys' && activeTab !== 'backups' && (
                        <div style={{ marginTop: '3rem', display: 'flex', justifyContent: 'flex-end' }}>
                            <button className="btn btn-primary" style={{ padding: '0.75rem 2rem' }}>
                                Guardar Configuración
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Settings;
