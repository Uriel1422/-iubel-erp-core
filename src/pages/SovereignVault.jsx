import React, { useState, useEffect } from 'react';
import { 
    Shield, Lock, Unlock, Key, Fingerprint, Eye, EyeOff, 
    ShieldCheck, ShieldAlert, Cpu, Network, Globe, Zap,
    ChevronRight, ArrowRight, Download, Share2, Plus, 
    Smartphone, HardDrive, Database
} from 'lucide-react';

const SovereignVault = () => {
    const [isLocked, setIsLocked] = useState(true);
    const [scanning, setScanning] = useState(false);
    const [scanProgress, setScanProgress] = useState(0);
    const [showBalance, setShowBalance] = useState(false);
    const [activeTab, setActiveTab] = useState('assets');

    // Simulación de escaneo biométrico
    const startScan = () => {
        setScanning(true);
        setScanProgress(0);
        const interval = setInterval(() => {
            setScanProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    setTimeout(() => {
                        setScanning(false);
                        setIsLocked(false);
                    }, 500);
                    return 100;
                }
                return prev + 5;
            });
        }, 50);
    };

    const assets = [
        { id: 1, name: 'Sovereign Reserve (BTC)', amount: '12.45 BTC', value: '$784,390.23', change: '+2.4%', icon: <Zap size={20} /> },
        { id: 2, name: 'Institutional Liquidity', amount: '$450,000.00', value: '$450,000.00', change: '0.0%', icon: <Globe size={20} /> },
        { id: 3, name: 'Private Equity (A-Series)', amount: '2,500 Shares', value: '$125,000.00', change: '+12.1%', icon: <Database size={20} /> },
        { id: 4, name: 'Tokenized Real Estate', amount: '4 Units', value: '$340,000.00', change: '+0.5%', icon: <Network size={20} /> },
    ];

    if (isLocked) {
        return (
            <div className="vault-overlay animate-fade-in" style={{
                height: 'calc(100vh - 120px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'radial-gradient(circle at center, #0f172a 0%, #020617 100%)',
                margin: '0 -2rem',
                borderRadius: '0',
                position: 'relative',
                overflow: 'hidden'
            }}>
                {/* Background effects */}
                <div style={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    background: 'url("https://www.transparenttextures.com/patterns/carbon-fibre.png")',
                    opacity: 0.1,
                    pointerEvents: 'none'
                }} />
                
                <div className="card glass-premium" style={{
                    maxWidth: '450px',
                    width: '90%',
                    padding: '3rem',
                    textAlign: 'center',
                    border: '1px solid rgba(255,255,255,0.1)',
                    background: 'rgba(30, 41, 59, 0.4)',
                    backdropFilter: 'blur(30px)',
                    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
                    borderRadius: '24px'
                }}>
                    <div style={{ marginBottom: '2rem', position: 'relative' }}>
                        <div className={`shield-container ${scanning ? 'scanning' : ''}`} style={{
                            width: '100px',
                            height: '100px',
                            margin: '0 auto',
                            background: scanning ? 'rgba(56, 189, 248, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: scanning ? '2px solid #38bdf8' : '2px solid rgba(255,255,255,0.1)',
                            transition: 'all 0.3s ease',
                            position: 'relative',
                            overflow: 'hidden'
                        }}>
                            {scanning ? (
                                <Fingerprint size={48} color="#38bdf8" />
                            ) : (
                                <Lock size={48} color="rgba(255,255,255,0.5)" />
                            )}
                            
                            {scanning && (
                                <div style={{
                                    position: 'absolute',
                                    top: `${scanProgress}%`,
                                    left: 0,
                                    width: '100%',
                                    height: '2px',
                                    background: '#38bdf8',
                                    boxShadow: '0 0 15px #38bdf8',
                                    zIndex: 2
                                }} />
                            )}
                        </div>
                    </div>

                    <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff', marginBottom: '0.5rem', letterSpacing: '-0.025em' }}>
                        Iubel Sovereign Vault
                    </h2>
                    <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '2.5rem', fontSize: '0.95rem' }}>
                        {scanning ? 'Verificando identidad institucional...' : 'Requiere autenticación de Nivel 5 para acceder a activos restringidos.'}
                    </p>

                    <button 
                        className="btn-premium" 
                        onClick={startScan}
                        disabled={scanning}
                        style={{
                            width: '100%',
                            padding: '1rem',
                            background: scanning ? 'transparent' : 'linear-gradient(135deg, #38bdf8 0%, #1d4ed8 100%)',
                            color: '#fff',
                            border: scanning ? '1px solid #38bdf8' : 'none',
                            borderRadius: '12px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.75rem',
                            fontSize: '1rem',
                            boxShadow: scanning ? 'none' : '0 10px 15px -3px rgba(56, 189, 248, 0.4)'
                        }}
                    >
                        {scanning ? (
                            <>Escaneando ({scanProgress}%)</>
                        ) : (
                            <>
                                <Fingerprint size={20} />
                                Iniciar Escaneo Biométrico
                            </>
                        )}
                    </button>

                    <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)' }}>
                            <ShieldCheck size={14} /> AES-256
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)' }}>
                            <Cpu size={14} /> Quantum Proof
                        </div>
                    </div>
                </div>
                
                <style>{`
                    .glass-premium {
                        backdrop-filter: blur(30px);
                        -webkit-backdrop-filter: blur(30px);
                    }
                    @keyframes pulse-border {
                        0% { box-shadow: 0 0 5px #38bdf8; border-color: rgba(56, 189, 248, 0.5); }
                        100% { box-shadow: 0 0 20px #38bdf8; border-color: #38bdf8; }
                    }
                    .shield-container.scanning {
                        animation: pulse-border 1s infinite alternate;
                    }
                `}</style>
            </div>
        );
    }

    return (
        <div className="animate-up" style={{ padding: '2rem', background: '#020617', margin: '-2rem', borderRadius: '0', minHeight: 'calc(100vh - 120px)', color: '#fff' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                        <div style={{ padding: '0.5rem', background: 'rgba(56, 189, 248, 0.1)', borderRadius: '10px' }}>
                            <ShieldCheck size={24} color="#38bdf8" />
                        </div>
                        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', margin: 0 }}>Sovereign Vault</h1>
                    </div>
                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem' }}>Estado de Seguridad: <span style={{ color: '#10b981', fontWeight: 700 }}>MÁXIMA PROTECCIÓN</span></p>
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button className="btn" onClick={() => setShowBalance(!showBalance)} style={{ background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', padding: '0.6rem 1rem', borderRadius: '8px', cursor: 'pointer' }}>
                        {showBalance ? <EyeOff size={18} /> : <Eye size={18} /> }
                    </button>
                    <button className="btn" onClick={() => setIsLocked(true)} style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '0.6rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, borderRadius: '8px', cursor: 'pointer' }}>
                        <Lock size={18} /> Cerrar Bóveda
                    </button>
                </div>
            </div>

            {/* Matrix Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
                <div className="card glass-premium" style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px' }}>
                    <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.75rem' }}>Valor Total Protegido</div>
                    <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff' }}>
                        {showBalance ? '$1,699,390.23' : '••••••••••'}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#10b981', marginTop: '0.5rem', fontWeight: 600 }}>+15.4% rendimiento anualizado</div>
                </div>
                <div className="card glass-premium" style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px' }}>
                    <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.75rem' }}>Nivel de Blindaje</div>
                    <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#38bdf8' }}>9.98/10</div>
                    <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', marginTop: '0.5rem' }}>Encriptación post-cuántica activa</div>
                </div>
                <div className="card glass-premium" style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px' }}>
                    <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.75rem' }}>Integridad Ledger</div>
                    <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff' }}>100.0%</div>
                    <div style={{ fontSize: '0.8rem', color: '#10b981', marginTop: '0.5rem', fontWeight: 600 }}>Cadenas SHA-256 validadas</div>
                </div>
            </div>

            {/* Asset Table */}
            <div className="card glass-premium" style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '20px', overflow: 'hidden' }}>
                <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>Inventario de Activos Soberanos</h3>
                    <button style={{ background: '#38bdf8', color: '#fff', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}>
                        <Plus size={16} /> Agregar Activo
                    </button>
                </div>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ textAlign: 'left', background: 'rgba(255,255,255,0.02)' }}>
                                <th style={{ padding: '1.25rem', color: 'rgba(255,255,255,0.3)', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase' }}>Activo</th>
                                <th style={{ padding: '1.25rem', color: 'rgba(255,255,255,0.3)', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase' }}>Cantidad</th>
                                <th style={{ padding: '1.25rem', color: 'rgba(255,255,255,0.3)', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', textAlign: 'right' }}>Valor Actual</th>
                                <th style={{ padding: '1.25rem', color: 'rgba(255,255,255,0.3)', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', textAlign: 'right' }}>Var 24h</th>
                                <th style={{ padding: '1.25rem', color: 'rgba(255,255,255,0.3)', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', textAlign: 'center' }}>Seguridad</th>
                            </tr>
                        </thead>
                        <tbody>
                            {assets.map(asset => (
                                <tr key={asset.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', transition: 'all 0.2s' }}>
                                    <td style={{ padding: '1.25rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <div style={{ width: 40, height: 40, borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#38bdf8' }}>
                                                {asset.icon}
                                            </div>
                                            <div style={{ fontWeight: 600, color: '#fff' }}>{asset.name}</div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '1.25rem', color: 'rgba(255,255,255,0.7)' }}>{asset.amount}</td>
                                    <td style={{ padding: '1.25rem', color: '#fff', fontWeight: 700, textAlign: 'right' }}>
                                        {showBalance ? asset.value : '••••••••'}
                                    </td>
                                    <td style={{ padding: '1.25rem', color: asset.change.startsWith('+') ? '#10b981' : '#ef4444', fontWeight: 700, textAlign: 'right' }}>
                                        {asset.change}
                                    </td>
                                    <td style={{ padding: '1.25rem', textAlign: 'center' }}>
                                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.25rem 0.75rem', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 700 }}>
                                            <Shield size={12} /> SECURED
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Hardware Connections */}
            <div style={{ marginTop: '2.5rem' }}>
                <h3 style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem' }}>Dispositivos de Firma Soberana</h3>
                <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                    <div className="card glass-premium" style={{ flex: 1, minWidth: '300px', display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '1.5rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px' }}>
                        <div style={{ width: 48, height: 48, borderRadius: '12px', background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Smartphone size={24} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ color: '#fff', fontWeight: 700 }}>iPhone 15 Pro Max</div>
                            <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' }}>Auth principal (FaceID habilitado)</div>
                        </div>
                        <div style={{ width: 10, height: 10, background: '#10b981', borderRadius: '50%', boxShadow: '0 0 10px #10b981' }} />
                    </div>
                    <div className="card glass-premium" style={{ flex: 1, minWidth: '300px', display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '1.5rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px' }}>
                        <div style={{ width: 48, height: 48, borderRadius: '12px', background: 'rgba(255, 255, 255, 0.05)', color: 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <HardDrive size={24} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ color: '#fff', fontWeight: 700 }}>Nano S Plus (Ledger)</div>
                            <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' }}>Almacenamiento en frío offline</div>
                        </div>
                        <div style={{ width: 10, height: 10, background: 'rgba(255,255,255,0.1)', borderRadius: '50%' }} />
                    </div>
                </div>
            </div>

            <style>{`
                .glass-premium {
                    backdrop-filter: blur(12px);
                    -webkit-backdrop-filter: blur(12px);
                }
            `}</style>
        </div>
    );
};

export default SovereignVault;
