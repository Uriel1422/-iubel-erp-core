import React, { useState, useEffect } from 'react';
import { 
    Activity, Shield, Zap, Search, Filter, Share2, 
    MoreHorizontal, ChevronRight, AlertCircle, Database, 
    Globe, Cpu, Link as LinkIcon, Eye, Maximize2, Terminal,
    LayoutGrid, Network
} from 'lucide-react';
import { 
    ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, 
    ZAxis, Tooltip, Cell, LineChart, Line
} from 'recharts';

// Datos simulados para el Mapa de Nodos (Grafo)
// Datos del mapa de nodos (vacío por defecto)
const MOCK_NODES = [];
const MOCK_EDGES = [];
const MOCK_ANOMALIES = [];

const DataNode = () => {
    const [activeNode, setActiveNode] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(true);
    const [terminalLines, setTerminalLines] = useState([
        '[SYSTEM] Booting Data Node v4.0.2...',
        '[AUTH] Access granted. Security Clearance: LEVEL 5',
        '[FETCH] Extracting transaction metadata...',
        '[AI] Running Link Analysis on cluster 0xFA42...',
    ]);

    useEffect(() => {
        const timer = setTimeout(() => setIsAnalyzing(false), 2500);
        return () => clearTimeout(timer);
    }, []);

    // Simulación de escritura en terminal
    useEffect(() => {
        if (!isAnalyzing) return;
        const interval = setInterval(() => {
            const extra = [
                `[DNS] Resolving node connections...`,
                `[HASH] SHA-256 Validated: 0x${Math.random().toString(16).slice(2, 10).toUpperCase()}`,
                `[GEO] Mapping origin to Panama/Bahamas edge...`,
                `[LINK] Visualizing graph relationships...`
            ];
            setTerminalLines(prev => [...prev.slice(-3), extra[Math.floor(Math.random() * extra.length)]]);
        }, 800);
        return () => clearInterval(interval);
    }, [isAnalyzing]);

    const renderNode = (node) => {
        const isActive = activeNode?.id === node.id;
        const color = node.risk === 'high' ? '#ef4444' : node.risk === 'medium' ? '#f59e0b' : '#10b981';
        
        return (
            <g 
                key={node.id} 
                className="cursor-pointer"
                onClick={() => setActiveNode(node)}
                style={{ transition: 'all 0.3s ease' }}
            >
                {/* Glow effect */}
                <circle cx={node.x} cy={node.y} r={isActive ? 12 : 8} fill={color} opacity={0.3} style={{ filter: 'blur(4px)' }} />
                <circle cx={node.x} cy={node.y} r={isActive ? 6 : 4} fill={color} stroke="#000" strokeWidth={1} />
                <text 
                    x={node.x} y={node.y + 20} 
                    fill={isActive ? '#fff' : '#94a3b8'} 
                    fontSize={10} textAnchor="middle" 
                    fontFamily="monospace"
                >
                    {node.label}
                </text>
            </g>
        );
    };

    return (
        <div style={{ 
            height: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column', 
            background: '#020617', color: '#f8fafc', margin: '-1.5rem', overflow: 'hidden',
            fontFamily: '"JetBrains Mono", monospace'
        }}>
            {/* Top Bar - Intelligence Status */}
            <div style={{ padding: '0.75rem 1.5rem', borderBottom: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#0f172a' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#38bdf8' }}>
                        <Network size={20} />
                        <span style={{ fontWeight: 800, letterSpacing: '2px', fontSize: '1rem' }}>IUBEL // DATA NODE</span>
                    </div>
                    <div style={{ height: '20px', width: '1px', background: '#334155' }}></div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                        STATUS: <span style={{ color: '#10b981' }}>OPERATIONAL [LEVEL 5]</span>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.7rem' }}>
                    <div style={{ color: '#94a3b8' }}>NODES: <span style={{ color: '#fff' }}>0</span></div>
                    <div style={{ color: '#94a3b8' }}>LINKS: <span style={{ color: '#fff' }}>0</span></div>
                    <div style={{ color: '#94a3b8' }}>ANOMALIES: <span style={{ color: '#10b981' }}>0</span></div>
                </div>
            </div>

            <div style={{ flex: 1, display: 'flex' }}>
                {/* Left Sidebar - Terminal and Filters */}
                <div style={{ width: '300px', borderRight: '1px solid #1e293b', display: 'flex', flexDirection: 'column', background: '#020617' }}>
                    
                    {/* Console Output */}
                    <div style={{ flex: '0 0 200px', padding: '1rem', background: '#000', margin: '0.75rem', borderRadius: '4px', border: '1px solid #1e293b', fontSize: '0.7rem' }}>
                        <div style={{ color: '#38bdf8', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <Terminal size={14} /> SECURITY CONSOLE
                        </div>
                        {terminalLines.map((line, i) => (
                            <div key={i} style={{ color: '#4ade80', marginBottom: '0.25rem', opacity: 0.8 }}>
                                {line}
                            </div>
                        ))}
                    </div>

                    {/* Radar / Anomalies */}
                    <div style={{ flex: 1, padding: '1rem', overflowY: 'auto' }}>
                        <h4 style={{ fontSize: '0.8rem', color: '#facc15', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <AlertCircle size={16} /> RADAR DE ANOMALÍAS
                        </h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {MOCK_ANOMALIES.map(anom => (
                                <div key={anom.id} style={{ border: '1px solid #1e293b', borderRadius: '6px', padding: '0.75rem', background: 'rgba(30, 41, 59, 0.4)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: anom.severity === 'critical' ? '#ef4444' : '#f97316' }}>
                                            {anom.title}
                                        </span>
                                        <span style={{ fontSize: '0.75rem', fontWeight: 900 }}>{anom.score}%</span>
                                    </div>
                                    <p style={{ fontSize: '0.65rem', color: '#94a3b8', margin: 0 }}>{anom.desc}</p>
                                    <div style={{ height: '4px', background: '#1e293b', marginTop: '0.5rem', borderRadius: '2px', overflow: 'hidden' }}>
                                        <div style={{ width: `${anom.score}%`, height: '100%', background: anom.severity === 'critical' ? '#ef4444' : '#f97316' }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Main Graph View - Inspired by Palantir Gotham */}
                <div style={{ flex: 1, position: 'relative', overflow: 'hidden', background: 'radial-gradient(circle at center, #0f172a 0%, #020617 100%)' }}>
                    {/* SVG Grid background */}
                    <div style={{ position: 'absolute', inset: 0, opacity: 0.05, pointerEvents: 'none' }}>
                        <svg width="100%" height="100%">
                            <defs>
                                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#60a5fa" strokeWidth="0.5" />
                                </pattern>
                            </defs>
                            <rect width="100%" height="100%" fill="url(#grid)" />
                        </svg>
                    </div>

                    {isAnalyzing ? (
                        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(2, 6, 23, 0.8)', zIndex: 10 }}>
                            <div className="pulsing-radar" style={{ width: 120, height: 120, border: '2px solid #38bdf8', borderRadius: '50%', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <div style={{ width: 20, height: 20, background: '#38bdf8', borderRadius: '50%', boxShadow: '0 0 20px #38bdf8' }}></div>
                                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, border: '2px solid #38bdf8', borderRadius: '50%', animation: 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite' }}></div>
                            </div>
                            <h3 style={{ marginTop: '2rem', fontSize: '1rem', letterSpacing: '4px', color: '#38bdf8' }}>ANALYZING VECTORS...</h3>
                            <style>{`
                                @keyframes ping { 75%, 100% { transform: scale(2); opacity: 0; } }
                            `}</style>
                        </div>
                    ) : (
                        <svg width="100%" height="100%" viewBox="0 0 800 400" preserveAspectRatio="xMidYMid meet">
                            {/* Lines (Edges) */}
                            {MOCK_EDGES.map((edge, i) => {
                                const from = MOCK_NODES.find(n => n.id === edge.from);
                                const to = MOCK_NODES.find(n => n.id === edge.to);
                                return (
                                    <line 
                                        key={i} 
                                        x1={from.x} y1={from.y} x2={to.x} y2={to.y} 
                                        stroke="#1e293b" strokeWidth={1} strokeDasharray="5,5" 
                                    />
                                );
                            })}
                            {/* Nodes */}
                            {MOCK_NODES.map(renderNode)}
                        </svg>
                    )}

                    {/* Node Details Overlay (Lower Right) */}
                    {activeNode && (
                        <div style={{ position: 'absolute', bottom: '2rem', right: '2rem', width: '300px', background: 'rgba(15, 23, 42, 0.9)', backdropFilter: 'blur(10px)', border: '1px solid #38bdf8', borderRadius: '8px', padding: '1.25rem', boxShadow: '0 0 30px rgba(56, 189, 248, 0.1)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                <div style={{ fontSize: '0.8rem', color: '#38bdf8', fontWeight: 800 }}>DETALLES DEL NODO</div>
                                <button onClick={() => setActiveNode(null)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                                    <MoreHorizontal size={14} />
                                </button>
                            </div>
                            <h3 style={{ fontSize: '1.1rem', margin: '0 0 0.5rem 0' }}>{activeNode.label}</h3>
                            <div style={{ fontSize: '0.75rem', marginBottom: '1rem' }}>
                                <div style={{ marginBottom: '0.25rem' }}>TIPO: <span style={{ color: '#fff' }}>{activeNode.type.toUpperCase()}</span></div>
                                <div style={{ marginBottom: '0.25rem' }}>RIESGO: <span style={{ color: activeNode.risk === 'high' ? '#ef4444' : '#10b981' }}>{activeNode.risk.toUpperCase()}</span></div>
                                <div>METADATA: <span style={{ color: '#94a3b8' }}>Encrypted/Blocked</span></div>
                            </div>
                            <button style={{ width: '100%', background: '#38bdf8', color: '#000', border: 'none', padding: '0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 800 }}>
                                INICIAR INVESTIGACIÓN PROFUNDA
                            </button>
                        </div>
                    )}
                </div>

                {/* Right Sidebar - Cluster Statistics */}
                <div style={{ width: '300px', borderLeft: '1px solid #1e293b', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '2rem', background: '#0f172a' }}>
                    <div>
                        <h4 style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '1.25rem', borderBottom: '1px solid #1e293b', paddingBottom: '0.5rem' }}>DENSIDAD DE CLÚSTER</h4>
                        <div style={{ height: '150px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <ScatterChart margin={{ top: 10, right: 10, bottom: 10, left: -20 }}>
                                    <XAxis type="number" dataKey="x" hide />
                                    <YAxis type="number" dataKey="y" hide />
                                    <ZAxis type="number" dataKey="z" range={[20, 40]} />
                                    <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                                    <Scatter name="Density" data={[{x: 10, y: 30, z: 20}, {x: 40, y: 70, z: 15}, {x: 80, y: 20, z: 25}]} fill="#38bdf8" />
                                </ScatterChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div>
                        <h4 style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '1.25rem', borderBottom: '1px solid #1e293b', paddingBottom: '0.5rem' }}>ALGORITMO PREDICTIVO</h4>
                        <div style={{ height: '100px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={[{v: 20}, {v: 45}, {v: 30}, {v: 70}, {v: 60}, {v: 90}]}>
                                    <Line type="monotone" dataKey="v" stroke="#facc15" strokeWidth={2} dot={false} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                        <div style={{ fontSize: '0.65rem', color: '#94a3b8', marginTop: '0.5rem' }}>
                            Confianza del modelo: <span style={{ color: '#10b981' }}>98.24%</span>
                        </div>
                    </div>

                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', gap: '0.5rem' }}>
                        <div style={{ padding: '1rem', background: 'rgba(56, 189, 248, 0.05)', border: '1px solid rgba(56, 189, 248, 0.2)', borderRadius: '8px' }}>
                            <div style={{ fontSize: '0.75rem', fontWeight: 800, marginBottom: '0.25rem' }}>AUDIT LOG</div>
                            <div style={{ fontSize: '0.65rem', color: '#94a3b8' }}>
                                Master Analysis triggered by UID:00x321. Results saved to secure vault.
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DataNode;
