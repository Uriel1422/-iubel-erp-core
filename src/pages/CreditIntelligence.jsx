import React, { useState, useEffect } from 'react';
import { 
    CreditCard, PieChart, TrendingUp, DollarSign, Users, 
    Calendar, AlertCircle, Plus, Filter, Download, 
    ChevronRight, ArrowUpRight, ArrowDownRight, Activity,
    ShieldCheck, Wallet, ShoppingBag, Receipt, MapPin, Trash2,
    Settings, Landmark
} from 'lucide-react';

import { 
    ResponsiveContainer, AreaChart, Area, XAxis, YAxis, 
    Tooltip, CartesianGrid, PieChart as RePie, Pie, Cell, 
    BarChart, Bar
} from 'recharts';

import { api } from '../utils/api';

const formatMoney = (val) => new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP' }).format(val);

const CreditIntelligence = () => {
    const [expenses, setExpenses] = useState([]);
    const [cardConfig, setCardConfig] = useState({
        name: 'Visa Infinite',
        bank: 'Banreservas',
        limit: 70000,
        currency: 'DOP'
    });

    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [isConfiguring, setIsConfiguring] = useState(false);
    
    // Cargar datos desde el servidor al montar
    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const expData = await api.get('credit_expenses');
                const configData = await api.get('credit_config');
                if (expData) setExpenses(expData);
                if (configData && configData.length > 0) {
                    setCardConfig(configData[0]);
                }
            } catch (err) {
                console.error('Error al cargar datos de Credit Intelligence:', err);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    const [newExpense, setNewExpense] = useState({
        merchant: '',
        amount: '',
        category: 'Alimentos',
        type: 'owner',
        person: 'Yo'
    });

    const [tempConfig, setTempConfig] = useState(cardConfig);

    useEffect(() => {
        if (!loading) setTempConfig(cardConfig);
    }, [cardConfig, loading]);

    // Cálculos
    const limit = cardConfig.limit;
    const totalSpent = expenses.reduce((acc, exp) => acc + (parseFloat(exp.amount) || 0), 0);
    const ownerSpent = expenses.filter(e => e.type === 'owner').reduce((acc, exp) => acc + exp.amount, 0);
    const thirdSpent = expenses.filter(e => e.type === 'third').reduce((acc, exp) => acc + exp.amount, 0);
    const utilization = (totalSpent / limit) * 100;
    
    // Salud Crediticia (Simulada basada en utilización)
    const healthScore = utilization < 30 ? 98 : utilization < 50 ? 85 : utilization < 70 ? 65 : 40;

    const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
    const pieData = [
        { name: 'Dueño', value: ownerSpent },
        { name: 'Terceros', value: thirdSpent }
    ];

    const categoryData = Object.entries(
        expenses.reduce((acc, exp) => {
            acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
            return acc;
        }, {})
    ).map(([name, value]) => ({ name, value }));

    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', flexDirection: 'column', gap: '1rem' }}>
                <Activity size={48} color="var(--primary)" className="animate-spin" />
                <p style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Cargando Sovereign Intelligence...</p>
                <div style={{ width: '200px', height: '4px', background: 'var(--border)', borderRadius: '2px', overflow: 'hidden' }}>
                    <div className="animate-pulse" style={{ height: '100%', background: 'var(--primary)', width: '60%' }}></div>
                </div>
            </div>
        );
    }

    const handleAddExpense = async (e) => {
        e.preventDefault();
        const expense = {
            ...newExpense,
            id: Date.now().toString(),
            date: new Date().toISOString().split('T')[0],
            amount: parseFloat(newExpense.amount)
        };
        const updatedExpenses = [expense, ...expenses];
        setExpenses(updatedExpenses);
        
        // Persistencia segura en el servidor
        await api.save('credit_expenses', updatedExpenses);
        
        setIsAdding(false);
        setNewExpense({ merchant: '', amount: '', category: 'Alimentos', type: 'owner', person: 'Yo' });
    };

    const handleDeleteExpense = async (id) => {
        if (window.confirm('¿Estás seguro de que deseas eliminar este registro de gasto?')) {
            const updatedExpenses = expenses.filter(exp => exp.id !== id);
            setExpenses(updatedExpenses);
            await api.save('credit_expenses', updatedExpenses);
        }
    };


    return (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '2rem' }}>
            
            {/* Header / Premium Stats */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '0.5rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <ShieldCheck size={32} color="var(--primary)" /> Sovereign Credit Intelligence
                    </h1>
                    <p style={{ color: 'var(--text-muted)', margin: '0.25rem 0 0' }}>Análisis táctico de gastos y salud crediticia • Acceso Restringido</p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button className="btn btn-secondary" onClick={() => { setTempConfig(cardConfig); setIsConfiguring(true); }} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Settings size={18} /> Configurar Tarjeta
                    </button>
                    <button className="btn btn-primary" onClick={() => setIsAdding(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.25rem' }}>
                        <Plus size={18} /> Registrar Gasto
                    </button>
                    <button className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Download size={18} /> Reporte PDF
                    </button>
                </div>
            </div>

            {/* Top Cards Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem' }}>
                <div className="card glass layout-card" style={{ padding: '1.5rem', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: -10, right: -10, opacity: 0.1 }}><Wallet size={80} /></div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Deuda Total Actual</div>
                    <div style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--text-main)' }}>{formatMoney(totalSpent)}</div>
                    <div style={{ height: '4px', background: 'var(--border)', borderRadius: '2px', marginTop: '1rem', overflow: 'hidden' }}>
                        <div style={{ width: `${utilization}%`, height: '100%', background: utilization > 80 ? 'var(--danger)' : 'var(--primary)' }}></div>
                    </div>
                </div>

                <div className="card glass layout-card" style={{ padding: '1.5rem' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Gastos de Terceros (CxC)</div>
                    <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#10b981' }}>{formatMoney(thirdSpent)}</div>
                    <div style={{ fontSize: '0.75rem', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--text-muted)' }}>
                        <Users size={14} /> {expenses.filter(e => e.type === 'third').length} Transacciones a cobrar
                    </div>
                </div>

                <div className="card glass layout-card" style={{ padding: '1.5rem' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Límite Disponible</div>
                    <div style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--text-main)' }}>{formatMoney(limit - totalSpent)}</div>
                    <div style={{ fontSize: '0.75rem', marginTop: '0.5rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                        {cardConfig.bank} • {cardConfig.name}
                    </div>
                </div>

                <div className="card glass layout-card" style={{ padding: '1.5rem', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', color: 'white' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, opacity: 0.7, textTransform: 'uppercase', marginBottom: '0.5rem' }}>Credit Health Score</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ fontSize: '2.5rem', fontWeight: 900, color: healthScore > 80 ? '#10b981' : '#f59e0b' }}>{healthScore}</div>
                        <div>
                            <div style={{ fontSize: '0.8rem', fontWeight: 800 }}>{healthScore > 80 ? 'EXCELENTE' : 'REGULAR'}</div>
                            <div style={{ fontSize: '0.65rem', opacity: 0.7 }}>Basado en utilización</div>
                        </div>
                    </div>
                    <div style={{ marginTop: '0.5rem', fontSize: '0.65rem', display: 'flex', gap: '0.5rem' }}>
                        <span style={{ color: '#10b981' }}>● Bajo Riesgo</span>
                        <span style={{ color: '#38bdf8' }}>● Tier 1</span>
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: '1.5rem' }}>
                
                {/* Left: Table of Expenses */}
                <div className="card glass layout-card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{ margin: 0, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Receipt size={18} className="text-primary" /> Historial de Movimientos
                        </h3>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <div style={{ position: 'relative' }}>
                                <Filter size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
                                <select style={{ padding: '0.4rem 0.75rem 0.4rem 2rem', borderRadius: '6px', background: 'var(--background)', border: '1px solid var(--border)', fontSize: '0.75rem', color: 'var(--text-main)', outline: 'none' }}>
                                    <option>Todos los gastos</option>
                                    <option>Solo Dueño</option>
                                    <option>Solo Terceros</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                            <thead style={{ background: 'rgba(0,0,0,0.02)' }}>
                                <tr>
                                    <th style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)', fontWeight: 700, fontSize: '0.7rem', textTransform: 'uppercase' }}>Fecha</th>
                                    <th style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)', fontWeight: 700, fontSize: '0.7rem', textTransform: 'uppercase' }}>Establecimiento / Detalle</th>
                                    <th style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)', fontWeight: 700, fontSize: '0.7rem', textTransform: 'uppercase' }}>Categoría</th>
                                    <th style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)', fontWeight: 700, fontSize: '0.7rem', textTransform: 'uppercase' }}>Asignado a</th>
                                    <th style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)', fontWeight: 700, fontSize: '0.7rem', textTransform: 'uppercase', textAlign: 'right' }}>Monto</th>
                                    <th style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)', fontWeight: 700, fontSize: '0.7rem', textTransform: 'uppercase', textAlign: 'center' }}>Acciones</th>

                                </tr>
                            </thead>
                            <tbody>
                                {expenses.map(exp => (
                                    <tr key={exp.id} style={{ borderBottom: '1px solid var(--border)', transition: '0.2s' }} className="hover-row">
                                        <td style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)' }}>{exp.date}</td>
                                        <td style={{ padding: '1rem 1.5rem' }}>
                                            <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{exp.merchant}</div>
                                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                                <MapPin size={10} /> Santo Domingo, DO
                                            </div>
                                        </td>
                                        <td style={{ padding: '1rem 1.5rem' }}>
                                            <span style={{ padding: '0.2rem 0.5rem', borderRadius: '4px', background: 'rgba(99,102,241,0.1)', color: 'var(--primary)', fontSize: '0.7rem', fontWeight: 700 }}>
                                                {exp.category}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1rem 1.5rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <div style={{ width: 24, height: 24, borderRadius: '50%', background: exp.type === 'owner' ? 'var(--primary)' : '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.6rem', fontWeight: 800 }}>
                                                    {exp.person[0]}
                                                </div>
                                                <span style={{ fontWeight: 600 }}>{exp.person}</span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '1rem 1.5rem', textAlign: 'right', fontWeight: 800, color: exp.type === 'third' ? '#10b981' : 'var(--text-main)' }}>
                                            {formatMoney(exp.amount)}
                                        </td>
                                        <td style={{ padding: '1rem 1.5rem', textAlign: 'center' }}>
                                            <button 
                                                onClick={() => handleDeleteExpense(exp.id)}
                                                style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0.5rem', borderRadius: '4px', transition: '0.2s' }}
                                                className="delete-btn"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>

                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Right: Analytics Charts */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    
                    {/* Owner vs Thirds Chart */}
                    <div className="card glass layout-card" style={{ padding: '1.5rem' }}>
                        <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '0.9rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Activity size={16} className="text-primary" /> Distribución de Responsabilidad
                        </h3>
                        <div style={{ height: '220px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <RePie>
                                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                        <Cell fill="var(--primary)" />
                                        <Cell fill="#10b981" />
                                    </Pie>
                                    <Tooltip formatter={(val) => formatMoney(val)} />
                                </RePie>
                            </ResponsiveContainer>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginTop: '1rem' }}>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700 }}>DUEÑO</div>
                                <div style={{ fontSize: '1rem', fontWeight: 800 }}>{((ownerSpent / totalSpent) * 100).toFixed(1)}%</div>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700 }}>TERCEROS</div>
                                <div style={{ fontSize: '1rem', fontWeight: 800 }}>{((thirdSpent / totalSpent) * 100).toFixed(1)}%</div>
                            </div>
                        </div>
                    </div>

                    {/* Category Bar Chart */}
                    <div className="card glass layout-card" style={{ padding: '1.5rem' }}>
                        <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '0.9rem', fontWeight: 800 }}>Gastos por Categoría</h3>
                        <div style={{ height: '200px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={categoryData} layout="vertical">
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="name" type="category" width={100} fontSize={10} axisLine={false} tickLine={false} />
                                    <Tooltip formatter={(val) => formatMoney(val)} cursor={{ fill: 'rgba(0,0,0,0.05)' }} />
                                    <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                                        {categoryData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                </div>
            </div>

            {/* Modal: Agregar Gasto */}
            {isAdding && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
                    <div className="card" style={{ width: '450px', padding: '2rem', background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '20px', boxShadow: '0 40px 80px rgba(0,0,0,0.4)' }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <Plus size={24} color="var(--primary)" /> Registrar Gasto Intel
                        </h2>
                        
                        <form onSubmit={handleAddExpense} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>ESTABLECIMIENTO</label>
                                <input 
                                    type="text" required value={newExpense.merchant} 
                                    onChange={e => setNewExpense({...newExpense, merchant: e.target.value})}
                                    style={{ width: '100%', padding: '0.875rem', borderRadius: '10px', background: 'var(--background)', border: '1px solid var(--border)', color: 'var(--text-main)', outline: 'none' }} 
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>MONTO (DOP)</label>
                                    <input 
                                        type="number" required value={newExpense.amount} 
                                        onChange={e => setNewExpense({...newExpense, amount: e.target.value})}
                                        style={{ width: '100%', padding: '0.875rem', borderRadius: '10px', background: 'var(--background)', border: '1px solid var(--border)', color: 'var(--text-main)', outline: 'none' }} 
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>CATEGORÍA</label>
                                    <select 
                                        value={newExpense.category} 
                                        onChange={e => setNewExpense({...newExpense, category: e.target.value})}
                                        style={{ width: '100%', padding: '0.875rem', borderRadius: '10px', background: 'var(--background)', border: '1px solid var(--border)', color: 'var(--text-main)', outline: 'none' }}
                                    >
                                        <option>Alimentos</option>
                                        <option>Tecnología</option>
                                        <option>Transporte</option>
                                        <option>Salud</option>
                                        <option>Entretenimiento</option>
                                        <option>Shopping</option>
                                    </select>
                                </div>
                            </div>

                            <div style={{ background: 'rgba(99,102,241,0.05)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--primary-light)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <label style={{ fontWeight: 800, fontSize: '0.85rem' }}>¿Es un gasto de Tercero?</label>
                                    <input 
                                        type="checkbox" 
                                        checked={newExpense.type === 'third'} 
                                        onChange={e => setNewExpense({...newExpense, type: e.target.checked ? 'third' : 'owner', person: e.target.checked ? '' : 'Yo'})}
                                        style={{ width: 20, height: 20 }}
                                    />
                                </div>
                                {newExpense.type === 'third' && (
                                    <div style={{ marginTop: '1rem' }}>
                                        <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, opacity: 0.6, marginBottom: '0.4rem' }}>NOMBRE DEL TERCERO (CXC)</label>
                                        <input 
                                            type="text" required placeholder="Ej: Juan Pérez" value={newExpense.person}
                                            onChange={e => setNewExpense({...newExpense, person: e.target.value})}
                                            style={{ width: '100%', padding: '0.625rem', borderRadius: '8px', background: 'var(--background)', border: '1px solid var(--border)', color: 'var(--text-main)', fontSize: '0.85rem' }} 
                                        />
                                    </div>
                                )}
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                <button type="button" onClick={() => setIsAdding(false)} className="btn btn-secondary" style={{ flex: 1 }}>Cancelar</button>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Registrar Gasto</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal: Configurar Tarjeta */}
            {isConfiguring && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
                    <div className="card" style={{ width: '450px', padding: '2rem', background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '20px', boxShadow: '0 40px 80px rgba(0,0,0,0.4)' }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <CreditCard size={24} color="var(--primary)" /> Configuración de Tarjeta
                        </h2>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>NOMBRE DE LA TARJETA</label>
                                <input 
                                    type="text" value={tempConfig.name} 
                                    onChange={e => setTempConfig({...tempConfig, name: e.target.value})}
                                    placeholder="Ej: Visa Infinite Elite"
                                    style={{ width: '100%', padding: '0.875rem', borderRadius: '10px', background: 'var(--background)', border: '1px solid var(--border)', color: 'var(--text-main)', outline: 'none' }} 
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>ENTIDAD BANCARIA</label>
                                <div style={{ position: 'relative' }}>
                                    <Landmark size={18} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.3 }} />
                                    <input 
                                        type="text" value={tempConfig.bank} 
                                        onChange={e => setTempConfig({...tempConfig, bank: e.target.value})}
                                        placeholder="Ej: Banreservas / Popular"
                                        style={{ width: '100%', padding: '0.875rem', borderRadius: '10px', background: 'var(--background)', border: '1px solid var(--border)', color: 'var(--text-main)', outline: 'none' }} 
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>LÍMITE DE CRÉDITO</label>
                                    <input 
                                        type="number" value={tempConfig.limit} 
                                        onChange={e => setTempConfig({...tempConfig, limit: parseFloat(e.target.value) || 0})}
                                        style={{ width: '100%', padding: '0.875rem', borderRadius: '10px', background: 'var(--background)', border: '1px solid var(--border)', color: 'var(--text-main)', outline: 'none' }} 
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>MONEDA</label>
                                    <select 
                                        value={tempConfig.currency} 
                                        onChange={e => setTempConfig({...tempConfig, currency: e.target.value})}
                                        style={{ width: '100%', padding: '0.875rem', borderRadius: '10px', background: 'var(--background)', border: '1px solid var(--border)', color: 'var(--text-main)', outline: 'none' }}
                                    >
                                        <option value="DOP">DOP</option>
                                        <option value="USD">USD</option>
                                    </select>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                                <button onClick={() => setIsConfiguring(false)} className="btn btn-secondary" style={{ flex: 1 }}>Cancelar</button>
                                <button onClick={async () => { 
                                    const finalConfig = { ...tempConfig, id: 'main' };
                                    setCardConfig(finalConfig);
                                    await api.save('credit_config', finalConfig);
                                    setIsConfiguring(false); 
                                }} className="btn btn-primary" style={{ flex: 1 }}>Guardar Cambios</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .hover-row:hover { background: rgba(99,102,241,0.03); }
                .text-primary { color: var(--primary); }
                .btn { cursor: pointer; border: 1px solid transparent; transition: 0.2s; border-radius: 8px; font-weight: 700; font-family: inherit; }
                .btn-primary { background: var(--primary); color: white; }
                .btn-primary:hover { opacity: 0.9; transform: translateY(-1px); }
                .btn-secondary { background: var(--background); border-color: var(--border); color: var(--text-main); }
                .btn-secondary:hover { background: var(--border); }
            `}</style>

        </div>
    );
};

export default CreditIntelligence;
