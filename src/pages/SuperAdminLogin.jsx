import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSuperAdmin } from '../context/SuperAdminContext';
import { Shield, Lock, Mail, AlertCircle, ArrowRight } from 'lucide-react';

const SuperAdminLogin = () => {
    const { login } = useSuperAdmin();
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await login(email, password);
            navigate('/superadmin/dashboard');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a', padding: '1rem' }}>
            <div className="card" style={{ width: '100%', maxWidth: '420px', padding: '2.5rem', background: 'white', borderRadius: '16px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '64px', height: '64px', borderRadius: '16px', background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)', color: 'white', marginBottom: '1rem' }}>
                        <Shield size={32} />
                    </div>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}><span>Iubel ERP</span></h1>
                    <p style={{ color: '#64748b', fontSize: '0.9rem' }}><span>Portal de Administración Global (SaaS)</span></p>
                </div>

                {error && (
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', padding: '1rem', background: '#fef2f2', borderRadius: '8px', marginBottom: '1.5rem', color: '#b91c1c', border: '1px solid #fecaca' }}>
                        <AlertCircle size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
                        <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div className="input-group" style={{ marginBottom: 0 }}>
                        <label className="input-label" style={{ color: '#334155' }}>Correo Electrónico</label>
                        <div style={{ position: 'relative' }}>
                            <Mail size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                            <input
                                type="email"
                                className="input-field"
                                style={{ paddingLeft: '2.75rem', borderColor: '#cbd5e1' }}
                                placeholder="sysadmin@iubel.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="input-group" style={{ marginBottom: 0 }}>
                        <label className="input-label" style={{ color: '#334155' }}>Contraseña</label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                            <input
                                type="password"
                                className="input-field"
                                style={{ paddingLeft: '2.75rem', borderColor: '#cbd5e1' }}
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="btn"
                        disabled={loading}
                        style={{
                            marginTop: '0.5rem',
                            width: '100%',
                            padding: '0.875rem',
                            background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
                            color: 'white',
                            fontSize: '1rem',
                            fontWeight: 600,
                            border: 'none',
                            borderRadius: '8px',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            opacity: loading ? 0.7 : 1
                        }}
                    >
                        <span>{loading ? 'Autenticando...' : 'Acceder al Portal'}</span>
                        {!loading && <ArrowRight size={18} />}
                    </button>
                </form>
            </div>
            <div style={{ position: 'absolute', bottom: '2rem', color: '#475569', fontSize: '0.8rem', textAlign: 'center', width: '100%' }}>
                <span>&copy; </span><span>{new Date().getFullYear()}</span><span> Iubel Cloud Platform. Ámbito restringido.</span>
            </div>
        </div>
    );
};

export default SuperAdminLogin;
