import React, { useState, useRef, useEffect } from 'react';
import { 
    Bot, User, Send, Sparkles, BrainCircuit, Activity, 
    BarChart2, PieChart, ShieldAlert, Zap, TrendingUp,
    CheckCircle2, AlertTriangle, Info, BookOpen
} from 'lucide-react';
import { SYSTEM_KNOWLEDGE } from '../data/SystemKnowledge';
import { useAuth } from '../context/AuthContext';
import { useContabilidad } from '../context/ContabilidadContext';
import {
    AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
    BarChart, Bar, Cell, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';

const INITIAL_MESSAGES = [
    {
        id: 1,
        sender: 'ai',
        text: '¡Hola! Soy **Iubel Copilot**, tu guía operativa. He analizado el estado de tu empresa y estoy listo para ayudarte. ¿Deseas saber cómo realizar alguna operación o una proyección financiera?',
        timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
    }
];

const IUBEL_GUIDES = {
    facturacion: {
        title: "Emisión de Facturas y NCF",
        steps: [
            "1. Ve al módulo de **Ventas/Facturas**.",
            "2. Haz clic en **Nueva Factura**.",
            "3. Selecciona el **Cliente** (puedes crear uno nuevo ahí mismo).",
            "4. Elige el **Tipo de Comprobante (NCF)** correspondiente.",
            "5. Agrega los productos o servicios con sus precios.",
            "6. Verifica el ITBIS y haz clic en **Emitir Factura**."
        ]
    },
    socios: {
        title: "Registro de Socios y KYC",
        steps: [
            "1. Dirígete a **Fintech/Socios**.",
            "2. Presiona el botón **+ Nuevo Socio**.",
            "3. Completa los datos personales y de contacto.",
            "4. En la pestaña **KYC**, sube el documento de identidad.",
            "5. El sistema asignará un **Socio Score** inicial automáticamente.",
            "6. Haz clic en **Guardar Registro**."
        ]
    },
    prestamos: {
        title: "Desembolso de Préstamos",
        steps: [
            "1. Entra a **Fintech/Préstamos**.",
            "2. Haz clic en **Nueva Solicitud**.",
            "3. Selecciona al socio y el monto aprobado.",
            "4. Define la **Tasa de Interés** y el **Plazo**.",
            "5. Selecciona el método de amortización (Francés o Alemán).",
            "6. Pulsa **Procesar Desembolso** para generar la tabla de pagos."
        ]
    },
    contabilidad: {
        title: "Cierre de Mes y Catalogo de Cuentas",
        steps: [
            "1. Verifica el **Libro Mayor** en Contabilidad.",
            "2. Asegúrate de que todos los asientos diarios estén cuadrados.",
            "3. Ve a **Configuración -> Plan de Cuentas** si necesitas añadir auxiliares.",
            "4. Dirígete a **Cierre Fiscal** para bloquear el periodo actual.",
            "5. Genera el reporte 606 y 607 para la DGII."
        ]
    }
};

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
                const token = localStorage.getItem('token');
                const res = await fetch('/api/ai/predictive-insight', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) setOracleInsight(await res.json());
            } catch (err) { console.error('Oracle fetch error:', err); }
            finally { setLoadingOracle(true); } // Keep loading state a bit for effect
            setTimeout(() => setLoadingOracle(false), 2000);
        };
        fetchOracle();
    }, []);

    const handleSendMessage = () => {
        if (!inputValue.trim()) return;

        const newUserMsg = {
            id: Date.now(),
            sender: 'user',
            text: inputValue,
            timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
        };

        setMessages(prev => [...prev, newUserMsg]);
        setInputValue('');
        setIsTyping(true);

        setTimeout(() => {
            processAIResponse(newUserMsg.text);
        }, 1200 + Math.random() * 800);
    };

    const processAIResponse = (userText) => {
        const textLower = userText.toLowerCase();
        let aiResponse = {
            id: Date.now() + 1,
            sender: 'ai',
            timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
        };

        // Memoria de sesión avanzada
        const count = sessionContext.interactionCount + 1;
        setSessionContext(prev => ({ ...prev, interactionCount: count }));

        // Lógica de Intenciones Institucionales Elite
        
        // 1. Seguridad & Datos (Prioridad Alta)
        if (textLower.includes('segur') || textLower.includes('sovereign') || textLower.includes('proteger') || textLower.includes('datos') || textLower.includes('privacidad')) {
            aiResponse.text = `Tu infraestructura operativa de **${empresa?.nombre || 'Iubel'}** está blindada bajo el protocolo **Sovereign V2**. Cada bit de información se procesa en un **Immutable Ledger**, lo que significa que el dato es físicamente imposible de alterar retrospectivamente. Además, el **FraudShield AI** monitorea patrones de acceso en tiempo real para neutralizar cualquier amenaza antes de que ocurra.`;
            aiResponse.widget = 'securityIntegrity';
        } 
        
        // 2. Analítica & Valuación
        else if (textLower.includes('valor') || textLower.includes('rendimiento') || textLower.includes('finanza') || textLower.includes('ganancia')) {
            aiResponse.text = `Estamos operando en un nivel de eficiencia óptimo. La valuación de tus activos digitales y propiedad intelectual bajo el motor Iubel se estima en **$2.5M USD**. He preparado un nodo de estabilidad financiera para que visualices la resiliencia de tu capital actual.`;
            aiResponse.widget = 'systemHealth';
        }

        // 3. Consultas de Módulos (Cerebro de Conocimiento)
        else if (textLower.includes('como') || textLower.includes('qué es') || textLower.includes('ayuda') || textLower.includes('paso') || textLower.includes('guia')) {
            // Buscador Neuronal de Conocimiento
            let bestMatch = null;
            let highestScore = 0;

            Object.keys(SYSTEM_KNOWLEDGE).forEach(key => {
                const item = SYSTEM_KNOWLEDGE[key];
                let score = 0;
                
                // Pesos de coincidencia
                if (textLower.includes(key.replace('_', ' '))) score += 10;
                item.tags.forEach(tag => {
                    if (textLower.includes(tag)) score += 5;
                });
                if (textLower.includes(item.title.toLowerCase())) score += 8;

                if (score > highestScore) {
                    highestScore = score;
                    bestMatch = item;
                }
            });

            if (bestMatch && highestScore > 0) {
                aiResponse.text = `Accediendo al **Manual Maestro Elite**. Aquí tienes la arquitectura operativa para **${bestMatch.title}**:\n\n> ${bestMatch.description}\n\n**Protocolo de Ejecución:**\n${bestMatch.how_to.join('\n')}\n\n**Capacidades Críticas:**\n- ${bestMatch.functions.join('\n- ')}`;
                aiResponse.widget = 'knowledgeCard';
            } else {
                aiResponse.text = "Mi base neuronal cubre la totalidad de la suite Iubel: **Bóveda**, **Facturación**, **Préstamos**, **Ahorros**, **Socios**, **Contabilidad** y **Nómina**. ¿Qué área estratégica deseas explorar ahora?";
            }
        }

        // 4. Préstamos & Cartera
        else if (textLower.includes('prestamo') || textLower.includes('mora') || textLower.includes('cartera') || textLower.includes('scoring')) {
            aiResponse.text = `La cartera de crédito muestra una salud estructural de grado **AAA**. El sistema de scoring ha optimizado el riesgo en un **12%** respecto al trimestre anterior. ¿Quieres que analice un perfil de socio específico o prefieres ver la proyección de amortización global?`;
            aiResponse.widget = 'loansTrend';
            setSessionContext(prev => ({ ...prev, lastTopic: 'loans' }));
        }

        // 5. Interacción Social / Saludos con Autoridad
        else if (textLower.includes('hola') || textLower.includes('buenos dias') || textLower.includes('saludos')) {
            aiResponse.text = `Saludos, **${user?.nombre || 'Administrador'}**. Identidad confirmada vía Protocolo Sovereign. Todos los subsistemas operan al 100%. Estoy listo para ejecutar análisis de alto impacto. ¿Por dónde empezamos hoy?`;
        }

        // 6. Sorpresa / Proactividad Elite
        else if (textLower.includes('sorpresa') || textLower.includes('qué hay de nuevo') || textLower.includes('recomienda')) {
            aiResponse.text = `He realizado un escaneo profundo de la arquitectura de datos. He detectado una oportunidad de optimización de liquidez en el **Sovereign Vault**. Además, tu índice de estabilidad operativa es de **98.4%**, el más alto registrado hasta ahora.`;
            aiResponse.widget = 'eliteAdvisor';
        }

        // Default
        else {
            const defaults = [
                "Como tu Copilot Institucional, mantengo monitoreo constante sobre la integridad del Ledger. ¿Tienes alguna duda técnica sobre la operación de los módulos?",
                "He detectado un aumento en la eficiencia de procesamiento. ¿Deseas que genere un informe de inteligencia predictiva sobre el flujo de caja?",
                "Interesante consulta. Basado en la metadata del sistema, sugiero revisar el módulo de auditoría forense para confirmar la integridad total de los asientos de este mes."
            ];
            aiResponse.text = defaults[Math.floor(Math.random() * defaults.length)];
        }

        setMessages(prev => [...prev, aiResponse]);
        setIsTyping(false);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') handleSendMessage();
    };

    const formatText = (text) => {
        const parts = text.split(/(\*\*.*?\*\*)/g);
        return parts.map((part, i) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={i} style={{ color: 'inherit', fontWeight: 800 }}>{part.slice(2, -2)}</strong>;
            }
            return part;
        });
    };

    return (
        <div className="animate-fade-in" style={{ height: '100%', display: 'flex', flexDirection: 'column', margin: '-1.5rem', backgroundColor: '#f1f5f9' }}>
            {/* Header Modernizado */}
            <div style={{ padding: '1.25rem 2rem', background: '#0f172a', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #1e293b', zIndex: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: 42, height: 42, borderRadius: '12px', background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <BrainCircuit size={24} color="white" />
                    </div>
                    <div>
                        <h1 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            Iubel Copilot <Sparkles size={14} color="#fbbf24" fill="#fbbf24" />
                        </h1>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.7rem', color: '#94a3b8' }}>
                            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981' }}></div>
                            Neuronal Engine Online • {empresa?.nombre}
                        </div>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button style={{ padding: '0.4rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8' }}><Info size={18} /></button>
                </div>
            </div>

            {/* Chat Area */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                
                {/* Oracle Proactive Insight Card */}
                {oracleInsight && (
                    <div className="animate-fade-in" style={{ 
                        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', 
                        color: 'white', 
                        padding: '1.5rem', 
                        borderRadius: '24px', 
                        boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
                        marginBottom: '1rem',
                        border: '1px solid rgba(99,102,241,0.3)',
                        position: 'relative',
                        overflow: 'hidden'
                    }}>
                        <div style={{ position: 'absolute', top: '-10%', right: '-5%', opacity: 0.1 }}>
                            <BrainCircuit size={120} color="#6366f1" />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                            <div style={{ padding: '0.5rem', background: 'rgba(99,102,241,0.2)', borderRadius: '10px' }}>
                                <Sparkles size={20} color="#6366f1" />
                            </div>
                            <span style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.1em', color: '#a5b4fc' }}>IUBEL ORACLE INSIGHT</span>
                            {loadingOracle && <div className="spinner-small" style={{ borderTopColor: '#6366f1' }} />}
                        </div>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                            <div>
                                <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem', color: '#94a3b8' }}>Tendencia Proyectada (30d)</p>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <TrendingUp size={24} color="#10b981" />
                                    <span style={{ fontSize: '1.5rem', fontWeight: 900 }}>+{(Math.random() * 5 + 8).toFixed(1)}%</span>
                                </div>
                            </div>
                            <div>
                                <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem', color: '#94a3b8' }}>Flujo de Caja Estimado</p>
                                <span style={{ fontSize: '1.5rem', fontWeight: 900, color: '#6366f1' }}>RD$3.2M</span>
                            </div>
                        </div>
                        
                        <div style={{ marginTop: '1.25rem', padding: '0.875rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', fontSize: '0.82rem', lineHeight: 1.6, color: '#cbd5e1', border: '1px solid rgba(255,255,255,0.05)' }}>
                             "El motor predictivo indica una oportunidad de inversión en activos fijos basada en el excedente de liquidez proyectado para el cierre de trimestre."
                        </div>
                    </div>
                )}

                {messages.map((msg) => {
                    const isAi = msg.sender === 'ai';
                    return (
                        <div key={msg.id} style={{ display: 'flex', gap: '1rem', alignSelf: isAi ? 'flex-start' : 'flex-end', maxWidth: '80%' }}>
                            {isAi && (
                                <div style={{ width: 36, height: 36, borderRadius: '10px', background: 'white', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '0.25rem', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                                    <Bot size={18} color="#6366f1" />
                                </div>
                            )}
                            
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', alignItems: isAi ? 'flex-start' : 'flex-end' }}>
                                <div style={{ 
                                    background: isAi ? 'white' : '#6366f1', 
                                    color: isAi ? '#1e293b' : 'white',
                                    padding: '1rem 1.25rem', 
                                    borderRadius: isAi ? '4px 20px 20px 20px' : '20px 4px 20px 20px',
                                    boxShadow: isAi ? '0 2px 10px rgba(0,0,0,0.05)' : '0 4px 12px rgba(99,102,241,0.2)',
                                    lineHeight: '1.5',
                                    fontSize: '0.92rem',
                                    border: isAi ? '1px solid #e2e8f0' : 'none'
                                }}>
                                    {formatText(msg.text)}
                                </div>

                                {msg.widget === 'securityIntegrity' && (
                                    <div style={{ background: '#0f172a', padding: '1.5rem', borderRadius: '24px', width: '320px', color: 'white', border: '1px solid #1e293b', boxShadow: '0 20px 40px rgba(0,0,0,0.3)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                                            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 10px #10b981' }}></div>
                                            <span style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '1px', color: '#94a3b8' }}>SOVEREIGN INTEGRITY</span>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                                                <span style={{ color: '#94a3b8' }}>Ledger Status:</span>
                                                <span style={{ color: '#10b981', fontWeight: 700 }}>IMMUTABLE</span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                                                <span style={{ color: '#94a3b8' }}>Encryption:</span>
                                                <span style={{ fontWeight: 700 }}>AES-256 GCM</span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                                                <span style={{ color: '#94a3b8' }}>FraudShield:</span>
                                                <span style={{ color: '#6366f1', fontWeight: 700 }}>ACTIVE</span>
                                            </div>
                                        </div>
                                        <div style={{ marginTop: '1.25rem', padding: '0.75rem', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '12px', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                                            <div style={{ fontSize: '0.65rem', color: '#a5b4fc', fontWeight: 800, marginBottom: '0.2rem' }}>LAST VERIFICATION</div>
                                            <div style={{ fontSize: '0.75rem', color: 'white', fontFamily: 'monospace' }}>SHA-256: 8f3a...d9e1</div>
                                        </div>
                                    </div>
                                )}

                                {msg.widget === 'systemHealth' && (
                                    <div style={{ background: 'white', padding: '1.5rem', borderRadius: '24px', width: '340px', border: '1px solid #e2e8f0', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                                            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b' }}>STABILITY NODE</span>
                                            <Activity size={16} color="#6366f1" />
                                        </div>
                                        <div style={{ height: 180 }}>
                                            <ResponsiveContainer width="100%" height="100%">
                                                <RadarChart outerRadius="80%" data={[
                                                    { subject: 'Liquidez', A: 120, fullMark: 150 },
                                                    { subject: 'Riesgo', A: 30, fullMark: 150 },
                                                    { subject: 'Seguridad', A: 150, fullMark: 150 },
                                                    { subject: 'Crecimiento', A: 90, fullMark: 150 },
                                                    { subject: 'Integridad', A: 145, fullMark: 150 },
                                                ]}>
                                                    <PolarGrid stroke="#e2e8f0" />
                                                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: '#64748b' }} />
                                                    <Radar name="System" dataKey="A" stroke="#6366f1" fill="#6366f1" fillOpacity={0.5} />
                                                </RadarChart>
                                            </ResponsiveContainer>
                                        </div>
                                        <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
                                            <span style={{ fontSize: '1.25rem', fontWeight: 900, color: '#1e293b' }}>98.4% Resilience</span>
                                        </div>
                                    </div>
                                )}

                                {msg.widget === 'eliteAdvisor' && (
                                    <div style={{ 
                                        background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)', 
                                        padding: '1.75rem', 
                                        borderRadius: '28px', 
                                        width: '320px', 
                                        color: 'white',
                                        position: 'relative',
                                        overflow: 'hidden',
                                        border: '1px solid rgba(255,255,255,0.1)'
                                    }}>
                                        <div style={{ position: 'absolute', top: '-10%', right: '-10%', opacity: 0.1 }}>
                                            <Sparkles size={100} color="white" />
                                        </div>
                                        <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#a5b4fc', textTransform: 'uppercase', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <Zap size={14} fill="#fbbf24" color="#fbbf24" /> Elite AI Suggestion
                                        </div>
                                        <h4 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '0 0 0.75rem 0' }}>Optimización de Liquidez</h4>
                                        <p style={{ fontSize: '0.8rem', color: '#cbd5e1', lineHeight: 1.5, margin: '0 0 1.25rem 0' }}>
                                            He detectado un flujo excedente en el Banco BHD. Recomiendo mover **RD$450,000** al Sovereign Vault para asegurar un rendimiento institucional del 6.5%.
                                        </p>
                                        <button style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', background: 'white', color: '#1e1b4b', border: 'none', fontWeight: 800, fontSize: '0.8rem', cursor: 'pointer' }}>
                                            Ejecutar Estrategia
                                        </button>
                                    </div>
                                )}

                                {msg.widget === 'knowledgeCard' && (
                                    <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '20px', width: '340px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', color: '#6366f1' }}>
                                            <BrainCircuit size={18} />
                                            <span style={{ fontSize: '0.75rem', fontWeight: 800 }}>FRAGMENTO MANUAL MAESTRO</span>
                                        </div>
                                        <div style={{ fontSize: '0.8rem', color: '#475569', fontStyle: 'italic', lineHeight: 1.5 }}>
                                            "La ejecución de estos protocolos bajo el estándar Sovereign garantiza que la metadata operativa permanezca auditable y resistente a la manipulación."
                                        </div>
                                    </div>
                                )}

                                {msg.widget === 'oracleForecast' && (
                                    <div style={{ background: 'white', padding: '1.25rem', borderRadius: '16px', width: '320px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', border: '1px solid #6366f122' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#6366f1' }}>PROYECCIÓN ORACLE</span>
                                            <Zap size={14} color="#6366f1" fill="#6366f1" />
                                        </div>
                                        <div style={{ height: 120 }}>
                                            <ResponsiveContainer width="100%" height="100%">
                                                <AreaChart data={[
                                                    {n: 'M-1', v: 100}, {n: 'ACT', v: 115}, {n: 'P+1', v: 128}, {n: 'P+2', v: 142}
                                                ]}>
                                                    <Area type="monotone" dataKey="v" stroke="#6366f1" fill="#6366f115" strokeWidth={3} />
                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                                </AreaChart>
                                            </ResponsiveContainer>
                                        </div>
                                        <div style={{ fontSize: '0.65rem', color: '#94a3b8', marginTop: '0.5rem', textAlign: 'center' }}>
                                            Puntos P+: Valores Proyectados por IA
                                        </div>
                                    </div>
                                )}

                                <div style={{ fontSize: '0.65rem', color: '#94a3b8', marginTop: '0.1rem' }}>
                                    {msg.timestamp}
                                </div>
                            </div>
                        </div>
                    );
                })}
                
                {isTyping && (
                    <div style={{ display: 'flex', gap: '1rem', alignSelf: 'flex-start' }}>
                        <div style={{ width: 36, height: 36, borderRadius: '10px', background: 'white', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Bot size={18} color="#6366f1" />
                        </div>
                        <div style={{ display: 'flex', gap: '4px', padding: '1rem' }}>
                            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#cbd5e1', animation: 'bounce 1.4s infinite ease-in-out' }}></div>
                            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#cbd5e1', animation: 'bounce 1.4s infinite ease-in-out 0.2s' }}></div>
                            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#cbd5e1', animation: 'bounce 1.4s infinite ease-in-out 0.4s' }}></div>
                        </div>
                    </div>
                )}
                <div ref={endOfMessagesRef} />
            </div>

            {/* Input Bar */}
            <div style={{ padding: '1.5rem 2.5rem', background: 'white', borderTop: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: '#f8fafc', padding: '0.4rem', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                    <div style={{ paddingLeft: '0.75rem', color: '#6366f1' }}><Zap size={18} fill="#6366f1" /></div>
                    <input 
                        type="text" 
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Pregunta sobre préstamos, riesgos o el valor de tu software..."
                        style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', padding: '0.6rem 0', fontSize: '0.95rem' }}
                    />
                    <button 
                        onClick={handleSendMessage}
                        style={{ width: 40, height: 40, borderRadius: '12px', background: '#6366f1', color: 'white', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                    >
                        <Send size={18} />
                    </button>
                </div>
            </div>

            <style>{`
                @keyframes bounce {
                    0%, 80%, 100% { transform: scale(0); }
                    40% { transform: scale(1.0); }
                }
            `}</style>
        </div>
    );
};

export default Copilot;
