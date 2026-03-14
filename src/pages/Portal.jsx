import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
    ShieldCheck, Rocket, Users, ChevronRight, LayoutDashboard, 
    Globe, Lock, ArrowRightCircle, Building2, Database, 
    LineChart, LogOut, Brain, CreditCard, Network, Zap,
    Cpu, Globe2, ShieldAlert
} from 'lucide-react';

const Portal = () => {
    const navigate = useNavigate();
    const { isAuthenticated, user, empresa, logout } = useAuth();
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handlePlanSelect = async (planId) => {
        if (!isAuthenticated) {
            navigate(`/register?plan=${planId}`);
            return;
        }

        try {
            const res = await fetch('/api/billing/create-checkout', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ planId })
            });
            const data = await res.json();
            if (data.success) {
                // Redirigir a la pasarela segura
                window.location.href = data.url;
            } else {
                alert(data.error || 'Error al conectar con la pasarela');
            }
        } catch (e) {
            console.error('Checkout error:', e);
            alert('Error de red al procesar el pago');
        }
    };

    const features = [
        {
            title: "Iubel Copilot AI",
            desc: "Analítica predictiva y chat financiero con inteligencia artificial avanzada.",
            icon: <Brain size={24} />,
            color: "#8b5cf6"
        },
        {
            title: "Card Issuing 3D",
            desc: "Emisión de tarjetas corporativas con gestión de seguridad en tiempo real.",
            icon: <CreditCard size={24} />,
            color: "#0ea5e9"
        },
        {
            title: "Data Node Gotham",
            desc: "Visualización de grafos de riesgo y detección de anomalías tipo inteligencia.",
            icon: <Network size={24} />,
            color: "#38bdf8"
        },
        {
            title: "Exchange Engine",
            desc: "Mercado secundario de participaciones y tokenización de activos.",
            icon: <Zap size={24} />,
            color: "#facc15"
        }
    ];

    return (
        <div style={{
            minHeight: '100vh',
            background: '#020617',
            color: '#f8fafc',
            fontFamily: "'Outfit', 'Inter', sans-serif",
            position: 'relative',
            overflowX: 'hidden'
        }}>
            {/* 🌌 Ultra-Premium Background */}
            <div style={{ position: 'fixed', inset: 0, zIndex: 0, opacity: 0.4 }}>
                <div style={{ position: 'absolute', top: -100, left: -100, width: 600, height: 600, background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)', filter: 'blur(80px)' }} />
                <div style={{ position: 'absolute', bottom: -100, right: -100, width: 800, height: 800, background: 'radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)', filter: 'blur(100px)' }} />
            </div>

            {/* ⚡ Navigation Bar */}
            <nav style={{
                position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
                padding: scrolled ? '1rem 2rem' : '2rem 4rem',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                background: scrolled ? 'rgba(2, 6, 23, 0.8)' : 'transparent',
                backdropFilter: scrolled ? 'blur(20px)' : 'none',
                borderBottom: scrolled ? '1px solid rgba(255,255,255,0.1)' : 'none',
                transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: 38, height: 38, borderRadius: '10px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, boxShadow: '0 8px 16px rgba(99,102,241,0.3)' }}>I</div>
                    <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em' }}>IUBEL <span style={{ color: '#6366f1', opacity: 0.8 }}>CLOUD</span></span>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                    <div style={{ display: 'none' /* placeholder for links */ }}></div>
                    {isAuthenticated ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'rgba(255,255,255,0.05)', padding: '0.4rem 0.5rem 0.4rem 1rem', borderRadius: '100px', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Hola, {user?.nombre}</span>
                            <button onClick={() => navigate('/erp')} style={{ background: '#6366f1', color: 'white', border: 'none', padding: '0.4rem 1.2rem', borderRadius: '100px', fontWeight: 700, cursor: 'pointer', fontSize: '0.8rem' }}>Dashboard</button>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button onClick={() => navigate('/login')} style={{ background: 'transparent', color: '#f8fafc', border: 'none', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem' }}>Entrar</button>
                            <button onClick={() => navigate('/register')} style={{ background: '#f8fafc', color: '#020617', border: 'none', padding: '0.6rem 1.5rem', borderRadius: '100px', fontWeight: 800, cursor: 'pointer', fontSize: '0.9rem' }}>Empezar Gratis</button>
                        </div>
                    )}
                </div>
            </nav>

            {/* 🚀 Hero Section */}
            <main style={{ position: 'relative', zIndex: 1, paddingTop: '10rem' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center', padding: '0 2rem' }}>
                    <div style={{ 
                        display: 'inline-flex', alignItems: 'center', gap: '0.5rem', 
                        padding: '0.5rem 1.5rem', borderRadius: '100px', 
                        background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)',
                        color: '#818cf8', fontSize: '0.75rem', fontWeight: 800, 
                        letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '2.5rem'
                    }}>
                        <Cpu size={14} /> Next-Gen Enterprise Infrastructure
                    </div>
                    
                    <h1 style={{ fontSize: 'clamp(3rem, 8vw, 6rem)', fontWeight: 900, lineHeight: 0.95, letterSpacing: '-0.05em', marginBottom: '2rem' }}>
                        Transformamos <span style={{ color: '#6366f1' }}>Datos</span> <br/> 
                        en <span style={{ textDecoration: 'underline', textDecorationColor: 'rgba(99,102,241,0.3)' }}>Inteligencia</span>
                    </h1>
                    
                    <p style={{ fontSize: '1.25rem', color: '#94a3b8', maxWidth: '700px', margin: '0 auto 4rem', lineHeight: 1.6 }}>
                        Iubel Cloud es el primer ecosistema ERP en República Dominicana que integra IA Generativa, Core Bancario Temenos y Análisis de Vínculos tipo Palantir.
                    </p>

                    <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginBottom: '8rem' }}>
                        <button onClick={() => navigate('/register')} style={{ padding: '1.25rem 3rem', borderRadius: '14px', background: '#6366f1', color: 'white', border: 'none', fontWeight: 800, fontSize: '1.1rem', cursor: 'pointer', transition: '0.3s', boxShadow: '0 20px 40px rgba(99,102,241,0.2)' }}>
                            Digitalizar Mi Empresa
                        </button>
                        <button style={{ padding: '1.25rem 3rem', borderRadius: '14px', background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.1)', fontWeight: 700, fontSize: '1.1rem', cursor: 'pointer' }}>
                            Ver Demo
                        </button>
                    </div>

                    {/* Feature Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '10rem' }}>
                        {features.map((feat, i) => (
                            <div key={i} style={{ 
                                padding: '2.5rem', borderRadius: '24px', background: 'rgba(255,255,255,0.02)', 
                                border: '1px solid rgba(255,255,255,0.05)', textAlign: 'left',
                                transition: '0.3s'
                            }}>
                                <div style={{ 
                                    width: 48, height: 48, borderRadius: '14px', background: `${feat.color}20`,
                                    color: feat.color, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    marginBottom: '1.5rem'
                                }}>
                                    {feat.icon}
                                </div>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.75rem' }}>{feat.title}</h3>
                                <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: 1.6 }}>{feat.desc}</p>
                            </div>
                        ))}
                    </div>

                    {/* 📊 Pricing Section */}
                    <div id="pricing" style={{ marginBottom: '10rem', padding: '4rem 0' }}>
                        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                            <div style={{ color: '#6366f1', fontSize: '0.8rem', fontWeight: 800, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '1rem' }}>PLANES Y SUSCRIPCIONES</div>
                            <h2 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 900, letterSpacing: '-0.02em' }}>Inversión en <span style={{ color: '#6366f1' }}>Excelencia</span></h2>
                            <p style={{ color: '#64748b', marginTop: '1rem', fontSize: '1.1rem' }}>Selecciona el motor que impulsará el crecimiento de tu organización.</p>
                        </div>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', alignItems: 'stretch' }}>
                            {/* Básico */}
                            <div style={{ padding: '3rem', borderRadius: '32px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', transition: '0.3s' }}>
                                <div style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.5rem' }}>Básico</div>
                                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '2rem' }}>
                                    <span style={{ fontSize: '2.5rem', fontWeight: 900 }}>$4,500</span>
                                    <span style={{ color: '#64748b' }}>/mes</span>
                                </div>
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2.5rem' }}>
                                    {[ 
                                        'Hasta 3 Usuarios', 'Contabilidad Básica', 'Facturación DGII', 'Soporte Estándar'
                                    ].map((item, i) => (
                                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.9rem', color: '#94a3b8' }}>
                                            <ShieldCheck size={16} style={{ color: '#6366f1' }} />
                                            {item}
                                        </div>
                                    ))}
                                </div>
                                <button onClick={() => handlePlanSelect('basico')} style={{ padding: '1rem', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.1)', fontWeight: 700, cursor: 'pointer', transition: '0.3s' }}>Empezar con Básico</button>
                            </div>

                            {/* Intermedio (Popular) */}
                            <div style={{ padding: '3.5rem 3rem', borderRadius: '32px', background: 'rgba(99,102,241,0.05)', border: '2px solid #6366f1', display: 'flex', flexDirection: 'column', position: 'relative', transform: 'scale(1.05)', boxShadow: '0 25px 50px -12px rgba(99, 102, 241, 0.25)' }}>
                                <div style={{ position: 'absolute', top: '-15px', left: '50%', transform: 'translateX(-50%)', background: '#6366f1', color: 'white', padding: '6px 16px', borderRadius: '100px', fontSize: '0.75rem', fontWeight: 900, letterSpacing: '0.5px' }}>MÁS POPULAR</div>
                                <div style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '0.5rem' }}>Intermedio</div>
                                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '2rem' }}>
                                    <span style={{ fontSize: '3rem', fontWeight: 900 }}>$12,500</span>
                                    <span style={{ color: '#64748b' }}>/mes</span>
                                </div>
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2.5rem' }}>
                                    {[ 
                                        'Hasta 15 Usuarios', 'Módulo de Nómina & TSS', 'FinTech Dashboards', 'Soporte Prioritario', 'Iubel Copilot AI (GTP)'
                                    ].map((item, i) => (
                                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.95rem', color: '#f1f5f9' }}>
                                            <ShieldCheck size={18} style={{ color: '#6366f1' }} />
                                            {item}
                                        </div>
                                    ))}
                                </div>
                                <button onClick={() => handlePlanSelect('intermedio')} style={{ padding: '1.1rem', borderRadius: '14px', background: '#6366f1', color: 'white', border: 'none', fontWeight: 800, fontSize: '1rem', cursor: 'pointer', boxShadow: '0 10px 20px rgba(99,102,241,0.3)', transition: '0.3s' }}>Empezar con Intermedio</button>
                            </div>

                            {/* Avanzado (Enterprise) */}
                            <div style={{ padding: '3rem', borderRadius: '32px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', transition: '0.3s' }}>
                                <div style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.5rem' }}>Avanzado</div>
                                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '2rem' }}>
                                    <span style={{ fontSize: '2.5rem', fontWeight: 900 }}>$25,000</span>
                                    <span style={{ color: '#64748b' }}>/mes</span>
                                </div>
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2.5rem' }}>
                                    {[ 
                                        'Usuarios Ilimitados', 'Acceso FinTech Elite Total', 'Iubel Copilot Ilimitado', 'DataNode & Exchange', 'API & Soporte 24/7'
                                    ].map((item, i) => (
                                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.9rem', color: '#94a3b8' }}>
                                            <ShieldCheck size={16} style={{ color: '#6366f1' }} />
                                            {item}
                                        </div>
                                    ))}
                                </div>
                                <button onClick={() => handlePlanSelect('avanzado')} style={{ padding: '1rem', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.1)', fontWeight: 700, cursor: 'pointer', transition: '0.3s' }}>Empezar con Avanzado</button>
                            </div>
                        </div>
                    </div>

                    {/* Trust Section */}
                    <div style={{ padding: '4rem', borderRadius: '32px', background: 'linear-gradient(180deg, rgba(255,255,255,0.03) 0%, transparent 100%)', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '8rem' }}>
                        <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#475569', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '3rem' }}>COBERTURA Y SEGURIDAD MUNDIAL</div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '2rem' }}>
                            <div>
                                <Globe2 size={24} style={{ color: '#6366f1', marginBottom: '1rem' }} />
                                <div style={{ fontSize: '1.5rem', fontWeight: 900 }}>RD-256</div>
                                <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Encriptación Fiscal</div>
                            </div>
                            <div>
                                <ShieldAlert size={24} style={{ color: '#10b981', marginBottom: '1rem' }} />
                                <div style={{ fontSize: '1.5rem', fontWeight: 900 }}>ISO 27001</div>
                                <div style={{ fontSize: '0.7rem', color: '#64748b' }}>SaaS Security</div>
                            </div>
                            <div>
                                <Database size={24} style={{ color: '#f59e0b', marginBottom: '1rem' }} />
                                <div style={{ fontSize: '1.5rem', fontWeight: 900 }}>Cloud Core</div>
                                <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Uptime 99.99%</div>
                            </div>
                            <div>
                                <ShieldCheck size={24} style={{ color: '#ef4444', marginBottom: '1rem' }} />
                                <div style={{ fontSize: '1.5rem', fontWeight: 900 }}>AML Radar</div>
                                <div style={{ fontSize: '0.7rem', color: '#64748b' }}>OFAC Compliant</div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <footer style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '4rem 0', textAlign: 'center', background: '#020617' }}>
                <p style={{ color: '#64748b', fontSize: '0.85rem' }}>
                    &copy; 2026 IUBEL ENTERPRISE SYSTEMS S.R.L. <br/>
                    Tecnología Dominicana Compitiendo en el Escenario Mundial.
                </p>
                <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'center', gap: '1.5rem', fontSize: '0.75rem', color: '#4d5c70' }}>
                    <Link to="/superadmin/login">Super Admin Access</Link>
                    <span>|</span>
                    <Link to="/ayuda">Support Desk</Link>
                </div>
            </footer>

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;800;900&display=swap');
                
                body { background: #020617; }
                
                h1, h2, h3 { font-family: 'Outfit', sans-serif; }

                .animate-float {
                    animation: float 6s ease-in-out infinite;
                }

                @keyframes float {
                    0% { transform: translateY(0px); }
                    50% { transform: translateY(-20px); }
                    100% { transform: translateY(0px); }
                }
            `}</style>
        </div>
    );
};

export default Portal;
