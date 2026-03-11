import React, { useState, useMemo } from 'react';
import { useFacturacion } from '../context/FacturacionContext';
import { useCompras } from '../context/ComprasContext';
import { useContactos } from '../context/ContactosContext';
import { FileText, User, Download, FileSpreadsheet } from 'lucide-react';
import { exportToExcel } from '../utils/exportUtils';

const EstadosCuenta = () => {
    const { facturas } = useFacturacion();
    const { compras } = useCompras();
    const { contactos } = useContactos();
    const [contactoId, setContactoId] = useState('');
    const [tipo, setTipo] = useState('cliente');

    const formatMoney = (amount) =>
        new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP' }).format(amount || 0);

    const clientes = contactos.filter(c => c.tipo === 'Cliente');
    const proveedores = contactos.filter(c => c.tipo === 'Proveedor');
    const listaActual = tipo === 'cliente' ? clientes : proveedores;
    const contactoSeleccionado = contactos.find(c => c.id === contactoId);

    const movimientos = useMemo(() => {
        if (!contactoId) return [];
        if (tipo === 'cliente') {
            return [...facturas]
                .filter(f => f.clienteId === contactoId || f.clienteNombre === contactoSeleccionado?.nombre)
                .sort((a, b) => new Date(a.fechaEmision) - new Date(b.fechaEmision))
                .map(f => ({
                    id: f.id,
                    fecha: f.fechaEmision || f.fechaRegistro,
                    referencia: f.ncf || f.numeroInterno,
                    descripcion: `Factura de Venta`,
                    cargo: f.total,
                    abono: 0,
                    estado: f.estado,
                    tipo: 'factura'
                }));
        } else {
            return [...compras]
                .filter(c => c.proveedorId === contactoId || c.proveedorNombre === contactoSeleccionado?.nombre)
                .sort((a, b) => new Date(a.fechaRegistro) - new Date(b.fechaRegistro))
                .map(c => ({
                    id: c.id,
                    fecha: c.fechaRegistro,
                    referencia: c.ncf || c.numeroInterno,
                    descripcion: `Factura de Compra`,
                    cargo: c.total,
                    abono: 0,
                    estado: c.estado,
                    tipo: 'compra'
                }));
        }
    }, [contactoId, tipo, facturas, compras, contactoSeleccionado]);

    const totalCargo = movimientos.reduce((acc, m) => acc + m.cargo, 0);
    const totalAbono = movimientos.reduce((acc, m) => acc + m.abono, 0);
    const saldo = totalCargo - totalAbono;

    const handleExportExcel = () => {
        const data = movimientos.map(m => ({
            "Fecha": new Date(m.fecha).toLocaleDateString('es-DO'),
            "Referencia": m.referencia,
            "Descripción": m.descripcion,
            "Cargo": m.cargo,
            "Abono": m.abono,
            "Estado": m.estado
        }));
        data.push({
            "Fecha": "", 
            "Referencia": "", 
            "Descripción": "TOTAL", 
            "Cargo": totalCargo, 
            "Abono": totalAbono, 
            "Estado": `Saldo: ${saldo}`
        });
        exportToExcel(data, `Estado_Cuenta_${contactoSeleccionado?.nombre}`, 'EstadoCuenta');
    };

    const handleExportPDF = () => {
        const win = window.open('', '_blank');
        if (!win) return;
        win.document.write(`
            <html><head><title>Estado de Cuenta - ${contactoSeleccionado?.nombre}</title>
            <style>body{font-family:Arial,sans-serif;padding:20px;} table{width:100%;border-collapse:collapse;} th,td{border:1px solid #ccc;padding:8px;text-align:left;} th{background:#f0f0f0;} .total-row{font-weight:bold;background:#f9f9f9;}</style>
            </head><body>
            <h1>Estado de Cuenta</h1>
            <p><strong>Contacto:</strong> ${contactoSeleccionado?.nombre}</p>
            <p><strong>RNC:</strong> ${contactoSeleccionado?.rnc || 'N/A'}</p>
            <p><strong>Tipo:</strong> ${tipo === 'cliente' ? 'Cliente' : 'Proveedor'}</p>
            <p><strong>Fecha de emisión:</strong> ${new Date().toLocaleDateString('es-DO')}</p><br/>
            <table>
                <thead><tr><th>Fecha</th><th>Referencia</th><th>Descripción</th><th>Cargo</th><th>Abono</th><th>Estado</th></tr></thead>
                <tbody>
                    ${movimientos.map(m => `<tr>
                        <td>${new Date(m.fecha).toLocaleDateString('es-DO')}</td>
                        <td>${m.referencia}</td>
                        <td>${m.descripcion}</td>
                        <td style="text-align:right">${formatMoney(m.cargo)}</td>
                        <td style="text-align:right">${formatMoney(m.abono)}</td>
                        <td>${m.estado}</td>
                    </tr>`).join('')}
                    <tr class="total-row"><td colspan="3">TOTAL</td>
                        <td style="text-align:right">${formatMoney(totalCargo)}</td>
                        <td style="text-align:right">${formatMoney(totalAbono)}</td>
                        <td>Saldo: ${formatMoney(saldo)}</td>
                    </tr>
                </tbody>
            </table>
            </body></html>
        `);
        win.document.close();
        win.print();
    };

    return (
        <div className="animate-up">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 className="page-title" style={{ marginBottom: '0.25rem' }}>Estados de Cuenta</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Historial detallado de cargos y abonos por cliente o proveedor.</p>
                </div>
                {contactoId && (
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <button className="btn btn-secondary" onClick={handleExportPDF}>
                            <FileText size={18} /> Exportar PDF
                        </button>
                        <button className="btn btn-primary" onClick={handleExportExcel}>
                            <FileSpreadsheet size={18} /> Exportar Excel
                        </button>
                    </div>
                )}
            </div>

            {/* Selector */}
            <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: '1rem', alignItems: 'end' }}>
                    <div className="input-group" style={{ marginBottom: 0 }}>
                        <label className="input-label">Ver por</label>
                        <select className="input-field" value={tipo} onChange={e => { setTipo(e.target.value); setContactoId(''); }}>
                            <option value="cliente">Clientes (CxC)</option>
                            <option value="proveedor">Proveedores (CxP)</option>
                        </select>
                    </div>
                    <div className="input-group" style={{ marginBottom: 0 }}>
                        <label className="input-label">Seleccionar {tipo === 'cliente' ? 'Cliente' : 'Proveedor'}</label>
                        <select className="input-field" value={contactoId} onChange={e => setContactoId(e.target.value)}>
                            <option value="">-- Seleccionar --</option>
                            {listaActual.map(c => <option key={c.id} value={c.id}>{c.nombre} ({c.rnc})</option>)}
                        </select>
                    </div>
                </div>
            </div>

            {contactoSeleccionado && (
                <>
                    {/* Cabecera del Estado */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                        <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid var(--danger)' }}>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem', textTransform: 'uppercase', fontWeight: 700 }}>Total Cargos</div>
                            <div style={{ fontSize: '1.4rem', fontWeight: 700 }}>{formatMoney(totalCargo)}</div>
                        </div>
                        <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid var(--success)' }}>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem', textTransform: 'uppercase', fontWeight: 700 }}>Total Abonos</div>
                            <div style={{ fontSize: '1.4rem', fontWeight: 700 }}>{formatMoney(totalAbono)}</div>
                        </div>
                        <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid var(--primary)', background: 'var(--primary-light)' }}>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem', textTransform: 'uppercase', fontWeight: 700 }}>Saldo Actual</div>
                            <div style={{ fontSize: '1.4rem', fontWeight: 700, color: saldo > 0 ? 'var(--danger)' : 'var(--success)' }}>{formatMoney(saldo)}</div>
                        </div>
                    </div>

                    {/* Tabla */}
                    <div className="card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                            <div>
                                <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>{contactoSeleccionado.nombre}</div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>RNC: {contactoSeleccionado.rnc}</div>
                            </div>
                        </div>
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ background: 'var(--background)', fontSize: '0.8rem' }}>
                                        <th style={{ padding: '0.75rem', textAlign: 'left' }}>Fecha</th>
                                        <th style={{ padding: '0.75rem', textAlign: 'left' }}>Referencia</th>
                                        <th style={{ padding: '0.75rem', textAlign: 'left' }}>Descripción</th>
                                        <th style={{ padding: '0.75rem', textAlign: 'right' }}>Cargo</th>
                                        <th style={{ padding: '0.75rem', textAlign: 'right' }}>Abono</th>
                                        <th style={{ padding: '0.75rem', textAlign: 'center' }}>Estado</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {movimientos.length === 0 ? (
                                        <tr><td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                            No hay transacciones para este contacto.
                                        </td></tr>
                                    ) : (
                                        movimientos.map(m => (
                                            <tr key={m.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                                <td style={{ padding: '0.75rem', fontSize: '0.875rem' }}>{new Date(m.fecha).toLocaleDateString('es-DO')}</td>
                                                <td style={{ padding: '0.75rem', fontSize: '0.875rem', fontWeight: 600 }}>{m.referencia}</td>
                                                <td style={{ padding: '0.75rem', fontSize: '0.875rem' }}>{m.descripcion}</td>
                                                <td style={{ padding: '0.75rem', textAlign: 'right', color: 'var(--danger)', fontWeight: 600 }}>{formatMoney(m.cargo)}</td>
                                                <td style={{ padding: '0.75rem', textAlign: 'right', color: 'var(--success)', fontWeight: 600 }}>{m.abono > 0 ? formatMoney(m.abono) : '—'}</td>
                                                <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                                                    <span style={{
                                                        padding: '0.2rem 0.6rem', borderRadius: '1rem', fontSize: '0.7rem', fontWeight: 700,
                                                        background: m.estado === 'Pagada' || m.estado === 'Cobrada' ? 'rgba(16,185,129,0.12)' : 'rgba(245,158,11,0.12)',
                                                        color: m.estado === 'Pagada' || m.estado === 'Cobrada' ? 'var(--success)' : 'var(--warning)'
                                                    }}>{m.estado}</span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                                <tfoot>
                                    <tr style={{ background: 'var(--background)', fontWeight: 700 }}>
                                        <td colSpan={3} style={{ padding: '0.75rem' }}>TOTAL</td>
                                        <td style={{ padding: '0.75rem', textAlign: 'right', color: 'var(--danger)' }}>{formatMoney(totalCargo)}</td>
                                        <td style={{ padding: '0.75rem', textAlign: 'right', color: 'var(--success)' }}>{formatMoney(totalAbono)}</td>
                                        <td style={{ padding: '0.75rem', textAlign: 'center' }}>Saldo: {formatMoney(saldo)}</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>
                </>
            )}

            {!contactoId && (
                <div className="card" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    <User size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                    <div>Selecciona un contacto para ver su estado de cuenta.</div>
                </div>
            )}
        </div>
    );
};

export default EstadosCuenta;
