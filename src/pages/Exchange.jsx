import React, { useState, useEffect } from 'react';
import { 
    TrendingUp, TrendingDown, ArrowRightLeft, Database, 
    Zap, Share2, Layers, Repeat, BarChart3, Clock, 
    ArrowUpRight, ArrowDownLeft, ShieldCheck, PieChart,
    ChevronUp, ChevronDown, Plus, Minus, Cpu
} from 'lucide-react';
import { 
    ResponsiveContainer, AreaChart, Area, XAxis, YAxis, 
    Tooltip, CartesianGrid, BarChart, Bar, Cell
} from 'recharts';

const MOCK_TRADES = [
    { id: 1, price: 105.52, amount: 15.5, time: '14:02:11', type: 'buy' },
    { id: 2, price: 105.48, amount: 8.2, time: '14:01:45', type: 'sell' },
    { id: 3, price: 105.55, amount: 100.0, time: '13:59:12', type: 'buy' },
    { id: 4, price: 105.40, amount: 25.0, time: '13:58:30', type: 'sell' },
    { id: 5, price: 105.50, amount: 50.0, time: '13:57:05', type: 'buy' }
];

const MOCK_ORDER_BOOK_SELL = [
    { price: 105.90, amount: 1200, total: 2800 },
    { price: 105.75, amount: 800, total: 1600 },
    { price: 105.65, amount: 500, total: 800 },
    { price: 105.55, amount: 300, total: 300 }
];

const MOCK_ORDER_BOOK_BUY = [
    { price: 105.45, amount: 150, total: 150 },
    { price: 105.35, amount: 450, total: 600 },
    { price: 105.20, amount: 1200, total: 1800 },
    { price: 105.00, amount: 4500, total: 6300 }
];

const INITIAL_TOKENIZED_ASSETS = [
    { id: 't1', name: 'Edificio Iubel HQ', symbol: 'IUB-HQ', balance: 500000, value: 5000000, color: '#6366f1' },
    { id: 't2', name: 'Flota Transporte Alpha', symbol: 'IUB-TRN', balance: 120000, value: 1200000, color: '#10b981' },
    { id: 't3', name: 'Contrato Trigo 2024', symbol: 'IUB-AGRO', balance: 45000, value: 450000, color: '#f59e0b' }
];


const Exchange = () => {
    const [price, setPrice] = useState(105.52);
    const [change, setChange] = useState(+2.45);
    const [activeTab, setActiveTab] = useState('trading'); // trading, tokens
    const [tokenizedAssets, setTokenizedAssets] = useState(INITIAL_TOKENIZED_ASSETS);

    // Simular tickers de mercado
    useEffect(() => {
        const interval = setInterval(() => {
            const movement = (Math.random() - 0.5) * 0.1;
            setPrice(prev => Number((prev + movement).toFixed(2)));
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    const formatMoney = (val) => new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP' }).format(val);

    return (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', height: '100%' }}>
            
            {/* Header / Stats Bar */}
            <div className="card glass layout-card" style={{ padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, #0ea5e9 0%, #38bdf8 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                            <Zap size={20} />
                        </div>
                        <div>
                            <div style={{ fontSize: '0.75rem', fontWeight: 700, opacity: 0.6, letterSpacing: '1px' }}>IUBEL TOKEN (IUB)</div>
                            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>{formatMoney(price)}</div>
                        </div>
                    </div>
                    <div style={{ height: '30px', width: '1px', background: 'var(--border)' }}></div>
                    <div>
                        <div style={{ fontSize: '0.75rem', opacity: 0.6 }}>24h Change</div>
                        <div style={{ color: change >= 0 ? 'var(--success)' : 'var(--danger)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                            {change >= 0 ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            {change}%
                        </div>
                    </div>
                    <div>
                        <div style={{ fontSize: '0.75rem', opacity: 0.6 }}>24h Volume</div>
                        <div style={{ fontWeight: 700 }}>$0.00</div>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button 
                        onClick={() => setActiveTab('trading')}
                        style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: 'none', cursor: 'pointer', background: activeTab === 'trading' ? 'var(--primary)' : 'var(--background)', color: activeTab === 'trading' ? 'white' : 'var(--text-muted)', fontWeight: 600, transition: '0.2s' }}
                    >
                        Trading
                    </button>
                    <button 
                        onClick={() => setActiveTab('tokens')}
                        style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: 'none', cursor: 'pointer', background: activeTab === 'tokens' ? 'var(--primary)' : 'var(--background)', color: activeTab === 'tokens' ? 'white' : 'var(--text-muted)', fontWeight: 600, transition: '0.2s' }}
                    >
                        Tokenización
                    </button>
                </div>
            </div>

            {activeTab === 'trading' ? (
                <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '300px 1fr 300px', gap: '1.5rem' }}>
                    
                    {/* Panel 1: Order Book */}
                    <div className="card glass layout-card" style={{ padding: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                        <div style={{ padding: '1rem', borderBottom: '1px solid var(--border)', fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-muted)' }}>ORDER BOOK</div>
                        
                        {/* Sells */}
                        <div style={{ padding: '0.5rem 1rem', flex: 1, display: 'flex', flexDirection: 'column-reverse' }}>
                            {MOCK_ORDER_BOOK_SELL.map((order, i) => (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', padding: '0.25rem 0', position: 'relative' }}>
                                    <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, background: 'rgba(239, 68, 68, 0.1)', width: `${(order.total / 3000) * 100}%`, zIndex: 0 }}></div>
                                    <span style={{ color: 'var(--danger)', fontWeight: 700, zIndex: 1 }}>{order.price.toFixed(2)}</span>
                                    <span style={{ zIndex: 1 }}>{order.amount}</span>
                                    <span style={{ opacity: 0.6, zIndex: 1 }}>{order.total}</span>
                                </div>
                            ))}
                        </div>

                        {/* Spread / Current Price */}
                        <div style={{ padding: '0.75rem 1rem', background: 'var(--background)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', textAlign: 'center' }}>
                            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)' }}>{price.toFixed(2)}</div>
                            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Mark Price: {price.toFixed(2)}</div>
                        </div>

                        {/* Buys */}
                        <div style={{ padding: '0.5rem 1rem', flex: 1 }}>
                            {MOCK_ORDER_BOOK_BUY.map((order, i) => (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', padding: '0.25rem 0', position: 'relative' }}>
                                    <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, background: 'rgba(16, 185, 129, 0.1)', width: `${(order.total / 8000) * 100}%`, zIndex: 0 }}></div>
                                    <span style={{ color: 'var(--success)', fontWeight: 700, zIndex: 1 }}>{order.price.toFixed(2)}</span>
                                    <span style={{ zIndex: 1 }}>{order.amount}</span>
                                    <span style={{ opacity: 0.6, zIndex: 1 }}>{order.total}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Panel 2: Chart & Execution */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div className="card glass layout-card" style={{ flex: 1, padding: '1.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <BarChart3 size={18} className="text-primary" />
                                    <h3 style={{ margin: 0, fontSize: '1rem' }}>Evolución del Mercado Secundario</h3>
                                </div>
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Intervalo: 1H</div>
                            </div>
                            <div style={{ height: '300px' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={[{t: '09:00', v: 102}, {t: '10:00', v: 104.5}, {t: '11:00', v: 103.2}, {t: '12:00', v: 106}, {t: '13:00', v: 105.5}, {t: '14:00', v: 105.52}]}>
                                        <defs>
                                            <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                                                <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                                        <XAxis dataKey="t" stroke="var(--text-muted)" fontSize={10} />
                                        <YAxis domain={['auto', 'auto']} stroke="var(--text-muted)" fontSize={10} />
                                        <Tooltip contentStyle={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '8px' }} />
                                        <Area type="monotone" dataKey="v" stroke="var(--primary)" fillOpacity={1} fill="url(#colorVal)" strokeWidth={3} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Trade Execution */}
                        <div className="card glass layout-card" style={{ padding: '1.5rem' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                        <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Comprar IUB</span>
                                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Disp: $250,400.00</span>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                        <div style={{ position: 'relative' }}>
                                            <input type="text" placeholder="Monto" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'var(--background)', border: '1px solid var(--border)', fontSize: '0.9rem', color: 'var(--text-main)' }} />
                                            <span style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', fontSize: '0.75rem', fontWeight: 700, opacity: 0.5 }}>IUB</span>
                                        </div>
                                        <button className="btn btn-primary" style={{ width: '100%', padding: '0.75rem', background: '#10b981', border: 'none' }}>ORDEN DE COMPRA</button>
                                    </div>
                                </div>
                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                        <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Vender IUB</span>
                                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Disp: 1,500 IUB</span>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                        <div style={{ position: 'relative' }}>
                                            <input type="text" placeholder="Monto" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'var(--background)', border: '1px solid var(--border)', fontSize: '0.9rem', color: 'var(--text-main)' }} />
                                            <span style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', fontSize: '0.75rem', fontWeight: 700, opacity: 0.5 }}>IUB</span>
                                        </div>
                                        <button className="btn btn-primary" style={{ width: '100%', padding: '0.75rem', background: '#ef4444', border: 'none' }}>ORDEN DE VENTA</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Panel 3: Recent Trades */}
                    <div className="card glass layout-card" style={{ padding: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                        <div style={{ padding: '1rem', borderBottom: '1px solid var(--border)', fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-muted)' }}>ÚLTIMAS EJECUCIONES</div>
                        <div style={{ flex: 1, overflowY: 'auto' }}>
                            <table style={{ width: '100%', fontSize: '0.75rem', borderCollapse: 'collapse' }}>
                                <thead style={{ position: 'sticky', top: 0, background: 'var(--background)', zIndex: 1 }}>
                                    <tr>
                                        <th style={{ textAlign: 'left', padding: '0.75rem' }}>Precio</th>
                                        <th style={{ textAlign: 'center', padding: '0.75rem' }}>Monto</th>
                                        <th style={{ textAlign: 'right', padding: '0.75rem' }}>Hora</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {MOCK_TRADES.map(trade => (
                                        <tr key={trade.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                            <td style={{ padding: '0.75rem', color: trade.type === 'buy' ? 'var(--success)' : 'var(--danger)', fontWeight: 700 }}>{trade.price.toFixed(2)}</td>
                                            <td style={{ padding: '0.75rem', textAlign: 'center' }}>{trade.amount}</td>
                                            <td style={{ padding: '0.75rem', textAlign: 'right', opacity: 0.6 }}>{trade.time}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>
            ) : (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    
                    {/* Tokenization Overview */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
                        <div className="card glass layout-card" style={{ padding: '1.5rem', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', color: 'white', position: 'relative', overflow: 'hidden' }}>
                            <div style={{ position: 'absolute', top: -10, right: -10, opacity: 0.1 }}><Share2 size={100} /></div>
                            <div style={{ fontSize: '0.8rem', opacity: 0.8, marginBottom: '0.5rem' }}>Tokens en Circulación</div>
                            <div style={{ fontSize: '2rem', fontWeight: 800 }}>12,450,000</div>
                            <div style={{ fontSize: '0.75rem', marginTop: '1rem', color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                <ShieldCheck size={14} /> Respaldado por Activos Físicos
                            </div>
                        </div>
                        <div className="card glass layout-card" style={{ padding: '1.5rem' }}>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Valor de Capitalización</div>
                            <div style={{ fontSize: '2rem', fontWeight: 800 }}>$0.00</div>
                            <div style={{ fontSize: '0.75rem', marginTop: '1rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                <TrendingUp size={14} /> n/a
                            </div>
                        </div>
                        <div className="card glass layout-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', border: '2px dashed var(--primary)', cursor: 'pointer' }}>
                            <Plus size={32} className="text-primary" />
                            <div style={{ fontWeight: 700, marginTop: '0.5rem' }}>Tokenizar Nuevo Activo</div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Inmuebles, Vehículos, Contratos</div>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '1.5rem', flex: 1 }}>
                        {/* Token List */}
                        <div className="card glass layout-card" style={{ padding: '1.5rem' }}>
                            <h3 style={{ margin: '0 0 1.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Layers size={18} className="text-primary" /> Activos Digitalizados
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {tokenizedAssets.map((token, i) => (
                                    <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'var(--background)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <div style={{ width: 48, height: 48, borderRadius: '12px', background: token.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800 }}>
                                                {token.symbol.split('-')[1]}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 700 }}>{token.name}</div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Identificador: {token.symbol} • Red Iubel-Core</div>
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>{token.balance.toLocaleString()} Units</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--success)' }}>Liquidación Instantánea</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Node Explorer Preview */}
                        <div className="card glass layout-card" style={{ padding: '1.5rem', background: '#020617', color: 'white' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#38bdf8', marginBottom: '1.5rem' }}>
                                <Cpu size={18} />
                                <span style={{ fontWeight: 800, letterSpacing: '1px', fontSize: '0.8rem' }}>IUB-LEDGER EXPLORER</span>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {[1, 2, 3].map(b => (
                                    <div key={b} style={{ borderLeft: '2px solid #38bdf8', padding: '0 0 0.5rem 1rem', position: 'relative' }}>
                                        <div style={{ position: 'absolute', left: '-5px', top: 0, width: 8, height: 8, borderRadius: '50%', background: '#38bdf8' }}></div>
                                        <div style={{ fontSize: '0.65rem', color: '#94a3b8' }}>BLOQUE #{842340 + b} • Hace {b*2} mins</div>
                                        <div style={{ fontSize: '0.75rem', fontFamily: 'monospace', margin: '0.25rem 0' }}>tx: 0x42f...a4e</div>
                                        <div style={{ fontSize: '0.7rem', color: '#10b981' }}>+ 12.00 IUB Minted</div>
                                    </div>
                                ))}
                            </div>
                            <div style={{ marginTop: '2rem', padding: '1rem', border: '1px solid #1e293b', borderRadius: '8px', fontSize: '0.7rem', color: '#94a3b8' }}>
                                Validating cross-ledger consensus... <span style={{ color: '#10b981' }}>READY</span>
                            </div>
                        </div>
                    </div>

                </div>
            )}

        </div>
    );
};

export default Exchange;
