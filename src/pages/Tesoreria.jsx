import React, { useState } from 'react';
import { useFacturacion } from '../context/FacturacionContext';
import { useCompras } from '../context/ComprasContext';
import { useContabilidad } from '../context/ContabilidadContext';
import { useCaja } from '../context/CajaContext';
import { CheckCircle, Clock, Receipt, Banknote } from 'lucide-react';

const Tesoreria = ({ tipo }) => {
    const { facturas, registrarPagoFactura } = useFacturacion();
    const { compras, registrarPagoCompra } = useCompras();
    const { registrarRecibo } = useCaja();

    const isIngreso = tipo === 'ingreso';
    const facturasPendientes = facturas.filter(f => f.condicion === 'Credito' && f.estado !== 'Pagada');
    const comprasPendientes = compras.filter(c => c.condicion === 'Credito' && c.estado !== 'Pagada');

    const [selectedId, setSelectedId] = useState('');
    const [success, setSuccess] = useState(false);
    const [lastReceipt, setLastReceipt] = useState(null);

    const handleLiquidar = (e) => {
        e.preventDefault();

        if (isIngreso) {
            const factura = facturas.find(f => f.id === selectedId);
            if (!factura) return;

            registrarPagoFactura(factura.id, factura.total);

            // Generar Recibo de Caja
            const recibo = registrarRecibo({
                cliente: factura.cliente?.nombre || factura.clienteNombre || 'Cliente General',
                monto: factura.total,
                concepto: `Pago de Factura ${factura.ncf || factura.numero}`,
                metodo: 'Efectivo/Transferencia'
            });
            setLastReceipt(recibo);
        } else {
            const compra = compras.find(c => c.id === selectedId);
            if (!compra) return;
            registrarPagoCompra(compra.id, compra.total);
        }

        setSuccess(true);
        setSelectedId('');
        setTimeout(() => setSuccess(false), 5000);
    };

    return (
        <div className="animate-up">
            <div style={{ marginBottom: '2rem' }}>
                <h1 className="page-title">{isIngreso ? 'Cobros a Clientes' : 'Pagos a Proveedores'}</h1>
                <p style={{ color: 'var(--text-muted)' }}>
                    {isIngreso
                        ? 'Registra la entrada de efectivo al liquidar facturas a crédito.'
                        : 'Registra la salida de fondos para saldar deudas con proveedores.'}
                </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: success ? '1fr' : '1fr 1fr', gap: '2rem' }}>
                <div className="card" style={{ padding: '2rem' }}>
                    {success ? (
                        <div style={{ textAlign: 'center', padding: '1rem' }}>
                            <div style={{
                                width: '64px',
                                height: '64px',
                                borderRadius: '50%',
                                background: 'var(--success-light)',
                                color: 'var(--success)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 1.5rem'
                            }}>
                                <CheckCircle size={32} />
                            </div>
                            <h2 style={{ marginBottom: '0.5rem' }}>Operación Exitosa</h2>
                            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
                                Se ha registrado el {isIngreso ? 'cobro' : 'pago'} y generado el asiento contable correspondiente.
                            </p>

                            {isIngreso && lastReceipt && (
                                <div className="card glass" style={{ textAlign: 'left', padding: '1.5rem', marginBottom: '2.5rem', border: '1px solid var(--success)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                        <span style={{ fontWeight: 700 }}>RECIBO {lastReceipt.numero}</span>
                                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{new Date(lastReceipt.fecha).toLocaleString()}</span>
                                    </div>
                                    <div style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}><b>Recibido de:</b> {lastReceipt.cliente}</div>
                                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--success)', marginBottom: '0.5rem' }}>{new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP' }).format(lastReceipt.monto)}</div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}><b>Concepto:</b> {lastReceipt.concepto}</div>
                                </div>
                            )}

                            <button className="btn btn-primary" onClick={() => { setSuccess(false); setLastReceipt(null); }}>
                                Registrar otro {isIngreso ? 'Cobro' : 'Pago'}
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleLiquidar}>
                            <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                {isIngreso ? <Banknote color="var(--success)" /> : <Receipt color="var(--danger)" />}
                                Datos del {isIngreso ? 'Cobro' : 'Pago'}
                            </h3>

                            <div className="input-group">
                                <label className="input-label">Seleccionar {isIngreso ? 'Factura de Cliente' : 'Factura de Proveedor'}</label>
                                <select
                                    className="input-field"
                                    value={selectedId}
                                    onChange={e => setSelectedId(e.target.value)}
                                    required
                                    style={{ height: '3.5rem' }}
                                >
                                    <option value="">-- Seleccione un documento pendiente --</option>
                                    {(isIngreso ? facturasPendientes : comprasPendientes).map(doc => (
                                        <option key={doc.id} value={doc.id}>
                                            {doc.ncf || doc.numero} - {doc.cliente?.nombre || doc.proveedor?.nombre || doc.clienteNombre || 'Prov. Gen.'} ({new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP' }).format(doc.total)})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="input-group">
                                <label className="input-label">Método de Pago</label>
                                <select className="input-field" style={{ height: '3.5rem' }}>
                                    <option>Efectivo</option>
                                    <option>Transferencia Bancaria</option>
                                    <option>Cheque</option>
                                    <option>Tarjeta de Crédito</option>
                                </select>
                            </div>

                            <div className="input-group">
                                <label className="input-label">Comentario / Referencia</label>
                                <input className="input-field" placeholder="Ej: Transf. #12345" style={{ height: '3.5rem' }} />
                            </div>

                            <button type="submit" className="btn btn-primary" style={{ width: '100%', height: '3.5rem', marginTop: '1rem' }} disabled={!selectedId}>
                                {isIngreso ? 'Generar Recibo e Ingresar' : 'Procesar Pago a Proveedor'}
                            </button>
                        </form>
                    )}
                </div>

                {!success && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div className="card glass" style={{ padding: '1.5rem' }}>
                            <h4 style={{ marginBottom: '1rem', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 800 }}>Resumen de Cartera</h4>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <span>Total Pendiente:</span>
                                <span style={{ fontWeight: 700, fontSize: '1.25rem', color: isIngreso ? 'var(--primary)' : 'var(--danger)' }}>
                                    {new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP' }).format(
                                        (isIngreso ? facturasPendientes : comprasPendientes).reduce((acc, d) => acc + d.total, 0)
                                    )}
                                </span>
                            </div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                {isIngreso
                                    ? `Tienes ${(isIngreso ? facturasPendientes : comprasPendientes).length} facturas esperando cobro.`
                                    : `Tienes ${(isIngreso ? facturasPendientes : comprasPendientes).length} facturas esperando pago.`}
                            </div>
                        </div>

                        <div className="card" style={{ padding: '1.5rem', background: 'var(--primary-light)', color: 'var(--primary)', border: 'none' }}>
                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                                <Clock size={20} />
                                <div>
                                    <div style={{ fontWeight: 700, marginBottom: '0.25rem' }}>Recordatorio de Auditoría</div>
                                    <div style={{ fontSize: '0.8rem', opacity: 0.9 }}>
                                        Cada recibo generado queda registrado en el módulo de **Caja** para su posterior anulación o reporte de cierre.
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Tesoreria;
