import React, { useState } from 'react';
import { 
    Building2, Globe, Database, ArrowRight, CheckCircle2, 
    ShieldCheck, Zap, Briefcase, Landmark, Store 
} from 'lucide-react';

const SetupWizard = ({ onComplete }) => {
    const [step, setStep] = useState(1);
    const [config, setConfig] = useState({
        rnc: '',
        nombreComercial: '',
        sector: '',
        moneda: 'DOP',
        catalogoBase: true
    });

    const sectors = [
        { id: 'comercio', label: 'Comercio / Retail', icon: <Store size={20} /> },
        { id: 'servicios', label: 'Servicios Profesionales', icon: <Briefcase size={20} /> },
        { id: 'financiero', label: 'Financiero / Cooperativa', icon: <Landmark size={20} /> }
    ];

    const handleNext = () => {
        if (step < 3) setStep(step + 1);
        else onComplete(config);
    };

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(2, 6, 23, 0.9)', backdropFilter: 'blur(10px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem'
        }}>
            <div style={{
                width: '100%', maxWidth: '600px',
                background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '24px', padding: '3rem', position: 'relative',
                boxShadow: '0 50px 100px -20px rgba(0,0,0,0.5)'
            }}>
                {/* Progress Bar */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '3rem' }}>
                    {[1, 2, 3].map(i => (
                        <div key={i} style={{ 
                            flex: 1, height: '4px', borderRadius: '2px', 
                            background: i <= step ? '#6366f1' : 'rgba(255,255,255,0.1)',
                            transition: '0.4s'
                        }} />
                    ))}
                </div>

                {step === 1 && (
                    <div className="animate-fade-in">
                        <div style={{ color: '#6366f1', fontSize: '0.75rem', fontWeight: 800, letterSpacing: '2px', marginBottom: '0.5rem' }}>BIENVENIDO A IUBEL CLOUD</div>
                        <h2 style={{ fontSize: '1.75rem', fontWeight: 900, marginBottom: '2rem' }}>Configuremos tu <span style={{ color: '#6366f1' }}>Identidad Fiscal</span></h2>
                        
                        <div style={{ display: 'grid', gap: '1.5rem', marginBottom: '2.5rem' }}>
                            <div>
                                <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.8rem', marginBottom: '0.5rem' }}>Nombre Comercial</label>
                                <input 
                                    type="text" value={config.nombreComercial} 
                                    onChange={e => setConfig({...config, nombreComercial: e.target.value})}
                                    placeholder="Ej: Inversiones Jimenez SRL"
                                    style={{ width: '100%', padding: '0.8rem 1rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'white' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.8rem', marginBottom: '0.5rem' }}>RNC / Cédula</label>
                                <input 
                                    type="text" value={config.rnc} 
                                    onChange={e => setConfig({...config, rnc: e.target.value})}
                                    placeholder="131234567"
                                    style={{ width: '100%', padding: '0.8rem 1rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'white' }}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="animate-fade-in">
                        <h2 style={{ fontSize: '1.75rem', fontWeight: 900, marginBottom: '1rem' }}>Sector <span style={{ color: '#6366f1' }}>Estratégico</span></h2>
                        <p style={{ color: '#64748b', marginBottom: '2.5rem' }}>Personalizaremos tus módulos según el tipo de empresa.</p>
                        
                        <div style={{ display: 'grid', gap: '1rem', marginBottom: '2.5rem' }}>
                            {sectors.map(s => (
                                <div 
                                    key={s.id}
                                    onClick={() => setConfig({...config, sector: s.id})}
                                    style={{
                                        padding: '1.5rem', borderRadius: '16px', cursor: 'pointer',
                                        background: config.sector === s.id ? 'rgba(99,102,241,0.1)' : 'rgba(255,255,255,0.02)',
                                        border: `1px solid ${config.sector === s.id ? '#6366f1' : 'rgba(255,255,255,0.05)'}`,
                                        display: 'flex', alignItems: 'center', gap: '1rem', transition: '0.2s'
                                    }}
                                >
                                    <div style={{ color: config.sector === s.id ? '#6366f1' : '#64748b' }}>{s.icon}</div>
                                    <span style={{ fontWeight: 600, color: config.sector === s.id ? '#fff' : '#94a3b8' }}>{s.label}</span>
                                    {config.sector === s.id && <CheckCircle2 size={18} style={{ marginLeft: 'auto', color: '#6366f1' }} />}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="animate-fade-in" style={{ textAlign: 'center' }}>
                        <div style={{ width: '64px', height: '64px', borderRadius: '20px', background: 'rgba(16,185,129,0.1)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                            <Zap size={32} />
                        </div>
                        <h2 style={{ fontSize: '1.75rem', fontWeight: 900, marginBottom: '1rem' }}>¡Todo Listo para el <span style={{ color: '#6366f1' }}>Despegue</span>!</h2>
                        <p style={{ color: '#64748b', marginBottom: '2.5rem' }}>Estamos activando tu entorno en la nube de Iubel. Pulsa el botón para entrar a tu nuevo centro de mando.</p>
                        
                        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', padding: '1.5rem', textAlign: 'left', marginBottom: '2.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem', color: '#94a3b8', fontSize: '0.85rem' }}>
                                <ShieldCheck size={16} style={{ color: '#6366f1' }} /> Plan Activo: <span style={{ color: '#fff', fontWeight: 700 }}>Intermedio</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#94a3b8', fontSize: '0.85rem' }}>
                                <Database size={16} style={{ color: '#6366f1' }} /> Base de Datos: <span style={{ color: '#fff', fontWeight: 700 }}>Aislada & Encriptada</span>
                            </div>
                        </div>
                    </div>
                )}

                <div style={{ display: 'flex', gap: '1rem', marginTop: 'auto' }}>
                    {step > 1 && (
                        <button 
                            onClick={() => setStep(step - 1)}
                            style={{ flex: 1, padding: '1rem', borderRadius: '14px', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontWeight: 600, cursor: 'pointer' }}
                        >
                            Atrás
                        </button>
                    )}
                    <button 
                        onClick={handleNext}
                        disabled={step === 1 && !config.nombreComercial}
                        style={{ 
                            flex: 2, padding: '1rem', borderRadius: '14px', 
                            background: (step === 1 && !config.nombreComercial) ? '#475569' : '#6366f1', 
                            color: 'white', border: 'none', fontWeight: 800, 
                            cursor: (step === 1 && !config.nombreComercial) ? 'not-allowed' : 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                            transition: '0.3s'
                        }}
                    >
                        {step === 3 ? 'Comenzar Operaciones' : 'Continuar'} <ArrowRight size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SetupWizard;
