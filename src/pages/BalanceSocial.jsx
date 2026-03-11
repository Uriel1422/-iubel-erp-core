import React, { useState } from 'react';
import { useBalanceSocial } from '../context/BalanceSocialContext';
import { Users, TrendingUp, Heart, Briefcase, DollarSign, Globe, BarChart3, ArrowUp, Calendar, Target, FileSpreadsheet } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { exportToExcel } from '../utils/exportUtils';

const Stat = ({ label, value, icon, color = 'var(--primary)', bg = 'var(--primary-light)', sub }) => (
    <div className="card" style={{ padding: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
        <div style={{ width: 48, height: 48, borderRadius: '12px', background: bg, color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{icon}</div>
        <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.3rem' }}>{label}</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color }}>{value}</div>
            {sub && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{sub}</div>}
        </div>
    </div>
);

const BalanceSocial = () => {
    const { indicadores, updateIndicadores } = useBalanceSocial();
    const [tab, setTab] = useState(0);
    const f = v => new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP', notation: 'compact', maximumFractionDigits: 1 }).format(v);
    const fNum = v => new Intl.NumberFormat('es-DO').format(v);

    const TABS = ['Resumen Ejecutivo', 'Indicadores Sociales', 'Empleo y Género', 'Impacto Comunitario'];

    const generoData = [
        { name: 'Femenino', value: indicadores.socios.generoFemenino },
        { name: 'Masculino', value: indicadores.socios.generoMasculino },
    ];

    const edadData = [
        { name: '< 35', socios: indicadores.socios.menores35 },
        { name: '35-55', socios: indicadores.socios.entre35y55 },
        { name: '> 55', socios: indicadores.socios.mayores55 },
    ];

    const empleoData = [
        { name: 'Mujeres', value: indicadores.empleo.empleadosFemeninos },
        { name: 'Hombres', value: indicadores.empleo.empleadosMasculinos },
    ];

    const COLORS = ['#8b5cf6', '#2563eb', '#10b981', '#f59e0b'];

    const handleExportExcel = () => {
        const data = [
            { 'Categoría': 'Total Socios', 'Valor': indicadores.socios.total },
            { 'Categoría': 'Socios Activos', 'Valor': indicadores.socios.activos },
            { 'Categoría': 'Nuevos', 'Valor': indicadores.socios.nuevos },
            { 'Categoría': 'Retirados', 'Valor': indicadores.socios.retirados },
            { 'Categoría': 'Masculino', 'Valor': indicadores.socios.generoMasculino },
            { 'Categoría': 'Femenino', 'Valor': indicadores.socios.generoFemenino },
            { 'Categoría': '< 35', 'Valor': indicadores.socios.menores35 },
            { 'Categoría': '35-55', 'Valor': indicadores.socios.entre35y55 },
            { 'Categoría': '> 55', 'Valor': indicadores.socios.mayores55 },
            
            { 'Categoría': 'Capital Social', 'Valor': indicadores.financiero.capitalSocial },
            { 'Categoría': 'Total Activos', 'Valor': indicadores.financiero.totalActivos },
            { 'Categoría': 'Cartera Préstamos', 'Valor': indicadores.financiero.carteraPrestamos },
            { 'Categoría': 'Ahorros', 'Valor': indicadores.financiero.ahorros },
            { 'Categoría': 'Excedentes', 'Valor': indicadores.financiero.excedentes },
            { 'Categoría': 'Retorno Socios', 'Valor': indicadores.financiero.retornoSocios },
            
            { 'Categoría': 'Empleados', 'Valor': indicadores.empleo.totalEmpleados },
            { 'Categoría': 'Salario Promedio', 'Valor': indicadores.empleo.salarioPromedio },
            { 'Categoría': 'Horas Capacitación', 'Valor': indicadores.empleo.capacitacionesHoras },
            { 'Categoría': 'Inversión Social', 'Valor': indicadores.impactoSocial.inversionSocial },
        ];
        exportToExcel(data, `Balance_Social_${indicadores.anio}`, 'Indicadores');
    };

    return (
        <div className="animate-up">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
                <div>
                    <h1 className="page-title" style={{ marginBottom: '0.25rem' }}>Balance Social</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Indicadores cooperativos de impacto social y bienestar — Período {indicadores.anio}</p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <div style={{ padding: '0.5rem 1rem', background: 'rgba(16,185,129,0.1)', color: 'var(--success)', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Calendar size={14} /> Año {indicadores.anio}
                    </div>
                    <button className="btn btn-secondary" onClick={() => window.print()}><BarChart3 size={16} /> PDF</button>
                    <button className="btn btn-primary" onClick={handleExportExcel}><FileSpreadsheet size={16} /> Excel</button>
                </div>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 0, borderBottom: '2px solid var(--border)', marginBottom: '2rem' }}>
                {TABS.map((t, i) => (
                    <button key={i} onClick={() => setTab(i)} style={{ padding: '0.85rem 1.5rem', fontWeight: 600, fontSize: '0.875rem', borderBottom: tab === i ? '2px solid var(--primary)' : 'none', color: tab === i ? 'var(--primary)' : 'var(--text-muted)', background: 'none', cursor: 'pointer', marginBottom: '-2px', whiteSpace: 'nowrap' }}>{t}</button>
                ))}
            </div>

            {tab === 0 && (
                <>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem', marginBottom: '2rem' }}>
                        <Stat label="Total Socios Activos" value={fNum(indicadores.socios.activos)} icon={<Users size={22} />} sub={`+${indicadores.socios.nuevos} nuevos este año`} />
                        <Stat label="Capital Social" value={f(indicadores.financiero.capitalSocial)} icon={<DollarSign size={22} />} color="var(--success)" bg="rgba(16,185,129,0.1)" />
                        <Stat label="Excedentes Generados" value={f(indicadores.financiero.excedentes)} icon={<TrendingUp size={22} />} color="#8b5cf6" bg="rgba(139,92,246,0.1)" />
                        <Stat label="Retorno a Socios" value={f(indicadores.financiero.retornoSocios)} icon={<Heart size={22} />} color="var(--danger)" bg="rgba(239,68,68,0.1)" sub="Distribución de excedentes" />
                        <Stat label="Inversión Social" value={f(indicadores.impactoSocial.inversionSocial)} icon={<Globe size={22} />} color="var(--warning)" bg="rgba(245,158,11,0.1)" />
                        <Stat label="Préstamos Otorgados" value={fNum(indicadores.servicios.prestamosOtorgados)} icon={<Target size={22} />} sub={`${f(indicadores.servicios.montoPrestamoTotal)} en cartera`} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <div className="card glass">
                            <h3 style={{ marginBottom: '1.25rem', fontSize: '1rem', fontWeight: 700 }}>Composición por Género (Socios)</h3>
                            <div style={{ height: 200, position: 'relative', minHeight: '200px' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart><Pie data={generoData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" isAnimationActive={false}>
                                        {generoData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                                    </Pie><Tooltip /></PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginTop: '0.5rem' }}>
                                {generoData.map((d, i) => <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}><div style={{ width: 10, height: 10, borderRadius: '50%', background: COLORS[i] }} />{d.name}: <strong>{d.value}</strong></div>)}
                            </div>
                        </div>
                        <div className="card glass">
                            <h3 style={{ marginBottom: '1.25rem', fontSize: '1rem', fontWeight: 700 }}>Distribución por Edad</h3>
                            <div style={{ height: 200, position: 'relative', minHeight: '200px' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={edadData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                        <YAxis axisLine={false} tickLine={false} />
                                        <Tooltip contentStyle={{ background: 'var(--bg-card)', border: 'none', borderRadius: '8px' }} />
                                        <Bar dataKey="socios" fill="var(--primary)" radius={[6, 6, 0, 0]} isAnimationActive={false} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {tab === 1 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
                    {[
                        {
                            titulo: '👥 Indicadores de Socios', datos: [
                                ['Total Socios', fNum(indicadores.socios.total)],
                                ['Socios Activos', fNum(indicadores.socios.activos)],
                                ['Nuevos este Año', `+${indicadores.socios.nuevos}`],
                                ['Retiros', indicadores.socios.retirados],
                                ['% Retención', `${((indicadores.socios.activos / indicadores.socios.total) * 100).toFixed(1)}%`],
                            ]
                        },
                        {
                            titulo: '💰 Indicadores Financieros', datos: [
                                ['Capital Social', f(indicadores.financiero.capitalSocial)],
                                ['Total Activos', f(indicadores.financiero.totalActivos)],
                                ['Cartera Préstamos', f(indicadores.financiero.carteraPrestamos)],
                                ['Captaciones', f(indicadores.financiero.ahorros)],
                                ['Excedentes', f(indicadores.financiero.excedentes)],
                            ]
                        },
                        {
                            titulo: '🏦 Servicios Prestados', datos: [
                                ['Préstamos Otorgados', fNum(indicadores.servicios.prestamosOtorgados)],
                                ['Monto Total Préstamos', f(indicadores.servicios.montoPrestamoTotal)],
                                ['Ahorradores Activos', fNum(indicadores.servicios.ahorradoresActivos)],
                                ['Solicitudes Atendidas', fNum(indicadores.servicios.solicitudesAtendidas)],
                                ['Tiempo Prom. Atención', `${indicadores.servicios.tiempoPromedioAtencion} min`],
                            ]
                        },
                        {
                            titulo: '🌱 Impacto Social', datos: [
                                ['Inversión Social', f(indicadores.impactoSocial.inversionSocial)],
                                ['Beneficiarios Directos', fNum(indicadores.impactoSocial.beneficiariosDirectos)],
                                ['Proyectos Comunitarios', indicadores.impactoSocial.proyectosComunitarios],
                                ['Becarios Apoyados', indicadores.impactoSocial.becariosApoyados],
                                ['Donaciones a ONG', f(indicadores.impactoSocial.doacionesONG)],
                            ]
                        },
                    ].map((panel, i) => (
                        <div key={i} className="card">
                            <h3 style={{ fontWeight: 700, marginBottom: '1.25rem' }}>{panel.titulo}</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {panel.datos.map(([label, val], j) => (
                                    <div key={j} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border)' }}>
                                        <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{label}</span>
                                        <span style={{ fontWeight: 700, color: 'var(--primary)' }}>{val}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {tab === 2 && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    <div className="card">
                        <h3 style={{ fontWeight: 700, marginBottom: '1.5rem' }}>👩‍💼 Equipo de Trabajo</h3>
                        {[
                            ['Total Empleados', indicadores.empleo.totalEmpleados],
                            ['Mujeres', `${indicadores.empleo.empleadosFemeninos} (${((indicadores.empleo.empleadosFemeninos / indicadores.empleo.totalEmpleados) * 100).toFixed(0)}%)`],
                            ['Hombres', `${indicadores.empleo.empleadosMasculinos} (${((indicadores.empleo.empleadosMasculinos / indicadores.empleo.totalEmpleados) * 100).toFixed(0)}%)`],
                            ['Nuevos Empleos Generados', `+${indicadores.empleo.nuevosEmpleos}`],
                            ['Salario Promedio Mensual', f(indicadores.empleo.salarioPromedio)],
                            ['Horas de Capacitación', `${indicadores.empleo.capacitacionesHoras}h`],
                        ].map(([l, v], j) => (
                            <div key={j} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: '1px solid var(--border)' }}>
                                <span style={{ color: 'var(--text-muted)' }}>{l}</span>
                                <span style={{ fontWeight: 700, color: 'var(--primary)' }}>{v}</span>
                            </div>
                        ))}
                    </div>
                    <div className="card glass">
                        <h3 style={{ fontWeight: 700, marginBottom: '1.5rem' }}>Empleos por Género</h3>
                        <div style={{ height: 200, position: 'relative', minHeight: '200px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart><Pie data={empleoData} cx="50%" cy="50%" outerRadius={80} dataKey="value" isAnimationActive={false}>
                                    {empleoData.map((_, i) => <Cell key={i} fill={['#8b5cf6', '#2563eb'][i]} />)}
                                </Pie><Tooltip /></PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginTop: '1rem' }}>
                            {empleoData.map((d, i) => <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}><div style={{ width: 10, height: 10, borderRadius: '50%', background: ['#8b5cf6', '#2563eb'][i] }} />{d.name}: <strong>{d.value}</strong></div>)}
                        </div>
                    </div>
                </div>
            )}

            {tab === 3 && (
                <div style={{ display: 'grid', gap: '1.25rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem', marginBottom: '1rem' }}>
                        {[
                            ['🌍 Beneficiarios Directos', fNum(indicadores.impactoSocial.beneficiariosDirectos), 'personas impactadas'],
                            ['🏘️ Proyectos Comunitarios', indicadores.impactoSocial.proyectosComunitarios, 'proyectos activos'],
                            ['🎓 Becas Otorgadas', indicadores.impactoSocial.becariosApoyados, 'estudiantes apoyados'],
                        ].map(([lab, val, sub], i) => (
                            <div key={i} className="card glass" style={{ textAlign: 'center', padding: '1.5rem' }}>
                                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '0.25rem' }}>{val}</div>
                                <div style={{ fontWeight: 700, marginBottom: '0.15rem' }}>{lab}</div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{sub}</div>
                            </div>
                        ))}
                    </div>
                    <div className="card">
                        <h3 style={{ fontWeight: 700, marginBottom: '1.25rem' }}>📅 Actividades de Impacto Social</h3>
                        <div style={{ display: 'grid', gap: '0.75rem' }}>
                            {indicadores.impactoSocial.actividades.map((act, i) => (
                                <div key={i} style={{ display: 'flex', gap: '1rem', alignItems: 'center', padding: '1rem', background: 'var(--background)', borderRadius: '10px' }}>
                                    <div style={{ width: 40, height: 40, borderRadius: '10px', background: 'rgba(139,92,246,0.1)', color: '#8b5cf6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0 }}>{i + 1}</div>
                                    <div style={{ flex: 1 }}><div style={{ fontWeight: 600 }}>{act.nombre}</div><div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{act.fecha}</div></div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--success)', fontWeight: 700 }}><Users size={15} /> {act.beneficiarios} beneficiarios</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BalanceSocial;
