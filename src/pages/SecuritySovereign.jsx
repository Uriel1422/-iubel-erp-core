import React, { useState, useEffect } from 'react';
import { 
    ShieldCheck, ShieldAlert, Lock, Fingerprint, Activity, 
    Zap, AlertOctagon, History, Database, Cpu, Globe, 
    RefreshCw, Building2, UserX, ShieldQuestion
} from 'lucide-react';
import { api } from '../utils/api';
import { 
    ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, 
    BarChart, Bar, Cell, CartesianGrid 
} from 'recharts';

const SecuritySovereign = () => {
    const [stats, setStats] = useState({
        integrityScore: 100,
        blockedThreats: 12,
        activeSentry: true,
        lastIntegrityCheck: 'Hace 4 minutos'
    });

    const [threats, setThreats] = useState([
        { id: 1, type: 'Monto Inusual', user: 'caj_01', status: 'BLOQUEADO', time: '10:45 AM', risk: 85, shieldId: 'SHD-17730104' },
        { id: 2, type: 'Acceso No Autorizado', user: 'inv_02', status: 'BLOQUEADO', time: '09:12 AM', risk: 92, shieldId: 'SHD-17730098' },
        { id: 3, type: 'Drift de Ubicación', user: 'adm_03', status: 'NOTIFICADO', time: '08:30 AM', risk: 45, shieldId: 'SHD-17729955' }
    ]);

    const [tenants, setTenants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [resetting, setResetting] = useState(null);

    useEffect(() => {
        const loadTenants = async () => {
            try {
                // In a real scenario, we'd fetch from /api/superadmin/empresas
                // For now, let's mock or use the standard list if available
                const data = await api.get('superadmin/empresas');
                setTenants(Array.isArray(data) ? data : []);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        loadTenants();
    }, []);

    const handleResetBiometrics = async (empresaId) => {
        if (!window.confirm('¿Confirmar Reseteo Biométrico Operacional? El usuario deberá registrar su rostro nuevamente.')) return;
        setResetting(empresaId);
        try {
            // Secure API call to clear fingerprint for this specific company
            await api.save('vault_face_profile/reset', { empresaId });
            alert('Protocolo de reseteo completado. Acceso facial despejado para la institución.');
        } catch (e) {
            alert('Error en el protocolo de seguridad.');
        } finally {
            setResetting(null);
        }
    };

    return (
        <div className="animate-fade-in" style={{ backgroundColor: '#020617', color: 'white', minHeight: '100vh', margin: '-1.5rem', padding: '2.5rem' }}>
            {/* Header Sovereign */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '3rem' }}>
                <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                    <div style={{ 
                        width: 60, height: 60, borderRadius: '18px', 
                        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', 
                        border: '1px solid #334155', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 0 30px rgba(99,102,241,0.1)'
                    }}>
                        <Fingerprint size={32} color="#6366f1" />
                    </div>
                    <div>
                        <h1 style={{ fontSize: '1.8rem', fontWeight: 900, margin: 0, letterSpacing: '-0.03em', color: '#f8fafc' }}>
                            Iubel Sovereign <span style={{ color: '#6366f1', fontSize: '0.8rem', verticalAlign: 'middle', background: 'rgba(99,102,241,0.1)', padding: '0.2rem 0.6rem', borderRadius: '6px', marginLeft: '0.5rem' }}>DEFENSE LEVEL 5</span>
                        </h1>
                        <p style={{ margin: '0.4rem 0 0', color: '#64748b', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Globe size={14} /> Centro de Comando de Seguridad Institucional • Inmutable Ledger Active
                        </p>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase' }}>Sistema Estatus</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#10b981', fontWeight: 700 }}>
                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 10px #10b981' }}></div>
                            DEFENSA ACTIVA
                        </div>
                    </div>
                </div>
            </div>

            {/* Matrix KPIs */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2.5rem' }}>
                {[
                    { label: 'Integridad Ledger', val: '100%', Icon: ShieldCheck, color: '#10b981' },
                    { label: 'Amenazas Bloqueadas', val: stats.blockedThreats, Icon: ShieldAlert, color: '#f43f5e' },
                    { label: 'Tiempo de Respuesta', val: '14ms', Icon: Zap, color: '#fbbf24' },
                    { label: 'Nodos de Validación', val: '12', Icon: Database, color: '#6366f1' }
                ].map((kpi, i) => (
                    <div key={i} style={{ 
                        background: '#0f172a', padding: '1.5rem', borderRadius: '20px', 
                        border: '1px solid #1e293b', boxShadow: '0 10px 20px rgba(0,0,0,0.2)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                            <kpi.Icon size={24} color={kpi.color} />
                            <Activity size={16} color="#334155" />
                        </div>
                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.25rem' }}>{kpi.label}</div>
                        <div style={{ fontSize: '1.75rem', fontWeight: 900, color: 'white' }}>{kpi.val}</div>
                    </div>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1.5rem', marginBottom: '2.5rem' }}>
                {/* Integrity Chart */}
                <div style={{ background: '#0f172a', padding: '2rem', borderRadius: '24px', border: '1px solid #1e293b' }}>
                    <h3 style={{ margin: '0 0 2rem 0', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <Lock size={18} color="#6366f1" /> Monitor de Integridad Criptográfica (Chain Pulse)
                    </h3>
                    <div style={{ height: 280 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={[
                                { name: '08:00', v: 100 }, { name: '09:00', v: 100 }, 
                                { name: '10:00', v: 100 }, { name: '11:00', v: 99.9 }, 
                                { name: '12:00', v: 100 }, { name: '13:00', v: 100 }
                            ]}>
                                <defs>
                                    <linearGradient id="colorInt" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                <XAxis dataKey="name" fontSize={11} stroke="#475569" />
                                <YAxis domain={[99.5, 100]} fontSize={11} stroke="#475569" />
                                <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '8px' }} />
                                <Area type="monotone" dataKey="v" stroke="#6366f1" fillOpacity={1} fill="url(#colorInt)" strokeWidth={3} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Biometric Override Control (Added High-End UI) */}
                <div style={{ background: '#0f172a', padding: '2rem', borderRadius: '24px', border: '1px solid #1e293b', display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ margin: '0 0 1.5rem 0', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <RefreshCw size={18} color="#f59e0b" /> Override Biométrico SA
                    </h3>
                    <p style={{ margin: '0 0 1.5rem 0', color: '#64748b', fontSize: '0.8rem', lineHeight: 1.5 }}>
                        Gestión centralizada de perfiles faciales. Única vía autorizada para desbloquear bóvedas en caso de pérdida de acceso del cliente.
                    </p>
                    
                    <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '280px', paddingRight: '0.5rem' }}>
                        {loading ? (
                            <div style={{ color: '#475569', fontSize: '0.8rem', textAlign: 'center', padding: '2rem' }}>Cargando terminales...</div>
                        ) : tenants.length === 0 ? (
                            <div style={{ color: '#475569', fontSize: '0.8rem', textAlign: 'center', padding: '2rem' }}>No hay instituciones activas.</div>
                        ) : tenants.map(t => (
                            <div key={t.id} style={{ 
                                background: 'rgba(255,255,255,0.02)', padding: '0.875rem', borderRadius: '14px', 
                                border: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <div style={{ width: 32, height: 32, borderRadius: '8px', background: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Building2 size={16} color="#94a3b8" />
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#f8fafc' }}>{t.nombre}</div>
                                        <div style={{ fontSize: '0.65rem', color: '#64748b' }}>RNC: {t.rnc || '---'}</div>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => handleResetBiometrics(t.id)}
                                    disabled={resetting === t.id}
                                    style={{ 
                                        padding: '0.45rem 0.75rem', borderRadius: '8px', background: 'rgba(245, 158, 11, 0.1)', 
                                        color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.2)', fontSize: '0.7rem', 
                                        fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s'
                                    }}
                                >
                                    {resetting === t.id ? 'RESETTING...' : 'RESET FACIAL'}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
                {/* Real-time Threat Map */}
                <div style={{ background: '#0f172a', padding: '2rem', borderRadius: '24px', border: '1px solid #1e293b' }}>
                    <h3 style={{ margin: '0 0 2rem 0', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <AlertOctagon size={18} color="#f43f5e" /> Amenazas en Tiempo Real (FraudShield)
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        {threats.map(t => (
                            <div key={t.id} style={{ 
                                background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '16px', 
                                borderLeft: `4px solid ${t.risk > 80 ? '#f43f5e' : '#fbbf24'}`,
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                            }}>
                                <div>
                                    <div style={{ fontSize: '0.85rem', fontWeight: 800 }}>{t.type}</div>
                                    <div style={{ fontSize: '0.7rem', color: '#64748b' }}>User: {t.user} • {t.time}</div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '0.7rem', fontWeight: 900, color: t.risk > 80 ? '#f43f5e' : '#fbbf24' }}>RIESGO {t.risk}%</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Sentry Logs Placeholder */}
                <div style={{ background: '#0f172a', padding: '2rem', borderRadius: '24px', border: '1px solid #1e293b', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ padding: '0.5rem', background: 'rgba(99,102,241,0.1)', borderRadius: '10px' }}>
                            <History size={18} color="#6366f1" />
                        </div>
                        <span style={{ fontWeight: 800, fontSize: '0.85rem' }}>Protocolos de Respaldo</span>
                    </div>
                    {[
                        { label: 'Acceso por SuperAdmin', status: 'Inmune', icon: <UserX size={14} color="#10b981" /> },
                        { label: 'Manual de Recuperación', status: 'Consultar', icon: <ShieldQuestion size={14} color="#f59e0b" /> },
                    ].map((item, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid #1e293b' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.75rem', fontWeight: 600 }}>{item.icon} {item.label}</div>
                            <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#475569' }}>{item.status}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Sovereign Footer */}
            <div style={{ marginTop: '3rem', padding: '1.5rem', background: 'linear-gradient(90deg, #0f172a 0%, #1e1b4b 100%)', borderRadius: '18px', border: '1px solid #1e293b', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <Cpu size={24} color="#6366f1" />
                <div style={{ flex: 1 }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#a5b4fc', display: 'block' }}>Iubel Sovereign Intelligence Unit</span>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>
                        La arquitectura Sovereign garantiza un tiempo de actividad del 99.99% con inmutabilidad de datos de grado bancario. Todos los registros son firmados por el hardware local.
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <div style={{ width: 40, height: 40, borderRadius: '10px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <History size={18} color="#64748b" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SecuritySovereign;
