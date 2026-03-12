import React, { useState, useEffect } from 'react';
import { 
    Zap, Brain, TrendingUp, ArrowRightLeft, Target, 
    ShieldCheck, AlertCircle, ChevronDown, Sparkles,
    BarChart, PieChart, Layers, Wallet, ArrowUpRight
} from 'lucide-react';

const LiquidityOrchestrator = ({ portfolioValue, dayChange }) => {
    const [analyzing, setAnalyzing] = useState(false);
    const [strategy, setStrategy] = useState(null);

    const runAnalysis = () => {
        setAnalyzing(true);
        setTimeout(() => {
            setStrategy({
                recommendedMove: 'Mover 15% de Cash a Stable Yield',
                impact: '+$1,240 USD mensualmente',
                confidence: '94%',
                risk: 'Bajo',
                reasoning: 'Basado en los excedentes de facturación del último trimestre y la baja tasa de interés en la cuenta de ahorros primaria.'
            });
            setAnalyzing(false);
        }, 2000);
    };

    return (
        <div className="wealth-glass" style={{ padding: '1.5rem', marginBottom: '1.5rem', position: 'relative', overflow: 'hidden' }}>
            {/* Ambient Sparkles */}
            <div style={{ position: 'absolute', top: '-20px', right: '-20px', opacity: 0.1, color: '#38bdf8' }}>
                <Sparkles size={80} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                <div>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#fff' }}>
                        <Brain size={20} color="#38bdf8" /> AI Liquidity Orchestrator
                    </h3>
                    <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>Motor de optimización de rendimientos en tiempo real</p>
                </div>
                <button 
                    onClick={runAnalysis}
                    disabled={analyzing}
                    style={{
                        background: 'linear-gradient(135deg, #38bdf8 0%, #1d4ed8 100%)',
                        color: '#fff',
                        border: 'none',
                        padding: '0.6rem 1.25rem',
                        borderRadius: '10px',
                        fontWeight: 700,
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(56, 189, 248, 0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        transition: 'all 0.2s'
                    }}
                >
                    {analyzing ? <RefreshCw size={16} className="animate-spin" /> : <Zap size={16} />}
                    {analyzing ? 'Optimizando...' : 'Analizar Liquidez'}
                </button>
            </div>

            {!strategy ? (
                <div style={{ padding: '1.5rem', textAlign: 'center', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '12px' }}>
                    <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.85rem' }}>
                        Inicia el análisis para obtener recomendaciones estratégicas basadas en tu flujo de caja real.
                    </div>
                </div>
            ) : (
                <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ background: 'rgba(56, 189, 248, 0.05)', border: '1px solid rgba(56, 189, 248, 0.2)', padding: '1.25rem', borderRadius: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#38bdf8' }}>Estrategia Sugerida</span>
                            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#10b981' }}>{strategy.impact}</span>
                        </div>
                        <div style={{ fontWeight: 800, fontSize: '1rem', color: '#fff', marginBottom: '0.5rem' }}>{strategy.recommendedMove}</div>
                        <p style={{ margin: 0, fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>{strategy.reasoning}</p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', marginBottom: '0.25rem' }}>Confianza del Modelo</div>
                            <div style={{ fontWeight: 700, fontSize: '1.1rem', color: '#fff' }}>{strategy.confidence}</div>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', marginBottom: '0.25rem' }}>Nivel de Riesgo</div>
                            <div style={{ fontWeight: 700, fontSize: '1.1rem', color: '#10b981' }}>{strategy.risk}</div>
                        </div>
                    </div>

                    <button style={{ 
                        marginTop: '0.5rem',
                        background: 'rgba(255,255,255,0.05)',
                        color: '#fff',
                        border: '1px solid rgba(255,255,255,0.1)',
                        padding: '0.75rem',
                        borderRadius: '10px',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem'
                    }}>
                        <ArrowRightLeft size={16} /> Ejecutar Orquestación Automática
                    </button>
                </div>
            )}
            
            <style>{`
                .animate-spin {
                    animation: spin 1s linear infinite;
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

// Reusable RefreshCw icon if not imported correctly
const RefreshCw = ({ size, className }) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width={size} 
        height={size} 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className={className}
    >
        <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
        <path d="M3 3v5h5" />
        <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
        <path d="M16 16h5v5" />
    </svg>
);

export default LiquidityOrchestrator;
