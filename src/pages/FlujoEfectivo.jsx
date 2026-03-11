import React, { useMemo } from 'react';
import { useContabilidad } from '../context/ContabilidadContext';
import { useCuentas } from '../context/CuentasContext';
import { Activity, ArrowUpRight, ArrowDownLeft, Landmark } from 'lucide-react';

const FlujoEfectivo = () => {
    const { asientos } = useContabilidad();
    const { cuentas } = useCuentas();

    const formatMoney = (amount) => {
        return new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP' }).format(amount || 0);
    };

    // Lógica Simplificada de Flujo de Efectivo (Método Indirecto / por Categoría)
    const analysis = useMemo(() => {
        const cashAccountIds = cuentas
            .filter(c => c.codigo?.startsWith('1101') || c.codigo?.startsWith('1102'))
            .map(c => c.id);

        let flujoOperativo = 0;
        let flujoInversion = 0;
        let flujoFinanciamiento = 0;

        asientos.forEach(a => {
            const detalles = a.detalles || [];
            const hasCashMovement = detalles.some(m => cashAccountIds.includes(m.cuentaId));
            if (!hasCashMovement) return;

            detalles.forEach(m => {
                if (!m.cuentaId) return;
                const esEfectivo = cashAccountIds.includes(m.cuentaId);
                if (esEfectivo) return; // Analizamos la contrapartida

                // El impacto neto en efectivo = crédito a contrapartida = ingreso de efectivo
                const contraMonto = (Number(m.credito) || 0) - (Number(m.debito) || 0);

                if (m.cuentaId.startsWith('4') || m.cuentaId.startsWith('5') ||
                    m.cuentaId.startsWith('6') || m.cuentaId.startsWith('1103') || m.cuentaId.startsWith('21')) {
                    flujoOperativo += contraMonto;
                } else if (m.cuentaId.startsWith('12')) {
                    flujoInversion += contraMonto;
                } else if (m.cuentaId.startsWith('22') || m.cuentaId.startsWith('3')) {
                    flujoFinanciamiento += contraMonto;
                }
            });
        });

        return { flujoOperativo, flujoInversion, flujoFinanciamiento, saldoInicial: 0 };
    }, [asientos, cuentas]);

    const netoTotal = analysis.flujoOperativo + analysis.flujoInversion + analysis.flujoFinanciamiento;

    return (
        <div className="animate-up">
            <div style={{ marginBottom: '2rem' }}>
                <h1 className="page-title" style={{ marginBottom: '0.25rem' }}>Estado de Flujo de Efectivo</h1>
                <p style={{ color: 'var(--text-muted)' }}>Análisis detallado de las fuentes y usos del efectivo durante el periodo.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
                <div className="card" style={{ padding: '1.5rem' }}>
                    <div style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}><Activity size={24} /></div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Actividades Operativas</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{formatMoney(analysis.flujoOperativo)}</div>
                </div>
                <div className="card" style={{ padding: '1.5rem' }}>
                    <div style={{ color: 'var(--warning)', marginBottom: '0.5rem' }}><ArrowUpRight size={24} /></div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Inversión</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{formatMoney(analysis.flujoInversion)}</div>
                </div>
                <div className="card" style={{ padding: '1.5rem' }}>
                    <div style={{ color: 'var(--success)', marginBottom: '0.5rem' }}><Landmark size={24} /></div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Financiamiento</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{formatMoney(analysis.flujoFinanciamiento)}</div>
                </div>
                <div className="card" style={{ padding: '1.5rem', background: 'var(--primary)', color: 'white' }}>
                    <div style={{ marginBottom: '0.5rem' }}><ArrowDownLeft size={24} /></div>
                    <div style={{ fontSize: '0.875rem', opacity: 0.8 }}>Incremento/Disminución Neta</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{formatMoney(netoTotal)}</div>
                </div>
            </div>

            <div className="card" style={{ padding: '2rem' }}>
                <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>Resumen Estructural</h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <div style={{ fontWeight: 600 }}>Actividades de Operación</div>
                            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Cobranzas de clientes, pagos a proveedores, salarios e impuestos.</div>
                        </div>
                        <div style={{ fontSize: '1.125rem', fontWeight: 700, color: analysis.flujoOperativo >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                            {formatMoney(analysis.flujoOperativo)}
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <div style={{ fontWeight: 600 }}>Actividades de Inversión</div>
                            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Adquisición o venta de activos fijos (Propiedad, Planta y Equipo).</div>
                        </div>
                        <div style={{ fontSize: '1.125rem', fontWeight: 700, color: analysis.flujoInversion >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                            {formatMoney(analysis.flujoInversion)}
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <div style={{ fontWeight: 600 }}>Actividades de Financiamiento</div>
                            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Préstamos recibidos, pagos de deuda, aportes de capital.</div>
                        </div>
                        <div style={{ fontSize: '1.125rem', fontWeight: 700, color: analysis.flujoFinanciamiento >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                            {formatMoney(analysis.flujoFinanciamiento)}
                        </div>
                    </div>

                    <div style={{ marginTop: '1rem', paddingTop: '1.5rem', borderTop: '2px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>Efectivo al Final del Periodo</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)' }}>
                            {formatMoney(netoTotal)}
                        </div>
                    </div>
                </div>
            </div>

            <div style={{ marginTop: '2rem', padding: '1.5rem', background: 'var(--primary-light)', borderRadius: 'var(--radius-md)', color: 'var(--primary)', border: '1px solid var(--primary-light)' }}>
                <p style={{ fontSize: '0.875rem', fontWeight: 500 }}>
                    <strong>Nota:</strong> Este reporte se genera automáticamente analizando las contrapartidas de las cuentas de Caja y Banco. Asegúrese de que sus asientos contables estén correctamente clasificados para una precisión óptima.
                </p>
            </div>
        </div>
    );
};

export default FlujoEfectivo;
