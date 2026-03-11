import React, { useMemo } from 'react';
import { useContabilidad } from '../context/ContabilidadContext';
import { TrendingUp, TrendingDown, AlertCircle, CheckCircle, DollarSign, Activity, BarChart2, Shield } from 'lucide-react';

const IndicadoresFinancieros = () => {
    const { asientos } = useContabilidad();

    const formatMoney = (amount) =>
        new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP' }).format(amount || 0);
    const formatPct = (val) => `${isNaN(val) || !isFinite(val) ? '—' : val.toFixed(1)}%`;
    const formatRatio = (val) => isNaN(val) || !isFinite(val) ? '—' : val.toFixed(2);

    const calculos = useMemo(() => {
        const saldos = {};
        asientos.forEach(a => {
            (a.detalles || []).forEach(d => {
                if (!d.cuentaId) return;
                if (!saldos[d.cuentaId]) saldos[d.cuentaId] = 0;
                saldos[d.cuentaId] += (Number(d.debito) || 0) - (Number(d.credito) || 0);
            });
        });

        const s = (codigo) => {
            let total = 0;
            Object.entries(saldos).forEach(([k, v]) => { if (k.startsWith(codigo)) total += v; });
            return Math.abs(total);
        };

        // Balance Sheet items
        const caja = s('1101');
        const cxc = s('1103');
        const inventario = s('1104');
        const activoCorr = s('110');
        const activoFijo = s('12');
        const activoTotal = activoCorr + activoFijo;
        const cxp = s('2101');
        const pasivoCorr = s('210');
        const pasivoLargo = s('220');
        const pasivoTotal = pasivoCorr + pasivoLargo;
        const patrimonio = activoTotal - pasivoTotal;

        // Income Statement items
        let ingresos = 0, costoVentas = 0, gastos = 0;
        asientos.forEach(a => {
            (a.detalles || []).forEach(d => {
                if (!d.cuentaId) return;
                if (d.cuentaId.startsWith('4')) ingresos += (Number(d.credito) || 0);
                if (d.cuentaId.startsWith('5')) costoVentas += (Number(d.debito) || 0);
                if (d.cuentaId.startsWith('6')) gastos += (Number(d.debito) || 0);
            });
        });

        const utilidadBruta = ingresos - costoVentas;
        const utilidadNeta = utilidadBruta - gastos;

        // Ratios
        const razonCorriente = pasivoCorr > 0 ? activoCorr / pasivoCorr : null;
        const pruebaAcida = pasivoCorr > 0 ? (caja + cxc) / pasivoCorr : null;
        const endeudamiento = activoTotal > 0 ? (pasivoTotal / activoTotal) * 100 : null;
        const margenBruto = ingresos > 0 ? (utilidadBruta / ingresos) * 100 : null;
        const margenNeto = ingresos > 0 ? (utilidadNeta / ingresos) * 100 : null;
        const roe = patrimonio > 0 ? (utilidadNeta / patrimonio) * 100 : null;
        const roa = activoTotal > 0 ? (utilidadNeta / activoTotal) * 100 : null;
        const rotInv = costoVentas > 0 && inventario > 0 ? costoVentas / inventario : null;
        const diasCobranza = ingresos > 0 ? (cxc / ingresos) * 365 : null;
        const diasPago = costoVentas > 0 ? (cxp / costoVentas) * 365 : null;

        return {
            kpis: { ingresos, costoVentas, utilidadBruta, gastos, utilidadNeta, activoTotal, pasivoTotal, patrimonio, caja, cxc, inventario, activoCorr, pasivoCorr },
            ratios: { razonCorriente, pruebaAcida, endeudamiento, margenBruto, margenNeto, roe, roa, rotInv, diasCobranza, diasPago }
        };
    }, [asientos]);

    const { kpis, ratios } = calculos;

    const RatioCard = ({ titulo, valor, descripcion, bueno, tipo = 'ratio', umbral, invertido = false }) => {
        const numVal = typeof valor === 'number' ? valor : null;
        let estado = 'neutral';
        if (numVal !== null && umbral !== undefined) {
            const ok = invertido ? numVal < umbral : numVal >= umbral;
            estado = ok ? 'bien' : 'alerta';
        }

        const colores = {
            bien: { bg: 'rgba(16,185,129,0.08)', border: 'var(--success)', dot: 'var(--success)' },
            alerta: { bg: 'rgba(239,68,68,0.08)', border: 'var(--danger)', dot: 'var(--danger)' },
            neutral: { bg: 'var(--bg-card)', border: 'var(--border)', dot: 'var(--text-muted)' }
        };
        const c = colores[estado];

        return (
            <div style={{ background: c.bg, border: `1px solid ${c.border}`, borderRadius: 'var(--radius-md)', padding: '1.25rem', transition: 'all 0.2s' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{titulo}</span>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: c.dot, marginTop: 4 }}></div>
                </div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: estado === 'bien' ? 'var(--success)' : estado === 'alerta' ? 'var(--danger)' : 'var(--text-main)' }}>
                    {numVal === null ? '—' : tipo === 'ratio' ? formatRatio(numVal) : tipo === 'pct' ? formatPct(numVal) : `${Math.round(numVal)} días`}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem', lineHeight: 1.5 }}>{descripcion}</div>
                {bueno && <div style={{ fontSize: '0.7rem', marginTop: '0.3rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>Ideal: {bueno}</div>}
            </div>
        );
    };

    return (
        <div className="animate-up">
            <div style={{ marginBottom: '2rem' }}>
                <h1 className="page-title" style={{ marginBottom: '0.25rem' }}>Indicadores Financieros</h1>
                <p style={{ color: 'var(--text-muted)' }}>Análisis integral de la salud financiera de tu empresa con ratios clave.</p>
            </div>

            {/* KPIs Principales */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem', marginBottom: '2rem' }}>
                {[
                    { label: 'Ingresos Totales', val: kpis.ingresos, icon: <TrendingUp size={20} color="var(--success)" />, color: 'var(--success)' },
                    { label: 'Costo de Ventas', val: kpis.costoVentas, icon: <TrendingDown size={20} color="var(--danger)" />, color: 'var(--danger)' },
                    { label: 'Utilidad Bruta', val: kpis.utilidadBruta, icon: <DollarSign size={20} color="var(--primary)" />, color: 'var(--primary)' },
                    { label: 'Utilidad Neta', val: kpis.utilidadNeta, icon: <Activity size={20} color={kpis.utilidadNeta >= 0 ? 'var(--success)' : 'var(--danger)'} />, color: kpis.utilidadNeta >= 0 ? 'var(--success)' : 'var(--danger)' },
                ].map(k => (
                    <div key={k.label} className="card" style={{ padding: '1.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{k.label}</span>
                            {k.icon}
                        </div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: k.color }}>{formatMoney(k.val)}</div>
                    </div>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
                {/* Balance Summary */}
                <div className="card" style={{ padding: '1.5rem' }}>
                    <h3 style={{ fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Shield size={18} color="var(--primary)" /> Resumen del Balance
                    </h3>
                    {[
                        { label: 'Activo Total', val: kpis.activoTotal, color: 'var(--primary)' },
                        { label: 'Pasivo Total', val: kpis.pasivoTotal, color: 'var(--danger)' },
                        { label: 'Patrimonio', val: kpis.patrimonio, color: 'var(--success)' },
                        { label: 'Caja y Banco', val: kpis.caja, color: 'var(--text-main)' },
                        { label: 'Cuentas por Cobrar', val: kpis.cxc, color: 'var(--text-main)' },
                        { label: 'Inventario', val: kpis.inventario, color: 'var(--text-main)' },
                    ].map((item, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0', borderBottom: i < 5 ? '1px solid var(--border)' : 'none' }}>
                            <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{item.label}</span>
                            <span style={{ fontWeight: 700, color: item.color }}>{formatMoney(item.val)}</span>
                        </div>
                    ))}
                </div>

                {/* Semetría Visual */}
                <div className="card" style={{ padding: '1.5rem' }}>
                    <h3 style={{ fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <BarChart2 size={18} color="var(--primary)" /> Estructura Financiera
                    </h3>
                    {kpis.activoTotal > 0 ? (
                        <>
                            {[
                                { label: 'Activo Corriente', val: kpis.activoCorr, total: kpis.activoTotal, color: '#3b82f6' },
                                { label: 'Activo Fijo', val: kpis.activoTotal - kpis.activoCorr, total: kpis.activoTotal, color: '#2563eb' },
                                { label: 'Pasivo Corriente', val: kpis.pasivoCorr, total: kpis.activoTotal, color: '#ef4444' },
                                { label: 'Pasivo LP', val: kpis.pasivoTotal - kpis.pasivoCorr, total: kpis.activoTotal, color: '#dc2626' },
                                { label: 'Patrimonio', val: Math.max(0, kpis.patrimonio), total: kpis.activoTotal, color: '#10b981' },
                            ].map(item => {
                                const pct = item.total > 0 ? (item.val / item.total) * 100 : 0;
                                return (
                                    <div key={item.label} style={{ marginBottom: '0.75rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{item.label}</span>
                                            <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{pct.toFixed(1)}%</span>
                                        </div>
                                        <div style={{ height: '8px', background: 'var(--background)', borderRadius: '4px', overflow: 'hidden' }}>
                                            <div style={{ width: `${Math.min(100, pct)}%`, height: '100%', background: item.color, borderRadius: '4px', transition: 'width 0.6s ease' }}></div>
                                        </div>
                                    </div>
                                );
                            })}
                        </>
                    ) : (
                        <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>Registra asientos para ver la estructura.</div>
                    )}
                </div>
            </div>

            {/* Ratios por categoría */}
            <div style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ fontWeight: 700, fontSize: '1.125rem', marginBottom: '1rem' }}>🔵 Ratios de Liquidez</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem' }}>
                    <RatioCard titulo="Razón Corriente" valor={ratios.razonCorriente} tipo="ratio" descripcion="Activo corriente / Pasivo corriente. Capacidad de pago a corto plazo." bueno="≥ 1.5" umbral={1.5} />
                    <RatioCard titulo="Prueba Ácida" valor={ratios.pruebaAcida} tipo="ratio" descripcion="(Caja + CxC) / Pasivo corriente. Liquidez sin inventario." bueno="≥ 1.0" umbral={1.0} />
                    <RatioCard titulo="Días de Cobranza" valor={ratios.diasCobranza} tipo="dias" descripcion="Promedio de días que tardan los clientes en pagar." bueno="< 45 días" umbral={45} invertido />
                </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ fontWeight: 700, fontSize: '1.125rem', marginBottom: '1rem' }}>🟢 Ratios de Rentabilidad</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem' }}>
                    <RatioCard titulo="Margen Bruto" valor={ratios.margenBruto} tipo="pct" descripcion="(Ingreso - Costo) / Ingreso × 100." bueno="> 30%" umbral={30} />
                    <RatioCard titulo="Margen Neto" valor={ratios.margenNeto} tipo="pct" descripcion="Utilidad neta / Ingresos × 100." bueno="> 10%" umbral={10} />
                    <RatioCard titulo="ROE" valor={ratios.roe} tipo="pct" descripcion="Retorno sobre Patrimonio." bueno="> 15%" umbral={15} />
                    <RatioCard titulo="ROA" valor={ratios.roa} tipo="pct" descripcion="Retorno sobre Activos." bueno="> 5%" umbral={5} />
                </div>
            </div>

            <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontWeight: 700, fontSize: '1.125rem', marginBottom: '1rem' }}>🔴 Ratios de Endeudamiento y Eficiencia</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem' }}>
                    <RatioCard titulo="Endeudamiento" valor={ratios.endeudamiento} tipo="pct" descripcion="Pasivo Total / Activo Total × 100. Proporción financiada con deuda." bueno="< 50%" umbral={50} invertido />
                    <RatioCard titulo="Rotación de Inventario" valor={ratios.rotInv} tipo="ratio" descripcion="Costo de Ventas / Inventario. Cuántas veces rota el inventario en el año." bueno="> 4x" umbral={4} />
                    <RatioCard titulo="Días de Pago" valor={ratios.diasPago} tipo="dias" descripcion="Promedio de días para pagar a proveedores." bueno="30-60 días" />
                </div>
            </div>

            {/* Footer Disclaimer */}
            <div style={{ padding: '1rem 1.5rem', background: 'var(--primary-light)', borderRadius: 'var(--radius-md)', fontSize: '0.8rem', color: 'var(--primary)' }}>
                ℹ️ Los indicadores se calculan automáticamente a partir de los asientos contables registrados. Los umbrales son referencias generales y pueden variar por industria.
            </div>
        </div>
    );
};

export default IndicadoresFinancieros;
