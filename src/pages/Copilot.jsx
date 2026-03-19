import React, { useState, useRef, useEffect } from 'react';
import { 
    Bot, User, Send, Sparkles, BrainCircuit, Activity, 
    Zap, TrendingUp, Info, ShoppingCart, User as UserIcon,
    Sparkle
} from 'lucide-react';
import { SYSTEM_KNOWLEDGE } from '../data/SystemKnowledge';
import { useAuth } from '../context/AuthContext';
import { useContabilidad } from '../context/ContabilidadContext';
import {
    AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
    Radar, RadarChart, PolarGrid, PolarAngleAxis
} from 'recharts';

const INITIAL_MESSAGES = [
    {
        id: 1,
        sender: 'ai',
        text: '¡Hola! Soy **Iubel Copilot**, tu guía institucional. Mi base neuronal ha sido expandida para cubrir la totalidad de la suite Iubel. Estoy listo para asistirte en cualquier módulo operativo o financiero. ¿Deseas explorar alguna categoría específica?',
        timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
    }
];

const Copilot = () => {
    const { user, empresa } = useAuth();
    const { asientos } = useContabilidad();
    const [messages, setMessages] = useState(INITIAL_MESSAGES);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [sessionContext, setSessionContext] = useState({
        lastTopic: null,
        interactionCount: 0
    });
    const [oracleInsight, setOracleInsight] = useState(null);
    const [loadingOracle, setLoadingOracle] = useState(false);
    const endOfMessagesRef = useRef(null);

    const scrollToBottom = () => {
        endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    useEffect(() => {
        const fetchOracle = async () => {
            setLoadingOracle(true);
            try {
                // Simulación de insights basados en IA
                setOracleInsight({
                    trend: "+8.4%",
                    intelligence: "Elite v2.5",
                    resilience: "98.4%"
                });
            } catch (err) { console.error('Oracle fetch error:', err); }
            finally { 
                setTimeout(() => setLoadingOracle(false), 1500);
            }
        };
        fetchOracle();
    }, []);

    const processAIResponse = (userText) => {
        const textLower = userText.toLowerCase();
        let aiResponse = {
            id: Date.now() + 1,
            sender: 'ai',
            timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
        };

        const count = sessionContext.interactionCount + 1;
        setSessionContext(prev => ({ ...prev, interactionCount: count }));

        // 1. Seguridad & Datos
        if (textLower.includes('segur') || textLower.includes('sovereign') || textLower.includes('proteger') || textLower.includes('datos') || textLower.includes('privacidad')) {
            aiResponse.text = `Tu infraestructura operativa de **${empresa?.nombre || 'Iubel'}** está blindada bajo el protocolo **Sovereign V2**. Cada bit de información se procesa en un **Immutable Ledger**, lo que significa que el dato es físicamente imposible de alterar retrospectivamente.`;
            aiResponse.widget = 'securityIntegrity';
        } 
        
        // 2. Consultas de Módulos (Cerebro de Conocimiento)
        else if (textLower.includes('como') || textLower.includes('qué es') || textLower.includes('ayuda') || textLower.includes('paso') || textLower.includes('guia') || textLower.includes('tutorial') || textLower.includes('explicame') || textLower.includes('módulo')) {
            let bestMatch = null;
            let highestScore = 0;

            Object.keys(SYSTEM_KNOWLEDGE).forEach(key => {
                const item = SYSTEM_KNOWLEDGE[key];
                let score = 0;
                
                const keyWords = key.replace(/_/g, ' ').split(' ');
                keyWords.forEach(kw => {
                    if (kw.length > 2 && textLower.includes(kw.toLowerCase())) score += 10;
                });

                if (textLower.includes(item.title.toLowerCase())) score += 12;
                
                item.tags.forEach(tag => {
                    if (textLower.includes(tag.toLowerCase())) score += 5;
                });

                if (score > highestScore) {
                    highestScore = score;
                    bestMatch = item;
                }
            });

            if (bestMatch && highestScore > 5) {
                aiResponse.text = `Accediendo al **Manual Maestro Iubel**. Aquí tienes la arquitectura operativa y guía para **${bestMatch.title}**:\n\n> ${bestMatch.description}\n\n✨ **Protocolo de Ejecución:**\n${bestMatch.how_to.map(s => `> ${s}`).join('\n')}\n\n🚀 **Capacidades Críticas:**\n- ${bestMatch.functions.join('\n- ')}`;
                aiResponse.widget = 'knowledgeCard';
            } else {
                aiResponse.text = "Mi base neuronal cubre la totalidad de la suite Iubel: desde **Operaciones** hasta **FinTech Enterprise**. ¿Qué área estratégica del menú deseas explorar ahora? Puedes usar las categorías rápidas superiores.";
            }
        }

        // 3. Saludos
        else if (textLower.includes('hola') || textLower.includes('buenos dias') || textLower.includes('saludos')) {
            aiResponse.text = `Saludos, **${user?.nombre || 'Administrador'}**. Identidad confirmada vía Protocolo Sovereign. ¿En qué área de la suite Iubel puedo guiarte hoy?`;
        }

        // Default
        else {
            aiResponse.text = "Como tu Copilot Institucional, estoy aquí para guiarte en el uso de cada módulo. ¿Deseas una explicación detallada de alguna sección de tu ERP?";
        }

        setMessages(prev => [...prev, aiResponse]);
        setIsTyping(false);
    };

    const handleSendMessage = (customText) => {
        const text = customText || inputValue;
        if (!text.trim()) return;

        const newUserMsg = {
            id: Date.now(),
            sender: 'user',
            text: text,
            timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
        };

        setMessages(prev => [...prev, newUserMsg]);
        setInputValue('');
        setIsTyping(true);

        setTimeout(() => {
            processAIResponse(text);
        }, 1200 + Math.random() * 800);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') handleSendMessage();
    };

    const formatText = (text) => {
        if (!text) return '';
        const parts = text.split(/(\*\*.*?\*\*|>.*?$|\n)/gm);
        return parts.map((part, i) => {
            if (part && part.startsWith('**') && part.endsWith('**')) {
                return <strong key={i} style={{ color: '#6366f1', fontWeight: 800 }}>{part.slice(2, -2)}</strong>;
            }
            if (part && part.startsWith('>')) {
                return <div key={i} style={{ paddingLeft: '1rem', borderLeft: '3px solid #6366f1', color: '#64748b', fontSize: '0.85rem', margin: '0.25rem 0', fontStyle: 'italic' }}>{part.slice(1).trim()}</div>;
            }
            if (part === '\n') return <br key={i} />;
            return part;
        });
    };

    const CATEGORIES = [
        { id: 'operaciones', label: 'Operaciones', icon: <Activity size={14} />, color: '#6366f1' },
        { id: 'ventas', label: 'Ventas/C.', icon: <ShoppingCart size={14} />, color: '#10b981' },
        { id: 'finanzas', label: 'Finanzas', icon: <TrendingUp size={14} />, color: '#f59e0b' },
        { id: 'rrhh', label: 'Talento/RRHH', icon: <UserIcon size={14} />, color: '#ec4899' },
        { id: 'vip', label: 'FinTech VIP', icon: <Sparkles size={14} />, color: '#8b5cf6' },
    ];

    return (
        <div className="animate-reveal" style={{ height: '100%', display: 'flex', flexDirection: 'column', margin: '-1.5rem', backgroundColor: '#f1f5f9' }}>
            {/* Header */}
            <div style={{ padding: '1.25rem 2rem', background: '#0f172a', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #1e293b', zIndex: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: 42, height: 42, borderRadius: '12px', background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px rgba(99, 102, 241, 0.4)' }}>
                        <BrainCircuit size={24} color="white" />
                    </div>
                    <div>
                        <h1 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            Iubel Copilot <Sparkles size={14} color="#fbbf24" fill="#fbbf24" />
                        </h1>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.7rem', color: '#94a3b8' }}>
                            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981' }}></div>
                            Neuronal Guide Online • Sovereign Elite
                        </div>
                    </div>
                </div>
                <div style={{ padding: '0.5rem 1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '20px', fontSize: '0.7rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Activity size={10} color="#10b981" /> System Integrated
                </div>
            </div>

            {/* Guía Rápida */}
            <div style={{ padding: '0.75rem 2rem', background: 'white', borderBottom: '1px solid #e2e8f0', display: 'flex', gap: '0.75rem', overflowX: 'auto', scrollbarWidth: 'none' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8', alignSelf: 'center', marginRight: '0.5rem', textTransform: 'uppercase' }}>Guía Rápida:</span>
                {CATEGORIES.map(cat => (
                    <button 
                        key={cat.id}
                        onClick={() => handleSendMessage(`Explícame los módulos de ${cat.id}`)}
                        style={{ 
                            padding: '0.5rem 1rem', 
                            borderRadius: '100px', 
                            background: '#f8fafc',
                            border: '1px solid #e2e8f0',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            color: '#475569',
                            whiteSpace: 'nowrap',
                            transition: '0.2s',
                            cursor: 'pointer'
                        }}
                    >
                        <span style={{ color: cat.color }}>{cat.icon}</span>
                        {cat.label}
                    </button>
                ))}
            </div>

            {/* Chat Area */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                
                {oracleInsight && (
                    <div className="animate-reveal" style={{ 
                        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', 
                        color: 'white', 
                        padding: '1.5rem', 
                        borderRadius: '24px', 
                        border: '1px solid rgba(99,102,241,0.3)',
                        marginBottom: '1rem'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                            <Sparkles size={20} color="#6366f1" />
                            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#a5b4fc' }}>ORACLE PREDICTIVE INSIGHT</span>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div>
                                <p style={{ margin: 0, fontSize: '0.75rem', color: '#94a3b8' }}>Tendencia</p>
                                <span style={{ fontSize: '1.25rem', fontWeight: 900 }}>{oracleInsight.trend}</span>
                            </div>
                            <div>
                                <p style={{ margin: 0, fontSize: '0.75rem', color: '#94a3b8' }}>Nivel UI</p>
                                <span style={{ fontSize: '1.25rem', fontWeight: 900, color: '#6366f1' }}>{oracleInsight.intelligence}</span>
                            </div>
                        </div>
                    </div>
                )}

                {messages.map((msg) => {
                    const isAi = msg.sender === 'ai';
                    return (
                        <div key={msg.id} style={{ display: 'flex', gap: '1rem', alignSelf: isAi ? 'flex-start' : 'flex-end', maxWidth: '85%' }}>
                            {isAi && (
                                <div style={{ width: 36, height: 36, borderRadius: '10px', background: 'white', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '0.25rem' }}>
                                    <Bot size={18} color="#6366f1" />
                                </div>
                            )}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', alignItems: isAi ? 'flex-start' : 'flex-end' }}>
                                <div style={{ 
                                    background: isAi ? 'white' : '#6366f1', 
                                    color: isAi ? '#1e293b' : 'white',
                                    padding: '1.25rem 1.5rem', 
                                    borderRadius: isAi ? '4px 20px 20px 20px' : '20px 4px 20px 20px',
                                    boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
                                    lineHeight: '1.6',
                                    fontSize: '0.95rem',
                                    border: isAi ? '1px solid #e2e8f0' : 'none'
                                }}>
                                    {formatText(msg.text)}
                                </div>

                                {msg.widget === 'knowledgeCard' && (
                                    <div className="animate-reveal" style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '24px', width: '380px', border: '1px solid #e2e8f0', marginTop: '0.5rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: '#6366f1' }}>
                                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#6366f1' }}></div>
                                            <span style={{ fontSize: '0.7rem', fontWeight: 900, textTransform: 'uppercase' }}>Manual Maestro Iubel</span>
                                        </div>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button style={{ flex: 1, padding: '0.5rem', borderRadius: '10px', background: '#eff6ff', color: '#2563eb', border: 'none', fontSize: '0.7rem', fontWeight: 800 }}>Documentación</button>
                                            <button style={{ flex: 1, padding: '0.5rem', borderRadius: '10px', background: '#f1f5f9', color: '#475569', border: 'none', fontSize: '0.7rem', fontWeight: 800 }}>Video</button>
                                        </div>
                                    </div>
                                )}
                                <div style={{ fontSize: '0.65rem', color: '#94a3b8' }}>{msg.timestamp}</div>
                            </div>
                        </div>
                    );
                })}
                
                {isTyping && (
                    <div style={{ display: 'flex', gap: '1rem', alignSelf: 'flex-start' }}>
                        <div style={{ width: 36, height: 36, borderRadius: '10px', background: 'white', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Bot size={18} color="#6366f1" />
                        </div>
                        <div className="dot-typing" style={{ padding: '1rem' }}></div>
                    </div>
                )}
                <div ref={endOfMessagesRef} />
            </div>

            {/* Input Bar */}
            <div style={{ padding: '1.5rem 2.5rem', background: 'white', borderTop: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: '#f8fafc', padding: '0.5rem', borderRadius: '100px', border: '1px solid #e2e8f0' }}>
                    <Zap size={18} color="#6366f1" style={{ marginLeft: '1rem' }} />
                    <input 
                        type="text" 
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Pregunta sobre cualquier módulo de Iubel..."
                        style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', padding: '0.6rem 0', fontSize: '0.95rem' }}
                    />
                    <button 
                        onClick={() => handleSendMessage()}
                        style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', color: 'white', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                    >
                        <Send size={20} />
                    </button>
                </div>
            </div>

            <style>{`
                .dot-typing {
                    position: relative;
                    left: -9999px;
                    width: 7px;
                    height: 7px;
                    border-radius: 5px;
                    background-color: #6366f1;
                    color: #6366f1;
                    box-shadow: 9999px 0 0 0 #6366f1, 10014px 0 0 0 #6366f1, 10028px 0 0 0 #6366f1;
                    animation: dotTyping 1.5s infinite linear;
                    margin-left: 20px;
                }
                @keyframes dotTyping {
                    0% { box-shadow: 9999px 0 0 0 #6366f1, 10014px 0 0 0 #6366f1, 10028px 0 0 0 #6366f1; }
                    33% { box-shadow: 9999px -5px 0 0 #6366f1, 10014px 0 0 0 #6366f1, 10028px 0 0 0 #6366f1; }
                    66% { box-shadow: 9999px 0 0 0 #6366f1, 10014px -5px 0 0 #6366f1, 10028px 0 0 0 #6366f1; }
                    100% { box-shadow: 9999px 0 0 0 #6366f1, 10014px 0 0 0 #6366f1, 10028px -5px 0 0 #6366f1; }
                }
                .animate-reveal { animation: reveal 0.4s cubic-bezier(0, 0, 0.2, 1); }
                @keyframes reveal { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </div>
    );
};

export default Copilot;
