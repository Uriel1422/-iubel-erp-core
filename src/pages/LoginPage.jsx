import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Building2, Mail, Lock, LogIn, AlertCircle, ArrowLeft, KeyRound, ShieldCheck } from 'lucide-react';

const LoginPage = () => {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [form, setForm] = useState({ empresa: '', email: '', password: '' });
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [view, setView] = useState('login'); // 'login' | 'forgot' | '2fa'
    const [pendingAuth, setPendingAuth] = useState(null); // stores {token, user, empresa} before 2fa
    const [twoFactorCode, setTwoFactorCode] = useState('');
    const [forgotEmail, setForgotEmail] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const data = await login(form.empresa, form.email, form.password);
            // Check if 2FA is required for demo purposes locally
            const is2FAEnabled = localStorage.getItem('iubel_2fa_enabled') === 'true';
            
            if (is2FAEnabled) {
                setPendingAuth(data.token);
                setView('2fa');
            } else {
                // Ya no necesitamos setItem aquí porque AuthContext.login ya lo hizo y actualizó el estado
                navigate('/erp');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handle2FASubmit = (e) => {
        e.preventDefault();
        setError('');
        if (twoFactorCode.length < 6) {
            setError('Código inválido. Ingrese 6 dígitos.');
            return;
        }
        setLoading(true);
        // Simulate validation delay
        setTimeout(() => {
            // Fixo code validation for demo:
            if (twoFactorCode !== '123456') {
                setError('Código incorrecto. El código de prueba es 123456.');
                setLoading(false);
                return;
            }
            // Success
            localStorage.setItem('iubel_token', pendingAuth);
            navigate('/erp');
        }, 1200);
    };

    const handleForgotSubmit = (e) => {
        e.preventDefault();
        if (!forgotEmail) return;
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            alert('¡Enlace de recuperación enviado! Verifique la bandeja de entrada de ' + forgotEmail);
            setView('login');
        }, 1500);
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #f0f4ff 0%, #ffffff 50%, #f5f3ff 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '2rem', fontFamily: "'Outfit', 'Inter', -apple-system, sans-serif"
        }}>
            {/* Background decoration */}
            <div style={{
                position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0
            }}>
                {[...Array(3)].map((_, i) => (
                    <div key={i} style={{
                        position: 'absolute',
                        borderRadius: '50%',
                        background: `rgba(99, 102, 241, ${0.08 + i * 0.04})`,
                        width: `${400 + i * 200}px`,
                        height: `${400 + i * 200}px`,
                        top: `${-50 + i * 30}%`,
                        left: `${-20 + i * 40}%`,
                        filter: 'blur(80px)',
                        animation: `spin ${30 + i * 10}s linear infinite`
                    }} />
                ))}
            </div>

            <div style={{ width: '100%', maxWidth: '420px', position: 'relative', zIndex: 1 }}>
                {/* Logo */}
                <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                    <div style={{
                        width: '64px', height: '64px', borderRadius: '18px',
                        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 1rem', fontSize: '1.75rem', fontWeight: 900,
                        color: 'white', boxShadow: '0 20px 40px rgba(99,102,241,0.3)'
                    }}>I</div>
                    <h1 style={{ color: '#0f172a', fontSize: '1.75rem', fontWeight: 800, margin: 0 }}>
                        <span>Iubel </span><span style={{ color: '#6366f1' }}>ERP</span>
                    </h1>
                    <p style={{ color: '#64748b', marginTop: '0.5rem', fontSize: '0.9rem', fontWeight: 500 }}>
                        <span>Sistema Contable Multiempresa</span>
                    </p>
                </div>

                {/* Card */}
                <div style={{
                    background: 'rgba(255, 255, 255, 0.85)',
                    border: '1px solid rgba(255, 255, 255, 1)',
                    borderRadius: '24px',
                    padding: '2.5rem',
                    backdropFilter: 'blur(20px)',
                    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.1), 0 0 40px rgba(99, 102, 241, 0.1)'
                }}>
                    <h2 style={{ color: '#1e293b', fontSize: '1.2rem', fontWeight: 700, marginBottom: '1.75rem', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem' }}>
                        {view === 'login' ? <span>Iniciar Sesión</span> : view === 'forgot' ? <><KeyRound size={20} className="text-primary"/><span>Recuperar Acceso</span></> : <><ShieldCheck size={20} className="text-primary"/><span>Verificación de 2 Pasos</span></>}
                    </h2>

                    {error && (
                        <div className="animate-fade-in" style={{
                            background: '#fef2f2', border: '1px solid #fecaca',
                            borderRadius: '12px', padding: '0.875rem 1rem',
                            display: 'flex', alignItems: 'center', gap: '0.6rem',
                            marginBottom: '1.5rem', color: '#dc2626', fontSize: '0.875rem', fontWeight: 500
                        }}>
                            <AlertCircle size={18} style={{ flexShrink: 0 }} />
                            <span>{error}</span>
                        </div>
                    )}

                    {view === 'login' && (
                    <form onSubmit={handleSubmit} className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        {/* Empresa */}
                        <div>
                            <label style={{ display: 'block', color: '#475569', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                                Nombre de la Empresa
                            </label>
                            <div style={{ position: 'relative' }}>
                                <Building2 size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                <input
                                    type="text"
                                    placeholder="Mi Empresa S.R.L."
                                    value={form.empresa}
                                    onChange={e => setForm({ ...form, empresa: e.target.value })}
                                    required
                                    style={{
                                        width: '100%', padding: '0.875rem 1rem 0.875rem 2.75rem',
                                        background: '#f8fafc',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '12px', color: '#0f172a', fontSize: '0.95rem',
                                        fontWeight: 500, outline: 'none', boxSizing: 'border-box',
                                        transition: 'all 0.2s', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)'
                                    }}
                                    onFocus={e => { e.target.style.borderColor = '#6366f1'; e.target.style.backgroundColor = '#eff6ff'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.1)'; }}
                                    onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.backgroundColor = '#f8fafc'; e.target.style.boxShadow = 'inset 0 2px 4px rgba(0,0,0,0.02)'; }}
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div>
                            <label style={{ display: 'block', color: '#475569', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                                Usuario (Email)
                            </label>
                            <div style={{ position: 'relative' }}>
                                <Mail size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                <input
                                    type="email"
                                    placeholder="admin@empresa.com"
                                    value={form.email}
                                    onChange={e => setForm({ ...form, email: e.target.value })}
                                    required
                                    style={{
                                        width: '100%', padding: '0.875rem 1rem 0.875rem 2.75rem',
                                        background: '#f8fafc',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '12px', color: '#0f172a', fontSize: '0.95rem',
                                        fontWeight: 500, outline: 'none', boxSizing: 'border-box',
                                        transition: 'all 0.2s', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)'
                                    }}
                                    onFocus={e => { e.target.style.borderColor = '#6366f1'; e.target.style.backgroundColor = '#eff6ff'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.1)'; }}
                                    onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.backgroundColor = '#f8fafc'; e.target.style.boxShadow = 'inset 0 2px 4px rgba(0,0,0,0.02)'; }}
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label style={{ display: 'block', color: '#475569', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                                Contraseña
                            </label>
                            <div style={{ position: 'relative' }}>
                                <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                <input
                                    type={showPass ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    value={form.password}
                                    onChange={e => setForm({ ...form, password: e.target.value })}
                                    required
                                    style={{
                                        width: '100%', padding: '0.875rem 3rem 0.875rem 2.75rem',
                                        background: '#f8fafc',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '12px', color: '#0f172a', fontSize: '0.95rem',
                                        fontWeight: 500, outline: 'none', boxSizing: 'border-box',
                                        transition: 'all 0.2s', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)'
                                    }}
                                    onFocus={e => { e.target.style.borderColor = '#6366f1'; e.target.style.backgroundColor = '#eff6ff'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.1)'; }}
                                    onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.backgroundColor = '#f8fafc'; e.target.style.boxShadow = 'inset 0 2px 4px rgba(0,0,0,0.02)'; }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPass(!showPass)}
                                    style={{
                                        position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)',
                                        background: 'none', border: 'none', cursor: 'pointer',
                                        color: '#94a3b8', padding: 0, outline: 'none'
                                    }}
                                >
                                    {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <div style={{ textAlign: 'right', marginTop: '-0.5rem' }}>
                            <button type="button" onClick={() => { setView('forgot'); setError(''); }} style={{ background: 'none', border: 'none', color: '#6366f1', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', padding: 0 }}>
                                ¿Olvidaste tu contraseña?
                            </button>
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn btn-primary"
                            style={{
                                width: '100%', padding: '0.875rem',
                                background: loading ? '#94a3b8' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                border: 'none', borderRadius: '12px',
                                color: 'white', fontWeight: 700, fontSize: '1rem',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem',
                                boxShadow: '0 8px 25px rgba(99,102,241,0.35)',
                                transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)', 
                                marginTop: '0.5rem',
                                transform: loading ? 'scale(0.98)' : 'scale(1)'
                            }}
                        >
                            {loading ? (
                                <React.Fragment>
                                    <div style={{ width: '18px', height: '18px', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', animation: 'spin 0.7s linear infinite' }} />
                                    <span>Verificando...</span>
                                </React.Fragment>
                            ) : (
                                <React.Fragment><LogIn size={20} /> <span>Ingresar al Sistema</span></React.Fragment>
                            )}
                        </button>
                    </form>
                    )}

                    {view === 'forgot' && (
                        <form onSubmit={handleForgotSubmit} className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '0.5rem', textAlign: 'center', fontWeight: 500 }}>
                                Ingresa tu correo electrónico y te enviaremos un enlace seguro para restablecer tu contraseña.
                            </p>
                            <div>
                                <label style={{ display: 'block', color: '#475569', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                                    Correo Electrónico
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <Mail size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                    <input
                                        type="email"
                                        placeholder="admin@empresa.com"
                                        value={forgotEmail}
                                        onChange={e => setForgotEmail(e.target.value)}
                                        required
                                        style={{
                                            width: '100%', padding: '0.875rem 1rem 0.875rem 2.75rem',
                                            background: '#f8fafc',
                                            border: '1px solid #e2e8f0',
                                            borderRadius: '12px', color: '#0f172a', fontSize: '0.95rem',
                                            fontWeight: 500, outline: 'none', boxSizing: 'border-box',
                                            transition: 'all 0.2s', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)'
                                        }}
                                        onFocus={e => { e.target.style.borderColor = '#6366f1'; e.target.style.backgroundColor = '#eff6ff'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.1)'; }}
                                        onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.backgroundColor = '#f8fafc'; e.target.style.boxShadow = 'inset 0 2px 4px rgba(0,0,0,0.02)'; }}
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={loading || !forgotEmail}
                                className="btn btn-primary"
                                style={{
                                    width: '100%', padding: '0.875rem',
                                    background: loading ? '#94a3b8' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                    border: 'none', borderRadius: '12px',
                                    color: 'white', fontWeight: 700, fontSize: '1rem',
                                    cursor: loading || !forgotEmail ? 'not-allowed' : 'pointer',
                                    transition: 'all 0.3s', marginTop: '0.5rem',
                                    boxShadow: '0 8px 25px rgba(99,102,241,0.35)'
                                }}
                            >
                                {loading ? 'Procesando...' : 'Enviar enlace seguro'}
                            </button>
                            <button type="button" onClick={() => setView('login')} style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', marginTop: '0.5rem' }}>
                                <ArrowLeft size={18} /> Volver al Login
                            </button>
                        </form>
                    )}

                    {view === '2fa' && (
                        <form onSubmit={handle2FASubmit} className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '0.5rem', textAlign: 'center', fontWeight: 500 }}>
                                Tu cuenta está protegida. Ingresa el código de 6 dígitos generado por tu aplicación autenticadora (ej. Google Authenticator).
                            </p>
                            <div>
                                <label style={{ display: 'block', color: '#475569', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                                    Código de Seguridad (2FA)
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <ShieldCheck size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#6366f1' }} />
                                    <input
                                        type="text"
                                        placeholder="123456"
                                        maxLength={6}
                                        value={twoFactorCode}
                                        onChange={e => setTwoFactorCode(e.target.value.replace(/\D/g, ''))} // only digits
                                        required
                                        style={{
                                            width: '100%', padding: '0.875rem 1rem 0.875rem 2.75rem',
                                            background: '#f8fafc',
                                            border: '2px solid #6366f1',
                                            borderRadius: '12px', color: '#4f46e5', fontSize: '1.75rem',
                                            fontWeight: 800, letterSpacing: '0.5em', textAlign: 'center',
                                            outline: 'none', boxSizing: 'border-box',
                                            boxShadow: '0 0 15px rgba(99,102,241,0.1)'
                                        }}
                                        onFocus={e => { e.target.style.borderColor = '#4f46e5'; e.target.style.backgroundColor = '#eff6ff'; }}
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={loading || twoFactorCode.length < 6}
                                className="btn btn-primary"
                                style={{
                                    width: '100%', padding: '0.875rem',
                                    background: loading || twoFactorCode.length < 6 ? '#94a3b8' : 'linear-gradient(135deg, #10b981, #059669)',
                                    border: 'none', borderRadius: '12px',
                                    color: 'white', fontWeight: 700, fontSize: '1rem',
                                    cursor: loading || twoFactorCode.length < 6 ? 'not-allowed' : 'pointer',
                                    transition: 'all 0.3s', marginTop: '0.5rem',
                                    boxShadow: '0 8px 25px rgba(16,185,129,0.35)'
                                }}
                            >
                                {loading ? 'Validando código...' : 'Verificar y Entrar'}
                            </button>
                            <button type="button" onClick={() => { setView('login'); setPendingAuth(null); setTwoFactorCode(''); }} style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', marginTop: '0.5rem' }}>
                                <ArrowLeft size={18} /> Cancelar y volver
                            </button>
                        </form>
                    )}

                    {view === 'login' && (
                    <div style={{ textAlign: 'center', marginTop: '1.75rem', paddingTop: '1.5rem', borderTop: '1px solid #e2e8f0' }}>
                        <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0, fontWeight: 500 }}>
                            ¿No tienes cuenta?{' '}
                            <Link to="/register" style={{ color: '#6366f1', fontWeight: 700, textDecoration: 'none' }}>
                                Registrar empresa
                            </Link>
                        </p>
                    </div>
                    )}
                </div>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } } input::placeholder { color: #94a3b8; font-weight: 400; }`}</style>
            </div>
        </div>
    );
};

export default LoginPage;
