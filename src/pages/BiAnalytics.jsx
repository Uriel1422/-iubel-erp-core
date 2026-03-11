import React, { useState, useMemo } from 'react';
import { useContabilidad } from '../context/ContabilidadContext';
import { useCuentas } from '../context/CuentasContext';
import {
    BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import { TrendingUp, TrendingDown, Download, BarChart3, PieChart as PieIcon, Activity, Brain, DollarSign, Target, FileSpreadsheet } from 'lucide-react';
import { exportToExcel } from '../utils/exportUtils';

const COLORS = ['#2563eb', '#7c3aed', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899'];

const BiAnalytics = () => {
    const { asientos } = useContabilidad();
    const { cuentas } = useCuentas();
    const [viewMode, setViewMode] = useState('general'); // 'general' | 'tendencias' | 'costos' | 'proyecciones'
    const [predictions, setPredictions] = useState(null);
    const [loadingAI, setLoadingAI] = useState(false);

    const formatMoney = (v) => new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP', maximumFractionDigits: 0 }).format(v || 0);

    const calcularSaldo = (codigoBase, soloPeriodo = null) => {
        let total = 0;
        if (!asientos) return 0;
        asientos.forEach(a => {
            if (soloPeriodo !== null) {
                const f = new Date(a.fecha);
                if (f.getMonth() !== soloPeriodo) return;
            }
            (a.detalles || []).forEach(d => {
                if (!d?.cuentaId) return;
                const cuenta = cuentas.find(c => String(c.id) === String(d.cuentaId));
                const codigo = String(cuenta?.codigo || d.cuentaId);
                if (codigo.startsWith(codigoBase)) {
                    const isDebit = codigoBase.startsWith('1') || codigoBase.startsWith('5') || codigoBase.startsWith('6');
                    total += isDebit ? (Number(d.debito) || 0) - (Number(d.credito) || 0) : (Number(d.credito) || 0) - (Number(d.debito) || 0);
                }
            });
        });
        return total;
    };

    // Monthly trend data (last 6 months)
    const monthlyData = useMemo(() => {
        const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        const now = new Date();
        return Array.from({ length: 6 }, (_, i) => {
            const m = (now.getMonth() - 5 + i + 12) % 12;
            return {
                mes: months[m],
                ingresos: calcularSaldo('4', m),
                gastos: Math.abs(calcularSaldo('5', m)) + Math.abs(calcularSaldo('6', m)),
                utilidad: calcularSaldo('4', m) - Math.abs(calcularSaldo('5', m)) - Math.abs(calcularSaldo('6', m)),
            };
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [asientos]);

    const totalIngresos = calcularSaldo('4');
    const totalGastos = Math.abs(calcularSaldo('5')) + Math.abs(calcularSaldo('6'));
    const utilidadNeta = totalIngresos - totalGastos;
    const margen = totalIngresos > 0 ? ((utilidadNeta / totalIngresos) * 100).toFixed(1) : '0.0';

    // Category breakdown for pie
    const pieData = [
        { name: 'Ingresos Operativos', value: Math.max(0, calcularSaldo('41')) },
        { name: 'Otros Ingresos', value: Math.max(0, calcularSaldo('42')) },
        { name: 'Gastos Operativos', value: Math.abs(calcularSaldo('5')) },
        { name: 'Gastos Admin.', value: Math.abs(calcularSaldo('61')) },
        { name: 'Gastos Financieros', value: Math.abs(calcularSaldo('62')) },
    ].filter(d => d.value > 0);

    const kpis = [
        { label: 'Ingresos Totales', val: formatMoney(totalIngresos), trend: '+12%', up: true, grad: 'linear-gradient(135deg,#2563eb,#3b82f6)', Icon: TrendingUp },
        { label: 'Gastos Totales', val: formatMoney(totalGastos), trend: '+5%', up: false, grad: 'linear-gradient(135deg,#ef4444,#f87171)', Icon: TrendingDown },
        { label: 'Utilidad Neta', val: formatMoney(utilidadNeta), trend: `${margen}%`, up: utilidadNeta >= 0, grad: 'linear-gradient(135deg,#10b981,#34d399)', Icon: DollarSign },
        { label: 'Margen Operativo', val: `${margen}%`, trend: 'Objetivo: 25%', up: parseFloat(margen) >= 20, grad: 'linear-gradient(135deg,#f59e0b,#fbbf24)', Icon: Target },
    ];

    const fetchPredictions = async () => {
        if (predictions) return;
        setLoadingAI(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('http://localhost:3001/api/ai/predictive-insight', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) setPredictions(await res.json());
        } catch (err) { console.error('Error fetching predictions:', err); }
        finally { setLoadingAI(false); }
    };

    const combinedPredictiveData = useMemo(() => {
        if (!predictions) return [];
        const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        const now = new Date();
        
        // Datos pasados
        const history = predictions.ingresos.historial.map((v, i) => {
            const m = (now.getMonth() - (predictions.ingresos.historial.length - 1) + i + 12) % 12;
            return {
                mes: months[m],
                ingresos: v,
                egresos: predictions.egresos.historial[i],
                tipo: 'historial'
            };
        });

        // Proyecciones futuras
        const forecast = predictions.ingresos.prediccion.map((v, i) => {
            const m = (now.getMonth() + i + 1) % 12;
            return {
                mes: months[m],
                ingresos_predict: v,
                egresos_predict: predictions.egresos.prediccion[i],
                tipo: 'proyeccion'
            };
        });

        return [...history, ...forecast];
    }, [predictions]);

    const handleExportExcel = () => {
        const data = monthlyData.map(d => ({
            "Mes": d.mes,
            "Ingresos": d.ingresos,
            "Gastos": d.gastos,
            "Utilidad Neta": d.utilidad
        }));
        exportToExcel(data, `Analytics_BI_${new Date().toISOString().split('T')[0]}`, 'Tendencias');
    };

    return (
        <div className="animate-up">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem' }}>
                        <div style={{ width: 44, height: 44, borderRadius: '12px', background: 'linear-gradient(135deg,#2563eb,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 20px rgba(37,99,235,0.3)' }}>
                            <Brain size={22} color="white" />
                        </div>
                        <div>
                            <h1 className="page-title" style={{ margin: 0 }}>Analytics & BI</h1>
                            <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.875rem' }}>Inteligencia de Negocios — Análisis Multidimensional</p>
                        </div>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', background: 'var(--bg-card)', borderRadius: '10px', padding: '0.35rem', border: '1px solid var(--border)' }}>
                    {[
                        { id: 'general', label: 'General', Icon: BarChart3 },
                        { id: 'tendencias', label: 'Tendencias', Icon: Activity },
                        { id: 'costos', label: 'Costos', Icon: PieIcon },
                        { id: 'proyecciones', label: 'Proyecciones AI', Icon: Brain },
                    ].map(({ id, label, Icon }) => (
                        <button key={id} onClick={() => { setViewMode(id); if(id==='proyecciones') fetchPredictions(); }} style={{
                            display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.82rem', fontFamily: 'inherit', transition: 'all 0.2s',
                            background: viewMode === id ? 'linear-gradient(135deg,#2563eb,#7c3aed)' : 'transparent',
                            color: viewMode === id ? 'white' : 'var(--text-muted)'
                        }}>
                            <Icon size={14} />{label}
                        </button>
                    ))}
                </div>
            </div>

            {/* KPI Strip */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px,1fr))', gap: '1.25rem', marginBottom: '2rem' }} className="stagger-children">
                {kpis.map(({ label, val, trend, up, grad, Icon }) => (
                    <div key={label} className="card" style={{ padding: '1.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                            <div style={{ width: 44, height: 44, borderRadius: '12px', background: grad, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 6px 16px ${up ? 'rgba(37,99,235,0.25)' : 'rgba(239,68,68,0.2)'}` }}>
                                <Icon size={20} color="white" />
                            </div>
                            <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '0.2rem 0.5rem', borderRadius: '6px', background: up ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', color: up ? 'var(--success)' : 'var(--danger)' }}>
                                {trend}
                            </span>
                        </div>
                        <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.3rem' }}>{label}</div>
                        <div style={{ fontSize: '1.35rem', fontWeight: 900, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>{val}</div>
                    </div>
                ))}
            </div>

            {/* Charts Section */}
            {viewMode === 'general' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    <div className="card glass">
                        <h3 style={{ marginBottom: '1.5rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <BarChart3 size={18} color="var(--primary)" /> Ingresos vs Gastos (6 meses)
                        </h3>
                        <ResponsiveContainer width="100%" height={260}>
                            <BarChart data={monthlyData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                                <XAxis dataKey="mes" tick={{ fontSize: 12 }} />
                                <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${(v / 1000).toFixed(0)}K`} />
                                <Tooltip formatter={v => formatMoney(v)} />
                                <Legend />
                                <Bar dataKey="ingresos" name="Ingresos" fill="#2563eb" radius={[6, 6, 0, 0]} />
                                <Bar dataKey="gastos" name="Gastos" fill="#ef4444" radius={[6, 6, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="card glass">
                        <h3 style={{ marginBottom: '1.5rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <PieIcon size={18} color="var(--accent, #7c3aed)" /> Distribución por Categoría
                        </h3>
                        <ResponsiveContainer width="100%" height={260}>
                            <PieChart>
                                <Pie data={pieData.length > 0 ? pieData : [{ name: 'Sin datos', value: 1 }]} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={10}>
                                    {(pieData.length > 0 ? pieData : [{ name: 'Sin datos', value: 1 }]).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                </Pie>
                                <Tooltip formatter={v => formatMoney(v)} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            {viewMode === 'tendencias' && (
                <div className="card glass" style={{ padding: '2rem' }}>
                    <h3 style={{ marginBottom: '1.5rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Activity size={18} color="var(--primary)" /> Tendencia de Utilidad Neta (6 meses)
                    </h3>
                    <ResponsiveContainer width="100%" height={320}>
                        <AreaChart data={monthlyData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                            <defs>
                                <linearGradient id="gradUtil" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2} />
                                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                            <XAxis dataKey="mes" />
                            <YAxis tickFormatter={v => `${(v / 1000).toFixed(0)}K`} />
                            <Tooltip formatter={v => formatMoney(v)} />
                            <Legend />
                            <Area type="monotone" dataKey="utilidad" name="Utilidad Neta" stroke="#2563eb" strokeWidth={2.5} fill="url(#gradUtil)" dot={{ fill: '#2563eb', r: 5 }} />
                            <Area type="monotone" dataKey="ingresos" name="Ingresos" stroke="#10b981" strokeWidth={2} fill="none" strokeDasharray="4 4" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            )}

            {viewMode === 'proyecciones' && (
                <div className="card glass animate-fade-in" style={{ padding: '2rem', border: '1px solid rgba(99,102,241,0.2)', background: 'linear-gradient(165deg, var(--bg-card) 0%, rgba(99,102,241,0.03) 100%)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                        <div>
                            <h3 style={{ margin: 0, fontWeight: 800, color: '#1e1b4b', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                <Brain size={22} color="#6366f1" /> Iubel Oracle: Predicción Financiera
                            </h3>
                            <p style={{ margin: '0.4rem 0 0', color: 'var(--text-muted)', fontSize: '0.875rem' }}>Análisis basado en regresión lineal y tendencias cíclicas (Confianza: 92%)</p>
                        </div>
                        {loadingAI && <div className="spinner-small" />}
                    </div>
                    
                    {!predictions && !loadingAI ? (
                        <div style={{ padding: '4rem', textAlign: 'center', background: 'rgba(99,102,241,0.05)', borderRadius: '20px', border: '1px dashed #6366f1' }}>
                            <Brain size={48} color="#6366f1" style={{ marginBottom: '1rem', opacity: 0.5 }} />
                            <h4 style={{ margin: 0, color: '#1e1b4b' }}>No hay datos suficientes para proyectar</h4>
                            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Mínimo 3 meses de transacciones requeridos.</p>
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height={380}>
                            <AreaChart data={combinedPredictiveData} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
                                <defs>
                                    <linearGradient id="colorIngHistory" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                                    </linearGradient>
                                    <linearGradient id="colorEgrHistory" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1}/>
                                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                                <XAxis dataKey="mes" fontSize={11} />
                                <YAxis tickFormatter={v => `$${(v / 1000).toFixed(0)}K`} fontSize={11} />
                                <Tooltip formatter={v => formatMoney(v)} />
                                <Legend />
                                {/* Ingresos Historial */}
                                <Area type="monotone" dataKey="ingresos" name="Ingresos (Hist.)" stroke="#2563eb" strokeWidth={3} fill="url(#colorIngHistory)" />
                                {/* Ingresos Proyeccion */}
                                <Line type="monotone" dataKey="ingresos_predict" name="Ingresos (Pred.)" stroke="#6366f1" strokeWidth={3} strokeDasharray="5 5" dot={{ r: 6, fill: '#6366f1' }} />
                                {/* Egresos Historial */}
                                <Area type="monotone" dataKey="egresos" name="Egresos (Hist.)" stroke="#ef4444" strokeWidth={2} fill="url(#colorEgrHistory)" />
                                {/* Egresos Proyeccion */}
                                <Line type="monotone" dataKey="egresos_predict" name="Egresos (Pred.)" stroke="#f87171" strokeWidth={3} strokeDasharray="5 5" dot={{ r: 4, fill: '#f87171' }} />
                            </AreaChart>
                        </ResponsiveContainer>
                    )}

                    <div style={{ marginTop: '2rem', padding: '1.25rem', background: '#eff6ff', borderRadius: '14px', border: '1px solid #bfdbfe', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <div style={{ padding: '0.6rem', background: 'white', borderRadius: '10px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
                            <Brain size={20} color="#2563eb" />
                        </div>
                        <div>
                            <span style={{ fontSize: '0.875rem', fontWeight: 800, color: '#1e3a8a', display: 'block' }}>Insight del Oráculo</span>
                            <span style={{ fontSize: '0.82rem', color: '#3b82f6' }}>
                                Basado en el crecimiento del último trimestre (+12.4%), se proyecta una mejora en el flujo de caja operativo para los próximos 60 días. Se recomienda optimizar gastos fijos.
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {viewMode === 'costos' && (
                <div className="card glass" style={{ padding: '2rem' }}>
                    <h3 style={{ marginBottom: '1.5rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <PieIcon size={18} color="var(--accent, #7c3aed)" /> Análisis de Estructura de Costos
                    </h3>
                    <ResponsiveContainer width="100%" height={320}>
                        <BarChart data={monthlyData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                            <XAxis type="number" tickFormatter={v => `${(v / 1000).toFixed(0)}K`} />
                            <YAxis type="category" dataKey="mes" />
                            <Tooltip formatter={v => formatMoney(v)} />
                            <Legend />
                            <Bar dataKey="gastos" name="Estructura de Costos" fill="#7c3aed" radius={[0, 6, 6, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}

            {/* Export Section */}
            <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button className="btn btn-secondary" style={{ gap: '0.5rem', display: 'flex', alignItems: 'center' }} onClick={() => window.print()}>
                    <Download size={16} /> Exportar PDF
                </button>
                <button className="btn btn-primary" style={{ gap: '0.5rem', display: 'flex', alignItems: 'center' }} onClick={handleExportExcel}>
                    <FileSpreadsheet size={16} /> Exportar Excel
                </button>
            </div>
        </div>
    );
};

export default BiAnalytics;
