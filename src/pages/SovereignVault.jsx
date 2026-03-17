import React, { useState, useEffect, useRef } from 'react';
import { 
    Shield, Lock, Unlock, Key, Fingerprint, Eye, EyeOff, 
    ShieldCheck, ShieldAlert, Cpu, Network, Globe, Zap,
    ChevronRight, ArrowRight, Download, Share2, Plus, 
    Smartphone, HardDrive, Database, Camera, XCircle, CheckCircle
} from 'lucide-react';

const SovereignVault = () => {
    const [isLocked, setIsLocked] = useState(true);
    const [scanning, setScanning] = useState(false);
    const [scanProgress, setScanProgress] = useState(0);
    const [showBalance, setShowBalance] = useState(false);
    const [activeTab, setActiveTab] = useState('assets');
    const [scanMode, setScanMode] = useState(null); // 'biometric' | 'camera' | 'pin' | null
    const [pinValue, setPinValue] = useState('');
    const [scanStatus, setScanStatus] = useState(''); // 'verifying' | 'success' | 'error' | ''
    const [scanMessage, setScanMessage] = useState('');
    const [cameraStream, setCameraStream] = useState(null);
    const videoRef = useRef(null);
    const intervalRef = useRef(null);

    const VAULT_PIN = '1234'; // PIN de respaldo de demostración

    // Limpieza de cámara al desmontar
    useEffect(() => {
        return () => {
            if (cameraStream) {
                cameraStream.getTracks().forEach(t => t.stop());
            }
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [cameraStream]);

    useEffect(() => {
        if (videoRef.current && cameraStream) {
            videoRef.current.srcObject = cameraStream;
        }
    }, [cameraStream]);

    const stopCamera = () => {
        if (cameraStream) {
            cameraStream.getTracks().forEach(t => t.stop());
            setCameraStream(null);
        }
    };

    const unlockVault = () => {
        stopCamera();
        setScanStatus('success');
        setScanMessage('Acceso Nivel 5 Autorizado');
        setTimeout(() => {
            setIsLocked(false);
            setScanMode(null);
            setScanning(false);
            setScanProgress(0);
            setScanStatus('');
        }, 1200);
    };

    const startScan = async () => {
        setScanStatus('');
        setScanMessage('');

        // === 1. TRY REAL WEBAUTHN BIOMETRIC (fingerprint / FaceID / Windows Hello) ===
        if (window.PublicKeyCredential) {
            try {
                setScanMode('biometric');
                setScanStatus('verifying');
                setScanMessage('Verificando identidad con biometría del dispositivo...');
                setScanning(true);
                setScanProgress(0);

                // Simular progreso visual mientras WebAuthn procesa
                intervalRef.current = setInterval(() => {
                    setScanProgress(prev => (prev >= 90 ? 90 : prev + 8));
                }, 120);

                // Challenge aleatorio
                const challenge = new Uint8Array(32);
                crypto.getRandomValues(challenge);

                const credential = await navigator.credentials.get({
                    publicKey: {
                        challenge,
                        timeout: 30000,
                        userVerification: 'required', // Fuerza biometría/PIN del SO
                        rpId: window.location.hostname || 'localhost',
                    }
                });

                clearInterval(intervalRef.current);
                setScanProgress(100);

                if (credential) {
                    setScanMessage('✅ Biometría validada. Abriendo bóveda...');
                    unlockVault();
                }
            } catch (err) {
                clearInterval(intervalRef.current);
                // Si el usuario canceló o no hay credencial registrada, ofrecer cámara
                if (err.name === 'NotAllowedError' || err.name === 'InvalidStateError') {
                    // Usuario canceló → ofrecer cámara
                    setScanMessage('Biometría cancelada. Iniciando verificación por cámara...');
                    setTimeout(() => startCamera(), 1200);
                } else {
                    // No soportado → ir directo a cámara 
                    setScanMessage('Biometría no disponible. Verificando por cámara facial...');
                    setTimeout(() => startCamera(), 1200);
                }
            }
        } else {
            // WebAuthn no disponible → usar cámara directamente
            startCamera();
        }
    };

    const startCamera = async () => {
        setScanMode('camera');
        setScanStatus('verifying');
        setScanMessage('Activando cámara para verificación facial...');
        setScanning(true);
        setScanProgress(0);

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { width: 320, height: 240, facingMode: 'user' },
                audio: false
            });
            setCameraStream(stream);
            setScanMessage('Cámara activa. Mirando hacia la cámara...');

            // Simular análisis de ~3 segundos
            let progress = 0;
            intervalRef.current = setInterval(() => {
                progress += 3;
                setScanProgress(progress);
                if (progress >= 100) {
                    clearInterval(intervalRef.current);
                    setScanMessage('✅ Verificación facial exitosa. Acceso autorizado.');
                    unlockVault();
                }
            }, 90);
        } catch (err) {
            setScanStatus('error');
            setScanMessage('No se pudo acceder a la cámara. Use el PIN de respaldo.');
            setScanMode('pin');
        }
    };

    const handlePinSubmit = (e) => {
        e.preventDefault();
        if (pinValue === VAULT_PIN) {
            setScanStatus('success');
            setScanMessage('✅ PIN correcto. Acceso autorizado.');
            setTimeout(() => unlockVault(), 900);
        } else {
            setScanStatus('error');
            setScanMessage('PIN incorrecto. Intente nuevamente.');
            setPinValue('');
        }
    };

    const cancelScan = () => {
        stopCamera();
        if (intervalRef.current) clearInterval(intervalRef.current);
        setScanning(false);
        setScanProgress(0);
        setScanMode(null);
        setScanStatus('');
        setScanMessage('');
        setPinValue('');
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
                    maxWidth: '480px',
                    width: '95%',
                    textAlign: 'center',
                    border: '1px solid rgba(255,255,255,0.1)',
                    background: 'rgba(15, 23, 42, 0.7)',
                    backdropFilter: 'blur(30px)',
                    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.7)',
                    borderRadius: '28px',
                    overflow: 'hidden'
                }}>
                    {/* Live Camera Feed */}
                    {scanMode === 'camera' && cameraStream && (
                        <div style={{ position: 'relative', background: '#000' }}>
                            <video ref={videoRef} autoPlay playsInline muted style={{ width: '100%', height: '220px', objectFit: 'cover', display: 'block' }} />
                            {/* Scan overlay */}
                            <div style={{ position: 'absolute', inset: 0, border: '3px solid #38bdf8', borderRadius: '0', boxShadow: 'inset 0 0 30px rgba(56,189,248,0.2)', pointerEvents: 'none' }} />
                            <div style={{ position: 'absolute', top: `${scanProgress}%`, left: 0, width: '100%', height: '2px', background: 'linear-gradient(90deg, transparent, #38bdf8, transparent)', boxShadow: '0 0 20px #38bdf8', transition: 'top 0.1s linear' }} />
                            <div style={{ position: 'absolute', top: 12, left: 12, background: 'rgba(239,68,68,0.8)', color: '#fff', fontSize: '0.65rem', fontWeight: 800, padding: '0.2rem 0.6rem', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#fff', animation: 'pulse-dot 1s infinite' }} />
                                REC
                            </div>
                            <div style={{ position: 'absolute', bottom: 12, left: '50%', transform: 'translateX(-50%)', background: 'rgba(0,0,0,0.6)', color: '#38bdf8', fontSize: '0.7rem', fontWeight: 700, padding: '0.3rem 0.75rem', borderRadius: '6px', whiteSpace: 'nowrap' }}>
                                Análisis facial en progreso… {scanProgress}%
                            </div>
                        </div>
                    )}

                    <div style={{ padding: '2.5rem' }}>
                        {/* Icon */}
                        {scanMode !== 'camera' && (
                            <div style={{ marginBottom: '1.5rem' }}>
                                <div className={`shield-container ${scanning && scanMode !== 'pin' ? 'scanning' : ''}`} style={{
                                    width: '96px', height: '96px', margin: '0 auto',
                                    background: scanStatus === 'success' ? 'rgba(16,185,129,0.15)' : scanStatus === 'error' ? 'rgba(239,68,68,0.1)' : scanning ? 'rgba(56,189,248,0.1)' : 'rgba(255,255,255,0.05)',
                                    borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    border: `2px solid ${scanStatus === 'success' ? '#10b981' : scanStatus === 'error' ? '#ef4444' : scanning ? '#38bdf8' : 'rgba(255,255,255,0.1)'}`,
                                    transition: 'all 0.4s ease', position: 'relative', overflow: 'hidden'
                                }}>
                                    {scanStatus === 'success' ? <CheckCircle size={48} color="#10b981" /> :
                                     scanStatus === 'error' ? <XCircle size={48} color="#ef4444" /> :
                                     scanMode === 'biometric' ? <Fingerprint size={48} color="#38bdf8" /> :
                                     scanMode === 'pin' ? <Key size={48} color="#f59e0b" /> :
                                     <Lock size={48} color="rgba(255,255,255,0.5)" />}
                                    {scanning && scanMode === 'biometric' && (
                                        <div style={{ position: 'absolute', top: `${scanProgress}%`, left: 0, width: '100%', height: '2px', background: '#38bdf8', boxShadow: '0 0 15px #38bdf8', zIndex: 2 }} />
                                    )}
                                </div>
                            </div>
                        )}

                        <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff', marginBottom: '0.25rem', letterSpacing: '-0.025em' }}>
                            Iubel Sovereign Vault
                        </h2>
                        <p style={{ color: scanStatus === 'error' ? '#ef4444' : scanStatus === 'success' ? '#10b981' : 'rgba(255,255,255,0.5)', marginBottom: '2rem', fontSize: '0.9rem', minHeight: '1.5rem', transition: 'color 0.3s' }}>
                            {scanMessage || 'Autenticación de Nivel 5 requerida para acceder a activos restringidos.'}
                        </p>

                        {/* Progress bar */}
                        {scanning && scanMode !== 'pin' && (
                            <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden', marginBottom: '1.5rem' }}>
                                <div style={{ height: '100%', width: `${scanProgress}%`, background: 'linear-gradient(90deg, #38bdf8, #1d4ed8)', borderRadius: '2px', transition: 'width 0.1s linear', boxShadow: '0 0 10px #38bdf8' }} />
                            </div>
                        )}

                        {/* PIN Input */}
                        {scanMode === 'pin' && (
                            <form onSubmit={handlePinSubmit} style={{ marginBottom: '1.5rem' }}>
                                <div style={{ marginBottom: '1rem', fontSize: '0.78rem', color: '#f59e0b', fontWeight: 700 }}>
                                    🔑 PIN de Respaldo
                                </div>
                                <input
                                    type="password"
                                    value={pinValue}
                                    onChange={e => setPinValue(e.target.value)}
                                    placeholder="Ingrese su PIN"
                                    maxLength={8}
                                    autoFocus
                                    style={{ width: '100%', padding: '0.875rem', background: 'rgba(255,255,255,0.05)', border: `1px solid ${scanStatus === 'error' ? '#ef4444' : 'rgba(255,255,255,0.15)'}`, borderRadius: '12px', color: '#fff', fontSize: '1.25rem', textAlign: 'center', letterSpacing: '0.5em', outline: 'none', marginBottom: '0.75rem', fontFamily: 'monospace' }}
                                />
                                <button type="submit" style={{ width: '100%', padding: '0.875rem', background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', fontSize: '1rem' }}>
                                    Verificar PIN
                                </button>
                            </form>
                        )}

                        {/* Primary Action */}
                        {!scanning && scanMode !== 'pin' && (
                            <button className="btn-premium" onClick={startScan} style={{
                                width: '100%', padding: '1rem',
                                background: 'linear-gradient(135deg, #38bdf8 0%, #1d4ed8 100%)',
                                color: '#fff', border: 'none', borderRadius: '14px', fontWeight: 700,
                                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                gap: '0.75rem', fontSize: '1rem', boxShadow: '0 10px 20px -3px rgba(56,189,248,0.35)',
                                transition: 'transform 0.2s, box-shadow 0.2s'
                            }}>
                                <Fingerprint size={20} /> Iniciar Escaneo Biométrico
                            </button>
                        )}

                        {/* Cancel Button */}
                        {scanning && (
                            <button onClick={cancelScan} style={{ marginTop: '1rem', background: 'none', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.5)', borderRadius: '10px', padding: '0.6rem 1.5rem', cursor: 'pointer', fontSize: '0.85rem', width: '100%' }}>
                                Cancelar
                            </button>
                        )}

                        {/* Badges */}
                        <div style={{ marginTop: '1.75rem', display: 'flex', justifyContent: 'center', gap: '1.25rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.7rem', color: 'rgba(255,255,255,0.25)' }}>
                                <ShieldCheck size={13} /> AES-256
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.7rem', color: 'rgba(255,255,255,0.25)' }}>
                                <Cpu size={13} /> Quantum Proof
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.7rem', color: 'rgba(255,255,255,0.25)' }}>
                                <Camera size={13} /> Facial Auth
                            </div>
                        </div>
                    </div>
                </div>
                
                <style>{`
                    .glass-premium { backdrop-filter: blur(30px); -webkit-backdrop-filter: blur(30px); }
                    @keyframes pulse-border {
                        0% { box-shadow: 0 0 5px #38bdf8; border-color: rgba(56,189,248,0.5); }
                        100% { box-shadow: 0 0 25px #38bdf8; border-color: #38bdf8; }
                    }
                    @keyframes pulse-dot { 0%,100% { opacity: 1; } 50% { opacity: 0.3; } }
                    .shield-container.scanning { animation: pulse-border 1s infinite alternate; }
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
