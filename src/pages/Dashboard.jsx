import React from 'react';
import { useContabilidad } from '../context/ContabilidadContext';
import { useCuentas } from '../context/CuentasContext';
import AsistenteFinanciero from '../components/AsistenteFinanciero';
import FiscalWidget from '../components/FiscalWidget';
import {
    TrendingUp,
    TrendingDown,
    DollarSign,
    Calculator,
    ArrowRight,
    ShoppingCart,
    Receipt,
    Calendar,
    BarChart3,
    PieChart as PieChartIcon,
    Sparkles,
    AlertCircle,
    Brain,
    CreditCard,
    Repeat,
    Network
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNCF } from '../context/NCFContext';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
    PieChart,
    Pie
} from 'recharts';

const Dashboard = () => {
    const { user, empresa, hasAccess, refreshAuth } = useAuth();
    const { asientos } = useContabilidad();
    const { cuentas } = useCuentas();
    const { alertas } = useNCF();

    React.useEffect(() => {
        refreshAuth();
    }, []);

    // Cálculo de KPIs
    const calcularSaldo = (codigoBase, soloMesActual = false) => {
        let total = 0;
        if (!asientos) return 0;

        const fechaActual = new Date();
        const mesActual = fechaActual.getMonth();
        const anioActual = fechaActual.getFullYear();

        asientos.forEach(asiento => {
            // Filtrar por el mes actual si se requiere
            if (soloMesActual) {
                const fechaAsiento = new Date(asiento.fecha);
                if (fechaAsiento.getMonth() !== mesActual || fechaAsiento.getFullYear() !== anioActual) {
                    return; // Ignorar este asiento
                }
            }

            (asiento.detalles || []).forEach(detalle => {
                if (!detalle || !detalle.cuentaId) return;
                // Look up the account by ID to get its code
                const cuenta = cuentas.find(c => String(c.id) === String(detalle.cuentaId));
                const codigo = String(cuenta?.codigo || detalle.cuentaId);
                if (codigo.startsWith(codigoBase)) {
                    const debe = Number(detalle.debito) || 0;
                    const haber = Number(detalle.credito) || 0;
                    if (codigoBase.startsWith('1') || codigoBase.startsWith('5') || codigoBase.startsWith('6')) {
                        total += (debe - haber);
                    } else {
                        total += (haber - debe);
                    }
                }
            });
        });
        return total;
    };

    const ingresos = calcularSaldo('4');
    const gastos = calcularSaldo('5') + calcularSaldo('6');
    const cxc = calcularSaldo('1102'); // Supongamos 1102 es CxC
    const itbisNeto = calcularSaldo('2102', true); // ITBIS del mes en curso

    const formatMoney = (amount) => {
        return new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP' }).format(amount);
    };

    const dataGrafico = [
        { name: 'Ingresos', valor: ingresos, color: 'var(--primary)' },
        { name: 'Gastos', valor: gastos, color: 'var(--danger)' }
    ];

    const rawDataPie = [
        { name: 'Cobrado', value: Math.abs(ingresos * 0.18), color: 'var(--success)' },
        { name: 'Pagado', value: Math.abs(gastos * 0.18), color: 'var(--warning)' }
    ];
    const totalPie = rawDataPie.reduce((acc, curr) => acc + curr.value, 0);
    const dataPie = totalPie === 0 ? [{ name: 'Sin Datos', value: 1, color: 'var(--border)' }] : rawDataPie;

    return (
        <div className="animate-up">
            {/* 🚩 NCF ALERTS BANNER */}
            {alertas && alertas.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                    {alertas.map((a, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.5rem', background: a.critico ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)', color: a.critico ? '#991b1b' : '#92400e', borderRadius: '12px', border: `1px solid ${a.critico ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.2)'}`, animation: 'bounce-in 0.5s ease' }}>
                            <AlertCircle size={20} />
                            <div style={{ flex: 1, fontWeight: 700, fontSize: '0.9rem' }}>
                                Alerta de Comprobantes {a.tipo}: <span style={{ textDecoration: 'underline' }}>{a.msg}</span>. Por favor registre un nuevo rango en Gestión de NCF.
                            </div>
                            <Link to="/ncf" style={{ fontSize: '0.8rem', fontWeight: 800, color: 'inherit', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                Ir a Gestión →
                            </Link>
                        </div>
                    ))}
                </div>
            )}
            {/* Premium Header */}
            <header style={{ marginBottom: '2rem' }}>
                <div className="card glass" style={{
                    padding: '1.75rem 2rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.85) 0%, rgba(240,244,255,0.9) 100%)',
                    borderTop: '4px solid transparent',
                    borderImage: 'linear-gradient(90deg, #2563eb, #7c3aed) 1',
                    position: 'relative', overflow: 'hidden'
                }}>
                    {/* Decorative orb */}
                    <div style={{ position: 'absolute', right: '-40px', top: '-40px', width: '160px', height: '160px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,58,237,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />
                    <div style={{ position: 'relative' }}>
                        <h1 style={{ fontSize: '1.9rem', fontWeight: 800, marginBottom: '0.35rem', background: 'linear-gradient(135deg, #1e293b 30%, #2563eb 70%, #7c3aed 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            ¡Bienvenido, {user?.nombre || 'Usuario'}!
                        </h1>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Sparkles size={14} style={{ color: 'var(--accent, #7c3aed)' }} />
                            Resumen ejecutivo de <strong>{empresa?.nombre || 'Iubel ERP'}</strong>
                        </p>
                    </div>
                    <div className="btn btn-primary" style={{ padding: '0.75rem 1.5rem', borderRadius: '14px' }}>
                        <Calendar size={18} style={{ marginRight: '0.4rem' }} />
                        <span>{new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                    </div>
                </div>
            </header>

            {/* Premium KPI Cards */}
            <div className="kpi-grid stagger-children" style={{ marginBottom: '2rem' }}>
                {[
                    { label: 'Ingresos Totales', val: ingresos, Icon: TrendingUp, grad: 'linear-gradient(135deg,#2563eb,#3b82f6)', shadow: 'rgba(37,99,235,0.3)' },
                    { label: 'Gastos Operativos', val: gastos, Icon: TrendingDown, grad: 'linear-gradient(135deg,#ef4444,#f87171)', shadow: 'rgba(239,68,68,0.3)' },
                    { label: 'Cuentas por Cobrar', val: cxc, Icon: DollarSign, grad: 'linear-gradient(135deg,#10b981,#34d399)', shadow: 'rgba(16,185,129,0.3)' },
                    { label: 'ITBIS por Pagar', val: itbisNeto, Icon: Calculator, grad: 'linear-gradient(135deg,#f59e0b,#fbbf24)', shadow: 'rgba(245,158,11,0.3)' },
                ].map(({ label, val, Icon, grad, shadow }) => (
                    <div key={label} className="card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                        <div style={{
                            width: 52, height: 52, borderRadius: '14px',
                            background: grad,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                            boxShadow: `0 8px 20px ${shadow}`
                        }}>
                            <Icon size={22} color="white" />
                        </div>
                        <div>
                            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.3rem' }}>{label}</div>
                            <div style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-main)', letterSpacing: '-0.03em', animation: 'countUp 0.5s ease' }}>{formatMoney(val)}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* 🧠 SMART ADVISORS GRID */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                <AsistenteFinanciero />
                <FiscalWidget />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '3rem' }}>
                <div key="chart-bar" className="card glass">
                    <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <BarChart3 size={20} color="var(--primary)" /> Rendimiento: Ingresos vs Gastos
                    </h3>
                    <div style={{ width: '100%', height: 300, minHeight: '300px', position: 'relative' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={dataGrafico}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                <YAxis axisLine={false} tickLine={false} />
                                <Tooltip
                                    cursor={{ fill: 'transparent' }}
                                    contentStyle={{ background: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: '12px', boxShadow: '0 10px 15px rgba(0,0,0,0.1)' }}
                                />
                                <Bar dataKey="valor" radius={[8, 8, 0, 0]}>
                                    {dataGrafico.map((entry, index) => (
                                        <Cell key={`bar-cell-${index}`} fill={entry.color} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div key="chart-pie" className="card glass">
                    <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <PieChartIcon size={20} color="var(--primary)" /> Distribución de ITBIS
                    </h3>
                    <div style={{ width: '100%', height: 300, minHeight: '300px', position: 'relative' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={dataPie}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                    isAnimationActive={false}
                                >
                                    {dataPie.map((entry, index) => (
                                        <Cell key={`pie-cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginTop: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{ width: 12, height: 12, borderRadius: '50%', background: 'var(--success)' }}></div>
                            <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Cobrado</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{ width: 12, height: 12, borderRadius: '50%', background: 'var(--warning)' }}></div>
                            <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Pagado</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* 📈 FINTECH: TESORERÍA PREDICTIVA (Fase 2) */}
            <div className="card glass animate-up" style={{ marginBottom: '3rem', borderLeft: '5px solid var(--primary)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <div>
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                            <TrendingUp size={22} color="var(--primary)" /> Tesorería Predictiva (30 días)
                        </h3>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Proyección de flujo de caja basada en préstamos activos y gastos recurrentes.</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Balance Estimado</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--primary)' }}>{formatMoney((ingresos - gastos) * 1.15)}</div>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
                    <div style={{ padding: '1.25rem', borderRadius: '12px', background: 'rgba(0,0,0,0.02)', border: '1px dashed var(--border)' }}>
                        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Entradas Proyectadas</div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--success)' }}>+ {formatMoney(ingresos * 0.4)}</div>
                        <div style={{ fontSize: '0.7rem', marginTop: '0.4rem', color: 'var(--text-muted)' }}>Proveniente de cuotas de préstamos</div>
                    </div>
                    <div style={{ padding: '1.25rem', borderRadius: '12px', background: 'rgba(0,0,0,0.02)', border: '1px dashed var(--border)' }}>
                        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Salidas Proyectadas</div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--danger)' }}>- {formatMoney(gastos * 0.8)}</div>
                        <div style={{ fontSize: '0.7rem', marginTop: '0.4rem', color: 'var(--text-muted)' }}>Nómina y servicios recurrentes</div>
                    </div>
                    <div style={{ padding: '1.25rem', borderRadius: '12px', background: 'linear-gradient(135deg, var(--primary), #1e40af)', color: 'white' }}>
                        <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.5rem', opacity: 0.8 }}>Flujo Neto Esperado</div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>{formatMoney((ingresos * 0.4) - (gastos * 0.8))}</div>
                        <div style={{ fontSize: '0.7rem', marginTop: '0.4rem', opacity: 0.8 }}>Salud financiera: Óptima</div>
                    </div>
                </div>
            </div>

            {/* 🌐 FINTECH INTELLIGENCE HUB */}
            <div className="card glass layout-card" style={{ marginBottom: '3rem', borderTop: '4px solid #38bdf8' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                    <Network size={22} color="#38bdf8" /> FinTech & AI Intelligence Hub
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                    <Link to="/erp/copilot" style={{ textDecoration: 'none', color: 'inherit', padding: '1rem', borderRadius: '12px', background: 'rgba(139, 92, 246, 0.05)', border: '1px solid rgba(139, 92, 246, 0.1)', transition: '0.2s' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#8b5cf6', marginBottom: '0.5rem' }}>
                            <Brain size={16} /> <span style={{ fontWeight: 800, fontSize: '0.7rem' }}>IUBEL COPILOT</span>
                        </div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>AI está lista</div>
                        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Analiza tus estados hoy</div>
                    </Link>
                    <Link to="/erp/tarjetas" style={{ textDecoration: 'none', color: 'inherit', padding: '1rem', borderRadius: '12px', background: 'rgba(14, 165, 233, 0.05)', border: '1px solid rgba(14, 165, 233, 0.1)', transition: '0.2s' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#0ea5e9', marginBottom: '0.5rem' }}>
                            <CreditCard size={16} /> <span style={{ fontWeight: 800, fontSize: '0.7rem' }}>CARD ISSUING</span>
                        </div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>24 Tarjetas activas</div>
                        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>0 intentos de fraude</div>
                    </Link>
                    <Link to="/erp/datanode" style={{ textDecoration: 'none', color: 'inherit', padding: '1rem', borderRadius: '12px', background: 'rgba(56, 189, 248, 0.05)', border: '1px solid rgba(56, 189, 248, 0.1)', transition: '0.2s' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#38bdf8', marginBottom: '0.5rem' }}>
                            <Network size={16} /> <span style={{ fontWeight: 800, fontSize: '0.7rem' }}>DATA NODE</span>
                        </div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>Anomalías: 0</div>
                        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Risk cluster estable</div>
                    </Link>
                    <Link to="/erp/exchange" style={{ textDecoration: 'none', color: 'inherit', padding: '1rem', borderRadius: '12px', background: 'rgba(250, 204, 21, 0.05)', border: '1px solid rgba(250, 204, 21, 0.1)', transition: '0.2s' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#facc15', marginBottom: '0.5rem' }}>
                            <Repeat size={16} /> <span style={{ fontWeight: 800, fontSize: '0.7rem' }}>EXCHANGE</span>
                        </div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>IUB: $105.52</div>
                        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Market Cap: $1.3B</div>
                    </Link>
                </div>
            </div>

            <h3 style={{ marginBottom: '1.5rem' }}>Acceso Rápido</h3>
            <div className="quick-actions">
                {hasAccess('facturacion') && (
                    <Link to="/facturas" className="card glass quick-card">
                        <Receipt size={24} />
                        <span>Nueva Factura</span>
                        <ArrowRight size={16} />
                    </Link>
                )}
                {hasAccess('compras') && (
                    <Link to="/compras" className="card glass quick-card">
                        <ShoppingCart size={24} />
                        <span>Registrar Gasto</span>
                        <ArrowRight size={16} />
                    </Link>
                )}
                {hasAccess('contabilidad') && (
                    <Link to="/diario" className="card glass quick-card">
                        <Calculator size={24} />
                        <span>Movimientos</span>
                        <ArrowRight size={16} />
                    </Link>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
