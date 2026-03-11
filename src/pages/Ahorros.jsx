import React, { useState } from 'react';
import {
    Wallet, Plus, ArrowUpRight, ArrowDownLeft, Search,
    Filter, CreditCard, PieChart, Clock, CheckCircle2,
    AlertCircle, TrendingUp, DollarSign, User
} from 'lucide-react';
import { useAhorros } from '../context/AhorrosContext';
import { useSocios } from '../context/SociosContext';

const Ahorros = () => {
    const { cuentas, movimientos, abrirCuenta, registrarMovimiento } = useAhorros();
    const { socios } = useSocios();
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('cuentas');
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState('apertura'); // apertura, deposito, retiro

    // KPIs
    const totalAhorros = cuentas.reduce((acc, c) => acc + c.balance, 0);
    const totalAportaciones = cuentas.filter(c => c.tipo === 'Aportaciones').reduce((acc, c) => acc + c.balance, 0);
    const cuentasActivas = cuentas.filter(c => c.estado === 'Activa').length;

    const formatCurrency = (val) => new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP' }).format(val);

    const filteredCuentas = cuentas.filter(c =>
        c.socioNombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.numero.includes(searchTerm)
    );

    return (
        <div className="page-container" style={{ padding: '2rem', background: '#f8fafc', minHeight: '100vh' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.25rem' }}>Gestión de Ahorros y Captaciones</h1>
                    <p style={{ color: '#64748b' }}>Administración de aportaciones, ahorros retirables y certificados a plazo.</p>
                </div>
                <button
                    onClick={() => { setModalType('apertura'); setShowModal(true); }}
                    className="btn-primary"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', borderRadius: '12px' }}
                >
                    <Plus size={20} /> Nueva Cuenta
                </button>
            </div>

            {/* KPIs Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                <KpiCard icon={<Wallet color="#3b82f6" />} label="Total en Ahorros" value={formatCurrency(totalAhorros)} trend="+4.2%" color="#3b82f6" />
                <KpiCard icon={<DollarSign color="#10b981" />} label="Capital Social (Aportes)" value={formatCurrency(totalAportaciones)} trend="+1.5%" color="#10b981" />
                <KpiCard icon={<CheckCircle2 color="#8b5cf6" />} label="Cuentas Activas" value={cuentasActivas} trend={`${cuentas.length} total`} color="#8b5cf6" />
                <KpiCard icon={<TrendingUp color="#f59e0b" />} label="Intereses Proyectados" value={formatCurrency(totalAhorros * 0.04)} trend="Est. Anual" color="#f59e0b" />
            </div>

            {/* Main Content */}
            <div className="card" style={{ padding: '0', overflow: 'hidden', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
                <div style={{ borderBottom: '1px solid #e2e8f0', padding: '1rem 1.5rem', display: 'flex', gap: '2rem' }}>
                    <TabButton active={activeTab === 'cuentas'} onClick={() => setActiveTab('cuentas')} label="Cuentas de Ahorro" />
                    <TabButton active={activeTab === 'movimientos'} onClick={() => setActiveTab('movimientos')} label="Historial de Movimientos" />
                    <TabButton active={activeTab === 'tasas'} onClick={() => setActiveTab('tasas')} label="Configuración de Tasas" />
                </div>

                <div style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                        <div style={{ position: 'relative', width: '300px' }}>
                            <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={18} />
                            <input
                                type="text"
                                placeholder="Buscar por socio o número..."
                                className="form-input"
                                style={{ paddingLeft: '2.5rem', width: '100%' }}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Filter size={18} /> Filtros
                        </button>
                    </div>

                    {activeTab === 'cuentas' && (
                        <div style={{ overflowX: 'auto' }}>
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Socio / Cliente</th>
                                        <th>No. Cuenta</th>
                                        <th>Tipo</th>
                                        <th>Balance</th>
                                        <th>Tasa</th>
                                        <th>Estado</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredCuentas.map(cuenta => (
                                        <tr key={cuenta.id}>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 600 }}>
                                                        {cuenta.socioNombre.substring(0, 2).toUpperCase()}
                                                    </div>
                                                    <span style={{ fontWeight: 600 }}>{cuenta.socioNombre}</span>
                                                </div>
                                            </td>
                                            <td style={{ fontFamily: 'monospace', color: '#64748b' }}>{cuenta.numero}</td>
                                            <td>
                                                <span className={`badge badge-${cuenta.tipo === 'Plazo Fijo' ? 'warning' : 'info'}`}>
                                                    {cuenta.tipo}
                                                </span>
                                            </td>
                                            <td style={{ fontWeight: 700, color: '#0f172a' }}>{formatCurrency(cuenta.balance)}</td>
                                            <td>{cuenta.tasa}%</td>
                                            <td>
                                                <span className={`status-pill ${cuenta.estado === 'Activa' ? 'status-active' : 'status-pending'}`}>
                                                    {cuenta.estado}
                                                </span>
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                    <button onClick={() => { setModalType('deposito'); setShowModal(true); }} className="action-btn" title="Depósito"><ArrowDownLeft size={16} color="#10b981" /></button>
                                                    <button onClick={() => { setModalType('retiro'); setShowModal(true); }} className="action-btn" title="Retiro"><ArrowUpRight size={16} color="#ef4444" /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {activeTab === 'movimientos' && (
                        <div style={{ overflowX: 'auto' }}>
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Fecha</th>
                                        <th>No. Cuenta</th>
                                        <th>Tipo</th>
                                        <th>Monto</th>
                                        <th>Nota</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {movimientos.map(m => (
                                        <tr key={m.id}>
                                            <td style={{ color: '#64748b' }}>{new Date(m.fecha).toLocaleDateString()}</td>
                                            <td style={{ fontFamily: 'monospace' }}>{cuentas.find(c => c.id === m.cuentaId)?.numero}</td>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    {m.tipo === 'Deposito' ? <ArrowDownLeft size={14} color="#10b981" /> : <ArrowUpRight size={14} color="#ef4444" />}
                                                    <span style={{ fontWeight: 500 }}>{m.tipo}</span>
                                                </div>
                                            </td>
                                            <td style={{ fontWeight: 600, color: m.tipo === 'Deposito' ? '#10b981' : '#ef4444' }}>
                                                {m.tipo === 'Deposito' ? '+' : '-'}{formatCurrency(m.monto)}
                                            </td>
                                            <td style={{ color: '#64748b', fontSize: '0.875rem' }}>{m.nota}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal Simulado */}
            {showModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div className="card" style={{ width: '450px', padding: '2rem' }}>
                        <h2 style={{ marginBottom: '1.5rem', textTransform: 'capitalize' }}>{modalType.replace('_', ' ')}</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div className="form-group">
                                <label className="form-label">Socio</label>
                                <select className="form-input">
                                    {socios.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
                                </select>
                            </div>
                            {modalType === 'apertura' && (
                                <div className="form-group">
                                    <label className="form-label">Tipo de Cuenta</label>
                                    <select className="form-input">
                                        <option>Aportaciones</option>
                                        <option>Ahorro Retirable</option>
                                        <option>Plazo Fijo</option>
                                    </select>
                                </div>
                            )}
                            <div className="form-group">
                                <label className="form-label">Monto</label>
                                <input type="number" className="form-input" placeholder="0.00" />
                            </div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
                            <button className="btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                            <button className="btn-primary" onClick={() => setShowModal(false)}>Guardar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const KpiCard = ({ icon, label, value, trend, color }) => (
    <div className="card" style={{ padding: '1.5rem', border: 'none', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
        <div style={{ padding: '0.75rem', background: `${color}15`, borderRadius: '12px' }}>
            {icon}
        </div>
        <div>
            <p style={{ fontSize: '0.875rem', color: '#64748b', fontWeight: 500, marginBottom: '0.25rem' }}>{label}</p>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e293b' }}>{value}</h3>
            <span style={{ fontSize: '0.75rem', color: '#10b981', background: '#dcfce7', padding: '0.125rem 0.5rem', borderRadius: '4px', fontWeight: 600 }}>{trend}</span>
        </div>
    </div>
);

const TabButton = ({ active, onClick, label }) => (
    <button
        onClick={onClick}
        style={{
            padding: '0.75rem 0.5rem',
            background: 'none',
            border: 'none',
            borderBottom: active ? '2px solid #3b82f6' : '2px solid transparent',
            color: active ? '#3b82f6' : '#64748b',
            fontWeight: active ? 700 : 500,
            cursor: 'pointer',
            fontSize: '0.875rem'
        }}
    >
        {label}
    </button>
);

export default Ahorros;
