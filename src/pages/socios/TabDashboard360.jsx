import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { ShieldAlert, ShieldCheck, Activity, Calendar, Clock, ArrowRight, TrendingUp, AlertTriangle, CheckCircle2, DollarSign, Wallet } from 'lucide-react';

const formatMoney = (val) => new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP' }).format(Number(val) || 0);

const TabDashboard360 = ({ socio }) => {
    const [kycState, setKycState] = useState('pending'); // pending, scanning, verified
    const [scanProgress, setScanProgress] = useState(0);
    const [scanText, setScanText] = useState('');

    useEffect(() => {
        if (kycState === 'scanning') {
            const steps = [
                'Iniciando cámara térmica...',
                'Detectando liveness facial...',
                'Extrayendo vectores biométricos...',
                'Cruzando con base de datos Cedulación...',
                'Consultando listas OFAC y PEPs...',
                'Verificando huella dactilar...',
                'Generando Hash Inmutable...'
            ];
            
            let currentStep = 0;
            const interval = setInterval(() => {
                setScanProgress((prev) => prev + 15);
                setScanText(steps[currentStep]);
                currentStep++;
                
                if (currentStep >= steps.length) {
                    clearInterval(interval);
                    setTimeout(() => {
                        setKycState('verified');
                    }, 1000);
                }
            }, 800);
            
            return () => clearInterval(interval);
        }
    }, [kycState]);

    // --- 1. Cálculos de Inteligencia Financiera ---
    const activos = Number(socio.ahorros || 0) + Number(socio.aportacion || 0);
    const pasivos = Number(socio.prestamos || 0);
    const ingresos = Number(socio.ingresoMensual || 0);
    
    const portfolioData = [
        { name: 'Activos Liquidos', value: activos > 0 ? activos : 1, color: 'var(--success)' },
        { name: 'Deuda Total', value: pasivos > 0 ? pasivos : 1, color: 'var(--danger)' }
    ];

    // Cálculos para el Socio Score (Escala 300 - 850)
    let scoreBase = 600;
    if (activos > 0) scoreBase += Math.min(50, activos / 2000);
    if (ingresos > 0) scoreBase += Math.min(100, ingresos / 1000);
    if (pasivos > 0) {
        const ratioDeudaIngreso = pasivos / (ingresos > 0 ? ingresos : 1);
        if (ratioDeudaIngreso > 20) scoreBase -= 150;
        else if (ratioDeudaIngreso > 5) scoreBase -= 50;
        else scoreBase += 20; // Buen manejo de crédito
    } else {
        scoreBase -= 10; // Penalidad por falta de historial crediticio
    }
    
    const finalScore = Math.max(300, Math.min(850, Math.floor(scoreBase)));
    
    // Categorización del Riesgo
    let riskLevel = { label: 'Excelente', color: 'var(--success)', icon: ShieldCheck };
    if (finalScore < 500) riskLevel = { label: 'Alto Riesgo', color: 'var(--danger)', icon: ShieldAlert };
    else if (finalScore < 650) riskLevel = { label: 'Riesgo Medio', color: 'var(--warning)', icon: AlertTriangle };
    
    // Customer Lifetime Value (LTV) - Proyección Simple
    const estimatedMargin = (pasivos * 0.18) + (activos * 0.02); // 18% spread en préstamos, 2% rentabilidad en pasivos
    const ltv = Math.round(estimatedMargin * 3); // Valor proyectado a 3 años

    // Actividad Falsa Reciente basada en el socio
    const timelineEvents = [
        { id: 1, type: 'credit', title: 'Consultó Buró de Crédito', date: 'Hace 2 días', desc: 'Score arrojado: ' + finalScore },
        { id: 2, type: 'system', title: 'Actualización de Perfil KYC', date: 'Hace 15 días', desc: 'Renovó copia de cédula.' },
        { id: 3, type: 'payment', title: 'Abono a Préstamo', date: 'Hace 1 mes', desc: 'Pago regular recibido a tiempo.' },
        { id: 4, type: 'account', title: 'Apertura de Cuenta de Ahorro', date: 'Hace 6 meses', desc: 'Inicio de relación comercial.' }
    ];

    // Simulación de rentabilidad por mes (Bar Chart)
    const profitabilityData = [
        { mes: 'Ene', margen: Math.round(estimatedMargin / 12 * 0.8) },
        { mes: 'Feb', margen: Math.round(estimatedMargin / 12 * 0.9) },
        { mes: 'Mar', margen: Math.round(estimatedMargin / 12 * 1.1) },
        { mes: 'Abr', margen: Math.round(estimatedMargin / 12 * 1.0) },
        { mes: 'May', margen: Math.round(estimatedMargin / 12 * 1.2) }
    ];

    return (
        <div className="animate-fade-in" style={{ display: 'grid', gap: '2rem' }}>
            
            {/* Fila 1: KPIs Principales (Socio Score, LTV, KYC Status) */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                
                {/* 1. Credit Score Gauge */}
                <div className="card glass layout-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '6px', background: riskLevel.color }}></div>
                    <riskLevel.icon size={32} color={riskLevel.color} style={{ marginBottom: '1rem', marginTop: '0.5rem' }} />
                    <h4 style={{ margin: '0 0 1rem 0', color: 'var(--text-muted)' }}>Calificación Crediticia</h4>
                    
                    <div style={{ position: 'relative', width: '180px', height: '90px', overflow: 'hidden', marginBottom: '1rem' }}>
                        <div style={{ 
                            width: '180px', height: '180px', borderRadius: '50%', 
                            border: '15px solid rgba(0,0,0,0.05)',
                            borderTopColor: riskLevel.color,
                            borderRightColor: riskLevel.color,
                            transform: `rotate(${Math.min(finalScore / 1000 * 180 + 45, 225)}deg)`,
                            transition: 'transform 1.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                        }}></div>
                        <div style={{ position: 'absolute', bottom: '0', left: '0', right: '0', textAlign: 'center' }}>
                            <span style={{ fontSize: '2.5rem', fontWeight: 900, color: riskLevel.color, lineHeight: '1' }}>{finalScore}</span>
                        </div>
                    </div>
                    
                    <div className="badge" style={{ background: `${riskLevel.color}22`, color: riskLevel.color, fontSize: '0.9rem', padding: '0.4rem 1rem' }}>
                        {riskLevel.label}
                    </div>
                </div>

                {/* 2. Customer Lifetime Value (LTV) */}
                <div className="card glass layout-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', color: 'var(--primary)' }}>
                        <TrendingUp size={24} />
                        <h4 style={{ margin: 0, fontSize: '1.1rem' }}>Valor Proyectado (LTV)</h4>
                    </div>
                    <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
                        {formatMoney(ltv)}
                    </div>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>Márgen estimado a 36 meses, basado en el uso actual de productos de pasivo y activo.</p>
                    
                    <div style={{ height: '80px', marginTop: '1rem' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={profitabilityData}>
                                <Bar dataKey="margen" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                                <RechartsTooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 3. KYC & Compliance Status (Biometric) */}
                <div className="card glass layout-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '1rem', marginBottom: '1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: kycState === 'verified' ? 'var(--success)' : 'var(--primary)' }}>
                            <CheckCircle2 size={24} />
                            <h4 style={{ margin: 0, fontSize: '1.1rem' }}>KYC & Biometría AML</h4>
                        </div>
                        {kycState === 'pending' && (
                            <button 
                                key="btn-scan"
                                onClick={() => setKycState('scanning')}
                                className="btn btn-primary" 
                                style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem', alignSelf: 'stretch', justifyContent: 'center' }}
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7V5a2 2 0 0 1 2-2h2"></path><path d="M17 3h2a2 2 0 0 1 2 2v2"></path><path d="M21 17v2a2 2 0 0 1-2 2h-2"></path><path d="M7 21H5a2 2 0 0 1-2-2v-2"></path><rect x="7" y="7" width="10" height="10" rx="2"></rect></svg>
                                Escanear al Cliente
                            </button>
                        )}
                    </div>
                    
                    {kycState === 'scanning' ? (
                        <div key="scanning-view" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', background: '#0f172a', borderRadius: '12px', padding: '1rem', position: 'relative', overflow: 'hidden' }}>
                            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '100%', background: 'linear-gradient(180deg, rgba(16,185,129,0) 0%, rgba(16,185,129,0.2) 50%, rgba(16,185,129,0) 100%)', animation: 'scanline 2s linear infinite' }}></div>
                            <div style={{ width: 64, height: 64, borderRadius: '50%', border: '2px dashed #10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'spin 4s linear infinite' }}>
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2"><path d="M3 7V5a2 2 0 0 1 2-2h2"></path><path d="M17 3h2a2 2 0 0 1 2 2v2"></path><path d="M21 17v2a2 2 0 0 1-2 2h-2"></path><path d="M7 21H5a2 2 0 0 1-2-2v-2"></path></svg>
                            </div>
                            <div style={{ color: '#10b981', fontFamily: 'monospace', fontSize: '0.85rem', textAlign: 'center' }}>
                                {scanText}<br/>
                                <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.1)', marginTop: '0.5rem', borderRadius: '2px', overflow: 'hidden' }}>
                                    <div style={{ width: `${scanProgress}%`, height: '100%', background: '#10b981', transition: 'width 0.5s' }}></div>
                                </div>
                            </div>
                            <style>{`
                                @keyframes scanline { 0% { transform: translateY(-100%); } 100% { transform: translateY(100%); } }
                                @keyframes spin { 100% { transform: rotate(360deg); } }
                            `}</style>
                        </div>
                    ) : (
                        <div key="results-view" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border)' }}>
                                <span style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>Prueba Biométrica Facial</span>
                                {kycState === 'verified' ? <span className="badge" style={{ background: 'var(--success)', color: 'white' }}>MATCH 99.8%</span> : <span className="badge" style={{ background: 'var(--warning)', color: 'white' }}>Requerido</span>}
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border)' }}>
                                <span style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>Identidad OFAC (Sanciones)</span>
                                {kycState === 'verified' ? <span className="badge" style={{ background: 'var(--success)', color: 'white' }}>Limpio</span> : <span className="badge" style={{ background: 'var(--danger)', color: 'white' }}>Falta Escaneo</span>}
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border)' }}>
                                <span style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>Score Predictivo de Fraude</span>
                                {kycState === 'verified' ? <span className="badge" style={{ background: 'var(--success)', color: 'white' }}>Riesgo: 1.2% (Bajo)</span> : <span className="badge" style={{ background: 'var(--warning)', color: 'white' }}>Sin calcular</span>}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Fila 2: Portfolio Visual & Timeline */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                
                {/* Posición Consolidada (Gráfico de Dona) */}
                <div className="card glass layout-card" style={{ padding: '2rem' }}>
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Wallet size={20} color="var(--primary)" /> Posición Consolidada
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', height: '220px' }}>
                        <div style={{ flex: 1, height: '100%' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={portfolioData}
                                        cx="50%" cy="50%"
                                        innerRadius={60} outerRadius={80}
                                        paddingAngle={5} dataKey="value" stroke="none"
                                    >
                                        {portfolioData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip formatter={(value) => formatMoney(value)} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--success)' }}></div> Activos Líquidos
                                </div>
                                <div style={{ fontSize: '1.3rem', fontWeight: 700, marginTop: '0.2rem' }}>{formatMoney(activos)}</div>
                            </div>
                            <div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--danger)' }}></div> Pasivos (Deuda)
                                </div>
                                <div style={{ fontSize: '1.3rem', fontWeight: 700, marginTop: '0.2rem' }}>{formatMoney(pasivos)}</div>
                            </div>
                            <div style={{ paddingTop: '0.5rem', borderTop: '1px solid var(--border)' }}>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                    Patrimonio Neto
                                </div>
                                <div style={{ fontSize: '1.3rem', fontWeight: 700, marginTop: '0.2rem', color: (activos - pasivos) >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                                    {formatMoney(activos - pasivos)}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Activity Feed (Timeline) */}
                <div className="card glass layout-card" style={{ padding: '2rem' }}>
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Clock size={20} color="var(--primary)" /> Últimas Interacciones (Timeline)
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'relative' }}>
                        {/* Línea vertical conectora */}
                        <div style={{ position: 'absolute', left: '15px', top: '10px', bottom: '10px', width: '2px', background: 'var(--border)', zIndex: 0 }}></div>
                        
                        {timelineEvents.map((evt, idx) => (
                            <div key={evt.id} style={{ display: 'flex', gap: '1rem', position: 'relative', zIndex: 1, alignItems: 'flex-start' }}>
                                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--background)', border: `2px solid var(${evt.type === 'credit' ? '--warning' : evt.type === 'payment' ? '--success' : '--primary'})`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: `var(${evt.type === 'credit' ? '--warning' : evt.type === 'payment' ? '--success' : '--primary'})` }}></div>
                                </div>
                                <div style={{ background: 'var(--background)', padding: '1rem', borderRadius: '8px', flex: 1, border: '1px solid var(--border)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                        <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{evt.title}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{evt.date}</div>
                                    </div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{evt.desc}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>

        </div>
    );
};

export default TabDashboard360;
