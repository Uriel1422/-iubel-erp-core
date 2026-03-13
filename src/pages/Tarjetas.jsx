import React, { useState } from 'react';
import { CreditCard, Lock, Shield, Settings, Eye, EyeOff, Snowflake, Play, Copy, Check, Filter, Search, ArrowUpRight, ArrowDownRight, RefreshCw, Smartphone, Globe, ShieldCheck, Activity } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const MOCK_CARDS = [];
const MOCK_TRANSACTIONS = [];


const formatMoney = (val) => new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP' }).format(Number(val));

const Tarjetas = () => {
    const { user } = useAuth();
    const [selectedCardId, setSelectedCardId] = useState(MOCK_CARDS[0]?.id || null);
    const [cards, setCards] = useState(MOCK_CARDS);
    const [showSensitive, setShowSensitive] = useState(false);
    const [copiedContent, setCopiedContent] = useState(null);
    const [isFlipped, setIsFlipped] = useState(false); // For 3D card effect

    const activeCard = cards.find(c => c.id === selectedCardId);
    const cardTransactions = MOCK_TRANSACTIONS.filter(t => t.cardId === selectedCardId);

    const handleCopy = (text, type) => {
        navigator.clipboard.writeText(text);
        setCopiedContent(type);
        setTimeout(() => setCopiedContent(null), 2000);
    };

    const toggleFreeze = () => {
        setCards(cards.map(c => {
            if (c.id === selectedCardId) {
                return { ...c, status: c.status === 'active' ? 'frozen' : 'active' };
            }
            return c;
        }));
    };

    // Calculate dynamic usage bar
    const usagePercentage = activeCard ? (activeCard.balance / activeCard.limit) * 100 : 0;

    return (
        <div className="animate-fade-in" style={{ display: 'flex', gap: '2rem', height: 'calc(100vh - 120px)', alignItems: 'flex-start' }}>
            
            {/* Panel Izquierdo: Visualizador 3D y Controles */}
            <div style={{ flex: '0 0 400px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                
                <div>
                    <h1 className="page-title" style={{ marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <CreditCard className="text-primary" /> Card Issuing
                    </h1>
                    <p style={{ color: 'var(--text-muted)' }}>Gestión de tarjetas corporativas Iubel</p>
                </div>

                {/* Contenedor de la Tarjeta 3D */}
                {activeCard ? (
                    <div 
                        style={{ perspective: '1000px', cursor: 'pointer', height: '240px' }}
                        onClick={() => setIsFlipped(!isFlipped)}
                    >
                        <div style={{ 
                            position: 'relative', width: '100%', height: '100%', transition: 'transform 0.8s', 
                            transformStyle: 'preserve-3d', transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
                        }}>
                            
                            {/* Frente de la tarjeta */}
                            <div style={{
                                position: 'absolute', width: '100%', height: '100%', backfaceVisibility: 'hidden',
                                background: activeCard.color, borderRadius: '20px', padding: '1.5rem',
                                display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                                border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden',
                                color: activeCard.textColor
                            }}>
                                {/* Chip & Contactless */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div style={{ width: 45, height: 35, background: 'linear-gradient(135deg, #e2e8f0 0%, #94a3b8 100%)', borderRadius: '6px', opacity: 0.9 }}></div>
                                    <Activity size={24} style={{ opacity: 0.7, transform: 'rotate(90deg)' }} />
                                </div>

                                {/* Card Number */}
                                <div style={{ fontSize: '1.4rem', letterSpacing: '2px', fontFamily: 'monospace', fontWeight: 600, marginTop: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span>•••• •••• •••• {activeCard.last4}</span>
                                    {showSensitive && (
                                        <button onClick={(e) => { e.stopPropagation(); handleCopy(`424242424242${activeCard.last4}`, 'pan'); }} style={{ background: 'transparent', border: 'none', color: activeCard.textColor, cursor: 'pointer', opacity: 0.7 }}>
                                            {copiedContent === 'pan' ? <Check size={16} /> : <Copy size={16} />}
                                        </button>
                                    )}
                                </div>

                                {/* Footer: Name & Brand */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                                    <div>
                                        <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', opacity: 0.7, marginBottom: '0.2rem' }}>Cardholder</div>
                                        <div style={{ fontWeight: 600, letterSpacing: '1px', fontSize: '0.9rem' }}>{activeCard.cardholder}</div>
                                    </div>
                                    <div style={{ fontSize: '1.2rem', fontWeight: 900, fontStyle: 'italic', opacity: activeCard.brand === 'ib-black' ? 1 : 0.8 }}>
                                        {activeCard.brand === 'visa' ? 'VISA' : activeCard.brand === 'mastercard' ? 'mastercard' : 'Iubel Black'}
                                    </div>
                                </div>

                                {/* Frost overlay if frozen */}
                                {activeCard.status === 'frozen' && (
                                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(255,255,255,0.3)', backdropFilter: 'blur(4px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#1e293b' }}>
                                        <Snowflake size={32} style={{ marginBottom: '0.5rem' }} />
                                        <span style={{ fontWeight: 700, letterSpacing: '1px' }}>TARJETA CONGELADA</span>
                                    </div>
                                )}
                            </div>

                            {/* Dorso de la tarjeta */}
                            <div style={{
                                position: 'absolute', width: '100%', height: '100%', backfaceVisibility: 'hidden',
                                background: activeCard.color, borderRadius: '20px', padding: '1.5rem 0',
                                display: 'flex', flexDirection: 'column', justifyContent: 'center',
                                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                                transform: 'rotateY(180deg)', border: '1px solid rgba(255,255,255,0.1)',
                                color: activeCard.textColor
                            }}>
                                <div style={{ width: '100%', height: '40px', background: '#000', marginBottom: '1.5rem' }}></div>
                                <div style={{ padding: '0 1.5rem', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{ background: '#fff', color: '#000', padding: '0.5rem 1rem', borderRadius: '4px', fontFamily: 'monospace', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <span style={{ fontSize: '0.7rem', opacity: 0.5 }}>CVV</span>
                                        {showSensitive ? activeCard.cvv : '•••'}
                                    </div>
                                    {showSensitive && (
                                        <button onClick={(e) => { e.stopPropagation(); handleCopy(activeCard.cvv, 'cvv'); }} style={{ background: 'transparent', border: 'none', color: activeCard.textColor, cursor: 'pointer', opacity: 0.7 }}>
                                            {copiedContent === 'cvv' ? <Check size={16} /> : <Copy size={16} />}
                                        </button>
                                    )}
                                </div>
                                <div style={{ padding: '0 1.5rem', marginTop: '1rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', opacity: 0.8 }}>
                                    <div>EXP: {activeCard.exp}</div>
                                    <div>Call 1-800-IUBEL</div>
                                </div>
                            </div>

                        </div>
                    </div>
                ) : (
                    <div style={{ height: '240px', background: 'rgba(255,255,255,0.05)', borderRadius: '20px', border: '2px dashed rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                        <CreditCard size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                        <span style={{ fontSize: '0.85rem' }}>No hay tarjetas activas en tu billetera.</span>
                    </div>
                )}

                <div style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {isFlipped ? 'Dorso de la tarjeta. Clic para voltear.' : 'Frente de la tarjeta. Clic para voltear.'}
                </div>

                {/* Controles de Seguridad */}
                {activeCard && (
                    <div className="card glass layout-card" style={{ padding: '1.5rem' }}>
                        <h3 style={{ fontSize: '1rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>Ajustes de Seguridad</h3>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <button 
                                className="btn" 
                                style={{ width: '100%', justifyContent: 'flex-start', background: 'var(--background)', color: 'var(--text-main)', border: '1px solid var(--border)', padding: '0.75rem 1rem' }}
                                onClick={() => setShowSensitive(!showSensitive)}
                            >
                                {showSensitive ? <EyeOff size={18} className="text-muted" /> : <Eye size={18} className="text-primary" />}
                                {showSensitive ? 'Ocultar datos sensibles' : 'Mostrar números completos'}
                            </button>

                            <button 
                                className="btn" 
                                style={{ width: '100%', justifyContent: 'flex-start', background: activeCard.status === 'frozen' ? 'rgba(16,185,129,0.1)' : 'rgba(56,189,248,0.1)', color: activeCard.status === 'frozen' ? 'var(--success)' : '#0ea5e9', border: `1px solid ${activeCard.status === 'frozen' ? 'var(--success)' : 'transparent'}`, padding: '0.75rem 1rem' }}
                                onClick={toggleFreeze}
                            >
                                {activeCard.status === 'frozen' ? <Play size={18} /> : <Snowflake size={18} />}
                                {activeCard.status === 'frozen' ? 'Descongelar Tarjeta' : 'Congelar Tarjeta Temporalmente'}
                            </button>

                            <button className="btn" style={{ width: '100%', justifyContent: 'flex-start', background: 'var(--background)', color: 'var(--text-main)', border: '1px solid var(--border)', padding: '0.75rem 1rem' }}>
                                <Settings size={18} className="text-muted" /> Configurar Límites y Países
                            </button>
                        </div>
                    </div>
                )}

                {/* Selector de Tarjetas (Wallet) */}
                <div>
                    <h4 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '1rem' }}>Tu Billetera (Wallet)</h4>
                    <div style={{ display: 'flex', gap: '0.75rem', overflowX: 'auto', paddingBottom: '0.5rem', scrollbarWidth: 'none' }}>
                        {cards.map(card => (
                            <div 
                                key={card.id}
                                onClick={() => { setSelectedCardId(card.id); setIsFlipped(false); }}
                                style={{
                                    flex: '0 0 auto', padding: '0.75rem', borderRadius: '12px', cursor: 'pointer',
                                    background: card.id === selectedCardId ? 'var(--primary-light)' : 'var(--background)',
                                    border: `1px solid ${card.id === selectedCardId ? 'var(--primary)' : 'var(--border)'}`,
                                    display: 'flex', alignItems: 'center', gap: '0.75rem', transition: '0.2s'
                                }}
                            >
                                <div style={{ width: 40, height: 28, borderRadius: '4px', background: card.color, border: '1px solid rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: card.textColor, fontSize: '0.5rem', fontWeight: 800 }}>
                                    *{card.last4}
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.8rem', fontWeight: 600, color: card.id === selectedCardId ? 'var(--primary)' : 'var(--text-main)' }}>{card.type}</div>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{card.status === 'frozen' ? '❄️ Congelada' : '✅ Activa'}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>

            {/* Panel Derecho: Dashboard Financiero de la Tarjeta */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem', height: '100%' }}>
                
                {/* Métricas Principales */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                    <div className="card glass layout-card" style={{ padding: '1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                            <Activity size={16} /> Balance Actual
                        </div>
                        <div style={{ fontSize: '2rem', fontWeight: 800 }}>{formatMoney(activeCard?.balance || 0)}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Corte: n/a</div>
                    </div>
                    <div className="card glass layout-card" style={{ padding: '1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                            <ShieldCheck size={16} /> Límite de Crédito
                        </div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)' }}>{formatMoney(activeCard?.limit || 0)}</div>
                        
                        {/* Progress Bar Lineal */}
                        <div style={{ width: '100%', height: '6px', background: 'var(--background)', borderRadius: '3px', marginTop: '1rem', overflow: 'hidden' }}>
                            <div style={{ 
                                height: '100%', 
                                width: `${usagePercentage}%`, 
                                background: usagePercentage > 80 ? 'var(--danger)' : usagePercentage > 50 ? 'var(--warning)' : 'var(--success)',
                                transition: 'width 0.5s ease-out'
                            }}></div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginTop: '0.4rem', color: 'var(--text-muted)' }}>
                            <span>Usado: {usagePercentage.toFixed(1)}%</span>
                            <span>Disponible: {formatMoney((activeCard?.limit || 0) - (activeCard?.balance || 0))}</span>
                        </div>
                    </div>
                    <div className="card glass layout-card" style={{ padding: '1.5rem', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                         <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: 0.9, marginBottom: '0.5rem' }}>
                            <ArrowDownRight size={16} /> Pago Mínimo
                        </div>
                        <div style={{ fontSize: '1.8rem', fontWeight: 800 }}>{formatMoney(Math.max((activeCard?.balance || 0) * 0.05, 0))}</div>
                        <button className="btn" disabled style={{ background: 'white', color: '#059669', border: 'none', padding: '0.5rem', marginTop: '1rem', width: '100%', fontSize: '0.85rem', opacity: 0.7, cursor: 'not-allowed' }}>
                            Pagar Ahora
                        </button>
                    </div>
                </div>

                {/* Historial de Transacciones */}
                <div className="card glass layout-card" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: 0 }}>
                    <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--background)' }}>
                        <h3 style={{ margin: 0, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <RefreshCw size={18} className="text-primary" /> Transacciones Recientes
                        </h3>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem' }}><Filter size={16} /> Filtrar</button>
                            <button className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem' }}><Search size={16} /></button>
                        </div>
                    </div>

                    <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 1.5rem' }}>
                        {cardTransactions.length === 0 ? (
                            <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '3rem' }}>
                                No hay transacciones para esta tarjeta.
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {cardTransactions.map(txn => (
                                    <div key={txn.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '1rem', borderBottom: '1px solid var(--border)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <div style={{ width: 44, height: 44, borderRadius: '50%', background: txn.status === 'declined' ? 'rgba(239,68,68,0.1)' : 'var(--background)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: txn.status === 'declined' ? 'var(--danger)' : 'var(--text-main)' }}>
                                                {txn.category === 'Software' ? <Globe size={20} /> : txn.category === 'Equipos' ? <Smartphone size={20} /> : <CreditCard size={20} />}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 600, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    {txn.merchant} 
                                                    {txn.status === 'declined' && <span className="badge" style={{ background: 'var(--danger)', color: 'white', fontSize: '0.65rem' }}>Rechazado</span>}
                                                </div>
                                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{txn.date} a las {txn.time} • {txn.category}</div>
                                                {txn.note && <div style={{ fontSize: '0.75rem', color: 'var(--danger)', marginTop: '0.2rem' }}>{txn.note}</div>}
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontWeight: 700, fontSize: '1.1rem', color: txn.status === 'declined' ? 'var(--text-muted)' : 'var(--text-main)', textDecoration: txn.status === 'declined' ? 'line-through' : 'none' }}>
                                                {formatMoney(Math.abs(txn.amount))}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

            </div>

        </div>
    );
};

export default Tarjetas;
