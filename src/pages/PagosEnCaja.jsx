import React, { useState, useMemo } from 'react';
import { useSocios } from '../context/SociosContext';
import { useCaja } from '../context/CajaContext';
import { usePrestamos } from '../context/PrestamosContext';
import {
    Search, ChevronLeft, ChevronRight, RefreshCw, X,
    DollarSign, ArrowDownCircle, ArrowUpCircle, Printer,
    CheckCircle2, Plus, Trash2, List, Coins, FileText as FileIcon
} from 'lucide-react';

// ── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (n) => new Intl.NumberFormat('es-DO', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(n) || 0);
const DENOMINATIONS = [2000, 1000, 500, 200, 100, 50, 25, 20, 10, 5, 1, 0.01];

// ═════════════════════════════════════════════════════════════════════════════
// MODAL: Desglose de Efectivo
// ═════════════════════════════════════════════════════════════════════════════
const DesgloseModal = ({ monto, onConfirm, onClose }) => {
    const [cantidades, setCantidades] = useState(() =>
        Object.fromEntries(DENOMINATIONS.map(d => [d, 0]))
    );

    const totalDesglosado = DENOMINATIONS.reduce((sum, d) => sum + d * (cantidades[d] || 0), 0);
    const cambio = Math.max(0, totalDesglosado - monto);

    const handleCant = (den, val) => {
        const v = Math.max(0, parseInt(val) || 0);
        setCantidades(p => ({ ...p, [den]: v }));
    };

    const denLabel = (d) => d < 1 ? 'Ctvs' : d.toLocaleString('es-DO');

    return (
        <div className="modal-overlay" style={{ zIndex: 1100 }}>
            <div className="card glass" style={{ width: '520px', padding: 0, overflow: 'hidden', boxShadow: '0 24px 64px rgba(0,0,0,0.25)' }}>
                {/* Header */}
                <div style={{ background: 'linear-gradient(135deg, var(--primary), #1e40af)', padding: '0.75rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: 'white', fontWeight: 800, fontSize: '0.95rem', letterSpacing: '1px', textTransform: 'uppercase' }}>
                        Desglose de Efectivo
                    </span>
                    <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '6px', padding: '0.25rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <X size={16} color="white" />
                    </button>
                </div>

                <div style={{ padding: '1rem', display: 'grid', gridTemplateColumns: '1fr auto', gap: '1rem' }}>
                    {/* Tabla denominaciones */}
                    <div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.25rem', padding: '0.4rem 0.5rem', background: 'var(--primary)', borderRadius: 'var(--radius-sm)', marginBottom: '0.25rem' }}>
                            {['Desglose', 'Cant.', 'Monto'].map(h => (
                                <span key={h} style={{ color: 'white', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase' }}>{h}</span>
                            ))}
                        </div>
                        <div style={{ maxHeight: '320px', overflowY: 'auto', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}>
                            {DENOMINATIONS.map(den => (
                                <div key={den} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.25rem', padding: '0.25rem 0.5rem', borderBottom: '1px solid var(--border-light)', alignItems: 'center' }}>
                                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)' }}>
                                        {den === 0.01 ? 'Ctvs' : `RD$${denLabel(den)}`}
                                    </span>
                                    <input
                                        type="number"
                                        min="0"
                                        className="input-field"
                                        style={{ height: '1.8rem', fontSize: '0.82rem', padding: '0 0.4rem', width: '100%' }}
                                        value={cantidades[den] || ''}
                                        onChange={e => handleCant(den, e.target.value)}
                                    />
                                    <span style={{ fontSize: '0.82rem', fontWeight: 600, textAlign: 'right', color: cantidades[den] > 0 ? 'var(--success)' : 'var(--text-muted)' }}>
                                        {fmt(den * (cantidades[den] || 0))}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Panel derecho */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', minWidth: '150px', paddingTop: '1.5rem' }}>
                        <div style={{ background: 'var(--primary-light)', border: '1px solid var(--primary)', borderRadius: 'var(--radius-md)', padding: '0.75rem', textAlign: 'center' }}>
                            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Monto a Cobrar</div>
                            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary)' }}>{fmt(monto)}</div>
                        </div>
                        <div style={{ background: 'rgba(16,185,129,0.07)', border: '1px solid var(--success)', borderRadius: 'var(--radius-md)', padding: '0.75rem', textAlign: 'center' }}>
                            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--success)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Efectivo Desglosado</div>
                            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--success)' }}>{fmt(totalDesglosado)}</div>
                        </div>
                        <div style={{ background: cambio > 0 ? 'rgba(245,158,11,0.07)' : 'var(--bg-secondary)', border: `1px solid ${cambio > 0 ? 'var(--warning)' : 'var(--border)'}`, borderRadius: 'var(--radius-md)', padding: '0.75rem', textAlign: 'center' }}>
                            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: cambio > 0 ? 'var(--warning)' : 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Cambio</div>
                            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: cambio > 0 ? 'var(--warning)' : 'var(--text-muted)' }}>{fmt(cambio)}</div>
                        </div>
                    </div>
                </div>

                {/* Botones */}
                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', padding: '0.75rem 1rem', borderTop: '1px solid var(--border)', background: 'var(--bg-secondary)' }}>
                    <button className="btn btn-secondary" onClick={onClose} style={{ gap: '0.4rem' }}>
                        <X size={14} /> Cancelar
                    </button>
                    <button className="btn btn-primary" onClick={() => onConfirm({ cantidades, totalDesglosado, cambio })} style={{ gap: '0.4rem', background: 'var(--success)', borderColor: 'var(--success)' }}>
                        <CheckCircle2 size={14} /> OK — Confirmar
                    </button>
                </div>
            </div>
        </div>
    );
};

// ═════════════════════════════════════════════════════════════════════════════
// MODAL: Pagos Mixtos
// ═════════════════════════════════════════════════════════════════════════════
const BANCOS = ['BHD León', 'Banco Popular', 'Banreservas', 'Scotiabank', 'Banco BDI', 'Apap', 'Otro'];

const PagosMixtosModal = ({ monto, onConfirm, onClose }) => {
    const [items, setItems] = useState([{ id: 1, tipo: 'Cheque', monto: 0, referencia: '', banco: '' }]);
    const [efectivo, setEfectivo] = useState(monto);

    const addItem = () => setItems(p => [...p, { id: Date.now(), tipo: 'Cheque', monto: 0, referencia: '', banco: '' }]);
    const removeItem = (id) => setItems(p => p.filter(i => i.id !== id));
    const updateItem = (id, field, val) => setItems(p => p.map(i => i.id === id ? { ...i, [field]: val } : i));

    const totales = items.reduce((acc, i) => {
        const m = Number(i.monto) || 0;
        if (i.tipo === 'Cheque') acc.cheques += m;
        if (i.tipo === 'Tarjeta') acc.tarjetas += m;
        if (i.tipo === 'Transferencias') acc.transferencias += m;
        return acc;
    }, { cheques: 0, tarjetas: 0, transferencias: 0 });

    const totalDesglosado = efectivo + totales.cheques + totales.tarjetas + totales.transferencias;

    return (
        <div className="modal-overlay" style={{ zIndex: 1100 }}>
            <div className="card glass" style={{ width: '600px', padding: 0, overflow: 'hidden', boxShadow: '0 24px 64px rgba(0,0,0,0.25)' }}>
                {/* Header */}
                <div style={{ background: 'linear-gradient(135deg, var(--primary), #1e40af)', padding: '0.75rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: 'white', fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase' }}>Pagos Mixtos</span>
                    <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '6px', padding: '0.25rem', cursor: 'pointer' }}>
                        <X size={16} color="white" />
                    </button>
                </div>

                <div style={{ padding: '1rem' }}>
                    {/* Cabecera */}
                    <div style={{ display: 'grid', gridTemplateColumns: '140px 90px 1fr 1fr 60px', gap: '0.5rem', padding: '0.35rem 0.5rem', background: 'var(--primary)', borderRadius: 'var(--radius-sm)', marginBottom: '0.25rem' }}>
                        {['Tipo', 'Monto', 'Referencia', 'Banco', 'Acc.'].map(h => (
                            <span key={h} style={{ color: 'white', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase' }}>{h}</span>
                        ))}
                    </div>

                    {/* Filas dinámicas */}
                    <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', marginBottom: '0.75rem' }}>
                        {items.map((item) => (
                            <div key={item.id} style={{ display: 'grid', gridTemplateColumns: '140px 90px 1fr 1fr 60px', gap: '0.5rem', padding: '0.35rem 0.5rem', borderBottom: '1px solid var(--border-light)', alignItems: 'center' }}>
                                <select className="input-field" style={{ height: '1.9rem', fontSize: '0.82rem', padding: '0 0.35rem' }}
                                    value={item.tipo} onChange={e => updateItem(item.id, 'tipo', e.target.value)}>
                                    {['Cheque', 'Tarjeta', 'Transferencias'].map(t => <option key={t}>{t}</option>)}
                                </select>
                                <input type="number" min="0" className="input-field" style={{ height: '1.9rem', fontSize: '0.82rem', padding: '0 0.35rem' }}
                                    value={item.monto} onChange={e => updateItem(item.id, 'monto', e.target.value)} />
                                <input type="text" className="input-field" style={{ height: '1.9rem', fontSize: '0.82rem', padding: '0 0.35rem' }}
                                    placeholder="Ref..." value={item.referencia} onChange={e => updateItem(item.id, 'referencia', e.target.value)} />
                                <select className="input-field" style={{ height: '1.9rem', fontSize: '0.82rem', padding: '0 0.35rem' }}
                                    value={item.banco} onChange={e => updateItem(item.id, 'banco', e.target.value)}>
                                    <option value=""></option>
                                    {BANCOS.map(b => <option key={b}>{b}</option>)}
                                </select>
                                <div style={{ display: 'flex', gap: '0.25rem' }}>
                                    <button onClick={addItem} style={{ background: 'var(--success)', color: 'white', border: 'none', borderRadius: '6px', width: '24px', height: '24px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Plus size={13} />
                                    </button>
                                    {items.length > 1 && (
                                        <button onClick={() => removeItem(item.id)} style={{ background: 'var(--danger)', color: 'white', border: 'none', borderRadius: '6px', width: '24px', height: '24px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <Trash2 size={11} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Summary grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', padding: '0.75rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                        {[
                            ['Efectivo', efectivo],
                            ['Tarjetas', totales.tarjetas],
                            ['Total a Desglosar', monto],
                            ['Cheques', totales.cheques],
                            ['Transferencia', totales.transferencias],
                            ['Total Desglosado', totalDesglosado],
                        ].map(([label, val]) => (
                            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.35rem 0.5rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}>
                                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>{label}</span>
                                <span style={{ fontSize: '0.88rem', fontWeight: 800, color: label.includes('Total') ? 'var(--primary)' : 'inherit' }}>{fmt(val)}</span>
                            </div>
                        ))}
                    </div>

                    {/* Efectivo field */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.75rem' }}>
                        <label style={{ fontSize: '0.82rem', fontWeight: 600 }}>Efectivo:</label>
                        <input type="number" min="0" className="input-field" style={{ height: '2rem', fontSize: '0.88rem', width: '140px' }}
                            value={efectivo} onChange={e => setEfectivo(Number(e.target.value) || 0)} />
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', padding: '0.75rem 1rem', borderTop: '1px solid var(--border)', background: 'var(--bg-secondary)' }}>
                    <button className="btn btn-secondary" onClick={onClose} style={{ gap: '0.4rem' }}>
                        <X size={14} /> Cancelar
                    </button>
                    <button className="btn btn-primary" onClick={() => onConfirm({ items, efectivo, totales, totalDesglosado })} style={{ gap: '0.4rem', background: 'var(--success)', borderColor: 'var(--success)' }}>
                        <CheckCircle2 size={14} /> Aceptar
                    </button>
                </div>
            </div>
        </div>
    );
};

// ═════════════════════════════════════════════════════════════════════════════
// MODAL: Cuotas Pendientes
// ═════════════════════════════════════════════════════════════════════════════
const CuotasPendientesModal = ({ cuotas, onConfirm, onClose }) => {
    const [selectedIds, setSelectedIds] = useState(cuotas.slice(0, 1).map(c => c.id));

    const toggle = (id) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const selectedCuotas = cuotas.filter(c => selectedIds.includes(c.id));
    const totals = selectedCuotas.reduce((acc, c) => ({
        capital: acc.capital + c.capital,
        interes: acc.interes + c.interes,
        mora: acc.mora + c.mora,
        seguro: acc.seguro + c.seguro,
        otros: acc.otros + c.otros,
        total: acc.total + c.total
    }), { capital: 0, interes: 0, mora: 0, seguro: 0, otros: 0, total: 0 });

    return (
        <div className="modal-overlay" style={{ zIndex: 1100 }}>
            <div className="card glass" style={{ width: '850px', padding: 0, overflow: 'hidden', boxShadow: '0 24px 64px rgba(0,0,0,0.25)' }}>
                <div style={{ background: 'var(--primary)', padding: '0.75rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: 'white', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>Cuotas Pendientes</span>
                    <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '6px', padding: '0.2rem', cursor: 'pointer' }}>
                        <X size={16} color="white" />
                    </button>
                </div>

                <div style={{ padding: '1rem' }}>
                    <h3 style={{ textAlign: 'center', color: 'var(--primary)', fontSize: '0.9rem', marginBottom: '1rem', fontWeight: 700 }}>Cuotas a Descontar de la Cta. 266 PRESTAMO NORMAL</h3>

                    <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '40px 100px 1fr 1fr 1fr 1fr 1fr 1fr', background: 'var(--primary)', padding: '0.5rem', gap: '0.5rem' }}>
                            <div />
                            {['Fecha Pago', 'Cap. Pend.', 'Int. Pend.', 'Mora Pend.', 'Seg. Pend.', 'Otros Pend.', 'Total'].map(h => (
                                <span key={h} style={{ fontSize: '0.65rem', fontWeight: 800, color: 'white', textTransform: 'uppercase' }}>{h}</span>
                            ))}
                        </div>
                        <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                            {cuotas.map(c => (
                                <div key={c.id} style={{ display: 'grid', gridTemplateColumns: '40px 100px 1fr 1fr 1fr 1fr 1fr 1fr', padding: '0.5rem', gap: '0.5rem', borderBottom: '1px solid var(--border-light)', alignItems: 'center', background: selectedIds.includes(c.id) ? 'rgba(34,197,94,0.05)' : 'transparent' }}>
                                    <input type="checkbox" checked={selectedIds.includes(c.id)} onChange={() => toggle(c.id)} style={{ accentColor: 'var(--success)', width: '16px', height: '16px' }} />
                                    <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{c.fecha}</span>
                                    <span style={{ fontSize: '0.8rem', textAlign: 'right' }}>{fmt(c.capital)}</span>
                                    <span style={{ fontSize: '0.8rem', textAlign: 'right' }}>{fmt(c.interes)}</span>
                                    <span style={{ fontSize: '0.8rem', textAlign: 'right' }}>{fmt(c.mora)}</span>
                                    <span style={{ fontSize: '0.8rem', textAlign: 'right' }}>{fmt(c.seguro)}</span>
                                    <span style={{ fontSize: '0.8rem', textAlign: 'right' }}>{fmt(c.otros)}</span>
                                    <span style={{ fontSize: '0.8rem', textAlign: 'right', fontWeight: 700 }}>{fmt(c.total)}</span>
                                </div>
                            ))}
                        </div>
                        {/* Totales */}
                        <div style={{ display: 'grid', gridTemplateColumns: '40px 100px 1fr 1fr 1fr 1fr 1fr 1fr', padding: '0.75rem 0.5rem', gap: '0.5rem', background: 'var(--bg-secondary)', fontWeight: 800, borderTop: '2px solid var(--primary)' }}>
                            <span style={{ fontSize: '0.75rem', color: 'var(--success)' }}>Totales</span>
                            <div />
                            <span style={{ fontSize: '0.8rem', textAlign: 'right' }}>{fmt(totals.capital)}</span>
                            <span style={{ fontSize: '0.8rem', textAlign: 'right' }}>{fmt(totals.interes)}</span>
                            <span style={{ fontSize: '0.8rem', textAlign: 'right' }}>{fmt(totals.mora)}</span>
                            <span style={{ fontSize: '0.8rem', textAlign: 'right' }}>{fmt(totals.seguro)}</span>
                            <span style={{ fontSize: '0.8rem', textAlign: 'right' }}>{fmt(totals.otros)}</span>
                            <span style={{ fontSize: '0.85rem', textAlign: 'right', color: 'var(--primary)' }}>{fmt(totals.total)}</span>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', padding: '1rem', borderTop: '1px solid var(--border)', background: 'var(--bg-secondary)' }}>
                    <button className="btn btn-primary" onClick={() => onConfirm(totals)} style={{ background: 'var(--success)', borderColor: 'var(--success)', minWidth: '140px', gap: '0.5rem' }}>
                        <CheckCircle2 size={16} /> OK
                    </button>
                    <button className="btn btn-secondary" onClick={onClose} style={{ minWidth: '140px', gap: '0.5rem' }}>
                        <X size={16} /> Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

// ═════════════════════════════════════════════════════════════════════════════
// VISTA PRINCIPAL: Pagos en Caja
// ═════════════════════════════════════════════════════════════════════════════
const CUENTA_TYPES = {
    ahorros: 'Ahorros',
    prestamos: 'Préstamos',
    aportacion: 'Aportaciones',
};

const buildCuentas = (socio) => {
    if (!socio) return [];
    const cuentas = [];
    if (socio.ahorros > 0 || socio.ficha)
        cuentas.push({ id: 'aho', numero: socio.codigo, descripcion: 'AHORROS LIBRETA (RETIRABLE)', tipo: 'Ahorros', balance: socio.ahorros || 0, obs: '' });
    if (socio.aportacion > 0)
        cuentas.push({ id: 'apo', numero: (parseInt(socio.codigo?.replace('SOC-', '') || 0) * 6).toString(), descripcion: 'APORTACIONES', tipo: 'Aportaciones', balance: socio.aportacion || 0, obs: '' });
    if (socio.prestamos > 0)
        cuentas.push({ id: 'pre', numero: (parseInt(socio.codigo?.replace('SOC-', '') || 0) * 3).toString().padStart(3, '0'), descripcion: 'PRESTAMO NORMAL', tipo: 'Préstamos', balance: socio.prestamos || 0, obs: '' });
    cuentas.push({ id: 'otros', numero: socio.codigo, descripcion: 'Otras Ingresos', tipo: 'Transacciones Libro Mayor', balance: 0, obs: '' });
    return cuentas;
};

const PagosEnCaja = () => {
    const { socios, actualizarSocio } = useSocios();
    const { agregarRecibo } = useCaja();

    // ── Estado de búsqueda ────────────────────────────────────────────────
    const [busqCodigo, setBusqCodigo] = useState('');
    const [busqNombre, setBusqNombre] = useState('');
    const [busqCedula, setBusqCedula] = useState('');
    const [socioIdx, setSocioIdx] = useState(0);
    const [searched, setSearched] = useState(false);

    // ── Estado de compte seleccionada ─────────────────────────────────────
    const [cuentaSel, setCuentaSel] = useState(null);
    const [monto, setMonto] = useState('');
    const [observacion, setObservacion] = useState('');
    const [formaPago, setFormaPago] = useState('efectivo'); // efectivo | mixto
    const [muestraBalance, setMuestraBalance] = useState(true);

    // ── Modales ────────────────────────────────────────────────────────────
    const [showDesglose, setShowDesglose] = useState(false);
    const [showMixto, setShowMixto] = useState(false);
    const [showRecibo, setShowRecibo] = useState(null);
    const [showCuotas, setShowCuotas] = useState(false);

    // ── Estado de Préstamo ───────────────────────────────────────────────
    const [loanFields, setLoanFields] = useState({
        capital: 0, interes: 0, mora: 0, seguro: 0, comision: 0, otros: 0
    });
    const [ncf, setNcf] = useState('(B02) Factura Consumidor Final');
    const [tipoPago, setTipoPago] = useState('pagar'); // pagar | abonar
    const [saldarPrestamo, setSaldarPrestamo] = useState(false);

    // ── Socios filtrados ──────────────────────────────────────────────────
    const filtrados = useMemo(() => socios.filter(s => {
        const q = v => (v || '').toLowerCase();
        return (
            (!busqCodigo || q(s.codigo).includes(q(busqCodigo))) &&
            (!busqNombre || q(s.nombre).includes(q(busqNombre))) &&
            (!busqCedula || q(s.cedula).includes(q(busqCedula)))
        );
    }), [socios, busqCodigo, busqNombre, busqCedula]);

    const socio = searched && filtrados.length > 0 ? filtrados[socioIdx] : null;
    const cuentas = buildCuentas(socio);
    const cuentaActual = cuentas.find(c => c.id === cuentaSel?.id) || cuentaSel;

    const handleBuscar = () => { setSearched(true); setSocioIdx(0); setCuentaSel(null); setMonto(''); };
    const handleLimpiar = () => { setBusqCodigo(''); setBusqNombre(''); setBusqCedula(''); setSearched(false); setSocioIdx(0); setCuentaSel(null); setMonto(''); setObservacion(''); };
    const handlePrev = () => { if (socioIdx > 0) { setSocioIdx(p => p - 1); setCuentaSel(null); } };
    const handleNext = () => { if (socioIdx < filtrados.length - 1) { setSocioIdx(p => p + 1); setCuentaSel(null); } };

    // Saldos calculados
    const saldoActual = cuentaActual?.balance || 0;
    const pignorado = 0;
    const flotante = 0;
    const embargos = 0;
    const disponible = saldoActual - pignorado - flotante - embargos;

    // ── Depósito / Retiro ──────────────────────────────────────────────────
    const ejecutarTransaccion = (tipo) => {
        const m = parseFloat(monto) || 0;
        if (!m || m <= 0) { alert('Ingrese un monto válido.'); return; }
        if (!cuentaActual) { alert('Seleccione una cuenta.'); return; }
        if (tipo === 'retiro' && m > disponible) { alert('Monto supera el saldo disponible.'); return; }

        const campo = cuentaActual.tipo === 'Ahorros' ? 'ahorros'
            : cuentaActual.tipo === 'Aportaciones' ? 'aportacion'
                : 'prestamos';

        const nuevo = tipo === 'deposito'
            ? saldoActual + m
            : saldoActual - m;

        actualizarSocio(socio.id, { [campo]: nuevo });
        agregarRecibo({
            numero: `REC-${Date.now().toString().slice(-6)}`,
            fecha: new Date().toISOString(),
            cliente: socio.nombre,
            concepto: `${tipo === 'deposito' ? 'Depósito' : 'Retiro'} — ${cuentaActual.descripcion}`,
            monto: m,
            estado: 'Valido',
            socioId: socio.id,
            cuenta: cuentaActual.numero,
            tipoCuenta: cuentaActual.tipo,
            formaPago,
            observacion,
        });

        setShowRecibo({ tipo, monto: m, cuenta: cuentaActual, socio, formaPago });
        setMonto('');
        setObservacion('');
    };

    const handleDeposito = () => {
        if (formaPago === 'efectivo') setShowDesglose(true);
        else setShowMixto(true);
    };

    const handleRetiro = () => ejecutarTransaccion('retiro');

    const onDesgloseConfirm = () => { setShowDesglose(false); ejecutarTransaccion('deposito'); };
    const onMixtoConfirm = () => { setShowMixto(false); ejecutarTransaccion('deposito'); };

    // ── Estilo de botón acción ────────────────────────────────────────────
    const btnNav = (onClick, icon, disabled = false) => (
        <button onClick={onClick} disabled={disabled}
            style={{ width: '36px', height: '36px', borderRadius: '8px', background: disabled ? 'rgba(37,99,235,0.3)' : 'var(--primary)', border: 'none', cursor: disabled ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', transition: 'all 0.15s' }}>
            {icon}
        </button>
    );

    return (
        <div className="animate-up" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* ── Título ── */}
            <div>
                <h1 className="page-title" style={{ marginBottom: '0.25rem' }}>Pagos en Caja</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Gestión de depósitos, retiros y transacciones de cuentas de socios</p>
            </div>

            {/* ════════════════════════════════════
                PANEL SUPERIOR: Búsqueda del Socio
            ════════════════════════════════════ */}
            <div className="card glass" style={{ padding: '1.25rem' }}>
                {/* Controles de búsqueda + navegación */}
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.75rem', flexWrap: 'wrap', marginBottom: socio ? '1rem' : 0 }}>
                    {[
                        ['Código', busqCodigo, setBusqCodigo],
                        ['Nombre', busqNombre, setBusqNombre],
                        ['Cédula', busqCedula, setBusqCedula],
                    ].map(([lbl, val, set]) => (
                        <div key={lbl} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                            <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{lbl}</label>
                            <input type="text" className="input-field"
                                style={{ height: '2.1rem', fontSize: '0.85rem', width: lbl === 'Nombre' ? '220px' : '130px' }}
                                value={val} onChange={e => set(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleBuscar()} />
                        </div>
                    ))}
                    <button className="btn btn-primary" style={{ height: '2.1rem', gap: '0.4rem', fontSize: '0.85rem' }} onClick={handleBuscar}>
                        <Search size={15} /> Buscar
                    </button>
                    <button className="btn btn-secondary" style={{ height: '2.1rem', gap: '0.4rem', fontSize: '0.85rem' }} onClick={handleLimpiar}>
                        <RefreshCw size={14} /> Limpiar
                    </button>

                    {/* Navegación ◁ ▷ */}
                    {searched && filtrados.length > 0 && (
                        <div style={{ display: 'flex', gap: '0.35rem', marginLeft: 'auto' }}>
                            {btnNav(handlePrev, <ChevronLeft size={18} />, socioIdx === 0)}
                            {btnNav(handleNext, <ChevronRight size={18} />, socioIdx >= filtrados.length - 1)}
                            {btnNav(() => setSearched(false), <RefreshCw size={15} />)}
                            {btnNav(handleLimpiar, <X size={15} />)}
                            <span style={{ display: 'flex', alignItems: 'center', fontSize: '0.78rem', color: 'var(--text-muted)', paddingLeft: '0.25rem' }}>
                                {socioIdx + 1} / {filtrados.length}
                            </span>
                        </div>
                    )}
                </div>

                {/* Tarjeta datos del socio */}
                {socio && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: '1rem', padding: '1rem', background: 'linear-gradient(135deg, rgba(37,99,235,0.06), rgba(30,64,175,0.03))', borderRadius: 'var(--radius-md)', border: '1px solid rgba(37,99,235,0.15)' }}>
                        {/* Avatar */}
                        <div style={{ width: '64px', height: '64px', borderRadius: '50%', border: '3px solid var(--primary)', overflow: 'hidden', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            {socio.foto
                                ? <img src={socio.foto} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                : <span style={{ fontSize: '1.75rem' }}>🧑</span>}
                        </div>

                        {/* Info */}
                        <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr 120px 1fr', gap: '0.5rem 1rem' }}>
                            {[
                                ['Código', socio.codigo],
                                ['Nombre', socio.nombre],
                                ['Cédula', socio.cedula],
                                ['Estado', socio.condicion || socio.estado],
                                ['Dirección', socio.direccion, true],
                            ].map(([lbl, val, full]) => (
                                <div key={lbl} style={{ gridColumn: full ? 'span 3' : undefined }}>
                                    <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', marginBottom: '0.1rem' }}>{lbl}</div>
                                    <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text)' }}>{val || '—'}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {searched && filtrados.length === 0 && (
                    <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                        No se encontraron socios con los criterios ingresados.
                    </div>
                )}
            </div>

            {/* ════════════════════════════════════
                CUENTAS ACTIVAS
            ════════════════════════════════════ */}
            {socio && (
                <div className="card glass" style={{ padding: '1.25rem' }}>
                    <h3 style={{ textAlign: 'center', fontSize: '1rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                        Cuentas Activas
                    </h3>

                    <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '90px 1fr 160px 110px 1fr', background: 'var(--primary)', padding: '0.45rem 0.75rem', gap: '0.5rem' }}>
                            {['Número Cta.', 'Descripción', 'Tipo de Cuenta', 'Balance', 'Observación'].map(h => (
                                <span key={h} style={{ color: 'white', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase' }}>{h}</span>
                            ))}
                        </div>
                        {cuentas.map(ct => (
                            <div key={ct.id}
                                onClick={() => { setCuentaSel(ct); setMonto(''); setObservacion(''); }}
                                style={{
                                    display: 'grid', gridTemplateColumns: '90px 1fr 160px 110px 1fr',
                                    padding: '0.5rem 0.75rem', gap: '0.5rem',
                                    background: cuentaSel?.id === ct.id ? 'linear-gradient(90deg, var(--primary), #1e40af)' : 'var(--bg-card)',
                                    cursor: 'pointer', borderBottom: '1px solid var(--border-light)',
                                    transition: 'background 0.15s',
                                }}
                            >
                                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: cuentaSel?.id === ct.id ? 'white' : 'var(--primary)' }}>{ct.numero}</span>
                                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: cuentaSel?.id === ct.id ? 'white' : 'var(--text)' }}>{ct.descripcion}</span>
                                <span style={{ fontSize: '0.82rem', color: cuentaSel?.id === ct.id ? 'rgba(255,255,255,0.85)' : 'var(--text-muted)' }}>{ct.tipo}</span>
                                <span style={{ fontSize: '0.88rem', fontWeight: 700, color: cuentaSel?.id === ct.id ? 'white' : 'var(--success)', textAlign: 'right' }}>{fmt(ct.balance)}</span>
                                <span style={{ fontSize: '0.8rem', color: cuentaSel?.id === ct.id ? 'rgba(255,255,255,0.7)' : 'var(--text-muted)' }}>{ct.obs}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ════════════════════════════════════
                PANEL TRANSACCIÓN
            ════════════════════════════════════ */}
            {socio && cuentaSel && (
                <div className="card glass" style={{ padding: '1.25rem' }}>
                    <h3 style={{ textAlign: 'center', fontSize: '0.95rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '1rem', textTransform: 'uppercase' }}>
                        Cuenta No. {cuentaActual?.numero} — {cuentaActual?.descripcion}
                    </h3>

                    {cuentaActual?.tipo === 'Préstamos' ? (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 200px', gap: '1.5rem', alignItems: 'start' }}>
                            {/* Col 1: Saldos */}
                            <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '0.75rem' }}>
                                <div style={{ background: 'var(--primary)', color: 'white', padding: '0.4rem 0.75rem', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', borderRadius: '4px 4px 0 0', margin: '-0.75rem -0.75rem 0.5rem -0.75rem' }}>Saldos de la Cuenta</div>
                                {[
                                    ['Cap. Atrasado', 0], ['Int. Atrasado', 0], ['Mora', 0], ['Seguro', 0], ['Comision', 0], ['Cuotas Atrasadas', 0]
                                ].map(([lbl, val]) => (
                                    <div key={lbl} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{lbl}</span>
                                        <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: '4px', width: '100px', padding: '0.2rem 0.4rem', fontSize: '0.8rem', textAlign: 'right', fontWeight: 700 }}>{fmt(val)}</div>
                                    </div>
                                ))}
                                <div style={{ borderTop: '1px solid var(--border)', marginTop: '0.5rem', paddingTop: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: '0.85rem', fontWeight: 800 }}>Total en Atraso:</span>
                                    <span style={{ fontSize: '0.9rem', fontWeight: 800 }}>{fmt(0)}</span>
                                </div>
                            </div>

                            {/* Col 2: Inputs Préstamo */}
                            <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: '0.4rem', alignItems: 'center' }}>
                                {['Capital', 'Interés', 'Mora', 'Seguro', 'Comisión', 'Otros'].map(lbl => (
                                    <React.Fragment key={lbl}>
                                        <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text)' }}>{lbl}</span>
                                        <input type="number" className="input-field" style={{ height: '2rem', textAlign: 'right', fontWeight: 700 }}
                                            value={loanFields[lbl.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")]}
                                            onChange={e => setLoanFields({ ...loanFields, [lbl.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")]: Number(e.target.value) })}
                                        />
                                    </React.Fragment>
                                ))}
                                <div style={{ gridColumn: 'span 2', display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}>
                                        <input type="checkbox" checked={muestraBalance} onChange={e => setMuestraBalance(e.target.checked)} /> Muestra Balance
                                    </label>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}>
                                        <input type="checkbox" checked={saldarPrestamo} onChange={e => setSaldarPrestamo(e.target.checked)} /> Saldar el Préstamo
                                    </label>
                                </div>
                                <div style={{ gridColumn: 'span 2', marginTop: '0.5rem' }}>
                                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>OBSERVACIONES</label>
                                    <textarea className="input-field" style={{ height: '3.5rem', marginTop: '0.2rem' }} value={observacion} onChange={e => setObservacion(e.target.value)} />
                                </div>
                                <div style={{ gridColumn: 'span 2', borderTop: '1px solid var(--border)', paddingTop: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: '0.85rem', fontWeight: 800 }}>Monto a Aplicar</span>
                                    <span style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--primary)' }}>{fmt(Object.values(loanFields).reduce((a, b) => a + b, 0))}</span>
                                </div>
                            </div>

                            {/* Col 3: NCF & Tipo Pago */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div>
                                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>NCF</label>
                                    <select className="input-field" style={{ height: '2rem', fontSize: '0.8rem' }} value={ncf} onChange={e => setNcf(e.target.value)}>
                                        <option>(B02) Factura Consumidor Final</option>
                                        <option>(B01) Factura Crédito Fiscal</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>TIPO DE PAGO</label>
                                    <div style={{ display: 'flex', border: '1px solid var(--border)', borderRadius: '6px', overflow: 'hidden', height: '2.5rem' }}>
                                        <button onClick={() => setTipoPago('pagar')} style={{ flex: 1, border: 'none', background: tipoPago === 'pagar' ? 'var(--primary)' : 'white', color: tipoPago === 'pagar' ? 'white' : 'var(--text)', fontWeight: 700, cursor: 'pointer' }}>Pagar</button>
                                        <button onClick={() => setTipoPago('abonar')} style={{ flex: 1, border: 'none', borderLeft: '1px solid var(--border)', background: tipoPago === 'abonar' ? 'var(--primary)' : 'white', color: tipoPago === 'abonar' ? 'white' : 'var(--text)', fontWeight: 700, cursor: 'pointer' }}>Abonar</button>
                                    </div>
                                </div>
                            </div>

                            {/* Footer Buttons */}
                            <div style={{ gridColumn: 'span 3', borderTop: '2px solid var(--primary)', paddingTop: '0.75rem', display: 'flex', gap: '0.5rem' }}>
                                <button className="btn btn-secondary" style={{ padding: '0.6rem 1.5rem', gap: '0.5rem', fontWeight: 800 }} onClick={() => setCuentaSel(null)}>
                                    <ChevronLeft size={16} /> Retroceder
                                </button>
                                <button className="btn btn-primary" style={{ flex: 1, background: 'var(--primary)', borderColor: 'var(--primary)', fontSize: '1.1rem', fontWeight: 900, gap: '0.5rem' }} onClick={handleDeposito}>
                                    <DollarSign size={20} /> Pagar ({fmt(Object.values(loanFields).reduce((a, b) => a + b, 0))})
                                </button>
                                <button className="btn btn-secondary" style={{ padding: '0.6rem 1.5rem', gap: '0.5rem', fontWeight: 800 }} onClick={() => setShowCuotas(true)}>
                                    <List size={16} /> Cuotas
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr auto', gap: '1.5rem', alignItems: 'start' }}>

                            {/* Saldos */}
                            <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                                <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', borderBottom: '1px solid var(--border)', paddingBottom: '0.3rem', marginBottom: '0.25rem' }}>Saldos de la Cuenta</div>
                                {[
                                    ['Saldo Actual', saldoActual, 'var(--primary)'],
                                    ['Pignorado', pignorado, null],
                                    ['Flotante', flotante, null],
                                    ['Embargos', embargos, null],
                                ].map(([lbl, val, color]) => (
                                    <div key={lbl} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                                        <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>{lbl}</span>
                                        <span style={{ fontWeight: 700, color: color || 'inherit' }}>{fmt(val)}</span>
                                    </div>
                                ))}
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', borderTop: '2px solid var(--primary)', paddingTop: '0.35rem', marginTop: '0.25rem' }}>
                                    <span style={{ fontWeight: 700, color: 'var(--primary)' }}>Disponible</span>
                                    <span style={{ fontWeight: 800, color: 'var(--success)' }}>{fmt(disponible)}</span>
                                </div>
                            </div>

                            {/* Monto + Observación */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                <div>
                                    <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.35rem', display: 'block' }}>Monto</label>
                                    <input type="number" min="0" className="input-field"
                                        style={{ fontSize: '1.4rem', fontWeight: 700, height: '3rem', padding: '0 0.75rem', color: 'var(--primary)', maxWidth: '260px', textAlign: 'right' }}
                                        value={monto} onChange={e => setMonto(e.target.value)}
                                        placeholder="0.00" />
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.35rem', display: 'block' }}>Observación</label>
                                    <textarea className="input-field" style={{ height: '4rem', fontSize: '0.85rem', padding: '0.4rem 0.5rem', resize: 'none', maxWidth: '360px' }}
                                        value={observacion} onChange={e => setObservacion(e.target.value)} />
                                </div>

                                {/* Botones acción */}
                                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
                                    <button className="btn btn-secondary" style={{ gap: '0.4rem', fontSize: '0.85rem' }} onClick={() => setCuentaSel(null)}>
                                        <ChevronLeft size={15} /> Retroceder
                                    </button>
                                    <button className="btn btn-primary" style={{ gap: '0.4rem', fontSize: '0.85rem', background: 'var(--success)', borderColor: 'var(--success)', flex: 1 }} onClick={handleDeposito}>
                                        <DollarSign size={15} /> Depósito
                                    </button>
                                    <button className="btn btn-primary" style={{ gap: '0.4rem', fontSize: '0.85rem', background: 'var(--danger)', borderColor: 'var(--danger)', flex: 1 }} onClick={handleRetiro}>
                                        <ArrowUpCircle size={15} /> Retiro
                                    </button>
                                </div>
                            </div>

                            {/* Forma de Pago + Muestra Balance */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' }}>
                                    <input type="checkbox" checked={muestraBalance} onChange={e => setMuestraBalance(e.target.checked)}
                                        style={{ width: '16px', height: '16px', accentColor: 'var(--primary)' }} />
                                    Muestra Balance
                                </label>
                                <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '0.75rem' }}>
                                    <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Forma de Pago</div>
                                    {[['efectivo', 'Efectivo'], ['mixto', 'Pago Mixto']].map(([val, lbl]) => (
                                        <label key={val} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', marginBottom: '0.35rem', cursor: 'pointer' }}>
                                            <input type="radio" name="formaPago" value={val} checked={formaPago === val} onChange={() => setFormaPago(val)}
                                                style={{ accentColor: 'var(--primary)', width: '15px', height: '15px' }} />
                                            {lbl}
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* ── Modales ──────────────────────────────────────────────────────── */}
            {showCuotas && (
                <CuotasPendientesModal
                    cuotas={[
                        { id: 1, fecha: '09/03/2026', capital: 0.59, interes: 0.00, mora: 0, seguro: 0, otros: 0, total: 0.59 },
                        { id: 2, fecha: '08/04/2026', capital: 4956.37, interes: 544.43, mora: 0, seguro: 21.05, otros: 0, total: 5521.85 },
                        { id: 3, fecha: '08/05/2026', capital: 5030.71, interes: 470.09, mora: 0, seguro: 21.05, otros: 0, total: 5521.85 },
                    ]}
                    onConfirm={(totals) => {
                        setLoanFields({
                            capital: totals.capital,
                            interes: totals.interes,
                            mora: totals.mora,
                            seguro: totals.seguro,
                            comision: 0,
                            otros: totals.otros
                        });
                        setShowCuotas(false);
                    }}
                    onClose={() => setShowCuotas(false)}
                />
            )}
            {showDesglose && (
                <DesgloseModal
                    monto={parseFloat(monto) || 0}
                    onConfirm={onDesgloseConfirm}
                    onClose={() => setShowDesglose(false)}
                />
            )}
            {showMixto && (
                <PagosMixtosModal
                    monto={parseFloat(monto) || 0}
                    onConfirm={onMixtoConfirm}
                    onClose={() => setShowMixto(false)}
                />
            )}

            {/* Recibo de confirmación */}
            {showRecibo && (
                <div className="modal-overlay" style={{ zIndex: 1200 }}>
                    <div className="card glass" style={{ maxWidth: '380px', width: '100%', padding: '2rem', textAlign: 'center' }}>
                        <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: showRecibo.tipo === 'deposito' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                            {showRecibo.tipo === 'deposito' ? <ArrowDownCircle size={28} color="var(--success)" /> : <ArrowUpCircle size={28} color="var(--danger)" />}
                        </div>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.5rem', color: showRecibo.tipo === 'deposito' ? 'var(--success)' : 'var(--danger)' }}>
                            {showRecibo.tipo === 'deposito' ? 'Depósito Exitoso' : 'Retiro Exitoso'}
                        </h2>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '1rem', fontSize: '0.9rem' }}>
                            {showRecibo.socio.nombre}<br />
                            <strong>{showRecibo.cuenta.descripcion}</strong>
                        </p>
                        <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '1.5rem' }}>
                            RD$ {fmt(showRecibo.monto)}
                        </div>
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <button className="btn btn-secondary" style={{ flex: 1, gap: '0.4rem' }} onClick={() => setShowRecibo(null)}>
                                <X size={14} /> Cerrar
                            </button>
                            <button className="btn btn-primary" style={{ flex: 1, gap: '0.4rem' }} onClick={() => { window.print(); setShowRecibo(null); }}>
                                <Printer size={14} /> Imprimir
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PagosEnCaja;
