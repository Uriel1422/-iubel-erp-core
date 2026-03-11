import React, { useState } from 'react';
import { useSegmentacion } from '../context/SegmentacionContext';
import {
    Users, Map, Globe, Flag, MapPin, Navigation,
    Share2, Activity, UserMinus, Briefcase, Coins,
    UserCheck, GraduationCap, Gavel, BarChart2
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

const TABS = [
    { id: 'dashboard', label: 'Dashboard Analítico', icon: BarChart2 },
    { id: 'areas', label: 'Áreas', icon: Share2 },
    { id: 'paises', label: 'Países', icon: Globe },
    { id: 'ciudades', label: 'Ciudades', icon: MapPin },
    { id: 'regiones', label: 'Regiones', icon: Map },
    { id: 'sectores', label: 'Sectores', icon: Navigation },
    { id: 'distritos', label: 'Distritos', icon: Flag },
    { id: 'condicion', label: 'Cond. Socio', icon: Users },
    { id: 'seguimiento', label: 'Est. Seguimiento', icon: Activity },
    { id: 'desafiliacion', label: 'Mot. Desafiliación', icon: UserMinus },
    { id: 'fondos', label: 'Fondos', icon: Briefcase },
    { id: 'monedas', label: 'Monedas', icon: Coins },
    { id: 'oficiales', label: 'Oficiales', icon: UserCheck },
    { id: 'profesiones', label: 'Profesiones', icon: GraduationCap },
    { id: 'abogados', label: 'Cobros Abogado', icon: Gavel },
];

const Segmentacion = () => {
    const { segmentos, sociosSegmentados } = useSegmentacion();
    const [activeTab, setActiveTab] = useState('dashboard');

    const totalSocios = segmentos.reduce((acc, s) => acc + (s.totalSocios || 0), 0);
    const SEG_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'];
    const pieData = segmentos.map((s, i) => ({ name: s.nombre, value: s.totalSocios, color: SEG_COLORS[i] || '#64748b' }));

    const renderEmptyCatalog = (title, description) => {
        const Icon = TABS.find(t => t.id === activeTab)?.icon;
        return (
            <div className="animate-fade-in" style={{ padding: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: 0 }}>
                        {Icon && <Icon size={24} className="text-primary" />}
                        Mantenimiento de {title}
                    </h3>
                    <button className="btn btn-primary">Añadir Nuevo</button>
                </div>
                <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>{description}</p>

                <div style={{ border: '1px dashed var(--border)', borderRadius: '12px', padding: '4rem', textAlign: 'center', background: '#f8fafc' }}>
                    <p style={{ color: 'var(--text-muted)', margin: 0 }}>Catálogo de <strong>{title}</strong> actualmente vacío u operando con datos por defecto.</p>
                </div>
            </div>
        );
    };

    return (
        <div className="animate-up" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                <div>
                    <h1 className="page-title" style={{ marginBottom: '0.25rem' }}>Segmentación y Parámetros</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Configuración de catálogos y análisis de cartera de socios</p>
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
                                minWidth: '95px'
                            }}
                        >
                            <Icon size={22} strokeWidth={isActive ? 2.5 : 1.5} />
                            <span style={{ fontSize: '0.7rem', fontWeight: isActive ? 700 : 500 }}>
                                {tab.label}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* Tab Contents */}
            <div className="card" style={{ flex: 1, overflowY: 'auto', padding: activeTab === 'dashboard' ? '1.5rem' : 0 }}>
                {activeTab === 'dashboard' && (
                    <div className="animate-fade-in">
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
                            {segmentos.map((seg, i) => (
                                <div key={seg.id} className="card" style={{ borderLeft: `4px solid ${SEG_COLORS[i]}`, background: 'var(--bg-card)', padding: '1.25rem' }}>
                                    <div style={{ fontSize: '1.75rem', fontWeight: 800, color: SEG_COLORS[i], marginBottom: '0.25rem' }}>{seg.totalSocios}</div>
                                    <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{seg.nombre}</div>
                                </div>
                            ))}
                        </div>
                        <div style={{ height: 300 }}>
                            <h3 style={{ fontWeight: 700, marginBottom: '1rem', fontSize: '1rem' }}>Distribución de Cartera Total ({totalSocios})</h3>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={70} outerRadius={110} dataKey="value" label>
                                        {pieData.map((_, i) => <Cell key={i} fill={SEG_COLORS[i]} />)}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}

                {activeTab === 'areas' && renderEmptyCatalog('Áreas Geográficas / Negocio', 'Define las grandes áreas para agrupar sucursales y regiones.')}
                {activeTab === 'paises' && renderEmptyCatalog('Países', 'Gestión de países de residencia o nacionalidad de los socios.')}
                {activeTab === 'ciudades' && renderEmptyCatalog('Ciudades', 'Catálogo de provincias y ciudades principales.')}
                {activeTab === 'regiones' && renderEmptyCatalog('Regiones', 'Asignación de zonas (Norte, Sur, Este, Oeste).')}
                {activeTab === 'sectores' && renderEmptyCatalog('Sectores', 'Distribución de barrios y sectores urbanos/rurales.')}
                {activeTab === 'distritos' && renderEmptyCatalog('Distritos', 'Divisiones administrativas menores.')}
                {activeTab === 'condicion' && renderEmptyCatalog('Condición del Socio', 'Tipificación de estados (Activo, Funcionario, Empleado, Especial).')}
                {activeTab === 'seguimiento' && renderEmptyCatalog('Estados de Seguimiento', 'Fases de los procesos jurídicos o de cobro.')}
                {activeTab === 'desafiliacion' && renderEmptyCatalog('Motivos de Desafiliación', 'Estadísticas de por qué los socios salen de la cooperativa.')}
                {activeTab === 'fondos' && renderEmptyCatalog('Fondos de Origen', 'Procedencia de los recursos crediticios.')}
                {activeTab === 'monedas' && renderEmptyCatalog('Monedas', 'Tipos de cambio y divisas soportadas (DOP, USD, EUR).')}
                {activeTab === 'oficiales' && renderEmptyCatalog('Oficiales de Cuenta', 'Asesores de crédito/negocios asignados a socios.')}
                {activeTab === 'profesiones' && renderEmptyCatalog('Profesiones y Oficios', 'Catálogo utilizado para la matriz de riesgos AML/CFT.')}
                {activeTab === 'abogados' && renderEmptyCatalog('Tarifas de Cobro Legal', 'Listado de bufetes y costos por etapa de demanda.')}
            </div>
        </div>
    );
};

export default Segmentacion;
