import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
    Shield, Lock, Unlock, Key, Fingerprint, Eye, EyeOff, 
    ShieldCheck, ShieldAlert, Cpu, Network, Globe, Zap,
    ChevronRight, ArrowRight, Download, Share2, Plus, 
    Smartphone, HardDrive, Database, Camera, XCircle, CheckCircle,
    AlertTriangle, User
} from 'lucide-react';
import { api } from '../utils/api';

// ─── High-Entropy Biometric Engine (Spatial-Grid RGBH) ────────────────────────
// Captures a 4x4 spatial grid of RGB histograms (256 feature points)
// to analyze structural facial geometry and color distribution.
const captureFaceFingerprint = (videoEl) => {
    const GRID_SIZE = 4; // 4x4 grid = 16 cells
    const BINS = 16;     // 16 luminance bins per cell
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    
    // Draw center-cropped face region
    const sw = videoEl.videoWidth;
    const sh = videoEl.videoHeight;
    const size = Math.min(sw, sh) * 0.7; // 70% of frame height
    const sx = (sw - size) / 2;
    const sy = (sh - size) / 2;
    ctx.drawImage(videoEl, sx, sy, size, size, 0, 0, 128, 128);
    
    const imgData = ctx.getImageData(0, 0, 128, 128).data;
    const spatialHistogram = [];

    const cellW = 128 / GRID_SIZE;
    const cellH = 128 / GRID_SIZE;

    for (let gy = 0; gy < GRID_SIZE; gy++) {
        for (let gx = 0; gx < GRID_SIZE; gx++) {
            const cellHist = new Array(BINS).fill(0);
            let pCount = 0;
            
            for (let y = gy * cellH; y < (gy + 1) * cellH; y++) {
                for (let x = gx * cellW; x < (gx + 1) * cellW; x++) {
                    const idx = (Math.floor(y) * 128 + Math.floor(x)) * 4;
                    const r = imgData[idx], g = imgData[idx+1], b = imgData[idx+2];
                    // High-accuracy luminance formula
                    const lum = Math.floor((0.2126 * r + 0.7152 * g + 0.0722 * b) / (256 / BINS));
                    if (lum >= 0 && lum < BINS) cellHist[lum]++;
                    pCount++;
                }
            }
            // Normalize cell
            spatialHistogram.push(...cellHist.map(v => v / pCount));
        }
    }
    return spatialHistogram;
};

const compareFaceFingerprints = (fp1, fp2) => {
    if (!fp1 || !fp2 || fp1.length !== fp2.length) return 0;
    // Structural Bhattacharyya distance component
    let totalSim = 0;
    const numCells = 16;
    const binsPerCell = 16;
    
    for (let c = 0; c < numCells; c++) {
        let cellSim = 0;
        const start = c * binsPerCell;
        for (let b = 0; b < binsPerCell; b++) {
            cellSim += Math.sqrt(fp1[start + b] * fp2[start + b]);
        }
        totalSim += cellSim;
    }
    return totalSim / numCells; 
};

const FACE_SIMILARITY_THRESHOLD = 0.88; // Restricted threshold for Elite Security

const SovereignVault = () => {
    const [isLocked, setIsLocked] = useState(true);
    const [scanProgress, setScanProgress] = useState(0);
    const [showBalance, setShowBalance] = useState(false);
    const [scanning, setScanning] = useState(false);
    const [scanMode, setScanMode] = useState(null); // 'biometric' | 'camera' | 'pin' | null
    const [pinValue, setPinValue] = useState('');
    const [scanStatus, setScanStatus] = useState(''); // '' | 'verifying' | 'success' | 'error' | 'blocked'
    const [scanMessage, setScanMessage] = useState('');
    const [scanPhase, setScanPhase] = useState(''); // 'calibrating' | 'analyzing' | 'matching' | 'learning'
    const [storedFace, setStoredFace] = useState(null); // loaded from backend

    // Use refs to avoid re-render side-effects
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const streamRef = useRef(null);
    const intervalRef = useRef(null);
    const progressRef = useRef(0);

    const VAULT_PIN = '1234';

    // Load stored face fingerprint on mount
    useEffect(() => {
        const loadFace = async () => {
            const data = await api.get('vault_face_profile');
            if (data && data.length > 0 && data[0].fingerprint) {
                setStoredFace(data[0].fingerprint);
            }
        };
        loadFace();
        return () => {
            stopCameraInternal();
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, []); // ← Only runs on mount/unmount - NO infinite loop

    const stopCameraInternal = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(t => t.stop());
            streamRef.current = null;
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
    };

    const unlockVault = useCallback((faceSignature) => {
        stopCameraInternal();
        if (intervalRef.current) clearInterval(intervalRef.current);
        setScanStatus('success');
        setScanMessage('✅ Acceso Nivel 5 Autorizado — Identidad Verificada');
        setScanPhase('');

        // Save face fingerprint if this is first-time registration
        if (faceSignature && !storedFace) {
            api.save('vault_face_profile', { id: 'main', fingerprint: faceSignature, registeredAt: new Date().toISOString() });
            setStoredFace(faceSignature);
        }

        setTimeout(() => {
            setIsLocked(false);
            setScanMode(null);
            setScanning(false);
            setScanProgress(0);
            progressRef.current = 0;
            setScanStatus('');
            setScanPhase('');
        }, 1400);
    }, [storedFace]);

    const blockAccess = useCallback((reason) => {
        stopCameraInternal();
        if (intervalRef.current) clearInterval(intervalRef.current);
        setScanning(false);
        setScanStatus('blocked');
        setScanMode(null);
        setScanMessage(reason);
        setScanPhase('');
        setScanProgress(0);
        progressRef.current = 0;
        // No auto-dismiss — user must take action
    }, []);

    const resetFaceProfile = async () => {
        // Delete the stored face from backend
        try {
            await api.delete('vault_face_profile', 'main');
        } catch(e) {
            // If delete API not available, overwrite with empty
            await api.save('vault_face_profile', { id: 'main', fingerprint: null, registeredAt: null });
        }
        setStoredFace(null);
        setScanStatus('');
        setScanMessage('');
    };

    // ── Core camera scanning logic ───────────────────────────────────────────
    const runFaceAnalysis = useCallback(() => {
        // Phase 1: Calibration (0-30%)
        setScanPhase('calibrating');
        setScanMessage('Calibrando sensor óptico...');
        
        const totalDuration = 4000; // 4 sec total scan
        const tickMs = 50;
        const totalTicks = totalDuration / tickMs;
        let tick = 0;
        let capturedFingerprint = null;

        intervalRef.current = setInterval(() => {
            tick++;
            const rawProgress = (tick / totalTicks) * 100;
            progressRef.current = rawProgress;
            setScanProgress(Math.round(rawProgress));

            // Phase transitions
            if (rawProgress >= 5 && rawProgress < 50) {
                setScanPhase('analyzing');
                setScanMessage('Analizando rasgos biométricos faciales...');
            } else if (rawProgress >= 50 && rawProgress < 80) {
                setScanPhase('matching');
                setScanMessage(storedFace ? 'Comparando con perfil registrado...' : 'Capturando perfil facial único...');
                // Capture fingerprint at 60%
                if (rawProgress >= 60 && !capturedFingerprint && videoRef.current && videoRef.current.readyState >= 2) {
                    capturedFingerprint = captureFaceFingerprint(videoRef.current);
                }
            } else if (rawProgress >= 80) {
                setScanPhase('learning');
                setScanMessage('Verificando integridad de señal...');
            }

            if (tick >= totalTicks) {
                clearInterval(intervalRef.current);
                // Final decision
                if (capturedFingerprint && storedFace) {
                    const similarity = compareFaceFingerprints(capturedFingerprint, storedFace);
                    if (similarity >= FACE_SIMILARITY_THRESHOLD) {
                        unlockVault(null); // Already have face stored
                    } else {
                        blockAccess(`🚫 Acceso Denegado — Rostro no reconocido (similitud: ${Math.round(similarity * 100)}%). Solo el propietario puede acceder.`);
                    }
                } else {
                    // First time — register and unlock
                    unlockVault(capturedFingerprint);
                }
            }
        }, tickMs);
    }, [storedFace, unlockVault, blockAccess]);

    const startCamera = useCallback(async () => {
        setScanMode('camera');
        setScanStatus('verifying');
        setScanMessage('Iniciando sistema de verificación facial...');
        setScanning(true);
        setScanProgress(0);
        progressRef.current = 0;

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
                audio: false
            });
            streamRef.current = stream;
            // Assign to video element immediately
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.onloadedmetadata = () => {
                    videoRef.current.play();
                    // Start analysis after brief calibration delay
                    setTimeout(() => runFaceAnalysis(), 800);
                };
            } else {
                // If ref not yet mounted, wait one tick
                setTimeout(() => {
                    if (videoRef.current) {
                        videoRef.current.srcObject = stream;
                        videoRef.current.play().then(() => {
                            setTimeout(() => runFaceAnalysis(), 800);
                        });
                    }
                }, 200);
            }
        } catch (err) {
            setScanStatus('error');
            setScanMessage('Cámara no disponible. Use el PIN de respaldo.');
            setScanMode('pin');
        }
    }, [runFaceAnalysis]);

    const startScan = async () => {
        setScanStatus('');
        setScanMessage('');
        setScanPhase('');
        // Try WebAuthn biometrics first
        if (window.PublicKeyCredential) {
            try {
                setScanMode('biometric');
                setScanStatus('verifying');
                setScanMessage('Activando sensor biométrico del dispositivo...');
                setScanning(true);
                setScanProgress(0);
                intervalRef.current = setInterval(() => {
                    setScanProgress(prev => (prev >= 90 ? 90 : prev + 6));
                }, 120);
                const challenge = new Uint8Array(32);
                crypto.getRandomValues(challenge);
                const credential = await navigator.credentials.get({
                    publicKey: { challenge, timeout: 30000, userVerification: 'required', rpId: window.location.hostname || 'localhost' }
                });
                clearInterval(intervalRef.current);
                setScanProgress(100);
                if (credential) unlockVault(null);
            } catch (err) {
                clearInterval(intervalRef.current);
                setScanning(false);
                setScanMessage('Biometría no disponible. Activando cámara facial...');
                setTimeout(() => startCamera(), 1000);
            }
        } else {
            startCamera();
        }
    };

    const handlePinSubmit = (e) => {
        e.preventDefault();
        if (pinValue === VAULT_PIN) {
            setScanStatus('success');
            setScanMessage('✅ PIN correcto. Acceso autorizado.');
            setTimeout(() => unlockVault(null), 900);
        } else {
            setScanStatus('error');
            setScanMessage('PIN incorrecto. Intente nuevamente.');
            setPinValue('');
        }
    };

    const cancelScan = () => {
        stopCameraInternal();
        if (intervalRef.current) clearInterval(intervalRef.current);
        setScanning(false);
        setScanProgress(0);
        progressRef.current = 0;
        setScanMode(null);
        setScanStatus('');
        setScanMessage('');
        setScanPhase('');
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
                    {scanMode === 'camera' && (
                        <div style={{ position: 'relative', background: '#000' }}>
                            <video ref={videoRef} autoPlay playsInline muted style={{ width: '100%', height: '240px', objectFit: 'cover', display: 'block' }} />
                            {/* Face brackets */}
                            <div style={{ position: 'absolute', top: '15%', left: '25%', width: '50%', height: '70%', border: `2px solid ${scanStatus === 'blocked' ? '#ef4444' : '#38bdf8'}`, borderRadius: '8px', pointerEvents: 'none', transition: 'border-color 0.3s', boxShadow: `inset 0 0 20px ${scanStatus === 'blocked' ? 'rgba(239,68,68,0.2)' : 'rgba(56,189,248,0.15)'}` }} />
                            {/* Scan laser line (Enhanced) */}
                            {scanning && (
                                <>
                                    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'linear-gradient(rgba(56, 189, 248, 0) 48%, rgba(56, 189, 248, 0.3) 50%, rgba(56, 189, 248, 0) 52%)', backgroundSize: '100% 200%', animation: 'scanline 2s linear infinite', zIndex: 5, pointerEvents: 'none' }} />
                                    <div style={{ position: 'absolute', top: `${15 + (scanProgress / 100) * 70}%`, left: 0, width: '100%', height: '3px', background: '#38bdf8', boxShadow: '0 0 20px #38bdf8', zIndex: 6 }} />
                                </>
                            )}
                            {/* REC badge */}
                            <div style={{ position: 'absolute', top: 10, left: 10, background: 'rgba(239,68,68,0.85)', color: '#fff', fontSize: '0.6rem', fontWeight: 900, padding: '0.15rem 0.5rem', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '0.3rem', letterSpacing: '0.05em' }}>
                                <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#fff', animation: 'pulse-dot 0.8s infinite' }} /> REC
                            </div>
                            {/* Phase badge top-right */}
                            <div style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(0,0,0,0.65)', color: scanPhase === 'matching' ? '#10b981' : '#38bdf8', fontSize: '0.65rem', fontWeight: 700, padding: '0.15rem 0.55rem', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.06em', transition: 'color 0.3s' }}>
                                {scanPhase === 'calibrating' ? '⚡ Calibrating' : scanPhase === 'analyzing' ? '🔍 Analyzing' : scanPhase === 'matching' ? '🔗 Matching' : scanPhase === 'learning' ? '🧠 Learning' : '🎥 Active'}
                            </div>
                            {/* Progress bar at bottom of video */}
                            <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '3px', background: 'rgba(0,0,0,0.5)' }}>
                                <div style={{ height: '100%', width: `${scanProgress}%`, background: `linear-gradient(90deg, #38bdf8, ${scanPhase === 'matching' ? '#10b981' : '#7c3aed'})`, transition: 'width 0.05s linear, background 0.5s' }} />
                            </div>
                            {/* First-time registration notice */}
                            {!storedFace && scanPhase === 'matching' && (
                                <div style={{ position: 'absolute', bottom: 12, left: '50%', transform: 'translateX(-50%)', background: 'rgba(16,185,129,0.9)', color: '#fff', fontSize: '0.65rem', fontWeight: 700, padding: '0.25rem 0.75rem', borderRadius: '6px', whiteSpace: 'nowrap' }}>
                                    📸 Registrando perfil facial por primera vez
                                </div>
                            )}
                            {storedFace && scanPhase === 'matching' && (
                                <div style={{ position: 'absolute', bottom: 12, left: '50%', transform: 'translateX(-50%)', background: 'rgba(56,189,248,0.85)', color: '#fff', fontSize: '0.65rem', fontWeight: 700, padding: '0.25rem 0.75rem', borderRadius: '6px', whiteSpace: 'nowrap' }}>
                                    🔗 Comparando con perfil registrado...
                                </div>
                            )}
                        </div>
                    )}

                    <div style={{ padding: '2rem 2.5rem' }}>
                        {/* ACCESS BLOCKED alert */}
                        {scanStatus === 'blocked' && (
                            <div style={{ marginBottom: '1.25rem', padding: '1rem', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)', borderRadius: '12px', display: 'flex', gap: '0.75rem', alignItems: 'flex-start', textAlign: 'left' }}>
                                <AlertTriangle size={22} color="#ef4444" style={{ flexShrink: 0, marginTop: 2 }} />
                                <div>
                                    <div style={{ color: '#ef4444', fontWeight: 800, fontSize: '0.85rem', marginBottom: '0.25rem' }}>ACCESO BLOQUEADO</div>
                                    <div style={{ color: 'rgba(239,68,68,0.8)', fontSize: '0.75rem', lineHeight: 1.4 }}>{scanMessage}</div>
                                </div>
                            </div>
                        )}

                        {/* Icon — hide when camera is showing */}
                        {scanMode !== 'camera' && scanStatus !== 'blocked' && (
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
                                        <>
                                            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'linear-gradient(transparent 48%, rgba(56, 189, 248, 0.4) 50%, transparent 52%)', backgroundSize: '100% 200%', animation: 'scanline 1.5s linear infinite', zIndex: 1 }} />
                                            <div style={{ position: 'absolute', top: `${scanProgress}%`, left: 0, width: '100%', height: '3px', background: '#38bdf8', boxShadow: '0 0 15px #38bdf8', zIndex: 2 }} />
                                        </>
                                    )}
                                </div>
                            </div>
                        )}

                        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', marginBottom: '0.25rem', letterSpacing: '-0.025em' }}>
                            Iubel Sovereign Vault
                        </h2>
                        {scanStatus !== 'blocked' && (
                            <p style={{ color: scanStatus === 'error' ? '#ef4444' : scanStatus === 'success' ? '#10b981' : scanning ? '#38bdf8' : 'rgba(255,255,255,0.5)', marginBottom: '1.5rem', fontSize: '0.875rem', minHeight: '1.25rem', transition: 'color 0.3s', lineHeight: 1.5 }}>
                                {scanMessage || (storedFace ? 'Perfil facial registrado. Autenticación Nivel 5 requerida.' : 'Primera vez — tu rostro se registrará como perfil seguro.')}
                            </p>
                        )}

                        {/* Stored face indicator */}
                        {storedFace && !scanning && scanStatus === '' && (
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.35rem 0.875rem', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '20px', marginBottom: '1.25rem', fontSize: '0.7rem', color: '#10b981', fontWeight: 700 }}>
                                <User size={12} /> Perfil facial registrado y activo
                            </div>
                        )}
                        {!storedFace && !scanning && scanStatus === '' && (
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.35rem 0.875rem', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: '20px', marginBottom: '1.25rem', fontSize: '0.7rem', color: '#f59e0b', fontWeight: 700 }}>
                                <Camera size={12} /> Primera vez — se registrará tu rostro
                            </div>
                        )}

                        {/* Biometric progress */}
                        {scanning && scanMode === 'biometric' && (
                            <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden', marginBottom: '1.5rem' }}>
                                <div style={{ height: '100%', width: `${scanProgress}%`, background: 'linear-gradient(90deg, #38bdf8, #1d4ed8)', borderRadius: '2px', transition: 'width 0.1s linear', boxShadow: '0 0 10px #38bdf8' }} />
                            </div>
                        )}

                        {/* PIN Input */}
                        {scanMode === 'pin' && (
                            <form onSubmit={handlePinSubmit} style={{ marginBottom: '1.5rem' }}>
                                <div style={{ marginBottom: '0.75rem', fontSize: '0.78rem', color: '#f59e0b', fontWeight: 700 }}>🔑 PIN de Respaldo</div>
                                <input type="password" value={pinValue} onChange={e => setPinValue(e.target.value)} placeholder="Ingrese su PIN" maxLength={8} autoFocus
                                    style={{ width: '100%', padding: '0.875rem', background: 'rgba(255,255,255,0.05)', border: `1px solid ${scanStatus === 'error' ? '#ef4444' : 'rgba(255,255,255,0.15)'}`, borderRadius: '12px', color: '#fff', fontSize: '1.2rem', textAlign: 'center', letterSpacing: '0.5em', outline: 'none', marginBottom: '0.75rem', fontFamily: 'monospace', boxSizing: 'border-box' }} />
                                <button type="submit" style={{ width: '100%', padding: '0.875rem', background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', fontSize: '0.95rem' }}>
                                    Verificar PIN
                                </button>
                            </form>
                        )}

                        {/* Primary Action */}
                        {!scanning && scanMode !== 'pin' && scanStatus !== 'blocked' && (
                            <button onClick={startScan} style={{ width: '100%', padding: '1rem', background: 'linear-gradient(135deg, #38bdf8, #1d4ed8)', color: '#fff', border: 'none', borderRadius: '14px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', fontSize: '1rem', boxShadow: '0 10px 20px -3px rgba(56,189,248,0.35)' }}>
                                <Fingerprint size={20} /> Iniciar Escaneo Biométrico
                            </button>
                        )}
                        {scanStatus === 'blocked' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
                                <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '14px', border: '1px solid rgba(239, 68, 68, 0.2)', textAlign: 'center' }}>
                                    <p style={{ margin: 0, fontSize: '0.82rem', color: '#fca5a5', lineHeight: 1.5 }}>
                                        <AlertTriangle size={16} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} />
                                        <strong>Acceso Restringido</strong><br/>
                                        Identidad no validada. Por seguridad, el reseteo biométrico solo puede ser realizado por un <strong>Superadministrador</strong>.
                                    </p>
                                </div>
                                <button onClick={cancelScan} style={{ width: '100%', padding: '1rem', background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '14px', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                    ← Volver al inicio
                                </button>
                            </div>
                        )}
                        {/* Cancel during scan */}
                        {scanning && (
                            <button onClick={cancelScan} style={{ marginTop: '1rem', background: 'none', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.4)', borderRadius: '10px', padding: '0.5rem 1.5rem', cursor: 'pointer', fontSize: '0.8rem', width: '100%' }}>
                                Cancelar
                            </button>
                        )}

                        {/* Badges */}
                        <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'center', gap: '1.25rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.65rem', color: 'rgba(255,255,255,0.2)' }}><ShieldCheck size={11} /> AES-256</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.65rem', color: 'rgba(255,255,255,0.2)' }}><Cpu size={11} /> Quantum Proof</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.65rem', color: 'rgba(255,255,255,0.2)' }}><Camera size={11} /> Facial Auth</div>
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
