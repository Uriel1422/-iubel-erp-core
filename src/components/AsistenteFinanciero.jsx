import React, { useMemo } from 'react';
import { useContabilidad } from '../context/ContabilidadContext';
import { useCuentas } from '../context/CuentasContext';
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Zap, Brain } from 'lucide-react';

/**
 * AsistenteFinanciero – AI-powered Financial Health component
 * Analyzes KPIs in real-time and emits smart alerts/recommendations.
 */
const AsistenteFinanciero = () => {
    const { asientos } = useContabilidad();
    const { cuentas } = useCuentas();

    // Same calcularSaldo helper as Dashboard
    const calcularSaldo = (codigoBase, soloMesActual = false) => {
        let total = 0;
        if (!asientos) return 0;
        const now = new Date();
        asientos.forEach(a => {
            if (soloMesActual) {
                const f = new Date(a.fecha);
                if (f.getMonth() !== now.getMonth() || f.getFullYear() !== now.getFullYear()) return;
            }
            (a.detalles || []).forEach(d => {
                if (!d || !d.cuentaId) return;
                const cuenta = cuentas.find(c => String(c.id) === String(d.cuentaId));
                const codigo = String(cuenta?.codigo || d.cuentaId);
                if (codigo.startsWith(codigoBase)) {
                    const debe = Number(d.debito) || 0;
                    const haber = Number(d.credito) || 0;
                    total += codigoBase.startsWith('1') || codigoBase.startsWith('5') || codigoBase.startsWith('6')
                        ? (debe - haber) : (haber - debe);
                }
            });
        });
        return total;
    };

    const insights = useMemo(() => {
        const ingresos = calcularSaldo('4');
        const gastos = calcularSaldo('5') + calcularSaldo('6');
        const utilidad = ingresos - gastos;
        const margen = ingresos > 0 ? (utilidad / ingresos) * 100 : 0;
        const itbisNeto = calcularSaldo('2102', true);

        const alerts = [];
        let score = 100;

        // Regla 1: Márgenes
        if (margen < 0) {
            alerts.push({ type: 'danger', icon: AlertTriangle, title: 'Pérdidas Operativas', msg: 'Tus gastos superan tus ingresos. Revisa los centros de costo.' });
            score -= 35;
        } else if (margen < 15) {
            alerts.push({ type: 'warning', icon: TrendingDown, title: 'Margen Bajo', msg: `Margen de sólo ${margen.toFixed(1)}%. El estándar empresarial es >20%.` });
            score -= 15;
        } else {
            alerts.push({ type: 'success', icon: CheckCircle, title: 'Margen Saludable', msg: `Margen del ${margen.toFixed(1)}%. Rentabilidad operativa en zona óptima. 🎉` });
        }

        // Regla 2: ITBIS
        if (itbisNeto > 20000) {
            alerts.push({ type: 'warning', icon: AlertTriangle, title: 'ITBIS por Pagar', msg: `Tienes DOP ${new Intl.NumberFormat('es-DO').format(itbisNeto)} de ITBIS pendiente este mes. Recuerda pagar antes del 20.` });
            score -= 10;
        }

        // Regla 3: Ingresos
        if (ingresos === 0) {
            alerts.push({ type: 'info', icon: Zap, title: 'Sin Movimientos', msg: 'No hay ingresos registrados aún. Registra facturas para ver el análisis completo.' });
            score = 50;
        }

        // Regla 4: Gastos desproporcionados
        if (ingresos > 0 && gastos / ingresos > 0.85) {
            alerts.push({ type: 'warning', icon: TrendingDown, title: 'Gastos Elevados', msg: `Los gastos representan el ${((gastos / ingresos) * 100).toFixed(0)}% de los ingresos. Revisa nómina y operaciones.` });
            score -= 15;
        }

        score = Math.max(0, Math.min(100, score));

        return { alerts, score, margen, ingresos, gastos, utilidad };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [asientos, cuentas]);

    const scoreColor = insights.score >= 80 ? 'var(--success)' : insights.score >= 55 ? 'var(--warning)' : 'var(--danger)';
    const scoreLabel = insights.score >= 80 ? 'EXCELENTE' : insights.score >= 55 ? 'MODERADO' : 'CRÍTICO';

    const colorMap = { danger: 'var(--danger)', warning: 'var(--warning)', success: 'var(--success)', info: 'var(--primary)' };

    return (
        <div className="card glass animate-up" style={{
            marginBottom: '2rem',
            borderLeft: '4px solid var(--accent)',
            background: 'linear-gradient(135deg, rgba(124,58,237,0.04) 0%, rgba(255,255,255,0.8) 100%)',
        }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: 44, height: 44, borderRadius: '12px', background: 'linear-gradient(135deg, var(--accent), #2563eb)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 20px rgba(124,58,237,0.3)' }}>
                        <Brain size={22} color="white" />
                    </div>
                    <div>
                        <h3 style={{ fontWeight: 800, fontSize: '1rem', margin: 0 }}>Asistente de Salud Financiera</h3>
                        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>Análisis en tiempo real · Actualizado ahora</p>
                    </div>
                </div>

                {/* Financial Health Score */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: `${scoreColor}0d`, border: `1px solid ${scoreColor}33`, padding: '0.75rem 1.25rem', borderRadius: '12px' }}>
                    <div style={{ position: 'relative', width: 56, height: 56 }}>
                        <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                            <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth="3" />
                            <circle cx="18" cy="18" r="15.9" fill="none" stroke={scoreColor} strokeWidth="3"
                                strokeDasharray={`${insights.score} ${100 - insights.score}`}
                                strokeLinecap="round" style={{ transition: 'stroke-dasharray 1s ease' }} />
                        </svg>
                        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 900, color: scoreColor }}>
                            {insights.score}
                        </div>
                    </div>
                    <div>
                        <div style={{ fontSize: '0.62rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Salud Financiera</div>
                        <div style={{ fontSize: '1rem', fontWeight: 900, color: scoreColor }}>{scoreLabel}</div>
                    </div>
                </div>
            </div>

            {/* Insights/Alerts */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {insights.alerts.map((alert, i) => {
                    const Icon = alert.icon;
                    const col = colorMap[alert.type] || 'var(--primary)';
                    return (
                        <div key={i} style={{
                            display: 'flex', alignItems: 'flex-start', gap: '0.875rem',
                            padding: '0.875rem 1rem', borderRadius: '10px',
                            background: `${col}09`, border: `1px solid ${col}22`,
                            animation: `slideInUp 0.4s ${i * 0.08}s cubic-bezier(0.22,1,0.36,1) both`
                        }}>
                            <div style={{ width: 32, height: 32, borderRadius: '8px', background: `${col}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <Icon size={16} color={col} />
                            </div>
                            <div>
                                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: col, marginBottom: '0.15rem' }}>{alert.title}</div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>{alert.msg}</div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Quick stats bar */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border)' }}>
                {[
                    { label: 'Ingresos', val: insights.ingresos, color: 'var(--success)', Icon: TrendingUp },
                    { label: 'Gastos', val: insights.gastos, color: 'var(--danger)', Icon: TrendingDown },
                    { label: 'Utilidad Neta', val: insights.utilidad, color: insights.utilidad >= 0 ? 'var(--primary)' : 'var(--danger)', Icon: insights.utilidad >= 0 ? TrendingUp : TrendingDown },
                ].map(k => (
                    <div key={k.label} style={{ textAlign: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem', fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                            <k.Icon size={11} color={k.color} />{k.label}
                        </div>
                        <div style={{ fontSize: '1rem', fontWeight: 800, color: k.color }}>
                            {new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP', maximumFractionDigits: 0 }).format(k.val)}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AsistenteFinanciero;
