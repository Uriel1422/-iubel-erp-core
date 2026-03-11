import React, { useState, useMemo, useRef } from 'react';
import { useBancos } from '../context/BancosContext';
import { useContabilidad } from '../context/ContabilidadContext';
import {
    CheckSquare, Square, AlertTriangle, CheckCircle, Download, Save,
    FileSpreadsheet, Search, Upload, Zap, RefreshCw, X, ChevronRight,
    GitMerge, BarChart2, Layers, Info, Eye, FileText, Clock
} from 'lucide-react';

const fmt = (n) => new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP' }).format(n || 0);
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('es-DO') : '—';

// ─── Simulated bank statement entries (demo) ─────────────────────
const generateBankStatement = (librosItems) => {
    const stmt = librosItems.map(m => ({
        id: `BANK-${m.id}`,
        fecha: m.fecha,
        descripcion: m.descripcion.toUpperCase().replace(/[ÁÉÍÓÚáéíóú]/g, c => ({ 'á':'a','é':'e','í':'i','ó':'o','ú':'u','Á':'A','É':'E','Í':'I','Ó':'O','Ú':'U' })[c] || c),
        monto: m.monto,
        tipo: m.monto >= 0 ? 'CR' : 'DB',
        matched: false,
        libroId: null,
    }));
    // Add a few "bank-only" items to simulate partial reconciliation
    stmt.push({
        id: `BANK-CARGO-${Date.now()}`,
        fecha: new Date().toISOString(),
        descripcion: 'COMISION BANCARIA BHD MARZO',
        monto: -250,
        tipo: 'DB',
        matched: false,
        libroId: null,
        bankOnly: true,
    });
    return stmt;
};

// ─────────────────────────────────────────────────────────────────
const ConciliacionBancaria = () => {
    const { saldoLibros } = useBancos();
    const { asientos } = useContabilidad();

    const [saldoBancario, setSaldoBancario] = useState('');
    const [busqueda, setBusqueda] = useState('');
    const [success, setSuccess] = useState(false);
    const [activeTab, setActiveTab] = useState('reconcile'); // reconcile | history | settings
    const [autoMatchDone, setAutoMatchDone] = useState(false);
    const [autoMatchCount, setAutoMatchCount] = useState(0);
    const [bankStatement, setBankStatement] = useState(null);
    const [matchMap, setMatchMap] = useState({}); // libroId => bankId
    const [historial, setHistorial] = useState([]);
    const [showImportModal, setShowImportModal] = useState(false);
    const [importText, setImportText] = useState('');
    const [showDetailId, setShowDetailId] = useState(null);
    const fileRef = useRef(null);

    // ── Book movements ────────────────────────────────────────────
    const movimientos = useMemo(() => {
        const list = [];
        asientos.forEach(a => {
            (a.detalles || a.movimientos || []).forEach(d => {
                const cuentaId = d.cuentaId;
                if (cuentaId && (cuentaId.startsWith('1101') || cuentaId.startsWith('1102'))) {
                    const monto = (Number(d.debito || d.debe) || 0) - (Number(d.credito || d.haber) || 0);
                    list.push({
                        id: `${a.id}-${d.cuentaId}`,
                        fecha: a.fecha,
                        descripcion: a.descripcion || '—',
                        cuentaId,
                        monto,
                        tipo: monto >= 0 ? 'CR' : 'DB',
                        referencia: a.referencia || a.numeroInterno || a.id,
                        asientoId: a.id,
                    });
                }
            });
        });
        return list.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    }, [asientos]);

    const movFiltrados = movimientos.filter(m =>
        (m.descripcion?.toLowerCase().includes(busqueda.toLowerCase()) || String(m.monto).includes(busqueda))
    );

    // ── KPIs ─────────────────────────────────────────────────────
    const totalLibros = movimientos.reduce((s, m) => s + m.monto, 0);
    const saldoBancoNum = Number(saldoBancario) || 0;
    const diferencia = saldoBancoNum - (saldoLibros || totalLibros);
    const estaConciliado = Math.abs(diferencia) < 0.01;
    const matchedCount = Object.keys(matchMap).length;
    const pctConciliado = movimientos.length > 0 ? Math.round((matchedCount / movimientos.length) * 100) : 0;

    // ── Auto-matching engine ──────────────────────────────────────
    const handleAutoMatch = () => {
        const stmt = bankStatement || generateBankStatement(movimientos);
        if (!bankStatement) setBankStatement(stmt);

        const newMatchMap = {};
        let count = 0;
        const usedBankIds = new Set();

        movimientos.forEach(libro => {
            // Match by amount (within 1 DOP tolerance)
            const candidates = stmt.filter(b =>
                !usedBankIds.has(b.id) &&
                Math.abs(b.monto - libro.monto) < 1
            );
            if (candidates.length > 0) {
                // Prefer same-date match
                const sameDate = candidates.find(b => b.fecha?.substring(0,10) === libro.fecha?.substring(0,10));
                const best = sameDate || candidates[0];
                newMatchMap[libro.id] = best.id;
                usedBankIds.add(best.id);
                count++;
            }
        });

        setMatchMap(newMatchMap);
        setAutoMatchDone(true);
        setAutoMatchCount(count);
    };

    // ── Toggle manual match ───────────────────────────────────────
    const toggleMatch = (libroId) => {
        setMatchMap(prev => {
            const nxt = { ...prev };
            if (nxt[libroId]) delete nxt[libroId];
            else nxt[libroId] = `MANUAL-${libroId}`;
            return nxt;
        });
    };

    // ── Export Excel ──────────────────────────────────────────────
    const exportToCSV = () => {
        const data = movimientos.map(m => ({
            'Fecha': new Date(m.fecha).toLocaleDateString(),
            'Descripcion': (m.descripcion || '').replace(/,/g, ''),
            'Referencia': m.referencia,
            'Monto': m.monto,
            'Tipo': m.tipo,
            'Conciliado': matchMap[m.id] ? 'Sí' : 'No'
        }));
        exportToExcel(data, `Conciliacion_${new Date().toISOString().split('T')[0]}`, 'Conciliacion');
    };

    // ── Save reconciliation ───────────────────────────────────────
    const handleGuardar = () => {
        const entry = {
            id: Date.now(),
            fecha: new Date().toLocaleDateString('es-DO'),
            saldoLibros: saldoLibros || totalLibros,
            saldoBanco: saldoBancoNum,
            diferencia,
            conciliado: estaConciliado,
            itemsReconciliados: matchedCount,
            itemsTotal: movimientos.length,
        };
        setHistorial(prev => [entry, ...prev]);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 4000);
    };

    // ── Simulate file import ──────────────────────────────────────
    const handleSimulateImport = () => {
        const stmt = generateBankStatement(movimientos);
        setBankStatement(stmt);
        setShowImportModal(false);
        setAutoMatchDone(false);
        setMatchMap({});
    };

    // ── Styles ────────────────────────────────────────────────────
    const glassCard = {
        background: 'rgba(255,255,255,0.9)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.6)',
        borderRadius: '20px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.07)',
    };

    return (
        <div className="animate-up" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

            {/* ── Header ───────────────────────────────────────── */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1 className="page-title" style={{ marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <GitMerge size={28} color="var(--primary)" /> Conciliación Bancaria
                    </h1>
                    <p style={{ color: 'var(--text-muted)' }}>Motor automático de conciliación · comparación de libros vs extracto bancario</p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <button className="btn btn-secondary" onClick={() => setShowImportModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Upload size={16} /> Cargar Extracto
                    </button>
                    <button className="btn btn-secondary" onClick={exportToCSV} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <FileSpreadsheet size={16} /> Exportar Excel
                    </button>
                    <button className="btn btn-primary" onClick={handleGuardar} disabled={!estaConciliado} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Save size={16} /> Guardar Conciliación
                    </button>
                </div>
            </div>

            {/* ── Success Banner ───────────────────────────────── */}
            {success && (
                <div style={{ background: 'rgba(34,197,94,0.1)', color: '#16a34a', padding: '1rem 1.5rem', borderRadius: '14px', border: '1px solid rgba(34,197,94,0.3)', display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 600 }}>
                    <CheckCircle size={20} /> ¡Conciliación guardada exitosamente en el historial!
                </div>
            )}

            {autoMatchDone && (
                <div style={{ background: 'rgba(37,99,235,0.08)', color: 'var(--primary)', padding: '1rem 1.5rem', borderRadius: '14px', border: '1px solid rgba(37,99,235,0.2)', display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 600 }}>
                    <Zap size={20} /> Motor automático: <strong>{autoMatchCount}</strong> movimientos conciliados automáticamente. Revisa los no conciliados manualmente.
                </div>
            )}

            {/* ── Tab Bar ─────────────────────────────────────── */}
            <div style={{ display: 'flex', gap: '0.25rem', background: 'rgba(248,250,252,0.9)', padding: '0.3rem', borderRadius: '14px', width: 'fit-content', border: '1px solid var(--border)' }}>
                {[
                    { id: 'reconcile', label: 'Conciliar', icon: GitMerge },
                    { id: 'history', label: 'Historial', icon: Clock },
                ].map(tab => {
                    const Icon = tab.icon;
                    return (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ padding: '0.5rem 1.25rem', borderRadius: '10px', border: 'none', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', background: activeTab === tab.id ? 'var(--primary)' : 'transparent', color: activeTab === tab.id ? '#fff' : 'var(--text-muted)', transition: 'all 0.2s' }}>
                            <Icon size={15} /> {tab.label}
                        </button>
                    );
                })}
            </div>

            {activeTab === 'reconcile' && (<>

                {/* ── KPI Summary Cards ────────────────────────── */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                    {[
                        { label: 'Saldo en Libros', value: fmt(saldoLibros || totalLibros), color: 'var(--primary)', bg: 'rgba(37,99,235,0.1)', info: 'Calculado del diario contable (cuentas 1101/1102)' },
                        { label: 'Saldo del Banco', value: fmt(saldoBancoNum), color: '#d97706', bg: 'rgba(245,158,11,0.1)', info: 'Ingresado manualmente o importado del extracto' },
                        { label: 'Diferencia', value: fmt(diferencia), color: estaConciliado ? '#16a34a' : '#ef4444', bg: estaConciliado ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', info: estaConciliado ? '✅ Balance cuadrado' : '⚠️ Pendiente de ajuste' },
                        { label: '% Conciliado', value: `${pctConciliado}%`, color: '#7c3aed', bg: 'rgba(124,58,237,0.1)', info: `${matchedCount} de ${movimientos.length} movimientos` },
                    ].map((kpi, i) => (
                        <div key={i} style={{ ...glassCard, padding: '1.25rem' }}>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>{kpi.label}</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 900, color: kpi.color, letterSpacing: '-0.02em' }}>{kpi.value}</div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{kpi.info}</div>
                        </div>
                    ))}
                </div>

                {/* ── Manual saldo bancario ─────────────────────── */}
                <div style={{ ...glassCard, padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: '200px' }}>
                        <label className="input-label">🏦 Saldo Extracto Bancario (DOP)</label>
                        <input type="number" className="input-field" placeholder="Ej: 450,000.00" value={saldoBancario} onChange={e => setSaldoBancario(e.target.value)} style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 0 }} />
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <button onClick={handleAutoMatch} style={{ background: 'linear-gradient(135deg, var(--primary), #1d4ed8)', color: '#fff', border: 'none', borderRadius: '12px', padding: '0.875rem 1.5rem', cursor: 'pointer', fontWeight: 700, fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                            <Zap size={18} /> Auto-Conciliar
                        </button>
                        <button onClick={() => { setMatchMap({}); setAutoMatchDone(false); }} style={{ background: 'rgba(107,114,128,0.1)', color: 'var(--text-muted)', border: 'none', borderRadius: '12px', padding: '0.875rem 1.25rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <RefreshCw size={15} /> Limpiar
                        </button>
                    </div>
                </div>

                {/* ── Progress bar ─────────────────────────────── */}
                {movimientos.length > 0 && (
                    <div style={{ ...glassCard, padding: '1.25rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                            <span style={{ fontWeight: 700, fontSize: '0.875rem' }}>Progreso de Conciliación</span>
                            <span style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '0.875rem' }}>{matchedCount} / {movimientos.length} movimientos</span>
                        </div>
                        <div style={{ height: '10px', borderRadius: '5px', background: 'rgba(0,0,0,0.06)' }}>
                            <div style={{ height: '100%', borderRadius: '5px', background: `linear-gradient(90deg, ${pctConciliado === 100 ? '#22c55e' : 'var(--primary)'}, ${pctConciliado === 100 ? '#16a34a' : '#1d4ed8'})`, width: `${pctConciliado}%`, transition: 'width 0.5s ease' }} />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            <span>🟢 {matchedCount} conciliados</span>
                            <span>🔴 {movimientos.length - matchedCount} pendientes</span>
                        </div>
                    </div>
                )}

                {/* ── Dual-pane reconciliation table ───────────── */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    {/* LIBROS */}
                    <div style={{ ...glassCard, overflow: 'hidden' }}>
                        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <FileText size={16} color="var(--primary)" /> Libros Contables
                            </div>
                            <div style={{ position: 'relative' }}>
                                <Search size={12} style={{ position: 'absolute', left: '0.6rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                <input className="input-field" placeholder="Filtrar..." style={{ paddingLeft: '1.8rem', height: '30px', fontSize: '0.75rem', width: '140px', marginBottom: 0 }} value={busqueda} onChange={e => setBusqueda(e.target.value)} />
                            </div>
                        </div>
                        <div style={{ overflowY: 'auto', maxHeight: '400px' }}>
                            {movFiltrados.length === 0 ? (
                                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                    No hay movimientos de caja/banco registrados.
                                </div>
                            ) : (
                                movFiltrados.map(m => {
                                    const isConciliado = !!matchMap[m.id];
                                    return (
                                        <div key={m.id} onClick={() => toggleMatch(m.id)} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', cursor: 'pointer', borderBottom: '1px solid rgba(0,0,0,0.04)', background: isConciliado ? 'rgba(34,197,94,0.06)' : 'transparent', transition: 'background 0.15s' }}>
                                            {isConciliado
                                                ? <CheckSquare size={18} color="#16a34a" style={{ flexShrink: 0 }} />
                                                : <Square size={18} color="var(--border)" style={{ flexShrink: 0 }} />
                                            }
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ fontWeight: 600, fontSize: '0.8rem', color: 'var(--text-main)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.descripcion}</div>
                                                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{fmtDate(m.fecha)} · REF: {m.referencia}</div>
                                            </div>
                                            <div style={{ fontWeight: 700, fontSize: '0.85rem', color: m.monto >= 0 ? '#16a34a' : '#ef4444', flexShrink: 0 }}>
                                                {m.monto >= 0 ? '+' : ''}{fmt(m.monto)}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    {/* Banco / Extracto */}
                    <div style={{ ...glassCard, overflow: 'hidden' }}>
                        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Layers size={16} color="#7c3aed" /> Extracto Bancario
                            </div>
                            {!bankStatement && (
                                <button onClick={() => setShowImportModal(true)} style={{ fontSize: '0.75rem', padding: '0.3rem 0.75rem', background: 'rgba(124,58,237,0.1)', color: '#7c3aed', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>
                                    + Cargar
                                </button>
                            )}
                        </div>
                        <div style={{ overflowY: 'auto', maxHeight: '400px' }}>
                            {!bankStatement ? (
                                <div style={{ padding: '3rem 2rem', textAlign: 'center' }}>
                                    <Upload size={40} color="var(--border)" style={{ marginBottom: '1rem' }} />
                                    <div style={{ fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.5rem' }}>No hay extracto cargado</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>Importa el estado de cuenta de tu banco para comparar</div>
                                    <button onClick={() => setShowImportModal(true)} className="btn btn-primary" style={{ fontSize: '0.8rem', padding: '0.5rem 1.25rem' }}>
                                        Cargar Extracto
                                    </button>
                                </div>
                            ) : (
                                bankStatement.map(b => {
                                    const isMatched = Object.values(matchMap).includes(b.id);
                                    return (
                                        <div key={b.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', borderBottom: '1px solid rgba(0,0,0,0.04)', background: isMatched ? 'rgba(34,197,94,0.06)' : b.bankOnly ? 'rgba(239,68,68,0.04)' : 'transparent' }}>
                                            {isMatched
                                                ? <CheckCircle size={18} color="#16a34a" style={{ flexShrink: 0 }} />
                                                : <AlertTriangle size={18} color={b.bankOnly ? '#ef4444' : 'var(--border)'} style={{ flexShrink: 0 }} />
                                            }
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ fontWeight: 600, fontSize: '0.8rem', color: 'var(--text-main)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.descripcion}</div>
                                                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                                                    {fmtDate(b.fecha)} · {b.tipo}
                                                    {b.bankOnly && <span style={{ color: '#ef4444', fontWeight: 700, marginLeft: '0.5rem' }}>Solo en banco</span>}
                                                </div>
                                            </div>
                                            <div style={{ fontWeight: 700, fontSize: '0.85rem', color: b.monto >= 0 ? '#16a34a' : '#ef4444', flexShrink: 0 }}>
                                                {b.monto >= 0 ? '+' : ''}{fmt(b.monto)}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>

                {/* ── Leyenda ──────────────────────────────────── */}
                <div style={{ ...glassCard, padding: '1rem 1.5rem', display: 'flex', gap: '2rem', flexWrap: 'wrap', alignItems: 'center' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>Leyenda:</div>
                    {[
                        { color: '#16a34a', bg: 'rgba(34,197,94,0.1)', label: 'Conciliado (coincide en libros y banco)' },
                        { color: '#ef4444', bg: 'rgba(239,68,68,0.1)', label: 'Solo en banco (cargo bancario sin registro)' },
                        { color: 'var(--text-muted)', bg: 'rgba(107,114,128,0.1)', label: 'Pendiente de conciliar (haz clic para marcar)' },
                    ].map(l => (
                        <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem' }}>
                            <div style={{ width: 12, height: 12, borderRadius: '3px', background: l.bg, border: `1px solid ${l.color}50` }} />
                            <span style={{ color: 'var(--text-muted)' }}>{l.label}</span>
                        </div>
                    ))}
                </div>
            </>)}

            {activeTab === 'history' && (
                <div style={{ ...glassCard, overflow: 'hidden' }}>
                    <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', fontWeight: 700 }}>Historial de Conciliaciones</div>
                    {historial.length === 0 ? (
                        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                            No hay conciliaciones guardadas todavía.
                        </div>
                    ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                            <thead><tr style={{ background: 'rgba(248,250,252,0.8)' }}>
                                {['Fecha', 'Saldo Libros', 'Saldo Banco', 'Diferencia', 'Items', 'Estado'].map(h => (
                                    <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{h}</th>
                                ))}
                            </tr></thead>
                            <tbody>
                                {historial.map(h => (
                                    <tr key={h.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                        <td style={{ padding: '0.875rem 1rem', fontWeight: 600 }}>{h.fecha}</td>
                                        <td style={{ padding: '0.875rem 1rem' }}>{fmt(h.saldoLibros)}</td>
                                        <td style={{ padding: '0.875rem 1rem' }}>{fmt(h.saldoBanco)}</td>
                                        <td style={{ padding: '0.875rem 1rem', fontWeight: 700, color: h.conciliado ? '#16a34a' : '#ef4444' }}>{fmt(h.diferencia)}</td>
                                        <td style={{ padding: '0.875rem 1rem', color: 'var(--text-muted)' }}>{h.itemsReconciliados}/{h.itemsTotal}</td>
                                        <td style={{ padding: '0.875rem 1rem' }}>
                                            <span style={{ padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, background: h.conciliado ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', color: h.conciliado ? '#16a34a' : '#ef4444' }}>
                                                {h.conciliado ? '✅ Cuadrado' : '⚠️ Diferencia'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}

            {/* ── Import Modal ─────────────────────────────────── */}
            {showImportModal && (
                <div className="modal-overlay">
                    <div style={{ background: '#fff', borderRadius: '20px', width: '100%', maxWidth: '520px', boxShadow: '0 40px 80px rgba(0,0,0,0.2)', zIndex: 2001, overflow: 'hidden' }}>
                        <div style={{ background: 'linear-gradient(135deg, #6d28d9, #7c3aed)', padding: '1.5rem 2rem', color: '#fff', position: 'relative' }}>
                            <button onClick={() => setShowImportModal(false)} style={{ position: 'absolute', right: '1.25rem', top: '1.25rem', background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '8px', color: '#fff', cursor: 'pointer', padding: '0.3rem', display: 'flex' }}><X size={18} /></button>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                                <Upload size={22} /> <span style={{ fontWeight: 800, fontSize: '1.2rem' }}>Cargar Extracto Bancario</span>
                            </div>
                            <div style={{ fontSize: '0.85rem', opacity: 0.85 }}>Importa tu estado de cuenta para conciliar automáticamente</div>
                        </div>
                        <div style={{ padding: '1.5rem 2rem 2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            {/* Drag & Drop Zone */}
                            <div
                                onClick={() => fileRef.current?.click()}
                                style={{ border: '2px dashed rgba(109,40,217,0.3)', borderRadius: '14px', padding: '2.5rem', textAlign: 'center', cursor: 'pointer', background: 'rgba(109,40,217,0.03)', transition: 'all 0.2s' }}
                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(109,40,217,0.07)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'rgba(109,40,217,0.03)'}
                            >
                                <input type="file" ref={fileRef} accept=".csv,.xlsx,.xls" style={{ display: 'none' }} />
                                <Upload size={36} color="#7c3aed" style={{ marginBottom: '0.75rem' }} />
                                <div style={{ fontWeight: 700, color: '#7c3aed', marginBottom: '0.25rem' }}>Arrastra tu archivo aquí</div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Formatos soportados: CSV, XLS, XLSX de BHD, Banreservas, Scotiabank, etc.</div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>O</span>
                                <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
                            </div>
                            <div style={{ padding: '1rem', background: 'rgba(34,197,94,0.06)', borderRadius: '12px', border: '1px solid rgba(34,197,94,0.2)', fontSize: '0.82rem', color: '#166534' }}>
                                💡 <strong>Modo Demo:</strong> Haz clic en «Simular Extracto» para generar datos de prueba basados en tus movimientos contables existentes.
                            </div>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button onClick={() => setShowImportModal(false)} className="btn btn-secondary" style={{ flex: 1 }}>Cancelar</button>
                                <button onClick={handleSimulateImport} style={{ flex: 2, padding: '0.875rem', background: 'linear-gradient(135deg, #6d28d9, #7c3aed)', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                    <Zap size={18} /> Simular Extracto
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ConciliacionBancaria;
