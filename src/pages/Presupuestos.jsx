import React, { useState, useMemo } from 'react';
import { useCuentas } from '../context/CuentasContext';
import { useContabilidad } from '../context/ContabilidadContext';
import { usePresupuesto } from '../context/PresupuestoContext';
import { Target, TrendingUp, AlertCircle, Save, Calendar, ChevronLeft, ChevronRight, BarChart3 } from 'lucide-react';

const Presupuestos = () => {
    const { cuentas } = useCuentas();
    const { asientos } = useContabilidad();
    const { guardarPresupuesto, obtenerPresupuestoPeriodo } = usePresupuesto();

    const [mes, setMes] = useState(new Date().getMonth() + 1);
    const [año, setAño] = useState(new Date().getFullYear());

    const periodoStr = `${año}-${String(mes).padStart(2, '0')}`;
    const presupuestoActual = obtenerPresupuestoPeriodo(periodoStr);

    const accountsToBudget = useMemo(() => {
        // Filtrar cuentas de Ingresos (4) y Gastos (5/6) que sean de detalle
        return cuentas.filter(c =>
            (c.codigo.startsWith('4') || c.codigo.startsWith('5') || c.codigo.startsWith('6')) &&
            c.subtipo === 'Cuenta Detalle'
        ).sort((a, b) => String(a.codigo || '').localeCompare(String(b.codigo || '')));
    }, [cuentas]);

    // Calcular montos reales para el periodo
    const realesPeriodo = useMemo(() => {
        const montos = {};
        asientos.forEach(a => {
            const fechaAsiento = new Date(a.fecha);
            if (fechaAsiento.getMonth() + 1 === mes && fechaAsiento.getFullYear() === año) {
                (a.detalles || []).forEach(m => {
                    if (!m.cuentaId) return;
                    if (!montos[m.cuentaId]) montos[m.cuentaId] = 0;
                    const debito = Number(m.debito) || 0;
                    const credito = Number(m.credito) || 0;
                    // Ingresos (Acreedor) crecen con crédito; Gastos/Costos (Deudor) con débito
                    if (m.cuentaId.startsWith('4')) {
                        montos[m.cuentaId] += (credito - debito);
                    } else {
                        montos[m.cuentaId] += (debito - credito);
                    }
                });
            }
        });
        return montos;
    }, [asientos, mes, año]);

    const handleSavePresupuesto = (cuentaId, monto) => {
        guardarPresupuesto(periodoStr, cuentaId, monto);
    };

    const formatMoney = (amount) => {
        return new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP' }).format(amount);
    };

    const getNombreMes = (m) => {
        return new Intl.DateTimeFormat('es-ES', { month: 'long' }).format(new Date(2000, m - 1));
    };

    const cambiarPeriodo = (delta) => {
        let nuevoMes = mes + delta;
        let nuevoAño = año;
        if (nuevoMes > 12) {
            nuevoMes = 1;
            nuevoAño++;
        } else if (nuevoMes < 1) {
            nuevoMes = 12;
            nuevoAño--;
        }
        setMes(nuevoMes);
        setAño(nuevoAño);
    };

    const totalPresupuestado = Object.values(presupuestoActual).reduce((acc, val) => acc + val, 0);
    const totalReal = Object.values(realesPeriodo).reduce((acc, val) => acc + val, 0);

    return (
        <div className="animate-up">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 className="page-title" style={{ marginBottom: '0.25rem' }}>Presupuestos y Metas</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Define objetivos financieros y mide el desempeño real de tu empresa.</p>
                </div>
                <div className="glass" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.5rem 1rem' }}>
                    <button className="btn btn-secondary" style={{ padding: '0.4rem' }} onClick={() => cambiarPeriodo(-1)}><ChevronLeft size={18} /></button>
                    <div style={{ fontWeight: 700, minWidth: '150px', textAlign: 'center', textTransform: 'capitalize' }}>
                        {getNombreMes(mes)} {año}
                    </div>
                    <button className="btn btn-secondary" style={{ padding: '0.4rem' }} onClick={() => cambiarPeriodo(1)}><ChevronRight size={18} /></button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                <div className="card" style={{ padding: '1.5rem', borderLeft: '4px solid var(--primary)' }}>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Total Presupuestado</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{formatMoney(totalPresupuestado)}</div>
                </div>
                <div className="card" style={{ padding: '1.5rem', borderLeft: '4px solid var(--success)' }}>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Ejecución Real</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{formatMoney(totalReal)}</div>
                </div>
                <div className="card" style={{ padding: '1.5rem', borderLeft: '4px solid var(--warning)' }}>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Diferencia Global</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: totalReal > totalPresupuestado ? 'var(--danger)' : 'var(--success)' }}>
                        {formatMoney(totalPresupuestado - totalReal)}
                    </div>
                </div>
            </div>

            <div className="card">
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--background)' }}>
                                <th style={{ padding: '1rem', textAlign: 'left' }}>Cuenta Contable</th>
                                <th style={{ padding: '1rem', textAlign: 'right' }}>Presupuesto</th>
                                <th style={{ padding: '1rem', textAlign: 'right' }}>Real</th>
                                <th style={{ padding: '1rem', textAlign: 'right' }}>Diferencia</th>
                                <th style={{ padding: '1rem', width: '200px' }}>Cumplimiento</th>
                            </tr>
                        </thead>
                        <tbody>
                            {accountsToBudget.map(cuenta => {
                                const p = presupuestoActual[cuenta.id] || 0;
                                const r = realesPeriodo[cuenta.id] || 0;
                                const diff = p - r;
                                const pct = p > 0 ? Math.min((r / p) * 100, 100) : 0;

                                return (
                                    <tr key={cuenta.id} style={{ borderBottom: '1px solid var(--border)', transition: '0.2s' }}>
                                        <td style={{ padding: '1rem' }}>
                                            <div style={{ fontWeight: 600 }}>{cuenta.nombre}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{cuenta.codigo}</div>
                                        </td>
                                        <td style={{ padding: '1rem', textAlign: 'right' }}>
                                            <input
                                                type="number"
                                                className="input-field"
                                                style={{ width: '120px', textAlign: 'right', marginBottom: 0 }}
                                                value={p || ''}
                                                onChange={(e) => handleSavePresupuesto(cuenta.id, e.target.value)}
                                                placeholder="0.00"
                                            />
                                        </td>
                                        <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 600 }}>
                                            {formatMoney(r)}
                                        </td>
                                        <td style={{ padding: '1rem', textAlign: 'right', color: diff < 0 ? 'var(--danger)' : 'var(--success)' }}>
                                            {formatMoney(diff)}
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <div style={{ width: '100%', height: '8px', background: 'var(--border)', borderRadius: '4px', overflow: 'hidden' }}>
                                                <div style={{
                                                    width: `${pct}%`,
                                                    height: '100%',
                                                    background: pct >= 100 ? 'var(--success)' : pct > 70 ? 'var(--primary)' : 'var(--warning)',
                                                    transition: 'width 0.5s ease-out'
                                                }}></div>
                                            </div>
                                            <div style={{ fontSize: '0.7rem', textAlign: 'right', marginTop: '4px', fontWeight: 600 }}>
                                                {pct.toFixed(1)}%
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Presupuestos;
