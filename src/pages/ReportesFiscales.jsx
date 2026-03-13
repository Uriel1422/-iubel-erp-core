import React, { useState, useMemo } from 'react';
import { useFacturacion } from '../context/FacturacionContext';
import { useCompras } from '../context/ComprasContext';
import { FileText, Download, Filter, Table, Calendar, CheckSquare, AlertTriangle } from 'lucide-react';

const ReportesFiscales = () => {
    const { facturas } = useFacturacion();
    const { compras } = useCompras();
    const [reporteActivo, setReporteActivo] = useState('606');
    
    // Filtros de fecha
    const hoy = new Date();
    const [mes, setMes] = useState(hoy.getMonth() + 1);
    const [anio, setAnio] = useState(hoy.getFullYear());

    const formatMoney = (amount) => {
        return new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP' }).format(amount || 0);
    };
    const formatDate = (dateStr) => {
        if (!dateStr) return '—';
        return new Date(dateStr).toLocaleDateString('es-DO');
    };

    // Filtrar data por mes y año
    const comprasFiltradas = useMemo(() => {
        return compras.filter(c => {
            const dStr = c.fechaFactura || c.fechaRegistro || c.fecha;
            if (!dStr) return false;
            const d = new Date(dStr);
            return (d.getMonth() + 1) === parseInt(mes) && d.getFullYear() === parseInt(anio);
        });
    }, [compras, mes, anio]);

    const facturasFiltradas = useMemo(() => {
        return facturas.filter(f => {
            const dStr = f.fechaEmision || f.fechaRegistro || f.fecha;
            if (!dStr) return false;
            const d = new Date(dStr);
            return (d.getMonth() + 1) === parseInt(mes) && d.getFullYear() === parseInt(anio);
        });
    }, [facturas, mes, anio]);

    // Totales 606 (Compras)
    const itbisPagado = comprasFiltradas.reduce((sum, c) => sum + (c.itbis || 0), 0);
    const subtotalCompras = comprasFiltradas.reduce((sum, c) => sum + (c.subtotal || 0), 0);
    const itbisRetenidoCompras = comprasFiltradas.reduce((sum, c) => sum + (c.itbisRetenido || 0), 0);
    const isrRetenidoCompras = comprasFiltradas.reduce((sum, c) => sum + (c.isrRetenido || 0), 0);

    // Totales 607 (Ventas)
    const itbisCobrado = facturasFiltradas.reduce((sum, f) => sum + (f.itbisDOP || f.itbis || 0), 0);
    const subtotalVentas = facturasFiltradas.reduce((sum, f) => sum + (f.subtotalDOP || f.subtotal || 0), 0);

    // Cuadre
    const balanceItbis = itbisCobrado - itbisPagado;

    // Exportar CSV
    const handleExportCSV = () => {
        let csvContent = "";
        const separador = ",";
        
        if (reporteActivo === '606') {
             csvContent += "RNC/Cedula,Tipo Id,Tipo Gasto,NCF,Modificado,Fecha Comprobante,Fecha Pago,Monto Facturado,ITBIS Facturado,ITBIS Retenido,ISR Retenido,Monto Propina,Forma de Pago\n";
             comprasFiltradas.forEach(c => {
                 const rnc = c.proveedorRnc || c.rnc || '';
                 const ncf = c.ncf || '';
                 const fComprobante = (c.fechaFactura || c.fecha || '').substring(0, 10).replace(/-/g, '');
                 const fPago = '';
                 const monto = (c.subtotal || 0).toFixed(2);
                 const itbis = (c.itbis || 0).toFixed(2);
                 const itbisRet = (c.itbisRetenido || 0).toFixed(2);
                 const isrRet = (c.isrRetenido || 0).toFixed(2);
                 const cond_pago = c.condicion === 'Contado' ? '1' : '4'; // 1=Efectivo, 4=Credito
                 const t_gasto = c.tipoGasto || '02';
                 csvContent += `${rnc}${separador}1${separador}${t_gasto}${separador}${ncf}${separador}${separador}${fComprobante}${separador}${fPago}${separador}${monto}${separador}${itbis}${separador}${itbisRet}${separador}${isrRet}${separador}0.00${separador}${cond_pago}\n`;
             });
        } else {
             csvContent += "RNC/Cedula,Tipo Id,NCF,Modificado,Tipo de Ingreso,Fecha Comprobante,Fecha Retencion,Monto Facturado,ITBIS Facturado,ITBIS Retenido,ISR Retenido,Efectivo,Transferencia\n";
             facturasFiltradas.forEach(f => {
                 const rnc = f.rnc || '';
                 const ncf = f.ncf || '';
                 const fComprobante = (f.fechaEmision || f.fecha || '').substring(0, 10).replace(/-/g, '');
                 const monto = (f.subtotalDOP || f.subtotal || 0).toFixed(2);
                 const itbis = (f.itbisDOP || f.itbis || 0).toFixed(2);
                 const t_ingreso = '01';
                 const is_efectivo = f.metodoPago === 'Efectivo' ? monto : '0.00';
                 const is_transf = f.metodoPago !== 'Efectivo' ? monto : '0.00';
                 csvContent += `${rnc}${separador}1${separador}${ncf}${separador}${separador}${t_ingreso}${separador}${fComprobante}${separador}${separador}${monto}${separador}${itbis}${separador}0.00${separador}0.00${separador}${is_efectivo}${separador}${is_transf}\n`;
             });
        }

        const blob = new Blob(["\ufeff", csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `Formato_${reporteActivo}_${anio}${String(mes).padStart(2,'0')}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="animate-up" style={{ paddingBottom: '2rem' }}>
            <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1 className="page-title" style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <FileText size={28} color="var(--primary)" /> Módulo Fiscal DGII
                    </h1>
                    <p style={{ color: 'var(--text-muted)' }}>Generación de formatos 606/607, cuadre de ITBIS mensual y exportación CSV.</p>
                </div>
                
                {/* Panel de Filtros */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: '#fff', padding: '0.5rem 1rem', borderRadius: '12px', border: '1px solid var(--border)', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                    <Calendar size={18} color="var(--primary)" />
                    <select className="input-field" value={mes} onChange={e => setMes(e.target.value)} style={{ height: '36px', padding: '0 10px', fontSize: '0.9rem', marginBottom: 0, minWidth: '120px' }}>
                        {[
                            'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
                        ].map((m, i) => <option key={i+1} value={i+1}>{m}</option>)}
                    </select>
                    <select className="input-field" value={anio} onChange={e => setAnio(e.target.value)} style={{ height: '36px', padding: '0 10px', fontSize: '0.9rem', marginBottom: 0, minWidth: '90px' }}>
                        {[...Array(5)].map((_, i) => <option key={i} value={hoy.getFullYear() - i}>{hoy.getFullYear() - i}</option>)}
                    </select>
                </div>
            </div>

            {/* Panel de Cuadre Superior */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem', marginBottom: '2rem' }}>
                <div className="card glass">
                    <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>ITBIS Cobrado (Ventas)</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#16a34a', marginTop: '0.5rem' }}>{formatMoney(itbisCobrado)}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>de {facturasFiltradas.length} comprobantes</div>
                </div>
                <div className="card glass">
                    <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>ITBIS Adelantado/Pagado</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#dc2626', marginTop: '0.5rem' }}>{formatMoney(itbisPagado)}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>en {comprasFiltradas.length} compras</div>
                </div>
                <div className="card glass" style={{ background: balanceItbis > 0 ? 'linear-gradient(135deg, #fef2f2, #fee2e2)' : 'linear-gradient(135deg, #f0fdf4, #dcfce7)', border: balanceItbis > 0 ? '1px solid #fca5a5' : '1px solid #86efac' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 800, color: balanceItbis > 0 ? '#b91c1c' : '#15803d', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        {balanceItbis > 0 ? <AlertTriangle size={14} /> : <CheckSquare size={14} />}
                        Balance ITBIS Mensual
                    </div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 900, color: balanceItbis > 0 ? '#b91c1c' : '#15803d', marginTop: '0.5rem' }}>
                        {formatMoney(Math.abs(balanceItbis))}
                    </div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: balanceItbis > 0 ? '#991b1b' : '#166534', marginTop: '0.25rem' }}>
                        {balanceItbis > 0 ? 'A pagar a la DGII' : 'Saldo a favor para próximo mes'}
                    </div>
                </div>
                <div className="card glass">
                    <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#9333ea', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Retenciones (Mes)</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#7e22ce', marginTop: '0.5rem' }}>{formatMoney(isrRetenidoCompras + itbisRetenidoCompras)}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem', display: 'flex', justifyContent: 'space-between' }}>
                        <span>ISR: {formatMoney(isrRetenidoCompras)}</span>
                        <span>ITBIS: {formatMoney(itbisRetenidoCompras)}</span>
                    </div>
                </div>
            </div>

            {/* Alternador de Reportes */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                <button
                    className={`btn ${reporteActivo === '606' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setReporteActivo('606')}
                    style={{ fontSize: '0.9rem', padding: '0.5rem 1.2rem', borderRadius: '100px' }}
                >
                    Formato 606 (Resumen de Compras)
                </button>
                <button
                    className={`btn ${reporteActivo === '607' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setReporteActivo('607')}
                    style={{ fontSize: '0.9rem', padding: '0.5rem 1.2rem', borderRadius: '100px' }}
                >
                    Formato 607 (Resumen de Ventas)
                </button>
            </div>

            <div className="card glass" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(248,250,252,0.8)' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.75rem', margin: 0 }}>
                        <Table size={18} color="var(--primary)" />
                        Datos del Formato {reporteActivo} Filtrados
                    </h3>
                    <button onClick={handleExportCSV} className="btn" style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem', background: '#e0f2fe', color: '#0369a1', border: '1px solid #bae6fd', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700 }}>
                        <Download size={16} /> Exportar CSV Compatible DGII
                    </button>
                </div>

                <div style={{ overflowX: 'auto', maxHeight: '500px' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                        <thead style={{ position: 'sticky', top: 0, background: '#fff', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', zIndex: 10 }}>
                            <tr style={{ textAlign: 'left' }}>
                                {reporteActivo === '606' ? (
                                    <>
                                        <th style={thStyle}>RNC/Cédula</th>
                                        <th style={thStyle}>Fechas (Comp/Pago)</th>
                                        <th style={thStyle}>NCF / Tipo Gasto</th>
                                        <th style={{...thStyle, textAlign: 'right'}}>Monto Mínimo</th>
                                        <th style={{...thStyle, textAlign: 'right'}}>ITBIS Adel.</th>
                                        <th style={{...thStyle, textAlign: 'right'}}>Retenciones</th>
                                        <th style={{...thStyle, textAlign: 'right'}}>Neto / Condición</th>
                                    </>
                                ) : (
                                    <>
                                        <th style={thStyle}>Cliente / RNC</th>
                                        <th style={thStyle}>Fecha Factura</th>
                                        <th style={thStyle}>NCF / Tipo</th>
                                        <th style={{...thStyle, textAlign: 'right'}}>Monto Facturado</th>
                                        <th style={{...thStyle, textAlign: 'right'}}>ITBIS Cobrado</th>
                                        <th style={{...thStyle, textAlign: 'right'}}>Total</th>
                                        <th style={{...thStyle, textAlign: 'right'}}>Método</th>
                                    </>
                                )}
                            </tr>
                        </thead>
                        <tbody>
                            {reporteActivo === '606' ? (
                                comprasFiltradas.length === 0 ? (
                                    <tr><td colSpan="7" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>No hay compras en este mes.</td></tr>
                                ) : comprasFiltradas.map(c => (
                                    <tr key={c.id} style={trStyle}>
                                        <td style={tdStyle}>
                                            <div style={{ fontWeight: 600 }}>{c.proveedorRnc || 'N/A'}</div>
                                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.proveedorNombre || ''}</div>
                                        </td>
                                        <td style={tdStyle}>
                                            <div style={{ fontWeight: 600 }}>{formatDate(c.fechaFactura || c.fecha)}</div>
                                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{c.estado === 'Pagada' ? 'Pagado' : 'Pendiente CxP'}</div>
                                        </td>
                                        <td style={tdStyle}>
                                            <div style={{ fontWeight: 600, fontFamily: 'monospace', color: 'var(--primary)', letterSpacing: '0.05em' }}>{c.ncf || 'NO APLICA'}</div>
                                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Tipo {c.tipoGasto || '02'}</div>
                                        </td>
                                        <td style={{...tdStyle, textAlign: 'right', fontWeight: 600}}>{formatMoney(c.subtotal)}</td>
                                        <td style={{...tdStyle, textAlign: 'right', color: '#dc2626', fontWeight: 600}}>{formatMoney(c.itbis)}</td>
                                        <td style={{...tdStyle, textAlign: 'right'}}>
                                            <div style={{ color: '#7e22ce', fontWeight: 700 }}>{formatMoney((c.itbisRetenido||0) + (c.isrRetenido||0))}</div>
                                        </td>
                                        <td style={{...tdStyle, textAlign: 'right'}}>
                                            <div style={{ fontWeight: 800 }}>{formatMoney(c.netoAPagar || c.total)}</div>
                                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{c.condicion || 'Contado'}</div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                facturasFiltradas.length === 0 ? (
                                    <tr><td colSpan="7" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>No hay facturas en este mes.</td></tr>
                                ) : facturasFiltradas.map(f => (
                                    <tr key={f.id} style={trStyle}>
                                        <td style={tdStyle}>
                                            <div style={{ fontWeight: 600 }}>{f.clienteNombre || 'Consumidor Final'}</div>
                                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>RNC: {f.rnc || 'N/A'}</div>
                                        </td>
                                        <td style={tdStyle}>{formatDate(f.fechaEmision || f.fecha)}</td>
                                        <td style={tdStyle}>
                                            <div style={{ fontWeight: 600, fontFamily: 'monospace', color: 'var(--primary)', letterSpacing: '0.05em' }}>{f.ncf || '—'}</div>
                                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{f.tipoNCF || 'CF'}</div>
                                        </td>
                                        <td style={{...tdStyle, textAlign: 'right', fontWeight: 600}}>{formatMoney(f.subtotalDOP || f.subtotal)}</td>
                                        <td style={{...tdStyle, textAlign: 'right', color: '#16a34a', fontWeight: 600}}>{formatMoney(f.itbisDOP || f.itbis)}</td>
                                        <td style={{...tdStyle, textAlign: 'right', fontWeight: 800}}>{formatMoney(f.totalDOP || f.total)}</td>
                                        <td style={{...tdStyle, textAlign: 'right'}}>{f.metodoPago || '—'}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

const thStyle = { padding: '1rem', fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '2px solid #e2e8f0', background: '#f8fafc' };
const tdStyle = { padding: '0.875rem 1rem', borderBottom: '1px solid #f1f5f9' };
const trStyle = { transition: 'background 0.15s' };

export default ReportesFiscales;
