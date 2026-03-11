import React, { useState, useMemo } from 'react';
import { useContabilidad } from '../context/ContabilidadContext';
import { useCuentas } from '../context/CuentasContext';
import { Calendar, Download, FileText, Search, Printer } from 'lucide-react';
import { exportToExcel } from '../utils/exportUtils';

const MayorGeneral = () => {
    const { asientos } = useContabilidad();
    const { cuentas } = useCuentas();

    const [cuentaId, setCuentaId] = useState('');
    const [fechaDesde, setFechaDesde] = useState('');
    const [fechaHasta, setFechaHasta] = useState('');

    const formatMoney = (amount) => {
        return new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP' }).format(amount);
    };

    const formatDate = (isoString) => {
        const d = new Date(isoString);
        return d.toLocaleDateString();
    };

    // Filtrar movimientos para la cuenta seleccionada
    const movimientos = useMemo(() => {
        if (!cuentaId) return [];

        const cta = cuentas.find(c => c.id === cuentaId);
        if (!cta) return [];

        let runningBalance = 0;
        const allMovements = [];

        // 1. Obtener todos los asientos que tocan esta cuenta
        // Nota: En un sistema real, los asientos de periodos anteriores se sumarían como balance inicial
        const asientosFiltrados = [...asientos].sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

        asientosFiltrados.forEach(asiento => {
            (asiento.detalles || []).forEach(detalle => {
                if (detalle.cuentaId === cuentaId) {
                    const debito = Number(detalle.debito) || 0;
                    const credito = Number(detalle.credito) || 0;

                    // Naturaleza de la cuenta (Deudora: Activo, Costo, Gasto)
                    const esDeudora = ['Activo', 'Costo', 'Gasto'].includes(cta.tipo);

                    if (esDeudora) {
                        runningBalance += debito;
                        runningBalance -= credito;
                    } else {
                        runningBalance += credito;
                        runningBalance -= debito;
                    }

                    allMovements.push({
                        id: asiento.id + Math.random(),
                        fecha: asiento.fecha,
                        numero: asiento.numero,
                        descripcion: asiento.descripcion,
                        debito,
                        credito,
                        balance: runningBalance
                    });
                }
            });
        });

        // Filtrar por fechas si existen
        return allMovements.filter(m => {
            const f = new Date(m.fecha);
            if (fechaDesde && f < new Date(fechaDesde)) return false;
            if (fechaHasta && f > new Date(fechaHasta)) return false;
            return true;
        });
    }, [asientos, cuentaId, fechaDesde, fechaHasta, cuentas]);

    const handlePrint = () => {
        window.print();
    };

    const handleExportCSV = () => {
        const data = movimientos.map(m => ({
            "Fecha": formatDate(m.fecha),
            "Referencia": m.numero,
            "Descripción": m.descripcion,
            "Débito": m.debito,
            "Crédito": m.credito,
            "Balance": m.balance
        }));
        exportToExcel(data, `Mayor_General_${cuentaId || 'General'}`, 'MayorGeneral');
    };

    return (
        <div className="animate-up">
            <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 className="page-title" style={{ marginBottom: '0.25rem' }}>Libro Mayor General</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Análisis detallado de transacciones por cuenta contable.</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button className="btn btn-secondary" onClick={handlePrint}>
                        <Printer size={18} /> PDF / Imprimir
                    </button>
                    <button className="btn btn-primary" onClick={handleExportCSV}>
                        <Download size={18} /> Exportar Excel
                    </button>
                </div>
            </div>

            {/* Filtros */}
            <div className="card no-print" style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '1.5rem', alignItems: 'flex-end' }}>
                    <div className="input-group">
                        <label className="input-label">Seleccionar Cuenta</label>
                        <select className="input-field" value={cuentaId} onChange={e => setCuentaId(e.target.value)}>
                            <option value="">-- Seleccione una cuenta --</option>
                            {cuentas.filter(c => c.subtipo === 'Cuenta Detalle').map(c => (
                                <option key={c.id} value={c.id}>{c.codigo} - {c.nombre}</option>
                            ))}
                        </select>
                    </div>
                    <div className="input-group">
                        <label className="input-label">Desde</label>
                        <input type="date" className="input-field" value={fechaDesde} onChange={e => setFechaDesde(e.target.value)} />
                    </div>
                    <div className="input-group">
                        <label className="input-label">Hasta</label>
                        <input type="date" className="input-field" value={fechaHasta} onChange={e => setFechaHasta(e.target.value)} />
                    </div>
                </div>
            </div>

            {/* Resultado */}
            <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
                <div className="print-header" style={{ display: 'none' }}>
                    <h1 style={{ textAlign: 'center', marginBottom: '1rem' }}>Libro Mayor General - Iubel ERP</h1>
                    <p style={{ textAlign: 'center' }}>Cuenta: {cuentas.find(c => c.id === cuentaId)?.nombre || 'Todas'}</p>
                    <p style={{ textAlign: 'center', fontSize: '0.75rem' }}>Fecha: {new Date().toLocaleDateString()}</p>
                    <hr style={{ margin: '1rem 0' }} />
                </div>

                {!cuentaId ? (
                    <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                        <Search size={48} style={{ margin: '0 auto 1.5rem', opacity: 0.3 }} />
                        <p>Seleccione una cuenta contable para visualizar sus movimientos.</p>
                    </div>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead style={{ background: 'var(--background)' }}>
                            <tr style={{ borderBottom: '1px solid var(--border)' }}>
                                <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>Fecha</th>
                                <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>Referencia</th>
                                <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>Descripción / Concepto</th>
                                <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', textAlign: 'right' }}>Débito</th>
                                <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', textAlign: 'right' }}>Crédito</th>
                                <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', textAlign: 'right' }}>Balance</th>
                            </tr>
                        </thead>
                        <tbody>
                            {movimientos.length === 0 ? (
                                <tr>
                                    <td colSpan="6" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No se encontraron transacciones en este rango.</td>
                                </tr>
                            ) : (
                                movimientos.map((m, idx) => (
                                    <tr key={idx} style={{ borderBottom: '1px solid var(--border)', fontSize: '0.875rem' }}>
                                        <td style={{ padding: '1rem' }}>{formatDate(m.fecha)}</td>
                                        <td style={{ padding: '1rem', color: 'var(--primary)', fontWeight: 600 }}>{m.numero}</td>
                                        <td style={{ padding: '1rem' }}>{m.descripcion}</td>
                                        <td style={{ padding: '1rem', textAlign: 'right' }}>{m.debito > 0 ? formatMoney(m.debito) : '-'}</td>
                                        <td style={{ padding: '1rem', textAlign: 'right' }}>{m.credito > 0 ? formatMoney(m.credito) : '-'}</td>
                                        <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 600, background: 'rgba(52, 152, 219, 0.05)' }}>{formatMoney(m.balance)}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Estilos para impresión */}
            <style>
                {`
                @media print {
                    .no-print { display: none !important; }
                    .print-header { display: block !important; }
                    body { background: white !important; font-size: 10pt; }
                    .card { border: none !important; box-shadow: none !important; padding: 0 !important; }
                    table { border: 1px solid #ccc; }
                    th { background: #eee !important; color: black !important; }
                    aside, header { display: none !important; }
                    main { margin: 0 !important; width: 100% !important; }
                }
                `}
            </style>
        </div>
    );
};

export default MayorGeneral;
