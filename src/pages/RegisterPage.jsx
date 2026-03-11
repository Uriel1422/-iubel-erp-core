import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    Building2, Hash, MapPin, Phone, Mail, User, Lock, Eye, EyeOff,
    ArrowRight, ArrowLeft, CheckCircle2, AlertCircle
} from 'lucide-react';

const Field = ({ label, icon: Icon, type = 'text', value, onChange, placeholder, required, toggle, onToggle, showValue }) => (
    <div>
        <label style={{ display: 'block', color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.5rem' }}>
            {label} {required && <span style={{ color: '#f87171' }}>*</span>}
        </label>
        <div style={{ position: 'relative' }}>
            {Icon && <Icon size={15} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }} />}
            <input
                type={toggle ? (showValue ? 'text' : 'password') : type}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                required={required}
                style={{
                    width: '100%', padding: `0.75rem ${toggle ? '3rem' : '1rem'} 0.75rem ${Icon ? '2.75rem' : '1rem'}`,
                    background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: '10px', color: 'white', fontSize: '0.875rem',
                    outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s'
                }}
                onFocus={e => e.target.style.borderColor = 'rgba(99,102,241,0.7)'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'}
            />
            {toggle && (
                <button type="button" onClick={onToggle} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', padding: 0 }}>
                    {showValue ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
            )}
        </div>
    </div>
);

const RegisterPage = () => {
    const navigate = useNavigate();
    const { register } = useAuth();

    const [step, setStep] = useState(1);
    const [showPass, setShowPass] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const [form, setForm] = useState({
        empresa: '', rnc: '', direccion: '', telefono: '', emailEmpresa: '',
        adminNombre: '', adminEmail: '', adminPassword: '', adminConfirm: ''
    });

    const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

    const handleStep1 = (e) => {
        e.preventDefault();
        if (!form.empresa || !form.rnc) { setError('Nombre de empresa y RNC son obligatorios'); return; }
        setError('');
        setStep(2);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (form.adminPassword !== form.adminConfirm) { setError('Las contraseñas no coinciden'); return; }
        if (form.adminPassword.length < 6) { setError('La contraseña debe tener mínimo 6 caracteres'); return; }
        setError('');
        setLoading(true);
        try {
            await register({
                empresa: form.empresa,
                rnc: form.rnc,
                direccion: form.direccion,
                telefono: form.telefono,
                email: form.emailEmpresa,
                adminNombre: form.adminNombre,
                adminEmail: form.adminEmail,
                adminPassword: form.adminPassword
            });
            setSuccess(true);
            setTimeout(() => navigate('/erp'), 1500);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const cardStyle = {
        background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '20px', padding: '2.5rem', backdropFilter: 'blur(20px)',
        boxShadow: '0 25px 60px rgba(0,0,0,0.5)'
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '2rem', fontFamily: "'Inter', -apple-system, sans-serif"
        }}>
            <style>{`@keyframes spin{to{transform:rotate(360deg)}} input::placeholder{color:rgba(255,255,255,0.25)}`}</style>

            <div style={{ width: '100%', maxWidth: '480px', position: 'relative', zIndex: 1 }}>
                {/* Logo */}
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{
                        width: '56px', height: '56px', borderRadius: '16px',
                        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 0.75rem', fontSize: '1.5rem', fontWeight: 900, color: 'white',
                        boxShadow: '0 15px 35px rgba(99,102,241,0.4)'
                    }}>I</div>
                    <h1 style={{ color: 'white', fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>
                        Iubel <span style={{ color: '#a78bfa' }}>ERP</span>
                    </h1>
                    <p style={{ color: 'rgba(255,255,255,0.5)', marginTop: '0.4rem', fontSize: '0.85rem' }}>
                        Crear nueva empresa
                    </p>
                </div>

                {/* Steps indicator */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', gap: '0' }}>
                    {[1, 2].map((s, i) => (
                        <React.Fragment key={s}>
                            <div style={{
                                width: '32px', height: '32px', borderRadius: '50%',
                                background: step >= s ? 'linear-gradient(135deg,#6366f1,#8b5cf6)' : 'rgba(255,255,255,0.1)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: step >= s ? 'white' : 'rgba(255,255,255,0.3)',
                                fontSize: '0.8rem', fontWeight: 700, transition: 'all 0.3s',
                                boxShadow: step >= s ? '0 4px 15px rgba(99,102,241,0.4)' : 'none'
                            }}>
                                {step > s ? <CheckCircle2 size={16} /> : s}
                            </div>
                            {i < 1 && (
                                <div style={{ width: '80px', height: '2px', background: step > 1 ? '#6366f1' : 'rgba(255,255,255,0.1)', transition: 'background 0.3s' }} />
                            )}
                        </React.Fragment>
                    ))}
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '7rem', marginBottom: '1.5rem' }}>
                    <span style={{ fontSize: '0.7rem', color: step === 1 ? '#a78bfa' : 'rgba(255,255,255,0.4)', fontWeight: 600 }}>Datos de Empresa</span>
                    <span style={{ fontSize: '0.7rem', color: step === 2 ? '#a78bfa' : 'rgba(255,255,255,0.4)', fontWeight: 600 }}>Usuario Administrador</span>
                </div>

                {success ? (
                    <div key="success-msg" style={{ ...cardStyle, textAlign: 'center' }}>
                        <CheckCircle2 size={56} color="#10b981" style={{ margin: '0 auto 1rem' }} />
                        <h3 style={{ color: 'white', marginBottom: '0.5rem' }}>¡Empresa registrada!</h3>
                        <p style={{ color: 'rgba(255,255,255,0.5)' }}>Redirigiendo al dashboard...</p>
                    </div>
                ) : (
                    <div style={cardStyle}>
                        {error && (
                            <div style={{
                                background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                                borderRadius: '10px', padding: '0.75rem 1rem',
                                display: 'flex', alignItems: 'center', gap: '0.5rem',
                                marginBottom: '1.5rem', color: '#fca5a5', fontSize: '0.85rem'
                            }}>
                                <AlertCircle size={15} style={{ flexShrink: 0 }} /> {error}
                            </div>
                        )}

                        {/* STEP 1 */}
                        {step === 1 && (
                            <form key="step-1-form" onSubmit={handleStep1} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <h3 style={{ color: 'white', fontWeight: 700, margin: '0 0 0.5rem' }}>Datos de la Empresa</h3>
                                <Field label="Nombre de la Empresa" icon={Building2} value={form.empresa} onChange={set('empresa')} placeholder="Mi Empresa S.R.L." required />
                                <Field label="RNC / Identificación Fiscal" icon={Hash} value={form.rnc} onChange={set('rnc')} placeholder="101-12345-6" required />
                                <Field label="Dirección" icon={MapPin} value={form.direccion} onChange={set('direccion')} placeholder="Calle Principal #1, Ciudad" />
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <Field label="Teléfono" icon={Phone} value={form.telefono} onChange={set('telefono')} placeholder="809-000-0000" />
                                    <Field label="Email Corporativo" icon={Mail} type="email" value={form.emailEmpresa} onChange={set('emailEmpresa')} placeholder="info@empresa.com" />
                                </div>
                                <button type="submit" style={{
                                    width: '100%', padding: '0.875rem',
                                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                    border: 'none', borderRadius: '10px', color: 'white',
                                    fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                                    marginTop: '0.5rem', boxShadow: '0 8px 25px rgba(99,102,241,0.35)'
                                }}>
                                    Siguiente <ArrowRight size={18} />
                                </button>
                            </form>
                        )}

                        {/* STEP 2 */}
                        {step === 2 && (
                            <form key="step-2-form" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <h3 style={{ color: 'white', fontWeight: 700, margin: '0 0 0.5rem' }}>Usuario Administrador</h3>
                                <Field label="Nombre completo" icon={User} value={form.adminNombre} onChange={set('adminNombre')} placeholder="Juan Pérez" required />
                                <Field label="Email del administrador" icon={Mail} type="email" value={form.adminEmail} onChange={set('adminEmail')} placeholder="admin@empresa.com" required />
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <Field label="Contraseña" icon={Lock} toggle showValue={showPass} onToggle={() => setShowPass(!showPass)} value={form.adminPassword} onChange={set('adminPassword')} placeholder="••••••••" required />
                                    <Field label="Confirmar contraseña" icon={Lock} toggle showValue={showConfirm} onToggle={() => setShowConfirm(!showConfirm)} value={form.adminConfirm} onChange={set('adminConfirm')} placeholder="••••••••" required />
                                </div>

                                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                                    <button type="button" onClick={() => { setStep(1); setError(''); }} style={{
                                        flex: 1, padding: '0.875rem',
                                        background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
                                        borderRadius: '10px', color: 'white', fontWeight: 600, cursor: 'pointer',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem'
                                    }}>
                                        <ArrowLeft size={16} /> Atrás
                                    </button>
                                    <button type="submit" disabled={loading} style={{
                                        flex: 2, padding: '0.875rem',
                                        background: loading ? 'rgba(99,102,241,0.5)' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                        border: 'none', borderRadius: '10px', color: 'white',
                                        fontWeight: 700, fontSize: '0.9rem', cursor: loading ? 'not-allowed' : 'pointer',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                                        boxShadow: '0 8px 25px rgba(99,102,241,0.35)'
                                    }}>
                                        {loading ? (
                                            <><div style={{ width: '16px', height: '16px', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', animation: 'spin 0.7s linear infinite' }} /> Creando...</>
                                        ) : (
                                            <><CheckCircle2 size={18} /> Crear Empresa</>
                                        )}
                                    </button>
                                </div>
                            </form>
                        )}

                        <div style={{ textAlign: 'center', marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', margin: 0 }}>
                                ¿Ya tienes cuenta?{' '}
                                <Link to="/login" style={{ color: '#a78bfa', fontWeight: 600, textDecoration: 'none' }}>
                                    Iniciar sesión
                                </Link>
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RegisterPage;
