import React, { useState, useEffect, useRef } from 'react';
import { 
    Send, Bot, User, ChevronRight, Search, 
    Sparkles, MessageSquare, HelpCircle, 
    Terminal, Database, Zap, ArrowRight,
    BrainCircuit, Loader2, Compass
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { SYSTEM_KNOWLEDGE } from '../data/SystemKnowledge';
import './Copilot.css';

const Copilot = ({ user }) => {
    const navigate = useNavigate();
    const [messages, setMessages] = useState([
        {
            id: 1,
            role: 'bot',
            content: `¡Hola **${user?.nombre || 'Socio'}**! Soy **Iubel Copilot Elite**. Estoy aquí para guiarte en el uso de tu ERP y ayudarte con cualquier duda técnica o funcional. \n\n¿En qué módulo deseas profundizar hoy?`,
            timestamp: new Date()
        }
    ]);
    const [input, setInput] = useState('');
    const [isThinking, setIsThinking] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isThinking]);

    const formatText = (text) => {
        if (!text) return "";
        let formatted = text;
        
        // Bold
        formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong class="text-indigo-400 font-bold">$1</strong>');
        
        // Lists
        formatted = formatted.split('\n').map(line => {
            if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
                return `<div class="flex gap-2 my-1"><span class="text-indigo-500">•</span><span>${line.trim().substring(2)}</span></div>`;
            }
            if (/^\d+\./.test(line.trim())) {
                const parts = line.trim().split('.');
                return `<div class="flex gap-2 my-1"><span class="text-indigo-600 font-bold">${parts[0]}.</span><span>${parts.slice(1).join('.').trim()}</span></div>`;
            }
            return line;
        }).join('\n');

        return <div dangerouslySetInnerHTML={{ __html: formatted.replace(/\n/g, '<br/>') }} />;
    };

    const processAIResponse = (query) => {
        const q = query.toLowerCase().trim();
        
        // 🛡️ Pre-limpieza y Puntuación Elite
        const stopwords = ["la", "el", "de", "un", "una", "donde", "como", "esta", "que", "para", "mi", "en", "el"];
        const words = q.split(/\s+/).filter(w => !stopwords.includes(w));
        
        let bestMatch = null;
        let highestScore = 0;

        Object.keys(SYSTEM_KNOWLEDGE).forEach(key => {
            const knowledge = SYSTEM_KNOWLEDGE[key];
            let score = 0;

            // Coincidencia exacta de llave
            if (q.includes(key)) score += 10;
            
            // Coincidencia en título
            if (knowledge.title.toLowerCase().includes(q)) score += 8;

            // Palabras clave (tags)
            knowledge.tags.forEach(tag => {
                if (q.includes(tag.toLowerCase())) score += 5;
                // Parcial
                words.forEach(w => {
                    if (tag.toLowerCase().includes(w) && w.length > 3) score += 2;
                });
            });

            // Sinónimos inteligentes
            const synonyms = {
                "vender": ["factura", "ventas", "cobro"],
                "gastar": ["compras", "gastos", "dgii"],
                "pagar": ["cxp", "bancos", "pagos"],
                "cobrar": ["cxc", "factura", "cobros"],
                "dinero": ["bancos", "caja", "ledger"],
                "personal": ["rrhh", "nomina", "empleados"],
                "empleado": ["rrhh", "nomina", "talento"],
                "seguridad": ["usuarios", "roles", "permisos"],
                "archivo": ["fiscal", "606", "607"],
                "impuesto": ["fiscal", "dgii", "it1"]
            };

            Object.keys(synonyms).forEach(syn => {
                if (q.includes(syn)) {
                    synonyms[syn].forEach(target => {
                        if (key === target) score += 4;
                    });
                }
            });

            if (score > highestScore) {
                highestScore = score;
                bestMatch = knowledge;
            }
        });

        // Respuesta Elite
        if (bestMatch && highestScore >= 3) {
            let response = `### ${bestMatch.title}\n${bestMatch.description}\n\n`;
            
            if (bestMatch.functions) {
                response += `**Capacidades Clave:**\n`;
                bestMatch.functions.forEach(f => response += `- ${f}\n`);
            }
            
            if (bestMatch.how_to) {
                response += `\n**¿Cómo usarlo?**\n`;
                bestMatch.how_to.forEach(step => response += `${step}\n`);
            }

            return {
                role: 'bot',
                content: response,
                modulePath: bestMatch.path,
                moduleName: bestMatch.title,
                timestamp: new Date()
            };
        }

        // Fallback Inteligente
        return {
            role: 'bot',
            content: "Disculpa, no logré ubicar un módulo exacto para esa consulta. Pero no te preocupes, puedo orientarte sobre **Contabilidad**, **Ventas**, **Nómina** o **Configuración de Seguridad**. \n\n¿Podrías ser más específico o intentar con otra palabra clave?",
            timestamp: new Date()
        };
    };

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg = {
            id: Date.now(),
            role: 'user',
            content: input,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsThinking(true);

        // Simulación de "Pensamiento Neuronal" Elite
        setTimeout(() => {
            const aiResponse = processAIResponse(userMsg.content);
            setMessages(prev => [...prev, { id: Date.now() + 1, ...aiResponse }]);
            setIsThinking(false);
        }, 1200);
    };

    const quickGuides = [
        { label: 'Registrar Venta', query: 'como facturar' },
        { label: 'Gasto DGII', query: 'registrar compra dgii' },
        { label: 'Conciliar Banco', query: 'conciliar bancos' },
        { label: 'Generar Nómina', query: 'procesar nomina' },
        { label: 'Dashboard AI', query: 'analitica predictiva' },
        { label: 'Bóveda Vault', query: 'sovereign vault' }
    ];

    return (
        <div className="copilot-container">
            {/* Header Elite */}
            <div className="copilot-header">
                <div className="flex items-center gap-3">
                    <div className="copilot-logo-pulse">
                        <BrainCircuit size={24} className="text-indigo-400" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-white tracking-tight">Iubel Copilot <span className="text-xs bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded-full ml-2">ELITE AI</span></h2>
                        <p className="text-xs text-slate-400">Asistente Institucional Activo</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 transition-colors" title="Limpiar Chat">
                        <Terminal size={18} />
                    </button>
                    <button className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 transition-colors">
                        <Database size={18} />
                    </button>
                </div>
            </div>

            {/* Guías Rápidas */}
            <div className="quick-guides-scroll custom-scrollbar">
                {quickGuides.map((guide, idx) => (
                    <button 
                        key={idx} 
                        className="quick-guide-chip"
                        onClick={() => {
                            setInput(guide.query);
                            // Auto-enviar para fluidez elite
                            setTimeout(() => {
                                const btn = document.getElementById('chat-btn');
                                if (btn) btn.click();
                            }, 100);
                        }}
                    >
                        <Zap size={12} className="text-amber-400" />
                        {guide.label}
                    </button>
                ))}
            </div>

            {/* Messages Area */}
            <div className="messages-area custom-scrollbar" id="messages-container">
                {messages.map((msg, idx) => (
                    <div key={msg.id || idx} className={`message-wrapper ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {msg.role === 'bot' && (
                            <div className="bot-avatar-elite shadow-lg shadow-indigo-500/10">
                                <Bot size={18} className="text-white" />
                            </div>
                        )}
                        
                        <div className={`message-bubble-elite ${msg.role === 'user' ? 'user-bubble' : 'bot-bubble'}`}>
                            <div className="message-content">
                                {formatText(msg.content)}
                            </div>
                            
                            {msg.modulePath && (
                                <div className="mt-4 pt-4 border-t border-indigo-500/10 flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-xs text-indigo-300/70">
                                        <Compass size={14} />
                                        <span>Detección de Módulo</span>
                                    </div>
                                    <button 
                                        onClick={() => navigate(msg.modulePath)}
                                        className="btn-navigate-elite"
                                    >
                                        Ir a {msg.moduleName}
                                        <ArrowRight size={14} />
                                    </button>
                                </div>
                            )}

                            <div className="message-footer">
                                <span>{msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                {msg.role === 'bot' && (
                                    <div className="flex gap-2 ml-auto">
                                        <HelpCircle size={12} className="cursor-help hover:text-indigo-400" />
                                    </div>
                                )}
                            </div>
                        </div>

                        {msg.role === 'user' && (
                            <div className="user-avatar-elite">
                                <User size={18} className="text-white" />
                            </div>
                        )}
                    </div>
                ))}

                {isThinking && (
                    <div className="message-wrapper justify-start">
                        <div className="bot-avatar-elite animate-pulse">
                            <Bot size={18} />
                        </div>
                        <div className="bot-bubble thinking-bubble">
                            <div className="brain-loading">
                                <span className="dot"></span>
                                <span className="dot"></span>
                                <span className="dot"></span>
                            </div>
                            <span className="text-xs text-slate-400 italic">Iubel está procesando tu solicitud...</span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="input-area-elite">
                <div className="input-wrapper-inner">
                    <input 
                        type="text" 
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Pregúntame sobre cualquier módulo..." 
                        className="chat-input-elite"
                    />
                    <button 
                        id="chat-btn"
                        onClick={handleSend}
                        disabled={!input.trim() || isThinking}
                        className={`send-btn-elite ${input.trim() ? 'active' : ''}`}
                    >
                        {isThinking ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                    </button>
                </div>
                <p className="text-[10px] text-center mt-2 text-slate-500 uppercase tracking-widest font-medium">
                    Iubel Enterprise AI Security Protocol Active
                </p>
            </div>
        </div>
    );
};

export default Copilot;
