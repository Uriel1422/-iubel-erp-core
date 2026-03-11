import React, { useState } from 'react';
import { useAhorros } from '../context/AhorrosContext';
import { Calculator, CalendarHeart, RefreshCw, CheckCircle, Clock, Save, FileText, Moon, ShieldAlert, Server, ArrowRightCircle } from 'lucide-react';

const TABS = [
    { id: 'cob', label: 'Cierre de Fin de Día (COB)', icon: Moon },
    { id: 'interes-certificado', label: 'Cálculo Interés Certificado', icon: FileText },
    { id: 'interes-ahorros', label: 'Cálculo Interés Ahorros', icon: Calculator },
];

const Procesos = () => {
    const { cuentas, calcularIntereses } = useAhorros();
    const [activeTab, setActiveTab] = useState('cob');
    const [procesando, setProcesando] = useState(false);
    const [resultado, setResultado] = useState(null);
    
    // COB States
    const [cobState, setCobState] = useState('idle'); // idle, running, completed
    const [cobStep, setCobStep] = useState(0);

    const formatMoney = v => new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP' }).format(Number(v) || 0);

    const handleProcesar = () => {
        setProcesando(true);
        setTimeout(() => {
            const result = calcularIntereses(); // Función de AhorrosContext para simular capitalización
            setResultado({
                fecha: new Date().toLocaleString(),
                tipo: activeTab === 'interes-ahorros' ? 'Ahorro Retirable' : 'Certificados/Plazos Fijos',
                cuentasAfectadas: activeTab === 'interes-ahorros' ? cuentas.filter(c => c.tipo === 'Ahorro Retirable').length : cuentas.filter(c => c.tipo === 'Plazo Fijo').length,
                montoCalculado: result
            });
            setProcesando(false);
            alert('✅ Proceso de cálculo y capitalización de intereses completado con éxito.');
        }, 2000);
    };

    const cobSteps = [
        { id: 1, label: 'Bloqueo del Sistema', desc: 'Desconexión de usuarios y ATMs' },
        { id: 2, label: 'Conciliación de Cajas', desc: 'Cierre de bóveda y cuadre de cajeros' },
        { id: 3, label: 'Devengos Automáticos', desc: 'Cálculo de intereses y carteras' },
        { id: 4, label: 'Cierre Contable', desc: 'Generación de Asientos Batch' },
        { id: 5, label: 'Roll-over de Fecha', desc: 'Avance al siguiente día hábil' }
    ];

    const handleStartCOB = () => {
        setCobState('running');
        setCobStep(1);
        let step = 1;
        const interval = setInterval(() => {
            step++;
            if (step > 5) {
                clearInterval(interval);
                setTimeout(() => setCobState('completed'), 1000);
            } else {
                setCobStep(step);
            }
        }, 2000); // 2 seconds per stage for effect
    };

    return (
        <div className="animate-up" style={{ minHeight: '100%', display: 'flex', flexDirection: 'column', paddingBottom: '3rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                <div>
                    <h1 className="page-title" style={{ marginBottom: '0.25rem' }}>Procesos y Cierres</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Módulo de ejecución de procesos automáticos, cierres de mes y cálculos de intereses.</p>
                </div>
            </div>

            {/* Ribbon-like Tabs */}
            <div className="card" style={{ padding: '0.5rem', marginBottom: '1.5rem', display: 'flex', gap: '0.5rem', overflowX: 'auto', whiteSpace: 'nowrap' }}>
                {TABS.map(tab => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => { setActiveTab(tab.id); setResultado(null); }}
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '0.75rem 1.25rem',
                                border: 'none',
                                background: isActive ? 'var(--primary-light)' : 'transparent',
                                color: isActive ? 'var(--primary)' : 'var(--text-muted)',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                minWidth: '150px'
                            }}
                        >
                            <Icon size={24} strokeWidth={isActive ? 2.5 : 1.5} />
                            <span style={{ fontSize: '0.75rem', fontWeight: isActive ? 700 : 500 }}>
                                {tab.label}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* Tab Contents */}
            {activeTab === 'cob' ? (
                <div key="tab-cob" className="card animate-fade-in" style={{ flex: 1, padding: '2.5rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--background)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
                        <div>
                            <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', color: 'var(--text-main)' }}>
                                <Moon size={28} className="text-primary" /> Ejecución de COB (Close of Business)
                            </h2>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '600px' }}>
                                El COB es el proceso "batch" más crítico del sistema Core. Al iniciarlo, Iubel bloqueará nuevas transacciones, cuadrará contabilidad, acumulará intereses y saltará al próximo día hábil.
                            </p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Fecha Operativa Actual</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)' }}>{new Date().toLocaleDateString('es-DO', { day: '2-digit', month: 'long', year: 'numeric' })}</div>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(350px, 1fr) 1.5fr', gap: '2.5rem', flex: 1 }}>
                        {/* Control Panel */}
                        <div style={{ borderRight: '1px solid var(--border)', paddingRight: '2.5rem', display: 'flex', flexDirection: 'column' }}>
                            <h3 style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>Panel de Control</h3>
                            
                            <div style={{ marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: 'rgba(239, 68, 68, 0.05)', border: '1px dashed var(--danger)', borderRadius: '8px' }}>
                                    <ShieldAlert size={24} color="var(--danger)" />
                                    <div style={{ fontSize: '0.85rem' }}>
                                        <strong style={{ color: 'var(--danger)', display: 'block' }}>Precaución: Proceso Irreversible</strong>
                                        Una vez iniciado el COB, los usuarios conectados serán desconectados forzosamente.
                                    </div>
                                </div>
                            </div>
                            
                            <div style={{ flex: 1 }}></div>
                            
                            {cobState === 'idle' ? (
                                <button className="btn btn-primary" style={{ width: '100%', height: '56px', fontSize: '1.1rem', justifyContent: 'center' }} onClick={handleStartCOB}>
                                    <Server size={20} /> INICIAR CIERRE (COB)
                                </button>
                            ) : cobState === 'running' ? (
                                <button className="btn" style={{ width: '100%', height: '56px', fontSize: '1.1rem', justifyContent: 'center', background: 'var(--border)', color: 'var(--text-muted)' }} disabled>
                                    <RefreshCw size={20} className="spin" /> EJECUTANDO BATCH...
                                </button>
                            ) : (
                                <button className="btn btn-primary" style={{ width: '100%', height: '56px', fontSize: '1.1rem', justifyContent: 'center', background: 'var(--success)', borderColor: 'var(--success)' }} onClick={() => { setCobState('idle'); setCobStep(0); }}>
                                    <CheckCircle size={20} /> SISTEMA LISTO PARA MAÑANA
                                </button>
                            )}
                        </div>

                        {/* Progress View */}
                        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                            {cobState === 'idle' && (
                                <div style={{ textAlign: 'center', opacity: 0.3 }}>
                                    <Server size={64} style={{ marginBottom: '1rem' }} />
                                    <h3>Motor Batch en Espera</h3>
                                    <p>Presione iniciar para comenzar la secuencia de cierre diario.</p>
                                </div>
                            )}

                            {(cobState === 'running' || cobState === 'completed') && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {cobSteps.map((step) => {
                                        const isCompleted = cobStep > step.id || cobState === 'completed';
                                        const isActive = cobStep === step.id && cobState === 'running';
                                        const isWaiting = cobStep < step.id;

                                        return (
                                            <div key={step.id} className="card" style={{ 
                                                display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.5rem',
                                                border: isActive ? '1px solid var(--primary)' : '1px solid var(--border)',
                                                background: isCompleted ? 'rgba(16, 185, 129, 0.05)' : isActive ? 'var(--background)' : 'transparent',
                                                opacity: isWaiting ? 0.4 : 1,
                                                transform: isActive ? 'scale(1.02)' : 'scale(1)',
                                                transition: 'all 0.3s'
                                            }}>
                                                <div style={{ 
                                                    width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    background: isCompleted ? 'var(--success)' : isActive ? 'var(--primary)' : 'var(--border)',
                                                    color: isCompleted || isActive ? '#fff' : 'inherit',
                                                    fontWeight: 'bold', fontSize: '0.9rem'
                                                }}>
                                                    {isCompleted ? <CheckCircle size={18} /> : step.id}
                                                </div>
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ fontWeight: 700, color: isCompleted ? 'var(--success)' : isActive ? 'var(--primary)' : 'var(--text-main)' }}>{step.label}</div>
                                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{step.desc}</div>
                                                </div>
                                                <div>
                                                    {isActive && <RefreshCw size={20} className="spin text-primary" />}
                                                </div>
                                            </div>
                                        );
                                    })}
                                    
                                    {cobState === 'completed' && (
                                        <div className="animate-up" style={{ marginTop: '1.5rem', padding: '1.5rem', background: 'var(--primary-light)', borderLeft: '4px solid var(--primary)', borderRadius: '8px' }}>
                                            <h4 style={{ color: 'var(--primary)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><CheckCircle size={18} /> Resumen de Cierre</h4>
                                            <ul style={{ fontSize: '0.85rem', color: 'var(--text-main)', margin: 0, paddingLeft: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                                <li><strong>Transacciones Procesadas:</strong> 5,248</li>
                                                <li><strong>Intereses Capitalizados:</strong> DOP 1,450,200.00</li>
                                                <li><strong>Cuadre de Bóvedas:</strong> OK (0 Diferencias)</li>
                                                <li><strong>Duración Batch:</strong> 00:00:10.024 ms</li>
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                <div key={`tab-${activeTab}`} className="card" style={{ flex: 1, padding: '2rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(400px, 1fr) 2fr', gap: '2rem' }}>
                        <div className="animate-fade-in" style={{ borderRight: '1px solid var(--border)', paddingRight: '2rem' }}>
                            <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                {activeTab === 'interes-ahorros' ? <Calculator size={20} className="text-primary" /> : <FileText size={20} className="text-primary" />}
                                {activeTab === 'interes-ahorros' ? 'Capitalización de Ahorros' : 'Capitalización de Certificados'}
                            </h3>

                            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '0.85rem' }}>
                                {activeTab === 'interes-ahorros'
                                    ? 'Este proceso calculará los intereses generados sobre el balance promedio diario de las cuentas de Ahorro Retirable y capitalizará el monto a la cuenta del socio.'
                                    : 'Este proceso genera el cálculo de rendimiento para los Certificados de Inversión y Plazos Fijos vigentes en el período seleccionado, transfiriendo los intereses a cuentas de ahorros según orden de pago.'}
                            </p>

                            <div className="input-group" style={{ marginBottom: '1.5rem' }}>
                                <label className="input-label">Período de Aplicación</label>
                                <input type="month" className="input-field" defaultValue="2026-03" />
                            </div>

                            <div className="input-group" style={{ marginBottom: '2.5rem' }}>
                                <label className="input-label">Tipo de Cambio / Modalidad</label>
                                <select className="input-field">
                                    <option>Tasa Fija General</option>
                                    <option>Tasas Variables por Escala</option>
                                </select>
                            </div>

                            <button
                                className="btn btn-primary"
                                style={{ width: '100%', height: '50px', fontSize: '1rem' }}
                                onClick={handleProcesar}
                                disabled={procesando}
                            >
                                <RefreshCw size={20} className={procesando ? 'spin' : ''} />
                                {procesando ? 'Procesando Cartera...' : 'Ejecutar Cálculo Masivo'}
                            </button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                            {procesando ? (
                                <div key="procesando" className="animate-fade-in" style={{ textAlign: 'center', color: 'var(--primary)' }}>
                                    <RefreshCw size={48} className="spin" style={{ opacity: 0.5, marginBottom: '1rem' }} />
                                    <h3 style={{ fontSize: '1.25rem' }}>Procesando {cuentas.length} cuentas...</h3>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Aplicando fórmulas de interés compuesto / simple.</p>
                                </div>
                            ) : resultado ? (
                                <div key="resultado" className="animate-fade-in" style={{ background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '2.5rem', borderRadius: '16px', textAlign: 'center', width: '100%', maxWidth: '400px' }}>
                                    <CheckCircle size={56} style={{ color: 'var(--success)', marginBottom: '1rem' }} />
                                    <h2 style={{ color: 'var(--success)', marginBottom: '0.5rem', fontSize: '1.5rem' }}>Proceso Exitoso</h2>
                                    <div style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: '1.5rem', color: 'var(--text-muted)' }}>ID: PROC-{Date.now().toString().slice(-6)}</div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.75rem', textAlign: 'left', background: 'var(--background)', padding: '1.5rem', borderRadius: '8px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Tipo:</span>
                                            <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{resultado.tipo}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Cuentas Impactadas:</span>
                                            <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{resultado.cuentasAfectadas} expedientes</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: '0.75rem', marginTop: '0.25rem' }}>
                                            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Total Distribuido:</span>
                                            <span style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '1rem' }}>{formatMoney(resultado.montoCalculado)}</span>
                                        </div>
                                    </div>

                                    <button className="btn btn-secondary" style={{ marginTop: '1.5rem', width: '100%' }}>
                                        <Save size={16} /> Descargar Informe de Contabilidad
                                    </button>
                                </div>
                            ) : (
                                <div key="idle" className="animate-fade-in" style={{ textAlign: 'center', opacity: 0.3, padding: '4rem' }}>
                                    <CalendarHeart size={84} style={{ marginBottom: '1rem' }} />
                                    <h3 style={{ fontSize: '1.25rem' }}>Resultados del Proceso</h3>
                                    <p>Configura los parámetros a la izquierda y presiona el botón para ejecutar el cierre de intereses.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Procesos;
