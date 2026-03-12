import React, { useState } from 'react';
import { useFacturacion } from '../context/FacturacionContext';
import { useCompras } from '../context/ComprasContext';
import { FileText, Download, Filter, Table, Calendar } from 'lucide-react';

const ReportesFiscales = () => {
    const { facturas } = useFacturacion();
    const { compras } = useCompras();
    const [reporteActivo, setReporteActivo] = useState('606'); // 606 o 607

    const formatMoney = (amount) => {
        return new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP' }).format(amount);
    };

    const handleExport = async () => {
        const token = localStorage.getItem('iubel_token');
        const endpoint = reporteActivo === '606' ? '/api/fiscal/export-606' : '/api/fiscal/export-607';

        try {
            const resp = await fetch(`${endpoint}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!resp.ok) throw new Error('Error al generar el archivo');

            const blob = await resp.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${reporteActivo}_Export_${new Date().toISOString().slice(0, 10)}.txt`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (err) {
            console.error(err);
            alert('Error al descargar el reporte fiscal');
        }
    };

    return (
        <div className="animate-up">
            <div style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <h1 className="page-title" style={{ marginBottom: '0.5rem' }}>Reportes Fiscales (606 / 607)</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Genera los reportes mensuales de compras y ventas para la DGII.</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button
                        className={`btn ${reporteActivo === '606' ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setReporteActivo('606')}
                    >
                        Formato 606 (Compras)
                    </button>
                    <button
                        className={`btn ${reporteActivo === '607' ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setReporteActivo('607')}
                    >
                        Formato 607 (Ventas)
                    </button>
                </div>
            </div>

            <div className="card glass" style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <Table size={20} color="var(--primary)" />
                        {reporteActivo === '606' ? 'Resumen de Compras y Gastos (606)' : 'Resumen de Ventas y Servicios (607)'}
                    </h3>
                    <button onClick={handleExport} className="btn btn-secondary" style={{ fontSize: '0.875rem', gap: '0.5rem' }}>
                        <Download size={16} /> Exportar TXT Validado
                    </button>
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
                                <th style={{ padding: '1rem', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>RNC/Cédula</th>
                                <th style={{ padding: '1rem', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Tipo NCF</th>
                                <th style={{ padding: '1rem', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>NCF</th>
                                <th style={{ padding: '1rem', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', textAlign: 'right' }}>Monto Facturado</th>
                                <th style={{ padding: '1rem', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', textAlign: 'right' }}>ITBIS</th>
                                <th style={{ padding: '1rem', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', textAlign: 'right' }}>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reporteActivo === '606' ? (
                                compras.length === 0 ? (
                                    <tr><td colSpan="6" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No hay compras registradas para este periodo.</td></tr>
                                ) : (
                                    compras.map(compra => (
                                        <tr key={compra.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                            <td style={{ padding: '1rem', fontSize: '0.875rem' }}>{compra.rnc}</td>
                                            <td style={{ padding: '1rem', fontSize: '0.875rem' }}>Gastos</td>
                                            <td style={{ padding: '1rem', fontSize: '0.875rem', fontFamily: 'monospace' }}>{compra.ncf}</td>
                                            <td style={{ padding: '1rem', fontSize: '0.875rem', textAlign: 'right' }}>{formatMoney(compra.subtotal)}</td>
                                            <td style={{ padding: '1rem', fontSize: '0.875rem', textAlign: 'right' }}>{formatMoney(compra.itbis)}</td>
                                            <td style={{ padding: '1rem', fontSize: '0.875rem', textAlign: 'right', fontWeight: 600 }}>{formatMoney(compra.total)}</td>
                                        </tr>
                                    ))
                                )
                            ) : (
                                facturas.length === 0 ? (
                                    <tr><td colSpan="6" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No hay ventas registradas para este periodo.</td></tr>
                                ) : (
                                    facturas.map(factura => (
                                        <tr key={factura.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                            <td style={{ padding: '1rem', fontSize: '0.875rem' }}>{factura.rnc || 'Consumidor Final'}</td>
                                            <td style={{ padding: '1rem', fontSize: '0.875rem' }}>{factura.tipoNCF}</td>
                                            <td style={{ padding: '1rem', fontSize: '0.875rem', fontFamily: 'monospace' }}>{factura.ncf}</td>
                                            <td style={{ padding: '1rem', fontSize: '0.875rem', textAlign: 'right' }}>{formatMoney(factura.subtotalDOP || factura.subtotal)}</td>
                                            <td style={{ padding: '1rem', fontSize: '0.875rem', textAlign: 'right' }}>{formatMoney(factura.itbisDOP || factura.itbis)}</td>
                                            <td style={{ padding: '1rem', fontSize: '0.875rem', textAlign: 'right', fontWeight: 600 }}>{formatMoney(factura.totalDOP || factura.total)}</td>
                                        </tr>
                                    ))
                                )
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '2rem' }}>
                <div className="card">
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Total ITBIS {reporteActivo === '606' ? 'Pagado' : 'Cobrado'}</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: reporteActivo === '606' ? 'var(--danger)' : 'var(--success)' }}>
                        {reporteActivo === '606'
                            ? formatMoney(compras.reduce((acc, c) => acc + (c.itbis || 0), 0))
                            : formatMoney(facturas.reduce((acc, f) => acc + (f.itbisDOP || f.itbis || 0), 0))
                        }
                    </div>
                </div>
                <div className="card">
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Total Monto Gravado</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>
                        {reporteActivo === '606'
                            ? formatMoney(compras.reduce((acc, c) => acc + (c.subtotal || 0), 0))
                            : formatMoney(facturas.reduce((acc, f) => acc + (f.subtotalDOP || f.subtotal || 0), 0))
                        }
                    </div>
                </div>
                <div className="card" style={{ background: 'var(--primary)', color: 'white' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Estado del ITBIS del Mes</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>
                        {formatMoney(facturas.reduce((acc, f) => acc + (f.itbisDOP || f.itbis || 0), 0) - compras.reduce((acc, c) => acc + (c.itbis || 0), 0))}
                    </div>
                    <p style={{ fontSize: '0.7rem', marginTop: '0.5rem', opacity: 0.8 }}>Diferencia a favor del {facturas.reduce((acc, f) => acc + (f.itbisDOP || f.itbis || 0), 0) > compras.reduce((acc, c) => acc + (c.itbis || 0), 0) ? 'Fisco' : 'Contribuyente'}</p>
                </div>
            </div>
        </div>
    );
};

export default ReportesFiscales;
