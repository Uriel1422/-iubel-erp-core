import React, { useState, useEffect } from 'react';
import { 
    TrendingUp, TrendingDown, Activity, DollarSign, Wallet, 
    PieChart, ArrowUpRight, ArrowDownRight, Zap, RefreshCw, Star, BarChart2, Shield
} from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, Cell
} from 'recharts';
import { NavLink } from 'react-router-dom';
import LiquidityOrchestrator from '../components/LiquidityOrchestrator';

// Definición de Activos de Grado Institucional
const ASSETS = [
    { symbol: 'BTC/USD', name: 'Bitcoin', price: 68420.50, change: 1.2, color: '#f7931a', type: 'crypto', balance: 0.25 },
    { symbol: 'ETH/USD', name: 'Ethereum', price: 3840.12, change: -0.8, color: '#627eea', type: 'crypto', balance: 4.5 },
    { symbol: 'IUB/DOP', name: 'Iubel Token', price: 105.50, change: 5.4, color: '#0ea5e9', type: 'security', balance: 15000 },
    { symbol: 'AAPL', name: 'Apple Inc.', price: 192.30, change: 0.45, color: '#fff', type: 'stock', balance: 40 },
    { symbol: 'XAU/USD', name: 'Gold', price: 2350.75, change: 0.15, color: '#fbbf24', type: 'commodity', balance: 10 },
    { symbol: 'USDT', name: 'Tether', price: 1.00, change: 0.01, color: '#26a17b', type: 'stable', balance: 25000 }
];


// Datos históricos simulados para el gráfico principal
const generateChartData = () => {
    const data = [];
    let base = 150000;
    for (let i = 1; i <= 30; i++) {
        base = base + (Math.random() * 5000 - 2000); // Variación de -2000 a +3000
        data.push({
            day: `Día ${i}`,
            value: base,
            uv: base * 0.9 // just for visually nice layers
        });
    }
    return data;
};

const INITIAL_CHART_DATA = generateChartData();

const generateLiveFeedData = () => {
    const data = [];
    for(let i=0; i<40; i++){
        data.push({
            time: `14:${i<10?'0'+i:i}`,
            vol: Math.random() * 1000
        });
    }
    return data;
}

const LIVE_VOL_DATA = generateLiveFeedData();

const WealthTerminal = () => {
    const [assets, setAssets] = useState(ASSETS);
    const [chartData, setChartData] = useState(INITIAL_CHART_DATA);
    const [portfolioValue, setPortfolioValue] = useState(542850.50);
    const [dayChange, setDayChange] = useState(4250.75);
    
    // Simulación de "Live Ticker" - Precios cambian cada 3 segundos
    useEffect(() => {
        const interval = setInterval(() => {
            setAssets(prevAssets => prevAssets.map(asset => {
                // Stablecoins no cambian casi
                if(asset.type === 'stable') return asset;
                
                // Variación aleatoria entre -0.5% y +0.5%
                const changePct = (Math.random() * 1) - 0.5;
                const newPrice = asset.price * (1 + (changePct / 100));
                // Actualizar porcentaje de cambio de manera realista (acumulando ligeramente)
                const newChange = asset.change + (changePct * 0.1);

                return {
                    ...asset,
                    price: newPrice,
                    change: newChange
                };
            }));
            
            // Simular balance total variando
            setPortfolioValue(prev => prev + (Math.random() * 100 - 45));
            setDayChange(prev => prev + (Math.random() * 50 - 20));

        }, 3000);

        return () => clearInterval(interval);
    }, []);

    const formatMoney = (v) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(v) || 0);

    return (
        <div style={{ 
            height: '100%', 
            display: 'flex', 
            flexDirection: 'column', 
            backgroundColor: '#0f172a', /* Dark slate background */
            color: '#f8fafc',
            margin: '-2rem', /* Salir del padding del layout principal */
            padding: '1.5rem',
            fontFamily: '"Inter", sans-serif',
            overflow: 'hidden'
        }}>
            
            <style>
                {`
                    /* Específicos para el Wealth Terminal */
                    .wealth-glass {
                        background: rgba(30, 41, 59, 0.7);
                        backdrop-filter: blur(10px);
                        border: 1px solid rgba(255, 255, 255, 0.05);
                        border-radius: 12px;
                    }
                    
                    @keyframes ticker {
                        0% { transform: translateX(0); }
                        100% { transform: translateX(-50%); }
                    }
                    
                    .ticker-wrap {
                        width: 100%;
                        overflow: hidden;
                        height: 40px;
                        background: rgba(0,0,0,0.5);
                        border-bottom: 1px solid rgba(255,255,255,0.1);
                        border-radius: 8px;
                        margin-bottom: 1rem;
                        display: flex;
                        align-items: center;
                    }
                    
                    .ticker-content {
                        display: inline-flex;
                        white-space: nowrap;
                        animation: ticker 30s linear infinite;
                    }
                    
                    .ticker-item {
                        display: flex;
                        align-items: center;
                        gap: 0.5rem;
                        padding: 0 2rem;
                        font-weight: 600;
                        font-size: 0.85rem;
                        font-family: monospace;
                    }
                    
                    .text-neon-green { color: #10b981; text-shadow: 0 0 10px rgba(16,185,129,0.3); }
                    .text-neon-red { color: #ef4444; text-shadow: 0 0 10px rgba(239,68,68,0.3); }
                    
                    /* Custom Scrollbar for Terminal */
                    .terminal-scroll::-webkit-scrollbar { width: 6px; }
                    .terminal-scroll::-webkit-scrollbar-track { background: transparent; }
                    .terminal-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
                `}
            </style>

            {/* Header & Live Ticker */}
            <div className="ticker-wrap">
                <div className="ticker-content">
                    {/* Renderizamos doble para efecto infinito */}
                    {[...assets, ...assets].map((asset, idx) => (
                        <div key={idx} className="ticker-item">
                            <span style={{ color: asset.color || '#fff' }}>{asset.symbol}</span>
                            <span>{formatMoney(asset.price)}</span>
                            <span className={asset.change >= 0 ? 'text-neon-green' : 'text-neon-red'} style={{ display: 'flex', alignItems: 'center' }}>
                                {asset.change >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                                {Math.abs(asset.change).toFixed(2)}%
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.5rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Activity className="text-primary" /> Iubel Wealth & Crypto
                    </h1>
                    <p style={{ color: '#94a3b8', margin: '0.25rem 0 0', fontSize: '0.85rem' }}>Terminal Institucional de Inversiones</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div style={{ color: '#94a3b8', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '2px' }}>Balance Total del Portafolio</div>
                    <div style={{ fontSize: '2.5rem', fontWeight: 900, fontFamily: 'monospace', letterSpacing: '-1px' }}>
                        {formatMoney(portfolioValue)}
                    </div>
                    <div className={dayChange >= 0 ? 'text-neon-green' : 'text-neon-red'} style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.25rem', fontWeight: 600 }}>
                        {dayChange >= 0 ? '+' : '-'}{formatMoney(Math.abs(dayChange))} ({(dayChange/portfolioValue*100).toFixed(2)}%) Hoy
                    </div>
                </div>
            </div>

            {/* Sovereign Quick Access Card */}
            <div className="wealth-glass" style={{ 
                padding: '1.5rem', 
                marginBottom: '1.5rem', 
                background: 'linear-gradient(90deg, rgba(56, 189, 248, 0.1) 0%, rgba(30, 41, 59, 0.7) 100%)',
                border: '1px solid rgba(56, 189, 248, 0.2)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <div style={{ 
                        width: '50px', 
                        height: '50px', 
                        background: 'rgba(56, 189, 248, 0.2)', 
                        borderRadius: '12px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        boxShadow: '0 0 15px rgba(56, 189, 248, 0.3)'
                    }}>
                        <Shield size={24} color="#38bdf8" />
                    </div>
                    <div>
                        <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#fff' }}>Sovereign Vault Active</div>
                        <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)' }}>Tus activos más valiosos están bajo protección de grado institucional.</div>
                    </div>
                </div>
                <NavLink to="/erp/sovereign-vault" style={{ 
                    textDecoration: 'none',
                    background: '#38bdf8',
                    color: '#fff',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '10px',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    boxShadow: '0 4px 12px rgba(56, 189, 248, 0.3)'
                }}>
                    Entrar a la Bóveda <ArrowUpRight size={18} />
                </NavLink>
            </div>

            {/* Grid Principal */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', flex: 1, overflow: 'hidden' }}>
                
                {/* Panel Izquierdo: Gráficos */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', overflow: 'hidden' }}>
                    
                    {/* Gráfico Principal */}
                    <div className="wealth-glass" style={{ flex: 2, padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                            <h3 style={{ margin: 0, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <TrendingUp size={18} /> Rendimiento de Activos (30D)
                            </h3>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', padding: '0.25rem 0.75rem', borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer' }}>1D</button>
                                <button style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', padding: '0.25rem 0.75rem', borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer' }}>1W</button>
                                <button style={{ background: 'var(--primary)', border: 'none', color: '#fff', padding: '0.25rem 0.75rem', borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer' }}>1M</button>
                                <button style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', padding: '0.25rem 0.75rem', borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer' }}>1Y</button>
                            </div>
                        </div>
                        
                        <div style={{ flex: 1, width: '100%', minHeight: 0 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                        </linearGradient>
                                        <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.5}/>
                                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                                    <XAxis dataKey="day" hide />
                                    <YAxis hide domain={['dataMin - 10000', 'dataMax + 10000']} />
                                    <Tooltip 
                                        contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }}
                                        itemStyle={{ color: '#fff' }}
                                        formatter={(value) => formatMoney(value)}
                                    />
                                    <Area type="monotone" dataKey="uv" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorUv)" strokeWidth={2} />
                                    <Area type="monotone" dataKey="value" stroke="#3b82f6" fillOpacity={1} fill="url(#colorValue)" strokeWidth={3} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Gráfico Secundario (Volumen de Ordenes) */}
                    <div className="wealth-glass" style={{ flex: 1, padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
                        <h3 style={{ margin: '0 0 1rem 0', fontSize: '0.85rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <BarChart2 size={16} /> Volumen de Mercado en Vivo
                        </h3>
                        <div style={{ flex: 1, width: '100%', minHeight: 0 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={LIVE_VOL_DATA}>
                                    <Tooltip 
                                        cursor={{fill: 'rgba(255,255,255,0.05)'}}
                                        contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: 'none', borderRadius: '4px' }}
                                        formatter={(val) => val.toFixed(2)}
                                    />
                                    <Bar dataKey="vol">
                                        {LIVE_VOL_DATA.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.vol > 500 ? '#10b981' : '#ef4444'} opacity={0.6} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                </div>

                {/* Panel Derecho: Watchlist & Trading */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', overflow: 'hidden' }}>
                    
                    {/* AI Liquidity Orchestrator Integration */}
                    <LiquidityOrchestrator portfolioValue={portfolioValue} dayChange={dayChange} />

                    {/* Trading Rápido */}
                    <div className="wealth-glass" style={{ padding: '1.5rem' }}>
                        <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Zap size={18} color="#f59e0b" /> Ejecución Inmediata
                        </h3>
                        
                        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
                            <button 
                                onClick={() => {
                                    const amount = (Math.random() * 5000 + 1000).toFixed(2);
                                    setPortfolioValue(prev => prev + Number(amount));
                                    setDayChange(prev => prev + Number(amount) * 0.1);
                                    alert(`Orden de COMPRA ejecutada: +$${amount} en portafolio.`);
                                }}
                                style={{ flex: 1, padding: '0.75rem', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', transition: '0.2s' }}
                            >
                                COMPRAR
                            </button>
                            <button 
                                onClick={() => {
                                    const amount = (Math.random() * 3000 + 500).toFixed(2);
                                    setPortfolioValue(prev => prev - Number(amount));
                                    setDayChange(prev => prev - Number(amount) * 0.1);
                                    alert(`Orden de VENTA ejecutada: -$${amount} en portafolio.`);
                                }}
                                style={{ flex: 1, padding: '0.75rem', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', transition: '0.2s' }}
                            >
                                VENDER
                            </button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.75rem', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', border: '1px solid #334155' }}>
                                <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Activo</span>
                                <span style={{ fontWeight: 'bold' }}>BTC/USD</span>
                            </div>
                            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.75rem', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', border: '1px solid #334155' }}>
                                <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Cantidad</span>
                                <input type="number" defaultValue="0.25" style={{ background: 'transparent', border: 'none', color: '#fff', textAlign: 'right', outline: 'none', fontWeight: 'bold', width: '50%' }} />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', fontSize: '0.85rem' }}>
                                <span style={{ color: '#94a3b8' }}>Valor Estimado</span>
                                <span style={{ fontWeight: 'bold' }}>{formatMoney(16057.62)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Portafolio & Watchlist */}
                    <div className="wealth-glass terminal-scroll" style={{ flex: 1, padding: '1.5rem', overflowY: 'auto' }}>
                        <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Wallet size={18} /> Mis Posiciones
                        </h3>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {assets.map((asset, i) => (
                                <div key={i} style={{ 
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
                                    padding: '0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px',
                                    border: '1px solid transparent', cursor: 'pointer', transition: '0.2s'
                                }} onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--primary)'} onMouseOut={(e) => e.currentTarget.style.borderColor = 'transparent'}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: asset.color }}></div>
                                        <div>
                                            <div style={{ fontWeight: 600 }}>{asset.symbol}</div>
                                            <div style={{ fontSize: '0.65rem', color: '#94a3b8' }}>{asset.type.toUpperCase()}</div>
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontWeight: 600, fontFamily: 'monospace' }}>{formatMoney(asset.price)}</div>
                                        <div className={asset.change >= 0 ? 'text-neon-green' : 'text-neon-red'} style={{ fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                                            {asset.change >= 0 ? '+' : ''}{asset.change.toFixed(2)}%
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
};

export default WealthTerminal;
