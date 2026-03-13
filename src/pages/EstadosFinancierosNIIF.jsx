import React, { useState, useMemo } from 'react';
import { useCuentas } from '../context/CuentasContext';
import { useContabilidad } from '../context/ContabilidadContext';
import { FileText, Printer, Building2, TrendingUp, DollarSign, Activity, Calendar, AlertTriangle, CheckSquare } from 'lucide-react';

const formatMoney = (amount) => new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP' }).format(amount || 0);

const EstadosFinancierosNIIF = () => {
    const { cuentas } = useCuentas();
    const { asientos } = useContabilidad();

    // Filtros de fecha (hasta el dia de hoy por defecto)
    const [fechaCorte, setFechaCorte] = useState(new Date().toISOString().split('T')[0]);

    // 1. Calcular Balances por Cuenta (Libro Mayor) al instante de la fecha de corte
    const mayores = useMemo(() => {
        const balances = {};
        
        // Inicializar todas las cuentas
        cuentas.forEach(c => {
            balances[c.id] = { 
                ...c, 
                debitoAbonado: 0, 
                creditoAbonado: 0, 
                saldo: 0 
            };
        });

        // Sumar asientos hasta la fechaCorte
        asientos.filter(a => a.fecha <= fechaCorte).forEach(a => {
            (a.detalles || []).forEach(d => {
                if (balances[d.cuentaId]) {
                    balances[d.cuentaId].debitoAbonado += Number(d.debito || 0);
                    balances[d.cuentaId].creditoAbonado += Number(d.credito || 0);
                }
            });
        });

        // Determinar saldo final basado en la naturaleza de la cuenta
        Object.values(balances).forEach(b => {
            const naturaleza = b.codigo.startsWith('1') || b.codigo.startsWith('5') || b.codigo.startsWith('6') ? 'DEUDORA' : 'ACREEDORA';
            if (naturaleza === 'DEUDORA') b.saldo = b.debitoAbonado - b.creditoAbonado;
            else b.saldo = b.creditoAbonado - b.debitoAbonado;
        });

        return balances;
    }, [asientos, cuentas, fechaCorte]);

    // 2. Agrupar saldos por cuenta de Control (Nivel 3)
    const getGrupo = (codigoPrefijo, soloDetalles = false) => {
        const filtradas = Object.values(mayores).filter(c => c.codigo.startsWith(codigoPrefijo) && c.nivel >= 3 && c.saldo !== 0);
        if (soloDetalles) return filtradas.filter(c => c.nivel >= 4);
        
        // Sumarizar por cuenta Control
        const controles = cuentas.filter(c => c.codigo.startsWith(codigoPrefijo) && c.nivel === 3);
        return controles.map(control => {
            const detalles = filtradas.filter(d => d.codigo.startsWith(control.codigo));
            const saldoTotal = detalles.reduce((sum, d) => sum + d.saldo, 0);
            return { ...control, saldo: saldoTotal, detalles };
        }).filter(c => c.saldo !== 0);
    };

    const activosCirculantes = getGrupo('11');
    const activosFijos = getGrupo('12');
    const pasivosCirculantes = getGrupo('21');
    const pasivosLargo = getGrupo('22');
    const patrimonio = getGrupo('3');
    
    const ingresos = getGrupo('4', true);
    const costos = getGrupo('5', true);
    const gastos = getGrupo('6', true);

    // 3. Totales Principales
    const sumSaldos = (arr) => arr.reduce((sum, item) => sum + item.saldo, 0);
    
    const totalActivos = sumSaldos(activosCirculantes) + sumSaldos(activosFijos);
    const totalPasivos = sumSaldos(pasivosCirculantes) + sumSaldos(pasivosLargo);
    
    const totalIngresos = sumSaldos(ingresos);
    const totalCostos = sumSaldos(costos);
    const totalGastos = sumSaldos(gastos);
    
    // Utilidad del Período (Ganancia o Pérdida)
    const utilidadNeta = totalIngresos - totalCostos - totalGastos;
    
    // Patrimonio Total = Cuentas Capital histórico + Resultado del Período
    const totalPatrimonio = sumSaldos(patrimonio) + utilidadNeta;

    const styles = {
        card: { background: 'var(--background)', borderRadius: '12px', border: '1px solid var(--border)', padding: '1.5rem', marginBottom: '1.5rem' },
        header: { fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary)', borderBottom: '2px solid var(--border)', paddingBottom: '0.75rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' },
        row: { display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', fontSize: '0.85rem' },
        rowBold: { display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0', fontSize: '0.9rem', fontWeight: 800, marginTop: '0.5rem', borderTop: '1px solid var(--border)' },
        tag: { fontSize: '0.7rem', color: 'var(--text-muted)', background: 'var(--accent-light)', padding: '0.1rem 0.4rem', borderRadius: '4px', marginLeft: '0.5rem' },
        h1: { fontSize: '1.5rem', fontWeight: 900, marginBottom: '0.2rem' },
        subtitle: { fontSize: '0.8rem', color: 'var(--text-muted)' }
    };

    const printDoc = () => {
        window.print();
    };

    return (
        <div className="animate-up" style={{ paddingBottom: '3rem', maxWidth: '1000px', margin: '0 auto' }}>
            
            {/* Header / Controles */}
            <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
                <div>
                    <h1 style={styles.h1}>Estados Financieros (NIIF)</h1>
                    <p style={styles.subtitle}>Generación en tiempo real estructurada bajo normas internacionales</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div className="input-group" style={{ marginBottom: 0 }}>
                        <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Calendar size={14} /> Fecha de Corte</label>
                        <input type="date" className="input-field" value={fechaCorte} onChange={e => setFechaCorte(e.target.value)} />
                    </div>
                    <button onClick={printDoc} className="btn btn-secondary" style={{ height: '38px', display: 'flex', gap: '0.5rem', marginTop: '1.2rem' }}>
                        <Printer size={16} /> Emitir PDF
                    </button>
                </div>
            </div>

            {/* Cabecera de Impresión */}
            <div style={{ textAlign: 'center', marginBottom: '3rem', borderBottom: '2px solid #000', paddingBottom: '1rem' }} className="print-only-show">
                <h2 style={{ fontSize: '1.5rem', fontWeight: 900, textTransform: 'uppercase', marginBottom: '0.25rem' }}>AUBEL S.R.L.</h2>
                <div style={{ fontSize: '1rem', fontWeight: 700 }}>ESTADOS FINANCIEROS AUDITADOS</div>
                <div style={{ fontSize: '0.85rem', color: '#555' }}>Expresados en Pesos Dominicanos (DOP)</div>
                <div style={{ fontSize: '0.85rem', color: '#555' }}>Al {new Date(fechaCorte).toLocaleDateString('es-DO', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
                
                {/* ─── ESTADO DE RESULTADOS ─── */}
                <div style={styles.card}>
                    <div style={styles.header}><Activity size={18} /> ESTADO DE RESULTADOS INTEGRAL</div>
                    
                    <div style={styles.rowBold}><span>INGRESOS OPERATIVOS</span></div>
                    {ingresos.map(c => <div style={styles.row} key={c.id}><span>{c.nombre} <span style={styles.tag}>{c.codigo}</span></span> <span>{formatMoney(c.saldo)}</span></div>)}
                    <div style={{...styles.rowBold, color: '#16a34a'}}><span>TOTAL INGRESOS</span> <span>{formatMoney(totalIngresos)}</span></div>

                    <div style={{...styles.rowBold, marginTop: '1.5rem'}}><span>COSTOS Y GASTOS DIRECTOS</span></div>
                    {costos.map(c => <div style={styles.row} key={c.id}><span>{c.nombre} <span style={styles.tag}>{c.codigo}</span></span> <span>{formatMoney(c.saldo)}</span></div>)}
                    <div style={{...styles.rowBold, color: '#dc2626'}}><span>TOTAL COSTOS</span> <span>{formatMoney(totalCostos)}</span></div>

                    <div style={{...styles.rowBold, marginTop: '1.5rem', background: '#f8fafc', padding: '0.5rem'}}>
                        <span>UTILIDAD BRUTA</span> 
                        <span style={{color: (totalIngresos - totalCostos) > 0 ? '#16a34a' : '#dc2626'}}>{formatMoney(totalIngresos - totalCostos)}</span>
                    </div>

                    <div style={{...styles.rowBold, marginTop: '1.5rem'}}><span>GASTOS GENERALES Y ADMINISTRATIVOS</span></div>
                    {gastos.map(c => <div style={styles.row} key={c.id}><span>{c.nombre} <span style={styles.tag}>{c.codigo}</span></span> <span>{formatMoney(c.saldo)}</span></div>)}
                    <div style={{...styles.rowBold, color: '#dc2626'}}><span>TOTAL GASTOS</span> <span>{formatMoney(totalGastos)}</span></div>

                    <div style={{...styles.rowBold, marginTop: '2rem', background: utilidadNeta >= 0 ? 'rgba(22,163,74,0.1)' : 'rgba(220,38,38,0.1)', padding: '1rem', borderRadius: '8px', fontSize: '1.1rem'}}>
                        <span style={{ color: utilidadNeta >= 0 ? '#15803d' : '#991b1b' }}>UTILIDAD NETA DEL PERÍODO</span> 
                        <span style={{ color: utilidadNeta >= 0 ? '#16a34a' : '#dc2626' }}>{formatMoney(utilidadNeta)}</span>
                    </div>
                </div>


                {/* ─── BALANCE GENERAL (ESTADO DE SITUACIÓN) ─── */}
                <div style={styles.card}>
                    <div style={styles.header}><Building2 size={18} /> ESTADO DE SITUACIÓN FINANCIERA (BALANCE GENERAL)</div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: '3rem' }}>
                        
                        {/* COLUMNA IZQUIERDA: ACTIVOS */}
                        <div>
                            <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#2563eb', marginBottom: '1rem', borderBottom: '2px solid #bfdbfe', paddingBottom: '0.2rem' }}>ACTIVOS</div>
                            
                            <div style={styles.rowBold}><span>Activos Circulantes</span></div>
                            {activosCirculantes.map(c => <div style={styles.row} key={c.id}><span>{c.nombre} <span style={styles.tag}>{c.codigo}</span></span> <span>{formatMoney(c.saldo)}</span></div>)}
                            <div style={{...styles.rowBold, color: '#2563eb'}}><span>Total Circulantes</span> <span>{formatMoney(sumSaldos(activosCirculantes))}</span></div>

                            <div style={{...styles.rowBold, marginTop: '1.5rem'}}><span>Activos Fijos (Planta y Eq.)</span></div>
                            {activosFijos.map(c => <div style={styles.row} key={c.id}><span>{c.nombre} <span style={styles.tag}>{c.codigo}</span></span> <span>{formatMoney(c.saldo)}</span></div>)}
                            <div style={{...styles.rowBold, color: '#2563eb'}}><span>Total Activos Fijos</span> <span>{formatMoney(sumSaldos(activosFijos))}</span></div>

                            <div style={{...styles.rowBold, marginTop: '2rem', background: 'rgba(37,99,235,0.1)', padding: '0.75rem', borderRadius: '6px', fontSize: '1rem', color: '#1d4ed8'}}>
                                <span>TOTAL ACTIVOS</span> <span>{formatMoney(totalActivos)}</span>
                            </div>
                        </div>

                        {/* COLUMNA DERECHA: PASIVOS Y PATRIMONIO */}
                        <div>
                            <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#ea580c', marginBottom: '1rem', borderBottom: '2px solid #fed7aa', paddingBottom: '0.2rem' }}>PASIVOS</div>
                            
                            <div style={styles.rowBold}><span>Pasivos a Corto Plazo</span></div>
                            {pasivosCirculantes.map(c => <div style={styles.row} key={c.id}><span>{c.nombre} <span style={styles.tag}>{c.codigo}</span></span> <span>{formatMoney(c.saldo)}</span></div>)}
                            <div style={{...styles.rowBold, color: '#ea580c'}}><span>Total Pasivos</span> <span>{formatMoney(totalPasivos)}</span></div>

                            <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#7c3aed', marginBottom: '1rem', marginTop: '2rem', borderBottom: '2px solid #ddd6fe', paddingBottom: '0.2rem' }}>PATRIMONIO DE LOS ACCIONISTAS</div>
                            
                            <div style={styles.rowBold}><span>Capital y Reservas</span></div>
                            {patrimonio.map(c => <div style={styles.row} key={c.id}><span>{c.nombre} <span style={styles.tag}>{c.codigo}</span></span> <span>{formatMoney(c.saldo)}</span></div>)}
                            
                            <div style={{...styles.row, color: utilidadNeta >= 0 ? '#16a34a' : '#dc2626', fontWeight: 600}}>
                                <span>Utilidad del Período Ejercicio</span> <span>{formatMoney(utilidadNeta)}</span>
                            </div>

                            <div style={{...styles.rowBold, color: '#7c3aed'}}><span>Total Patrimonio</span> <span>{formatMoney(totalPatrimonio)}</span></div>

                            <div style={{...styles.rowBold, marginTop: '2rem', background: 'rgba(234,88,12,0.1)', padding: '0.75rem', borderRadius: '6px', fontSize: '1rem', color: '#c2410c'}}>
                                <span>TOTAL PASIVOS + PATRIMONIO</span> <span>{formatMoney(totalPasivos + totalPatrimonio)}</span>
                            </div>
                        </div>

                    </div>
                    
                    {/* Alerta de Cuadre */}
                    {Math.abs(totalActivos - (totalPasivos + totalPatrimonio)) > 0.05 ? (
                        <div style={{ marginTop: '2rem', background: 'rgba(239,68,68,0.1)', padding: '1rem', borderRadius: '8px', color: '#b91c1c', display: 'flex', gap: '0.5rem', alignItems: 'center', fontWeight: 700 }}>
                            <AlertTriangle size={20} /> ALERTA DE CUADRE: Diferencia de {formatMoney(Math.abs(totalActivos - (totalPasivos + totalPatrimonio)))} detectada en asientos del diario.
                        </div>
                    ) : (
                        <div style={{ marginTop: '2rem', background: 'rgba(34,197,94,0.1)', padding: '1rem', borderRadius: '8px', color: '#15803d', display: 'flex', gap: '0.5rem', alignItems: 'center', fontWeight: 700 }}>
                            <CheckSquare size={20} /> ESTADO FINANCIERO CUADRADO EXACTAMENTE (Ecuación Contable Balanceada A=P+C)
                        </div>
                    )}
                </div>

                <div className="print-only-show" style={{ marginTop: '4rem', display: 'flex', justifyContent: 'space-around', paddingTop: '4rem', textTransform: 'uppercase', fontSize: '0.8rem', fontWeight: 700 }}>
                    <div style={{ borderTop: '1px solid #000', padding: '0.5rem 2rem' }}>Firma Preparador</div>
                    <div style={{ borderTop: '1px solid #000', padding: '0.5rem 2rem' }}>Firma Auditor/Contralor</div>
                    <div style={{ borderTop: '1px solid #000', padding: '0.5rem 2rem' }}>Firma Representante Legal</div>
                </div>

            </div>
        </div>
    );
};

export default EstadosFinancierosNIIF;
