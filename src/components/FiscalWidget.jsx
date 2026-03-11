import React from 'react';
import { useContabilidad } from '../context/ContabilidadContext';
import { useCuentas } from '../context/CuentasContext';
import { ShieldCheck, TrendingUp, AlertCircle, Info } from 'lucide-react';

const FiscalWidget = () => {
    const { asientos } = useContabilidad();
    const { cuentas } = useCuentas();

    const calcularSaldoCuenta = (codigoBase, soloMesActual = true) => {
        let total = 0;
        if (!asientos) return 0;

        const fechaActual = new Date();
        const mesActual = fechaActual.getMonth();
        const anioActual = fechaActual.getFullYear();

        asientos.forEach(asiento => {
            if (soloMesActual) {
                const fechaAsiento = new Date(asiento.fecha);
                if (fechaAsiento.getMonth() !== mesActual || fechaAsiento.getFullYear() !== anioActual) {
                    return;
                }
            }

            (asiento.detalles || []).forEach(detalle => {
                const cuenta = cuentas.find(c => String(c.id) === String(detalle.cuentaId));
                const codigo = String(cuenta?.codigo || detalle.cuentaId);
                
                if (codigo.startsWith(codigoBase)) {
                    const debe = Number(detalle.debito) || 0;
                    const haber = Number(detalle.credito) || 0;
                    // Cuentas de Pasivo (Comienza con 2) o Ingreso (4) suelen ser Haber - Debe
                    // Cuentas de Activo (1) o Gasto (5/6) suelen ser Debe - Haber
                    if (codigo.startsWith('1') || codigo.startsWith('5') || codigo.startsWith('6')) {
                        total += (debe - haber);
                    } else {
                        total += (haber - debe);
                    }
                }
            });
        });
        return total;
    };

    // Códigos estándar RD: 
    // 2107xx - ITBIS por Pagar (Ventas)
    // 1107xx - ITBIS Pagado (Compras/Adelantado)
    const itbisVentas = Math.abs(calcularSaldoCuenta('2107')); 
    const itbisCompras = Math.abs(calcularSaldoCuenta('1107'));
    const neto = itbisVentas - itbisCompras;

    const formatMoney = (v) => new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP' }).format(v);

    return (
        <div className="card glass" style={{ padding: '1.5rem', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ padding: '0.5rem', background: 'rgba(37, 99, 235, 0.1)', color: 'var(--primary)', borderRadius: '10px' }}>
                            <ShieldCheck size={20} />
                        </div>
                        <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800 }}>Resumen Fiscal (ITBIS)</h3>
                    </div>
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '0.2rem 0.6rem', background: 'var(--bg-card)', borderRadius: '20px', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
                        MES ACTUAL
                    </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                    <div style={{ padding: '1rem', background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                        <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Cobrado (Ventas)</div>
                        <div style={{ fontWeight: 800, color: 'var(--text-main)', fontSize: '1.1rem' }}>{formatMoney(itbisVentas)}</div>
                    </div>
                    <div style={{ padding: '1rem', background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                        <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Pagado (Compras)</div>
                        <div style={{ fontWeight: 800, color: 'var(--text-main)', fontSize: '1.1rem' }}>{formatMoney(itbisCompras)}</div>
                    </div>
                </div>

                <div style={{ padding: '1.25rem', background: neto > 0 ? 'rgba(239, 68, 68, 0.05)' : 'rgba(34, 197, 94, 0.05)', borderRadius: '15px', border: `1px solid ${neto > 0 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(34, 197, 94, 0.1)'}`, marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: neto > 0 ? '#991b1b' : '#065f46', marginBottom: '0.25rem' }}>
                                {neto > 0 ? 'ITBIS A PAGAR ESTIMADO' : 'ITBIS A FAVOR ESTIMADO'}
                            </div>
                            <div style={{ fontSize: '1.75rem', fontWeight: 900, color: neto > 0 ? 'var(--danger)' : 'var(--success)', letterSpacing: '-0.03em' }}>
                                {formatMoney(Math.abs(neto))}
                            </div>
                        </div>
                        <div style={{ opacity: 0.3 }}>
                            {neto > 0 ? <TrendingUp size={40} color="var(--danger)" /> : <TrendingUp size={40} color="var(--success)" style={{ transform: 'rotate(180deg)' }} />}
                        </div>
                    </div>
                </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', background: 'rgba(37, 99, 235, 0.03)', borderRadius: '10px', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                <Info size={14} />
                <span>Este es un cálculo preliminar basado en las entradas de diario del mes. Sujeto a validación final en formulario IT-1.</span>
            </div>
        </div>
    );
};

export default FiscalWidget;
