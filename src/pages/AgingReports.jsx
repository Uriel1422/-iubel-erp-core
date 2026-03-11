import React, { useState } from 'react';
import { useFacturacion } from '../context/FacturacionContext';
import { useCompras } from '../context/ComprasContext';
import { Clock, DollarSign, Download, Printer, CheckCircle2, AlertCircle } from 'lucide-react';
import ConfirmModal from '../components/ConfirmModal';
import { exportToExcel } from '../utils/exportUtils';

const AgingReports = () => {
    const { facturas, registrarPagoFactura } = useFacturacion();
    const { compras, registrarPagoCompra } = useCompras();

    const [tipoReporte, setTipoReporte] = useState('CXC'); // CXC o CXP
    const [confirmAction, setConfirmAction] = useState({ open: false, id: null, name: '' });

    const formatMoney = (amount) => {
        return new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP' }).format(amount);
    };

    const calculateDays = (dateStr) => {
        const diffTime = Math.abs(new Date() - new Date(dateStr));
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

    const getBucket = (days) => {
        if (days <= 30) return '0-30';
        if (days <= 60) return '31-60';
        if (days <= 90) return '61-90';
        return '90+';
    };

    const data = (tipoReporte === 'CXC' ? facturas : compras).filter(item => item.estado === 'Pendiente');

    const buckets = {
        '0-30': { total: 0, items: [] },
        '31-60': { total: 0, items: [] },
        '61-90': { total: 0, items: [] },
        '90+': { total: 0, items: [] }
    };

    data.forEach(item => {
        const days = calculateDays(item.fecha || item.fechaRegistro);
        const bucket = getBucket(days);
        const monto = item.totalDOP || item.total;
        buckets[bucket].total += monto;
        buckets[bucket].items.push({ ...item, days });
    });

    const handlePay = (id) => {
        const item = data.find(i => i.id === id);
        const name = item?.clienteNombre || item?.proveedorNombre;
        setConfirmAction({ open: true, id, name });
    };

    const processPayment = () => {
        if (confirmAction.id) {
            if (tipoReporte === 'CXC') {
                registrarPagoFactura(confirmAction.id, 99999999);
            } else {
                registrarPagoCompra(confirmAction.id, 99999999);
            }
            setConfirmAction({ open: false, id: null, name: '' });
            alert("¡Pago procesado exitosamente!");
        }
    };

    const handlePrint = () => window.print();

    const handleExportCSV = () => {
        const dataToExport = data.map(item => ({
            "Cliente/Prov": item.clienteNombre || item.proveedorNombre,
            "Documento": item.numeroInterno || item.ncf,
            "Fecha": item.fecha || item.fechaRegistro,
            "Días": calculateDays(item.fecha || item.fechaRegistro),
            "Monto": item.totalDOP || item.total,
            "Bucket": getBucket(calculateDays(item.fecha || item.fechaRegistro))
        }));
        exportToExcel(dataToExport, `Antiguedad_${tipoReporte}`, `Antiguedad`);
    };

    return (
        <div className="animate-up">
            <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 className="page-title" style={{ marginBottom: '0.25rem' }}>Antigüedad de Saldos ({tipoReporte})</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Seguimiento de {tipoReporte === 'CXC' ? 'Cuentas por Cobrar' : 'Cuentas por Pagar'} y flujo de caja.</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <div className="btn-group no-print" style={{ background: 'var(--background)', padding: '0.25rem', borderRadius: 'var(--radius-md)', display: 'flex' }}>
                        <button
                            className={`btn ${tipoReporte === 'CXC' ? 'btn-primary' : ''}`}
                            style={{ border: 'none', background: tipoReporte === 'CXC' ? '' : 'transparent' }}
                            onClick={() => setTipoReporte('CXC')}
                        >CXC</button>
                        <button
                            className={`btn ${tipoReporte === 'CXP' ? 'btn-primary' : ''}`}
                            style={{ border: 'none', background: tipoReporte === 'CXP' ? '' : 'transparent' }}
                            onClick={() => setTipoReporte('CXP')}
                        >CXP</button>
                    </div>
                    <button className="btn btn-secondary" onClick={handlePrint}>
                        <Printer size={18} /> PDF / Imprimir
                    </button>
                    <button className="btn btn-primary" onClick={handleExportCSV}>
                        <Download size={18} /> Exportar Excel
                    </button>
                </div>
            </div>

            {/* Resumen de Buckets */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
                {Object.keys(buckets).map(bucket => (
                    <div key={bucket} className="card" style={{ textAlign: 'center', position: 'relative' }}>
                        {bucket === '90+' && buckets[bucket].total > 0 && (
                            <div title="Crítico" style={{ position: 'absolute', top: '1rem', right: '1rem', color: 'var(--danger)' }}>
                                <AlertCircle size={20} />
                            </div>
                        )}
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>{bucket} días</span>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0.5rem 0' }}>{formatMoney(buckets[bucket].total)}</h3>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{buckets[bucket].items.length} documentos</p>
                    </div>
                ))}
            </div>

            {/* Detalle */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ background: 'var(--background)', borderBottom: '1px solid var(--border)' }}>
                            <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>{tipoReporte === 'CXC' ? 'Cliente' : 'Proveedor'}</th>
                            <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>Documento</th>
                            <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>Fecha</th>
                            <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', textAlign: 'center' }}>Días</th>
                            <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', textAlign: 'right' }}>Monto Pendiente</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.length === 0 ? (
                            <tr>
                                <td colSpan="6" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>No hay saldos pendientes en {tipoReporte}.</td>
                            </tr>
                        ) : (
                            data.sort((a, b) => calculateDays(b.fecha || b.fechaRegistro) - calculateDays(a.fecha || a.fechaRegistro)).map((item, idx) => {
                                const days = calculateDays(item.fecha || item.fechaRegistro);
                                return (
                                    <tr key={idx} style={{ borderBottom: '1px solid var(--border)', fontSize: '0.875rem' }}>
                                        <td style={{ padding: '1rem' }}>
                                            <div style={{ fontWeight: 600 }}>{item.clienteNombre || item.proveedorNombre}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>RNC: {item.clienteRnc || item.proveedorRnc || 'N/A'}</div>
                                        </td>
                                        <td style={{ padding: '1rem' }}>{item.numeroInterno || item.ncf}</td>
                                        <td style={{ padding: '1rem' }}>{new Date(item.fecha || item.fechaRegistro).toLocaleDateString()}</td>
                                        <td style={{ padding: '1rem', textAlign: 'center' }}>
                                            <span className={`badge ${days > 60 ? 'badge-danger' : days > 30 ? 'badge-warning' : 'badge-success'}`}>
                                                {days} días
                                            </span>
                                        </td>
                                        <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 600 }}>{formatMoney(item.totalDOP || item.total)}</td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            <ConfirmModal
                isOpen={confirmAction.open}
                onClose={() => setConfirmAction({ open: false, id: null, name: '' })}
                onConfirm={processPayment}
                title={`Pagar Documento (${tipoReporte})`}
                message={`¿Está seguro de que desea aplicar el PAGO TOTAL a este documento de ${confirmAction.name}?\n\nEsta acción generará un asiento contable automático y cerrará el balance pendiente.`}
                confirmText="Procesar Pago"
                type="primary"
            />

            <style>
                {`
                @media print {
                    .no-print { display: none !important; }
                    body { background: white !important; }
                    .card { border: none !important; box-shadow: none !important; }
                    aside, header { display: none !important; }
                    main { margin: 0 !important; width: 100% !important; }
                }
                `}
            </style>
        </div>
    );
};

export default AgingReports;
