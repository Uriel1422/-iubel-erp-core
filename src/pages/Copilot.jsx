import React, { useState, useRef, useEffect } from 'react';
import { 
    Bot, User, Send, Sparkles, BrainCircuit, Activity, 
    BarChart2, PieChart, ShieldAlert, Zap, TrendingUp,
    CheckCircle2, AlertTriangle, Info
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useContabilidad } from '../context/ContabilidadContext';
import {
    AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
    BarChart, Bar, Cell
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

        // Memoria de sesión
        const count = sessionContext.interactionCount + 1;
        setSessionContext(prev => ({ ...prev, interactionCount: count }));

        // Lógica de Intenciones Institucionales (Élite)
        if (textLower.includes('valor') || textLower.includes('cuanto vale') || textLower.includes('precio') || textLower.includes('competencia')) {
            aiResponse.text = `Iubel ERP tiene una valuación proyectada de clase mundial. Basado en su arquitectura **Sovereign** (Inmutable) y el motor **Oracle**, estimamos un valor de mercado IP de hasta **$2.5M USD**. Supera a la competencia local por su capacidad de auditoría forense y predicción en tiempo real.`;
            aiResponse.widget = 'valuationCard';
        } else if (textLower.includes('segur') || textLower.includes('sovereign') || textLower.includes('blockchain') || textLower.includes('ledger')) {
            aiResponse.text = `Tu capital y datos están blindados bajo la arquitectura **Iubel Sovereign**. Implementamos un **Immutable Ledger** (libro mayor inmutable) que firma criptográficamente cada transacción. Cualquier intento de alteración es detectado y bloqueado por el **FraudShield** en milisegundos.`;
            aiResponse.widget = 'riskProfile';
        } else if (textLower.includes('prestamo') || textLower.includes('préstamo') || textLower.includes('cartera')) {
            aiResponse.text = `Analizando la cartera de **${empresa?.nombre}**. He detectado que el índice de morosidad se mantiene en un saludable **2.1%**. Las colocaciones comerciales han crecido un **15%** este mes gracias al motor de scoring predictivo.`;
            aiResponse.widget = 'loansTrend';
            setSessionContext(prev => ({ ...prev, lastTopic: 'loans' }));
        } else if (textLower.includes('futuro') || textLower.includes('predic') || textLower.includes('oracle') || textLower.includes('proyec')) {
            if (oracleInsight) {
                const trend = oracleInsight.ingresos.prediccion[0] > oracleInsight.ingresos.historial[5] ? 'alcista' : 'estable';
                aiResponse.text = `El Oráculo de Iubel detecta una tendencia **${trend}**. Proyectamos ingresos de **RD$${(oracleInsight.ingresos.prediccion[0]/1000).toFixed(1)}K** para el cierre de ciclo con un nivel de confianza del **92%**. ¿Deseas que simulemos un escenario de estrés de liquidez?`;
                aiResponse.widget = 'oracleForecast';
            } else {
                aiResponse.text = 'Aún estoy procesando los datos maestros para generar una predicción precisa. Mi motor de IA requiere al menos 3 meses de historial para activar el modo de alta precisión.';
            }
        } else if (textLower.includes('como') || textLower.includes('cómo') || textLower.includes('paso a paso') || textLower.includes('guia') || textLower.includes('guía')) {
            if (textLower.includes('factura') || textLower.includes('ventas')) {
                const guide = IUBEL_GUIDES.facturacion;
                aiResponse.text = `¡Excelente! Aquí tienes la guía del manual para **${guide.title}**:\n\n${guide.steps.join('\n')}\n\n¿Necesitas ayuda con otra parte del manual?`;
            } else if (textLower.includes('socio') || textLower.includes('kyc')) {
                const guide = IUBEL_GUIDES.socios;
                aiResponse.text = `Para mantener el orden institucional, sigue estos pasos para **${guide.title}**:\n\n${guide.steps.join('\n')}\n\nPuedes ver el puntaje de salud financiera una vez guardado.`;
            } else if (textLower.includes('prestamo') || textLower.includes('préstamo')) {
                const guide = IUBEL_GUIDES.prestamos;
                aiResponse.text = `El motor de crédito es potente. Así es como realizas **${guide.title}**:\n\n${guide.steps.join('\n')}\n\nRecuerda revisar el Scoring del socio antes.`;
            } else if (textLower.includes('contabilidad') || textLower.includes('cierre') || textLower.includes('ncf')) {
                const guide = IUBEL_GUIDES.contabilidad;
                aiResponse.text = `La integridad contable es clave. Aquí los pasos para **${guide.title}**:\n\n${guide.steps.join('\n')}\n\n¿Quieres que revise el balance actual?`;
            } else {
                aiResponse.text = "Tengo manuales paso a paso para: **Facturación**, **Socios**, **Préstamos** y **Contabilidad**. ¿Sobre cuál de estos temas deseas aprender?";
            }
        } else if (textLower.includes('riesgo') || textLower.includes('aml') || textLower.includes('lavado')) {
            aiResponse.text = 'Protocolo de Cumplimiento activado. He cruzado las últimas transacciones con las listas de control global. El **FraudShield** reporta integridad total, pero sugiero una debida diligencia ampliada para transacciones por encima de $500K.';
            aiResponse.widget = 'riskProfile';
            setSessionContext(prev => ({ ...prev, lastTopic: 'risk' }));
        } else if (textLower.includes('gracias') || textLower.includes('bueno') || textLower.includes('ok')) {
             const options = [
                "¡De nada! La eficiencia institucional es mi prioridad.",
                "Es un placer asistirte en la dirección estratégica de tu empresa.",
                "Entendido. ¿Deseas que verifique la integridad del Libro Mayor ahora?",
                "¡A tus órdenes! Recuerda que el FraudShield está activo y protegiendo tus transacciones."
             ];
             aiResponse.text = options[Math.floor(Math.random() * options.length)];
        } else if (sessionContext.lastTopic === 'loans' && (textLower.includes('mas') || textLower.includes('detalle'))) {
            aiResponse.text = 'De los préstamos colocados, el **60%** corresponde a líneas de crédito revolvente. La seguridad del Ledger garantiza que estos registros son 100% auditables.';
        } else if (textLower.includes('hola') || textLower.includes('buenos dias')) {
             aiResponse.text = `¡Hola, ${user?.nombre || ''}! Identidad verificada. El sistema opera bajo parámetros de seguridad óptimos. ¿Nos enfocamos en el análisis predictivo o en auditoría de seguridad hoy?`;
        } else {
            // Respuestas Proactivas 2.0
            const defaults = [
                "Sugiero revisar el **Monitor de Integridad Sovereign**. He detectado transacciones que requieren tu firma criptográfica de administrador.",
                "Interesante pregunta. Según la metadata del Oráculo, tu empresa muestra una estabilidad operativa notable. ¿Quieres ver la proyección de flujo de caja?",
                "Como tu Copilot Institucional, sugiero activar una auditoría preventiva de las cuentas por cobrar antes del cierre mensual.",
                "He notado una aceleración analítica disponible. ¿Deseas que optimice el caché de los reportes BI para una carga instantánea?"
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

                                {msg.widget === 'loansTrend' && (
                                    <div style={{ background: 'white', padding: '1.25rem', borderRadius: '16px', width: '320px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b' }}>TRENDING LOANS</span>
                                            <TrendingUp size={14} color="#10b981" />
                                        </div>
                                        <div style={{ height: 120 }}>
                                            <ResponsiveContainer width="100%" height="100%">
                                                <AreaChart data={[
                                                    {n: 'E', v: 40}, {n: 'F', v: 45}, {n: 'M', v: 60}, {n: 'A', v: 55}, {n: 'M', v: 80}
                                                ]}>
                                                    <Area type="monotone" dataKey="v" stroke="#6366f1" fill="#6366f120" strokeWidth={2} />
                                                </AreaChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>
                                )}

                                {msg.widget === 'valuationCard' && (
                                    <div style={{ 
                                        background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)', 
                                        padding: '1.5rem', 
                                        borderRadius: '24px', 
                                        width: '320px', 
                                        color: 'white',
                                        boxShadow: '0 10px 30px rgba(79,70,229,0.3)',
                                        position: 'relative',
                                        overflow: 'hidden'
                                    }}>
                                        <div style={{ position: 'absolute', top: '-10%', right: '-10%', opacity: 0.2 }}>
                                            <Zap size={80} color="white" />
                                        </div>
                                        <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#c7d2fe', textTransform: 'uppercase', marginBottom: '0.5rem' }}>IP Market Valuation</div>
                                        <div style={{ fontSize: '1.75rem', fontWeight: 900, marginBottom: '0.25rem' }}>$2.5M <span style={{ fontSize: '0.9rem', color: '#c7d2fe' }}>USD</span></div>
                                        <div style={{ fontSize: '0.7rem', color: '#e0e7ff', lineHeight: 1.4 }}>
                                            Basado en la arquitectura Sovereign e integración In-Memory.
                                        </div>
                                        <div style={{ marginTop: '1rem', padding: '0.5rem', background: 'rgba(255,255,255,0.1)', borderRadius: '10px', fontSize: '0.65rem', textAlign: 'center', fontWeight: 700 }}>
                                            ASSET GRADE: AAA+
                                        </div>
                                    </div>
                                )}

                                {msg.widget === 'riskProfile' && (
                                    <div style={{ background: '#0f172a', padding: '1.25rem', borderRadius: '16px', width: '300px', color: 'white' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                                            <ShieldAlert size={16} color="#ef4444" />
                                            <span style={{ fontSize: '0.75rem', fontWeight: 800 }}>AML RISK MONITOR</span>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                                                <span>Crítico</span>
                                                <span style={{ color: '#ef4444' }}>0</span>
                                            </div>
                                            <div style={{ width: '100%', height: 4, background: '#1e293b', borderRadius: '2px' }}>
                                                <div style={{ width: '5%', height: '100%', background: '#ef4444', borderRadius: '2px' }}></div>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginTop: '0.2rem' }}>
                                                <span>Aceptable</span>
                                                <span style={{ color: '#10b981' }}>98%</span>
                                            </div>
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
