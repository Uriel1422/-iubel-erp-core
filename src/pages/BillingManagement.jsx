import React from 'react';
import { useAuth } from '../context/AuthContext';
import { 
    CreditCard, Zap, ShieldCheck, Users, Database, 
    ArrowUpCircle, History, Receipt, AlertCircle 
} from 'lucide-react';

const BillingManagement = () => {
    const { empresa } = useAuth();
    
    // Mock usage data
    const usage = {
        users: { current: 2, limit: 3 },
        storage: { current: 124, limit: 1024 }, // MB
        transactions: { current: 450, limit: 1000 }
    };

    const getProgress = (curr, limit) => (curr / limit) * 100;

    return (
        <div className="animate-up" style={{ padding: '2rem' }}>
            <header style={{ marginBottom: '3rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                    <div style={{ width: 48, height: 48, borderRadius: '14px', background: 'rgba(99,102,241,0.1)', color: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <CreditCard size={24} />
                    </div>
                    <div>
                        <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Mi Suscripción</h1>
                        <p style={{ color: 'var(--text-muted)' }}>Gestiona tu plan, facturación y límites de Iubel Cloud.</p>
                    </div>
                </div>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem' }}>
                {/* Plan Info Card */}
                <div className="card glass" style={{ padding: '2.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '3rem' }}>
                        <div>
                            <div style={{ color: '#6366f1', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.5rem' }}>PLAN ACTUAL</div>
                            <h2 style={{ fontSize: '2.5rem', fontWeight: 900 }}>Iubel <span style={{ color: '#6366f1' }}>{String(empresa?.plan || 'Básico').toUpperCase()}</span></h2>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#10b981', fontWeight: 700, marginTop: '0.5rem' }}>
                                <ShieldCheck size={16} /> Suscripción Activa
                            </div>
                        </div>
                        <button style={{ padding: '0.75rem 1.5rem', borderRadius: '12px', background: '#6366f1', color: 'white', border: 'none', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                            <ArrowUpCircle size={18} /> Mejorar Plan
                        </button>
                    </div>

                    <div style={{ display: 'grid', gap: '2rem' }}>
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                                <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Users size={16} /> Usuarios</span>
                                <span style={{ fontWeight: 700 }}>{usage.users.current} / {usage.users.limit}</span>
                            </div>
                            <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                                <div style={{ width: `${getProgress(usage.users.current, usage.users.limit)}%`, height: '100%', background: '#6366f1' }} />
                            </div>
                        </div>

                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                                <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Database size={16} /> Almacenamiento</span>
                                <span style={{ fontWeight: 700 }}>{usage.storage.current}MB / {usage.storage.limit}MB</span>
                            </div>
                            <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                                <div style={{ width: `${getProgress(usage.storage.current, usage.storage.limit)}%`, height: '100%', background: '#38bdf8' }} />
                            </div>
                        </div>

                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                                <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Zap size={16} /> Transacciones / Mes</span>
                                <span style={{ fontWeight: 700 }}>{usage.transactions.current} / {usage.transactions.limit}</span>
                            </div>
                            <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                                <div style={{ width: `${getProgress(usage.transactions.current, usage.transactions.limit)}%`, height: '100%', background: '#facc15' }} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Billing History */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div className="card glass" style={{ padding: '1.5rem' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <History size={18} /> Historial de Pagos
                        </h3>
                        <div style={{ display: 'grid', gap: '1rem' }}>
                            {[ 
                                { date: '01 Mar 2026', amount: '$4,500.00', status: 'Pagado' },
                                { date: '01 Feb 2026', amount: '$4,500.00', status: 'Pagado' }
                            ].map((inv, i) => (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', borderRadius: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                                    <div>
                                        <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{inv.date}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Membresía Mensual</div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontWeight: 800, color: '#f8fafc' }}>{inv.amount}</div>
                                        <div style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: 700 }}>{inv.status}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="card" style={{ padding: '1.5rem', background: 'rgba(245, 158, 11, 0.05)', border: '1px solid rgba(245, 158, 11, 0.1)' }}>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <AlertCircle size={20} style={{ color: '#f59e0b', flexShrink: 0 }} />
                            <div>
                                <div style={{ fontWeight: 800, color: '#f59e0b', fontSize: '0.9rem' }}>Próximo Pago</div>
                                <div style={{ fontSize: '0.8rem', color: '#92400e', marginTop: '0.25rem' }}>Tu membresía se renovará automáticamente el 01 de Abril de 2026.</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BillingManagement;
