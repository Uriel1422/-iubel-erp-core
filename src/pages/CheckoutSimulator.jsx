import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ShieldCheck, Lock, CreditCard, ChevronRight, Loader2 } from 'lucide-react';

const CheckoutSimulator = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const plan = searchParams.get('plan') || 'basico';
    const token = searchParams.get('token');
    
    const [processing, setProcessing] = useState(false);
    const [step, setStep] = useState(1); // 1: Info, 2: Processing, 3: Success

    const planNames = { basico: 'Iubel Pyme', intermedio: 'Iubel Corporate', avanzado: 'Iubel Enterprise' };
    const planPrices = { basico: '4,500', intermedio: '12,500', avanzado: '25,000' };

    const handlePayment = async () => {
        setProcessing(true);
        setStep(2);
        
        // Simular latencia de red de pasarela
        setTimeout(async () => {
            try {
                const res = await fetch('/api/billing/simulate-success', {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': token 
                    },
                    body: JSON.stringify({ plan })
                });
                
                if (res.ok) {
                    setStep(3);
                } else {
                    alert('Error en la simulación de pago');
                    setStep(1);
                    setProcessing(false);
                }
            } catch (e) {
                console.error(e);
                setStep(1);
                setProcessing(false);
            }
        }, 2500);
    };

    if (step === 3) {
        return (
            <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
                <div style={{ maxWidth: '450px', width: '100%', background: 'white', padding: '3rem', borderRadius: '32px', boxShadow: '0 20px 40px rgba(0,0,0,0.05)', textAlign: 'center' }}>
                    <div style={{ width: 80, height: 80, background: '#dcfce7', color: '#10b981', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem' }}>
                        <ShieldCheck size={40} />
                    </div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0f172a', marginBottom: '1rem' }}>¡Pago Exitoso!</h1>
                    <p style={{ color: '#64748b', marginBottom: '2.5rem' }}>Tu suscripción a <strong>{planNames[plan]}</strong> ha sido activada correctamente. Ya puedes acceder a todas tus funciones.</p>
                    <button onClick={() => navigate('/erp')} style={{ width: '100%', padding: '1rem', background: '#6366f1', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 800, cursor: 'pointer' }}>
                        Ir al Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', fontFamily: 'Inter, sans-serif' }}>
            <div style={{ maxWidth: '900px', width: '100%', display: 'grid', gridTemplateColumns: '1fr 380px', gap: '2rem' }}>
                
                {/* Payment Form (Simulated Stripe) */}
                <div style={{ background: 'white', padding: '3rem', borderRadius: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#6366f1', marginBottom: '2rem' }}>
                        <div style={{ background: '#6366f1', color: 'white', padding: '4px', borderRadius: '4px' }}><Lock size={14} /></div>
                        <span style={{ fontSize: '0.8rem', fontWeight: 800, letterSpacing: '0.05em' }}>IUBEL PAY SECURE CHECKOUT</span>
                    </div>

                    <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '2rem' }}>Método de Pago</h2>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div style={{ padding: '1rem', border: '2px solid #6366f1', borderRadius: '12px', background: '#f5f3ff', display: 'flex', alignItems: 'center', justifyBetween: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <CreditCard color="#6366f1" />
                                <span style={{ fontWeight: 700, color: '#1e1b4b' }}>Tarjeta Bancaria</span>
                            </div>
                            <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.4rem' }}>
                                <div style={{ width: 30, height: 20, background: '#e2e8f0', borderRadius: '4px' }} />
                                <div style={{ width: 30, height: 20, background: '#e2e8f0', borderRadius: '4px' }} />
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', marginBottom: '0.5rem' }}>INFORMACIÓN DE TARJETA</label>
                            <div style={{ position: 'relative' }}>
                                <input type="text" value="4242 4242 4242 4242" readOnly style={{ width: '100%', padding: '0.875rem', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#f8fafc', fontWeight: 600 }} />
                                <div style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', display: 'flex', gap: '1rem' }}>
                                    <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>MM / YY</span>
                                    <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>CVC</span>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', marginBottom: '0.5rem' }}>NOMBRE EN LA TARJETA</label>
                            <input type="text" placeholder="Ej. Juan Pérez" style={{ width: '100%', padding: '0.875rem', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none' }} />
                        </div>

                        <button 
                            onClick={handlePayment}
                            disabled={processing}
                            style={{ 
                                marginTop: '1rem', width: '100%', padding: '1.25rem', 
                                background: processing ? '#94a3b8' : '#0f172a', 
                                color: 'white', border: 'none', borderRadius: '12px', 
                                fontWeight: 800, fontSize: '1.1rem', cursor: processing ? 'not-allowed' : 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.8rem'
                            }}
                        >
                            {processing ? <><Loader2 className="animate-spin" /> Procesando segura...</> : `Pagar RD$ ${planPrices[plan]}`}
                        </button>
                        
                        <p style={{ textAlign: 'center', fontSize: '0.75rem', color: '#94a3b8', marginTop: '1rem' }}>
                            <ShieldCheck size={12} style={{ display: 'inline', marginRight: '4px' }} />
                            Tus datos están protegidos por encriptación AES-256 de grado bancario.
                        </p>
                    </div>
                </div>

                {/* Order Summary */}
                <div style={{ color: '#0f172a' }}>
                    <div style={{ position: 'sticky', top: '2rem' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1.5rem' }}>Resumen del Plan</h3>
                        <div style={{ background: 'rgba(255,255,255,0.5)', padding: '1.5rem', borderRadius: '20px', border: '1px solid rgba(0,0,0,0.05)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                <span style={{ color: '#64748b', fontSize: '0.9rem' }}>Suscripción</span>
                                <span style={{ fontWeight: 700 }}>{planNames[plan]}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                <span style={{ color: '#64748b', fontSize: '0.9rem' }}>Ciclo</span>
                                <span style={{ fontWeight: 700 }}>Mensual</span>
                            </div>
                            <div style={{ height: '1px', background: 'rgba(0,0,0,0.05)', margin: '1.5rem 0' }} />
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontWeight: 800 }}>Total a Pagar</span>
                                <span style={{ fontSize: '1.5rem', fontWeight: 900, color: '#6366f1' }}>RD$ {planPrices[plan]}</span>
                            </div>
                        </div>
                        
                        <div style={{ marginTop: '2rem', padding: '1rem' }}>
                            <div style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.8rem' }}>Beneficios Incluidos:</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                                {['Acceso Total 24/7', 'Soporte Prioritario', 'Copilot AI Activado', 'Escalable'].map(b => (
                                    <div key={b} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: '#475569' }}>
                                        <ShieldCheck size={14} color="#10b981" />
                                        {b}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default CheckoutSimulator;
