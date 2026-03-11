import React, { useState } from 'react';
import { useCaja } from '../context/CajaContext';
import {
    Banknote, Search, Printer, XCircle, CheckCircle,
    FileText, ShieldAlert, CreditCard, LayoutTemplate,
    Landmark, ArrowRightLeft, AlertTriangle, BarChart
} from 'lucide-react';

const TABS = [
    { id: 'operaciones', label: 'Operaciones', icon: LayoutTemplate },
    { id: 'pagos', label: 'Pagos', icon: CreditCard },
    { id: 'documentos', label: 'Documentos', icon: FileText },
    { id: 'bovedas', label: 'Bóvedas', icon: Landmark },
    { id: 'transacciones', label: 'Transacciones', icon: ArrowRightLeft },
    { id: 'incidencias', label: 'Incidencias', icon: ShieldAlert },
    { id: 'informes', label: 'Informes', icon: BarChart },
];

const CajaBoveda = () => {
    const { recibos, anularRecibo } = useCaja();
    const [activeTab, setActiveTab] = useState('operaciones');
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('Todos');

    const formatMoney = (amount) => new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP' }).format(amount || 0);

    const filtrados = recibos.filter(r => {
        const matchesSearch = r.numero.toLowerCase().includes(searchTerm.toLowerCase()) || r.cliente.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filter === 'Todos' || r.estado === filter;
        return matchesSearch && matchesFilter;
    });

    const renderEmptyTab = (title, desc) => {
        const Icon = TABS.find(t => t.id === activeTab)?.icon;
        return (
            <div className="animate-fade-in" style={{ padding: '3rem', textAlign: 'center' }}>
                <div style={{ width: 64, height: 64, margin: '0 auto 1.5rem', background: 'var(--primary-light)', color: 'var(--primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {Icon && <Icon size={32} />}
                </div>
                <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{title}</h2>
                <p style={{ color: 'var(--text-muted)' }}>{desc}</p>
            </div>
        );
    };

    return (
        <div className="animate-up" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                <div>
                    <h1 className="page-title" style={{ marginBottom: '0.25rem' }}>Caja y Bóveda</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Administración integral de tesorería, operaciones de caja e incidencias</p>
                </div>
            </div>

            {/* Ribbon-like Tabs */}
            <div className="card" style={{ padding: '0.5rem', marginBottom: '1.5rem', display: 'flex', gap: '0.5rem', overflowX: 'auto', whiteSpace: 'nowrap' }}>
                {TABS.map(tab => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '0.75rem 1rem',
                                border: 'none',
                                background: isActive ? 'var(--primary-light)' : 'transparent',
                                color: isActive ? 'var(--primary)' : 'var(--text-muted)',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                minWidth: '100px'
                            }}
                        >
                            <Icon size={22} strokeWidth={isActive ? 2.5 : 1.5} />
                            <span style={{ fontSize: '0.75rem', fontWeight: isActive ? 700 : 500 }}>
                                {tab.label}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* Tab Contents */}
            <div className="card" style={{ flex: 1, overflowY: 'auto', padding: activeTab === 'operaciones' ? '1.5rem 0 0 0' : '1.5rem' }}>
                {activeTab === 'operaciones' && (
                    <div className="animate-fade-in">
                        <div style={{ padding: '0 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', width: '100%' }}>
                                <div style={{ padding: '1.25rem', borderLeft: '4px solid var(--success)', background: '#f8fafc', borderRadius: '8px' }}>
                                    <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Ingresos Hoy</div>
                                    <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>{formatMoney(recibos.reduce((acc, r) => r.estado === 'Valido' ? acc + r.monto : acc, 0))}</div>
                                </div>
                                <div style={{ padding: '1.25rem', borderLeft: '4px solid var(--primary)', background: '#f8fafc', borderRadius: '8px' }}>
                                    <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Recibos Emitidos</div>
                                    <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>{recibos.length}</div>
                                </div>
                                <div style={{ padding: '1.25rem', borderLeft: '4px solid var(--warning)', background: '#f8fafc', borderRadius: '8px' }}>
                                    <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Caja Activa</div>
                                    <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.2rem' }}><CheckCircle size={16} /> CAJA-01</div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                                    <div style={{ position: 'relative', width: '100%' }}>
                                        <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                        <input type="text" placeholder="Buscar recibo..." className="input-field" style={{ paddingLeft: '2.5rem', marginBottom: 0 }} value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div style={{ borderTop: '1px solid var(--border)' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ textAlign: 'left', background: 'var(--background)', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                                        <th style={{ padding: '1rem 1.5rem' }}>Número</th>
                                        <th style={{ padding: '1rem' }}>Fecha</th>
                                        <th style={{ padding: '1rem' }}>Socio / Cliente</th>
                                        <th style={{ padding: '1rem' }}>Concepto</th>
                                        <th style={{ padding: '1rem', textAlign: 'right' }}>Monto</th>
                                        <th style={{ padding: '1rem', textAlign: 'center' }}>Estado</th>
                                        <th style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtrados.length === 0 ? (
                                        <tr><td colSpan={7} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>No se encontraron recibos de operaciones.</td></tr>
                                    ) : (
                                        filtrados.slice().reverse().map(r => (
                                            <tr key={r.id} style={{ borderBottom: '1px solid var(--border)', opacity: r.estado === 'Anulado' ? 0.6 : 1 }}>
                                                <td style={{ padding: '1rem 1.5rem', fontWeight: 700 }}>{r.numero}</td>
                                                <td style={{ padding: '1rem', fontSize: '0.85rem' }}>{new Date(r.fecha).toLocaleDateString()}</td>
                                                <td style={{ padding: '1rem', fontSize: '0.85rem', fontWeight: 500 }}>{r.cliente}</td>
                                                <td style={{ padding: '1rem', fontSize: '0.85rem' }}>{r.concepto}</td>
                                                <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 800 }}>{formatMoney(r.monto)}</td>
                                                <td style={{ padding: '1rem', textAlign: 'center' }}>
                                                    <span style={{ padding: '0.25rem 0.6rem', borderRadius: '1rem', fontSize: '0.7rem', fontWeight: 800, background: r.estado === 'Valido' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: r.estado === 'Valido' ? 'var(--success)' : 'var(--danger)' }}>{r.estado}</span>
                                                </td>
                                                <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                                                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                                        <button className="btn btn-secondary" style={{ padding: '0.4rem' }}><Printer size={16} /></button>
                                                        {r.estado === 'Valido' && (
                                                            <button className="btn btn-secondary" style={{ padding: '0.4rem', color: 'var(--danger)' }} onClick={() => { const m = prompt('Motivo:'); if (m) anularRecibo(r.id, m); }}>
                                                                <XCircle size={16} />
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'pagos' && renderEmptyTab('Gestión de Pagos por Caja', 'Módulo para registrar salidas de efectivo, pagos de cheques y desembolsos directos.')}
                {activeTab === 'documentos' && renderEmptyTab('Gestión Documental', 'Archivo de cuadres, comprobantes firmados y documentos de respaldo de la jornada.')}
                {activeTab === 'bovedas' && (
                    <div className="animate-fade-in" style={{ textAlign: 'center', padding: '3rem' }}>
                        <Landmark size={48} style={{ color: 'var(--primary)', opacity: 0.5, marginBottom: '1rem' }} />
                        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Gestión de Bóveda Central</h2>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Acceso directo al control de custodia de valores y reservas.</p>
                        <button className="btn btn-primary" onClick={() => window.location.href = '/boveda'}>Ir a Bóveda Central ⇾</button>
                    </div>
                )}
                {activeTab === 'transacciones' && renderEmptyTab('Diario de Transacciones', 'Bitácora completa y auditable de todos los eventos ocurridos en caja.')}
                {activeTab === 'incidencias' && renderEmptyTab('Registro de Incidencias', 'Reporte de sobrantes, faltantes y errores de cuadre con seguimiento.')}
                {activeTab === 'informes' && renderEmptyTab('Informes de Tesorería', 'Generación de reportes de final del día, arqueos y resúmenes de movimiento.')}
            </div>
        </div>
    );
};

export default CajaBoveda;
