import React, { useState, useMemo, useCallback } from 'react';
import { useCuentas } from '../context/CuentasContext';
import { useContabilidad } from '../context/ContabilidadContext';
import {
    PieChart, TrendingUp, TrendingDown, DollarSign, Download, Printer, BarChart3,
    Calendar, CheckCircle, XCircle, Plus, Trash2
} from 'lucide-react';
import { exportToExcel } from '../utils/exportUtils';

// ── HELPERS ─────────────────────────────────────────────────────────────────────
const THIS_YEAR = new Date().getFullYear();
const THIS_MONTH = new Date().getMonth() + 1;

const PERIODS_PRESETS = [
    { label: `Ene–${THIS_YEAR}`, inicio: `${THIS_YEAR}-01-01`, fin: `${THIS_YEAR}-01-31` },
    { label: `Feb–${THIS_YEAR}`, inicio: `${THIS_YEAR}-02-01`, fin: `${THIS_YEAR}-02-28` },
    { label: `Mar–${THIS_YEAR}`, inicio: `${THIS_YEAR}-03-01`, fin: `${THIS_YEAR}-03-31` },
    { label: `Abr–${THIS_YEAR}`, inicio: `${THIS_YEAR}-04-01`, fin: `${THIS_YEAR}-04-30` },
    { label: `May–${THIS_YEAR}`, inicio: `${THIS_YEAR}-05-01`, fin: `${THIS_YEAR}-05-31` },
    { label: `Jun–${THIS_YEAR}`, inicio: `${THIS_YEAR}-06-01`, fin: `${THIS_YEAR}-06-30` },
    { label: `Jul–${THIS_YEAR}`, inicio: `${THIS_YEAR}-07-01`, fin: `${THIS_YEAR}-07-31` },
    { label: `Ago–${THIS_YEAR}`, inicio: `${THIS_YEAR}-08-01`, fin: `${THIS_YEAR}-08-31` },
    { label: `Sep–${THIS_YEAR}`, inicio: `${THIS_YEAR}-09-01`, fin: `${THIS_YEAR}-09-30` },
    { label: `Oct–${THIS_YEAR}`, inicio: `${THIS_YEAR}-10-01`, fin: `${THIS_YEAR}-10-31` },
    { label: `Nov–${THIS_YEAR}`, inicio: `${THIS_YEAR}-11-01`, fin: `${THIS_YEAR}-11-30` },
    { label: `Dic–${THIS_YEAR}`, inicio: `${THIS_YEAR}-12-01`, fin: `${THIS_YEAR}-12-31` },
    { label: `Año ${THIS_YEAR}`, inicio: `${THIS_YEAR}-01-01`, fin: `${THIS_YEAR}-12-31` },
    { label: `Año ${THIS_YEAR - 1}`, inicio: `${THIS_YEAR - 1}-01-01`, fin: `${THIS_YEAR - 1}-12-31` },
    { label: 'Todo el Historial', inicio: '2000-01-01', fin: '2099-12-31' },
];

const fmt = (amount) => new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP' }).format(amount || 0);



function printSection(sectionId, title) {
    const el = document.getElementById(sectionId);
    if (!el) return;
    const win = window.open('', '_blank', 'width=900,height=700');
    win.document.write(`
        <html><head><title>${title}</title>
        <style>
            body { font-family: Arial, sans-serif; font-size: 13px; color: #111; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ddd; padding: 6px 10px; text-align: left; }
            th { background: #f3f4f6; font-weight: 700; }
            h1, h2 { color: #1e3a6f; }
            .right { text-align: right; }
            .total-row td { font-weight: 700; background: #e8f0fe; }
        </style>
        </head><body>
        <h1 style="border-bottom:2px solid #1e3a6f;padding-bottom:8px;">${title}</h1>
        ${el.innerHTML}
        </body></html>
    `);
    win.document.close();
    win.focus();
    win.print();
    win.close();
}

// ── MAIN COMPONENT ───────────────────────────────────────────────────────────────
const Reportes = () => {
    const { cuentas } = useCuentas();
    const { asientos } = useContabilidad();

    const [compareMode, setCompareMode] = useState(false);

    // Two period slots for comparison
    const defaultPeriod = { inicio: `${THIS_YEAR}-01-01`, fin: `${THIS_YEAR}-12-31`, label: `Año ${THIS_YEAR}` };
    const [periods, setPeriods] = useState([
        { ...defaultPeriod },
        { inicio: `${THIS_YEAR - 1}-01-01`, fin: `${THIS_YEAR - 1}-12-31`, label: `Año ${THIS_YEAR - 1}` }
    ]);

    const updatePeriod = (idx, field, value) => {
        setPeriods(prev => prev.map((p, i) => i === idx ? { ...p, [field]: value, label: 'Personalizado' } : p));
    };

    const applyPreset = (idx, preset) => {
        setPeriods(prev => prev.map((p, i) => i === idx ? { ...preset } : p));
    };

    // ── Aggregation function ───────────────────────────────────────────────────
    const calcularSaldosPeriodo = useCallback((inicio, fin) => {
        const startDate = new Date(inicio + 'T00:00:00');
        const endDate = new Date(fin + 'T23:59:59');

        const saldos = {}; // { cuentaId: { debito: n, credito: n } }
        cuentas.forEach(c => { saldos[c.id] = { debito: 0, credito: 0 }; });

        asientos.forEach(asiento => {
            const asientoDate = new Date(asiento.fecha);
            if (asientoDate < startDate || asientoDate > endDate) return;

            (asiento.detalles || []).forEach(detalle => {
                const cid = String(detalle.cuentaId);
                if (!saldos[cid]) saldos[cid] = { debito: 0, credito: 0 };
                saldos[cid].debito += Number(detalle.debito) || 0;
                saldos[cid].credito += Number(detalle.credito) || 0;
            });
        });

        // Convert to net saldo per account type
        const saldoNeto = {};
        cuentas.forEach(c => {
            const { debito, credito } = saldos[c.id] || { debito: 0, credito: 0 };
            if (['Activo', 'Costo', 'Gasto'].includes(c.tipo)) {
                saldoNeto[c.id] = debito - credito;
            } else {
                saldoNeto[c.id] = credito - debito;
            }
        });

        return { saldos, saldoNeto };
    }, [cuentas, asientos]);

    // Single period (always period[0])
    const { saldos: saldosRaw0, saldoNeto: saldos0 } = useMemo(
        () => calcularSaldosPeriodo(periods[0].inicio, periods[0].fin),
        [periods, calcularSaldosPeriodo]
    );
    const { saldoNeto: saldos1 } = useMemo(
        () => calcularSaldosPeriodo(periods[1].inicio, periods[1].fin),
        [periods, calcularSaldosPeriodo]
    );

    const getSaldos = (idx) => idx === 0 ? saldos0 : saldos1;

    const getPeriodTotals = (saldos) => {
        const totalActivos = cuentas.filter(c => c.tipo === 'Activo' && c.subtipo === 'Cuenta Detalle').reduce((a, c) => a + (saldos[c.id] || 0), 0);
        const totalPasivos = cuentas.filter(c => c.tipo === 'Pasivo' && c.subtipo === 'Cuenta Detalle').reduce((a, c) => a + (saldos[c.id] || 0), 0);
        const totalCapital = cuentas.filter(c => c.tipo === 'Capital' && c.subtipo === 'Cuenta Detalle').reduce((a, c) => a + (saldos[c.id] || 0), 0);
        const totalIngresos = cuentas.filter(c => c.tipo === 'Ingreso' && c.subtipo === 'Cuenta Detalle').reduce((a, c) => a + (saldos[c.id] || 0), 0);
        const totalCostos = cuentas.filter(c => c.tipo === 'Costo' && c.subtipo === 'Cuenta Detalle').reduce((a, c) => a + (saldos[c.id] || 0), 0);
        const totalGastos = cuentas.filter(c => c.tipo === 'Gasto' && c.subtipo === 'Cuenta Detalle').reduce((a, c) => a + (saldos[c.id] || 0), 0);
        const utilidadNeta = totalIngresos - totalCostos - totalGastos;
        const capitalTotal = totalCapital + utilidadNeta;
        return { totalActivos, totalPasivos, totalCapital, totalIngresos, totalCostos, totalGastos, utilidadNeta, capitalTotal };
    };

    const totals0 = useMemo(() => getPeriodTotals(saldos0), [saldos0]);
    const totals1 = useMemo(() => getPeriodTotals(saldos1), [saldos1]);

    const activePeriods = compareMode ? [0, 1] : [0];

    // ── Trial Balance Totals ───────────────────────────────────────────────────
    const trialBalanceRows = cuentas
        .filter(c => c.subtipo === 'Cuenta Detalle')
        .filter(c => (saldosRaw0[c.id]?.debito || 0) !== 0 || (saldosRaw0[c.id]?.credito || 0) !== 0)
        .sort((a, b) => a.codigo.localeCompare(b.codigo));

    const trialTotalDebito = trialBalanceRows.reduce((s, c) => s + (saldosRaw0[c.id]?.debito || 0), 0);
    const trialTotalCredito = trialBalanceRows.reduce((s, c) => s + (saldosRaw0[c.id]?.credito || 0), 0);
    const trialBalanced = Math.abs(trialTotalDebito - trialTotalCredito) <= 0.05;

    // ── Excel Exports ───────────────────────────────────────────────────────────
    const exportBalanza = () => {
        const data = trialBalanceRows.map(c => ({
            'Código': c.codigo,
            'Cuenta': c.nombre,
            'Tipo': c.tipo,
            'Mov. Débito': saldosRaw0[c.id]?.debito || 0,
            'Mov. Crédito': saldosRaw0[c.id]?.credito || 0,
            'Saldo': saldos0[c.id] || 0
        }));
        exportToExcel(data, 'Balanza_Comprobacion', 'Balanza');
    };

    const getPeriodKey0 = () => periods[0].label;
    const getPeriodKey1 = () => periods[1].label;

    const exportResultados = () => {
        const p0 = getPeriodKey0();
        const p1 = getPeriodKey1();
        const data = [
            { 'Concepto': '=== INGRESOS ===', [p0]: null, ...(compareMode ? { [p1]: null } : {}) },
            ...cuentas.filter(c => c.tipo === 'Ingreso' && c.subtipo === 'Cuenta Detalle' && (saldos0[c.id] || 0) !== 0)
                .map(c => ({ 'Concepto': c.nombre, [p0]: saldos0[c.id] || 0, ...(compareMode ? { [p1]: saldos1[c.id] || 0 } : {}) })),
            { 'Concepto': 'TOTAL VENTAS', [p0]: totals0.totalIngresos, ...(compareMode ? { [p1]: totals1.totalIngresos } : {}) },
            
            { 'Concepto': '=== COSTOS ===', [p0]: null, ...(compareMode ? { [p1]: null } : {}) },
            ...cuentas.filter(c => c.tipo === 'Costo' && c.subtipo === 'Cuenta Detalle')
                .map(c => ({ 'Concepto': c.nombre, [p0]: saldos0[c.id] || 0, ...(compareMode ? { [p1]: saldos1[c.id] || 0 } : {}) })),
            { 'Concepto': 'UTILIDAD BRUTA', [p0]: totals0.totalIngresos - totals0.totalCostos, ...(compareMode ? { [p1]: totals1.totalIngresos - totals1.totalCostos } : {}) },
            
            { 'Concepto': '=== GASTOS OPERATIVOS ===', [p0]: null, ...(compareMode ? { [p1]: null } : {}) },
            ...cuentas.filter(c => c.tipo === 'Gasto' && c.subtipo === 'Cuenta Detalle')
                .map(c => ({ 'Concepto': c.nombre, [p0]: saldos0[c.id] || 0, ...(compareMode ? { [p1]: saldos1[c.id] || 0 } : {}) })),
            
            { 'Concepto': 'UTILIDAD NETA', [p0]: totals0.utilidadNeta, ...(compareMode ? { [p1]: totals1.utilidadNeta } : {}) },
        ];
        exportToExcel(data, 'Estado_Resultados', 'Resultados');
    };

    const exportBalance = () => {
        const p0 = getPeriodKey0();
        const p1 = getPeriodKey1();
        const data = [
            { 'Concepto': '=== ACTIVOS ===', [p0]: null, ...(compareMode ? { [p1]: null } : {}) },
            ...cuentas.filter(c => c.tipo === 'Activo' && c.subtipo === 'Cuenta Detalle')
                .map(c => ({ 'Concepto': c.nombre, [p0]: saldos0[c.id] || 0, ...(compareMode ? { [p1]: saldos1[c.id] || 0 } : {}) })),
            { 'Concepto': 'TOTAL ACTIVOS', [p0]: totals0.totalActivos, ...(compareMode ? { [p1]: totals1.totalActivos } : {}) },
            
            { 'Concepto': '=== PASIVOS ===', [p0]: null, ...(compareMode ? { [p1]: null } : {}) },
            ...cuentas.filter(c => c.tipo === 'Pasivo' && c.subtipo === 'Cuenta Detalle')
                .map(c => ({ 'Concepto': c.nombre, [p0]: saldos0[c.id] || 0, ...(compareMode ? { [p1]: saldos1[c.id] || 0 } : {}) })),
            { 'Concepto': 'TOTAL PASIVOS', [p0]: totals0.totalPasivos, ...(compareMode ? { [p1]: totals1.totalPasivos } : {}) },
            
            { 'Concepto': '=== CAPITAL ===', [p0]: null, ...(compareMode ? { [p1]: null } : {}) },
            { 'Concepto': 'Capital Base', [p0]: totals0.totalCapital, ...(compareMode ? { [p1]: totals1.totalCapital } : {}) },
            { 'Concepto': 'Utilidad Neta', [p0]: totals0.utilidadNeta, ...(compareMode ? { [p1]: totals1.utilidadNeta } : {}) },
            { 'Concepto': 'TOTAL CAPITAL', [p0]: totals0.capitalTotal, ...(compareMode ? { [p1]: totals1.capitalTotal } : {}) },
        ];
        exportToExcel(data, 'Balance_General', 'Balance');
    };

    const exportAll = () => { exportBalanza(); exportResultados(); exportBalance(); };

    // ── Period Selector ────────────────────────────────────────────────────────
    const PeriodSelector = ({ idx }) => (
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap', background: 'var(--background)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
            <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--primary)', minWidth: '60px' }}>Período {idx + 1}</span>
            <select
                className="input-field"
                style={{ width: 'auto', height: '32px', fontSize: '0.8rem', padding: '0 0.5rem' }}
                value=""
                onChange={(e) => {
                    const p = PERIODS_PRESETS.find(pr => pr.label === e.target.value);
                    if (p) applyPreset(idx, p);
                }}
            >
                <option value="">▼ Elegir preset...</option>
                {PERIODS_PRESETS.map(p => <option key={p.label} value={p.label}>{p.label}</option>)}
            </select>
            <input type="date" className="input-field" style={{ width: 'auto', height: '32px', fontSize: '0.8rem', padding: '0 0.5rem' }}
                value={periods[idx].inicio} onChange={e => updatePeriod(idx, 'inicio', e.target.value)} />
            <span style={{ color: 'var(--text-muted)' }}>→</span>
            <input type="date" className="input-field" style={{ width: 'auto', height: '32px', fontSize: '0.8rem', padding: '0 0.5rem' }}
                value={periods[idx].fin} onChange={e => updatePeriod(idx, 'fin', e.target.value)} />
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>{periods[idx].label}</span>
        </div>
    );

    // ── Column headers for comparison ─────────────────────────────────────────
    const ColHeader = () => (
        <>
            {activePeriods.map(idx => (
                <th key={idx} style={{ padding: '0.75rem 1rem', textAlign: 'right', fontSize: '0.8rem', fontWeight: 700, color: idx === 0 ? 'var(--primary)' : 'var(--warning)', width: '160px' }}>
                    {periods[idx].label}
                </th>
            ))}
        </>
    );

    // ── Statement Row Component ───────────────────────────────────────────────
    const StmtRow = ({ label, values, bold, total, color, indent }) => (
        <tr style={{ borderBottom: '1px solid var(--border)', background: total ? 'var(--background)' : 'transparent' }}>
            <td style={{ padding: '0.5rem', paddingLeft: indent ? '2rem' : '0.75rem', fontSize: bold ? '0.9rem' : '0.85rem', fontWeight: bold ? 700 : 400, color: color }}>
                {label}
            </td>
            {values.map((v, i) => (
                <td key={i} style={{ padding: '0.5rem 1rem', textAlign: 'right', fontWeight: bold ? 700 : 400, color: color, fontSize: bold ? '0.9rem' : '0.85rem' }}>
                    {fmt(v)}
                </td>
            ))}
        </tr>
    );

    // ──────────────────────────────────────────────────────────────────────────
    return (
        <div>
            {/* ── PAGE HEADER ─────────────────────────────────────────────── */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1 className="page-title" style={{ marginBottom: '0.25rem' }}>Estados Financieros y Reportes</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Visualiza la salud financiera con filtros de período y comparación.</p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }} className="no-print">
                    <button
                        className="btn btn-secondary"
                        style={{ background: compareMode ? 'var(--primary-light)' : undefined, color: compareMode ? 'var(--primary)' : undefined, border: compareMode ? '1px solid var(--primary)' : undefined }}
                        onClick={() => setCompareMode(!compareMode)}
                    >
                        <Calendar size={16} /> {compareMode ? '✓ Comparar Períodos' : 'Comparar Períodos'}
                    </button>
                    <button className="btn btn-secondary" onClick={() => window.print()}><Printer size={16} /> PDF</button>
                    <button className="btn btn-primary" onClick={exportAll}><Download size={16} /> Excel (Todo)</button>
                </div>
            </div>

            {/* ── PERIOD SELECTORS ────────────────────────────────────────── */}
            <div className="no-print" style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                <PeriodSelector idx={0} />
                {compareMode && <PeriodSelector idx={1} />}
            </div>

            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* BALANZA DE COMPROBACIÓN                                         */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            <div className="card" style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)' }}>
                        <BarChart3 size={22} /> Balanza de Comprobación
                        <span style={{ fontSize: '0.75rem', background: trialBalanced ? 'var(--success)' : 'var(--danger)', color: 'white', padding: '2px 8px', borderRadius: '999px', fontWeight: 600 }}>
                            {trialBalanced ? '✓ Cuadrada' : '✗ Descuadrada'}
                        </span>
                    </h2>
                    <div style={{ display: 'flex', gap: '0.5rem' }} className="no-print">
                        <button className="btn btn-secondary" style={{ fontSize: '0.75rem', height: '32px' }} onClick={() => printSection('balanza-content', 'Balanza de Comprobación')}><Printer size={14} /> PDF</button>
                        <button className="btn btn-secondary" style={{ fontSize: '0.75rem', height: '32px' }} onClick={exportBalanza}><Download size={14} /> Excel</button>
                    </div>
                </div>

                <div id="balanza-content" style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                        <thead style={{ background: 'var(--background)' }}>
                            <tr>
                                <th style={{ padding: '0.75rem', borderBottom: '2px solid var(--border)' }}>Código / Cuenta</th>
                                <th style={{ padding: '0.75rem', textAlign: 'right', borderBottom: '2px solid var(--border)' }}>Mov. Débito</th>
                                <th style={{ padding: '0.75rem', textAlign: 'right', borderBottom: '2px solid var(--border)' }}>Mov. Crédito</th>
                                <th style={{ padding: '0.75rem', textAlign: 'right', borderBottom: '2px solid var(--border)' }}>Saldo</th>
                            </tr>
                        </thead>
                        <tbody>
                            {trialBalanceRows.length === 0 ? (
                                <tr><td colSpan="4" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Sin movimientos en este período.</td></tr>
                            ) : (
                                trialBalanceRows.map(c => {
                                    const deb = saldosRaw0[c.id]?.debito || 0;
                                    const cre = saldosRaw0[c.id]?.credito || 0;
                                    const saldo = saldos0[c.id] || 0;
                                    return (
                                        <tr key={c.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                            <td style={{ padding: '0.5rem 0.75rem' }}>{c.codigo} – {c.nombre}</td>
                                            <td style={{ padding: '0.5rem 0.75rem', textAlign: 'right' }}>{deb > 0 ? fmt(deb) : '—'}</td>
                                            <td style={{ padding: '0.5rem 0.75rem', textAlign: 'right' }}>{cre > 0 ? fmt(cre) : '—'}</td>
                                            <td style={{ padding: '0.5rem 0.75rem', textAlign: 'right', fontWeight: 600 }}>{fmt(saldo)}</td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                        <tfoot>
                            <tr style={{ background: 'var(--background)', fontWeight: 700, borderTop: '2px solid var(--border)' }}>
                                <td style={{ padding: '0.75rem' }}>TOTALES</td>
                                <td style={{ padding: '0.75rem', textAlign: 'right', color: 'var(--primary)' }}>{fmt(trialTotalDebito)}</td>
                                <td style={{ padding: '0.75rem', textAlign: 'right', color: 'var(--danger)' }}>{fmt(trialTotalCredito)}</td>
                                <td style={{ padding: '0.75rem', textAlign: 'right', color: trialBalanced ? 'var(--success)' : 'var(--danger)' }}>
                                    {trialBalanced ? '✓ Cuadrado' : `Dif: ${fmt(Math.abs(trialTotalDebito - trialTotalCredito))}`}
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>

            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* ESTADO DE RESULTADOS                                             */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            <div className="card" style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)' }}>
                        <TrendingUp size={22} /> Estado de Resultados
                    </h2>
                    <div style={{ display: 'flex', gap: '0.5rem' }} className="no-print">
                        <button className="btn btn-secondary" style={{ fontSize: '0.75rem', height: '32px' }} onClick={() => printSection('resultados-content', 'Estado de Resultados')}><Printer size={14} /> PDF</button>
                        <button className="btn btn-secondary" style={{ fontSize: '0.75rem', height: '32px' }} onClick={exportResultados}><Download size={14} /> Excel</button>
                    </div>
                </div>
                <div id="resultados-content" style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: 'var(--background)', borderBottom: '2px solid var(--border)' }}>
                                <th style={{ padding: '0.75rem', textAlign: 'left' }}>Concepto</th>
                                <ColHeader />
                            </tr>
                        </thead>
                        <tbody>
                            <StmtRow label="INGRESOS" values={activePeriods.map(i => getPeriodTotals(getSaldos(i)).totalIngresos)} bold color="var(--success)" />
                            {cuentas.filter(c => c.tipo === 'Ingreso' && c.subtipo === 'Cuenta Detalle').map(c =>
                                activePeriods.some(i => (getSaldos(i)[c.id] || 0) !== 0) && (
                                    <StmtRow key={c.id} label={c.nombre} values={activePeriods.map(i => getSaldos(i)[c.id] || 0)} indent />
                                )
                            )}

                            <StmtRow label="MENOS: COSTOS DE VENTA" values={activePeriods.map(i => getPeriodTotals(getSaldos(i)).totalCostos)} bold />
                            {cuentas.filter(c => c.tipo === 'Costo' && c.subtipo === 'Cuenta Detalle').map(c =>
                                activePeriods.some(i => (getSaldos(i)[c.id] || 0) !== 0) && (
                                    <StmtRow key={c.id} label={c.nombre} values={activePeriods.map(i => getSaldos(i)[c.id] || 0)} indent />
                                )
                            )}

                            <StmtRow label="UTILIDAD BRUTA" values={activePeriods.map(i => { const t = getPeriodTotals(getSaldos(i)); return t.totalIngresos - t.totalCostos; })} bold total color="var(--primary)" />

                            <StmtRow label="MENOS: GASTOS OPERATIVOS" values={activePeriods.map(i => getPeriodTotals(getSaldos(i)).totalGastos)} bold />
                            {cuentas.filter(c => c.tipo === 'Gasto' && c.subtipo === 'Cuenta Detalle').map(c =>
                                activePeriods.some(i => (getSaldos(i)[c.id] || 0) !== 0) && (
                                    <StmtRow key={c.id} label={c.nombre} values={activePeriods.map(i => getSaldos(i)[c.id] || 0)} indent />
                                )
                            )}

                            <StmtRow label="UTILIDAD NETA DEL PERÍODO" values={activePeriods.map(i => getPeriodTotals(getSaldos(i)).utilidadNeta)} bold total color={totals0.utilidadNeta >= 0 ? 'var(--success)' : 'var(--danger)'} />

                            {compareMode && (
                                <tr>
                                    <td colSpan={3} style={{ padding: '0.75rem', fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                                        Variación: {fmt(totals0.utilidadNeta - totals1.utilidadNeta)} ({totals1.utilidadNeta !== 0 ? `${((totals0.utilidadNeta - totals1.utilidadNeta) / Math.abs(totals1.utilidadNeta) * 100).toFixed(1)}%` : 'N/A'})
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* BALANCE GENERAL                                                   */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            <div className="card" style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)' }}>
                        <PieChart size={22} /> Balance General
                    </h2>
                    <div style={{ display: 'flex', gap: '0.5rem' }} className="no-print">
                        <button className="btn btn-secondary" style={{ fontSize: '0.75rem', height: '32px' }} onClick={() => printSection('balance-content', 'Balance General')}><Printer size={14} /> PDF</button>
                        <button className="btn btn-secondary" style={{ fontSize: '0.75rem', height: '32px' }} onClick={exportBalance}><Download size={14} /> Excel</button>
                    </div>
                </div>
                <div id="balance-content" style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: 'var(--background)', borderBottom: '2px solid var(--border)' }}>
                                <th style={{ padding: '0.75rem', textAlign: 'left' }}>Concepto</th>
                                <ColHeader />
                            </tr>
                        </thead>
                        <tbody>
                            <StmtRow label="ACTIVOS" values={activePeriods.map(i => getPeriodTotals(getSaldos(i)).totalActivos)} bold color="var(--primary)" />
                            {cuentas.filter(c => c.tipo === 'Activo' && c.subtipo === 'Cuenta Detalle').map(c =>
                                activePeriods.some(i => (getSaldos(i)[c.id] || 0) !== 0) && (
                                    <StmtRow key={c.id} label={c.nombre} values={activePeriods.map(i => getSaldos(i)[c.id] || 0)} indent />
                                )
                            )}
                            <StmtRow label="TOTAL ACTIVOS" values={activePeriods.map(i => getPeriodTotals(getSaldos(i)).totalActivos)} bold total color="var(--primary)" />

                            <StmtRow label="PASIVOS" values={activePeriods.map(i => getPeriodTotals(getSaldos(i)).totalPasivos)} bold color="var(--danger)" />
                            {cuentas.filter(c => c.tipo === 'Pasivo' && c.subtipo === 'Cuenta Detalle').map(c =>
                                activePeriods.some(i => (getSaldos(i)[c.id] || 0) !== 0) && (
                                    <StmtRow key={c.id} label={c.nombre} values={activePeriods.map(i => getSaldos(i)[c.id] || 0)} indent />
                                )
                            )}
                            <StmtRow label="TOTAL PASIVOS" values={activePeriods.map(i => getPeriodTotals(getSaldos(i)).totalPasivos)} bold total color="var(--danger)" />

                            <StmtRow label="CAPITAL CONTABLE" values={activePeriods.map(i => getPeriodTotals(getSaldos(i)).totalCapital)} bold color="var(--warning)" />
                            <StmtRow label="+ Utilidad Neta del Período" values={activePeriods.map(i => getPeriodTotals(getSaldos(i)).utilidadNeta)} indent />
                            <StmtRow label="TOTAL CAPITAL" values={activePeriods.map(i => getPeriodTotals(getSaldos(i)).capitalTotal)} bold total color="var(--warning)" />

                            <StmtRow label="PASIVO + CAPITAL" values={activePeriods.map(i => { const t = getPeriodTotals(getSaldos(i)); return t.totalPasivos + t.capitalTotal; })} bold total />
                        </tbody>
                    </table>

                    {Math.abs(totals0.totalActivos - (totals0.totalPasivos + totals0.capitalTotal)) > 0.05 && (
                        <div style={{ marginTop: '1rem', background: 'var(--danger)', color: 'white', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', fontWeight: 600, fontSize: '0.875rem' }}>
                            ⚠️ ¡ATENCIÓN! El Balance no Cuadra. Diferencia: {fmt(Math.abs(totals0.totalActivos - (totals0.totalPasivos + totals0.capitalTotal)))}
                        </div>
                    )}
                </div>
            </div>

            {/* ── PRINT STYLES ────────────────────────────────────────────── */}
            <style>{`
                @media print {
                    .no-print { display: none !important; }
                    aside, header { display: none !important; }
                    main { margin: 0 !important; width: 100% !important; }
                    .card { border: 1px solid #ccc !important; box-shadow: none !important; page-break-inside: avoid; }
                }
            `}</style>
        </div>
    );
};

export default Reportes;
