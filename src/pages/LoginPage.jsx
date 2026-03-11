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
                localStorage.setItem('iubel_token', data.token);
                window.location.href = '/erp';
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
            window.location.href = '/erp';
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
            background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '2rem', fontFamily: "'Inter', -apple-system, sans-serif"
        }}>
            {/* Background decoration */}
            <div style={{
                position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0
            }}>
                {[...Array(3)].map((_, i) => (
                    <div key={i} style={{
                        position: 'absolute',
                        borderRadius: '50%',
                        background: `rgba(99, 102, 241, ${0.04 + i * 0.02})`,
                        width: `${400 + i * 200}px`,
                        height: `${400 + i * 200}px`,
                        top: `${-50 + i * 30}%`,
                        left: `${-20 + i * 40}%`,
                        filter: 'blur(60px)',
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
                        color: 'white', boxShadow: '0 20px 40px rgba(99,102,241,0.4)'
                    }}>I</div>
                    <h1 style={{ color: 'white', fontSize: '1.75rem', fontWeight: 800, margin: 0 }}>
                        <span>Iubel </span><span style={{ color: '#a78bfa' }}>ERP</span>
                    </h1>
                    <p style={{ color: 'rgba(255,255,255,0.5)', marginTop: '0.5rem', fontSize: '0.9rem' }}>
                        <span>Sistema Contable Multiempresa</span>
                    </p>
                </div>

                {/* Card */}
                <div style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '20px',
                    padding: '2.5rem',
                    backdropFilter: 'blur(20px)',
                    boxShadow: '0 25px 60px rgba(0,0,0,0.5)'
                }}>
                    <h2 style={{ color: 'white', fontSize: '1.2rem', fontWeight: 700, marginBottom: '1.75rem', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                        {view === 'login' ? <span>Iniciar Sesión</span> : view === 'forgot' ? <><KeyRound size={20} className="text-primary"/><span>Recuperar Acceso</span></> : <><ShieldCheck size={20} className="text-primary"/><span>Verificación de 2 Pasos</span></>}
                    </h2>

                    {error && (
                        <div className="animate-fade-in" style={{
                            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                            borderRadius: '10px', padding: '0.75rem 1rem',
                            display: 'flex', alignItems: 'center', gap: '0.6rem',
                            marginBottom: '1.5rem', color: '#fca5a5', fontSize: '0.875rem'
                        }}>
                            <AlertCircle size={16} style={{ flexShrink: 0 }} />
                            <span>{error}</span>
                        </div>
                    )}

                    {view === 'login' && (
                    <form onSubmit={handleSubmit} className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        {/* Empresa */}
                        <div>
                            <label style={{ display: 'block', color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                                Nombre de la Empresa
                            </label>
                            <div style={{ position: 'relative' }}>
                                <Building2 size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }} />
                                <input
                                    type="text"
                                    placeholder="Mi Empresa S.R.L."
                                    value={form.empresa}
                                    onChange={e => setForm({ ...form, empresa: e.target.value })}
                                    required
                                    style={{
                                        width: '100%', padding: '0.75rem 1rem 0.75rem 2.75rem',
                                        background: 'rgba(255,255,255,0.06)',
                                        border: '1px solid rgba(255,255,255,0.12)',
                                        borderRadius: '10px', color: 'white', fontSize: '0.9rem',
                                        outline: 'none', boxSizing: 'border-box',
                                        transition: 'border-color 0.2s'
                                    }}
                                    onFocus={e => e.target.style.borderColor = 'rgba(99,102,241,0.7)'}
                                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'}
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div>
                            <label style={{ display: 'block', color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                                Usuario (Email)
                            </label>
                            <div style={{ position: 'relative' }}>
                                <Mail size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }} />
                                <input
                                    type="email"
                                    placeholder="admin@empresa.com"
                                    value={form.email}
                                    onChange={e => setForm({ ...form, email: e.target.value })}
                                    required
                                    style={{
                                        width: '100%', padding: '0.75rem 1rem 0.75rem 2.75rem',
                                        background: 'rgba(255,255,255,0.06)',
                                        border: '1px solid rgba(255,255,255,0.12)',
                                        borderRadius: '10px', color: 'white', fontSize: '0.9rem',
                                        outline: 'none', boxSizing: 'border-box'
                                    }}
                                    onFocus={e => e.target.style.borderColor = 'rgba(99,102,241,0.7)'}
                                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'}
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label style={{ display: 'block', color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                                Contraseña
                            </label>
                            <div style={{ position: 'relative' }}>
                                <Lock size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }} />
                                <input
                                    type={showPass ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    value={form.password}
                                    onChange={e => setForm({ ...form, password: e.target.value })}
                                    required
                                    style={{
                                        width: '100%', padding: '0.75rem 3rem 0.75rem 2.75rem',
                                        background: 'rgba(255,255,255,0.06)',
                                        border: '1px solid rgba(255,255,255,0.12)',
                                        borderRadius: '10px', color: 'white', fontSize: '0.9rem',
                                        outline: 'none', boxSizing: 'border-box'
                                    }}
                                    onFocus={e => e.target.style.borderColor = 'rgba(99,102,241,0.7)'}
                                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPass(!showPass)}
                                    style={{
                                        position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)',
                                        background: 'none', border: 'none', cursor: 'pointer',
                                        color: 'rgba(255,255,255,0.4)', padding: 0
                                    }}
                                >
                                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        <div style={{ textAlign: 'right', marginTop: '-0.5rem' }}>
                            <button type="button" onClick={() => { setView('forgot'); setError(''); }} style={{ background: 'none', border: 'none', color: '#a78bfa', fontSize: '0.8rem', fontWeight: 500, cursor: 'pointer', padding: 0 }}>
                                ¿Olvidaste tu contraseña?
                            </button>
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn btn-primary"
                            style={{
                                width: '100%', padding: '0.875rem',
                                background: loading ? 'rgba(99,102,241,0.5)' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                border: 'none', borderRadius: '10px',
                                color: 'white', fontWeight: 700, fontSize: '0.95rem',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                                boxShadow: '0 8px 25px rgba(99,102,241,0.35)',
                                transition: 'all 0.2s', marginTop: '0.5rem'
                            }}
                        >
                            {loading ? (
                                <React.Fragment>
                                    <div style={{ width: '16px', height: '16px', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', animation: 'spin 0.7s linear infinite' }} />
                                    <span>Verificando...</span>
                                </React.Fragment>
                            ) : (
                                <React.Fragment><LogIn size={18} /> <span>Ingresar al Sistema</span></React.Fragment>
                            )}
                        </button>
                    </form>
                    )}

                    {view === 'forgot' && (
                        <form onSubmit={handleForgotSubmit} className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', marginBottom: '0.5rem', textAlign: 'center' }}>
                                Ingresa tu correo electrónico y te enviaremos un enlace seguro para restablecer tu contraseña.
                            </p>
                            <div>
                                <label style={{ display: 'block', color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                                    Correo Electrónico
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <Mail size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }} />
                                    <input
                                        type="email"
                                        placeholder="admin@empresa.com"
                                        value={forgotEmail}
                                        onChange={e => setForgotEmail(e.target.value)}
                                        required
                                        style={{
                                            width: '100%', padding: '0.75rem 1rem 0.75rem 2.75rem',
                                            background: 'rgba(255,255,255,0.06)',
                                            border: '1px solid rgba(255,255,255,0.12)',
                                            borderRadius: '10px', color: 'white', fontSize: '0.9rem',
                                            outline: 'none', boxSizing: 'border-box'
                                        }}
                                        onFocus={e => e.target.style.borderColor = 'rgba(99,102,241,0.7)'}
                                        onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'}
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={loading || !forgotEmail}
                                className="btn btn-primary"
                                style={{
                                    width: '100%', padding: '0.875rem',
                                    background: loading ? 'rgba(99,102,241,0.5)' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                    border: 'none', borderRadius: '10px',
                                    color: 'white', fontWeight: 700, fontSize: '0.95rem',
                                    cursor: loading || !forgotEmail ? 'not-allowed' : 'pointer',
                                    transition: 'all 0.2s', marginTop: '0.5rem'
                                }}
                            >
                                {loading ? 'Procesando...' : 'Enviar enlace seguro'}
                            </button>
                            <button type="button" onClick={() => setView('login')} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', marginTop: '0.5rem' }}>
                                <ArrowLeft size={16} /> Volver al Login
                            </button>
                        </form>
                    )}

                    {view === '2fa' && (
                        <form onSubmit={handle2FASubmit} className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', marginBottom: '0.5rem', textAlign: 'center' }}>
                                Tu cuenta está protegida. Ingresa el código de 6 dígitos generado por tu aplicación autenticadora (ej. Google Authenticator).
                            </p>
                            <div>
                                <label style={{ display: 'block', color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                                    Código de Seguridad (2FA)
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <ShieldCheck size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }} />
                                    <input
                                        type="text"
                                        placeholder="123456"
                                        maxLength={6}
                                        value={twoFactorCode}
                                        onChange={e => setTwoFactorCode(e.target.value.replace(/\D/g, ''))} // only digits
                                        required
                                        style={{
                                            width: '100%', padding: '0.75rem 1rem 0.75rem 2.75rem',
                                            background: 'rgba(255,255,255,0.06)',
                                            border: '2px solid rgba(99,102,241,0.5)',
                                            borderRadius: '10px', color: 'var(--primary-light)', fontSize: '1.5rem',
                                            fontWeight: 700, letterSpacing: '0.5em', textAlign: 'center',
                                            outline: 'none', boxSizing: 'border-box'
                                        }}
                                        onFocus={e => e.target.style.borderColor = 'rgba(99,102,241,0.8)'}
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={loading || twoFactorCode.length < 6}
                                className="btn btn-primary"
                                style={{
                                    width: '100%', padding: '0.875rem',
                                    background: loading || twoFactorCode.length < 6 ? 'rgba(99,102,241,0.5)' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                    border: 'none', borderRadius: '10px',
                                    color: 'white', fontWeight: 700, fontSize: '0.95rem',
                                    cursor: loading || twoFactorCode.length < 6 ? 'not-allowed' : 'pointer',
                                    transition: 'all 0.2s', marginTop: '0.5rem'
                                }}
                            >
                                {loading ? 'Validando código...' : 'Verificar y Entrar'}
                            </button>
                            <button type="button" onClick={() => { setView('login'); setPendingAuth(null); setTwoFactorCode(''); }} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', marginTop: '0.5rem' }}>
                                <ArrowLeft size={16} /> Cancelar y volver
                            </button>
                        </form>
                    )}

                    {view === 'login' && (
                    <div style={{ textAlign: 'center', marginTop: '1.75rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', margin: 0 }}>
                            ¿No tienes cuenta?{' '}
                            <Link to="/register" style={{ color: '#a78bfa', fontWeight: 600, textDecoration: 'none' }}>
                                Registrar empresa
                            </Link>
                        </p>
                    </div>
                    )}
                </div>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } } input::placeholder { color: rgba(255,255,255,0.25); }`}</style>
            </div>
        </div>
    );
};

export default LoginPage;
