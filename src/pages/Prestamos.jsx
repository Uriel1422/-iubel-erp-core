import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { usePrestamos } from '../context/PrestamosContext';
import { useSocios } from '../context/SociosContext';
import { CreditCard, Plus, Calendar, DollarSign, Calculator, List, FileText, X, AlertCircle } from 'lucide-react';

const Prestamos = () => {
    const { prestamos, loading, registrarPrestamo, generarAmortizacion, obtenerCuotas, pagarCuota } = usePrestamos();
    const { socios } = useSocios();

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [previewTabla, setPreviewTabla] = useState([]);

    const [isAmortizacionModalOpen, setIsAmortizacionModalOpen] = useState(false);
    const [isPagoModalOpen, setIsPagoModalOpen] = useState(false);
    const [selectedPrestamo, setSelectedPrestamo] = useState(null);
    const [cuotasPrestamo, setCuotasPrestamo] = useState([]);
    const [loadingAction, setLoadingAction] = useState(false);

    const [formData, setFormData] = useState({
        socioId: '',
        monto: '',
        tasa: '18',
        plazo: '12',
        sistema: 'Frances'
    });

    const formatMoney = (amount) =>
        new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP' }).format(amount || 0);

    // Flujo de Creación
    const handlePreview = () => {
        if (!formData.monto || !formData.tasa || !formData.plazo) return;
        const { tabla } = generarAmortizacion(
            Number(formData.monto),
            Number(formData.tasa),
            Number(formData.plazo),
            formData.sistema
        );
        setPreviewTabla(tabla);
    };

    const handleCreateSubmit = async (e) => {
        e.preventDefault();
        setLoadingAction(true);
        try {
            const socio = socios.find(s => s.id === formData.socioId);
            const res = await registrarPrestamo({
                ...formData,
                socioNombre: socio?.nombre || 'Socio Desconocido'
            });
            if (res) {
                // Stable reset
                setIsCreateModalOpen(false);
                setFormData({ socioId: '', monto: '', tasa: '18', plazo: '12', sistema: 'Frances' });
                setPreviewTabla([]);
            }
        } catch (error) {
            alert(error.message);
        } finally {
            setLoadingAction(false);
        }
    };

    // Consultas Modal
    const openAmortizacion = async (prestamo) => {
        setLoadingAction(true);
        setSelectedPrestamo(prestamo);
        setIsAmortizacionModalOpen(true);
        try {
            const cuotas = await obtenerCuotas(prestamo.id);
            setCuotasPrestamo(cuotas);
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingAction(false);
        }
    };

    const openPago = async (prestamo) => {
        setLoadingAction(true);
        setSelectedPrestamo(prestamo);
        setIsPagoModalOpen(true);
        try {
            const cuotas = await obtenerCuotas(prestamo.id);
            setCuotasPrestamo(cuotas);
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingAction(false);
        }
    };

    const handlePagarCuota = async (cuota) => {
        if (!window.confirm(`¿Confirmas el pago por ${formatMoney(cuota.monto_total)}?`)) return;
        setLoadingAction(true);
        try {
            const ok = await pagarCuota(selectedPrestamo.id, cuota.id, cuota.monto_total);
            if (ok) setIsPagoModalOpen(false);
        } catch (error) {
            alert(error.message);
        } finally {
            setLoadingAction(false);
        }
    };

    const cuotaPendiente = (cuotas) => cuotas.find(c => c.estado !== 'Pagada');

    return (
        <React.Fragment>
            <div className="animate-up" key="prestamos-page-main">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <div>
                        <h1 className="page-title" style={{ marginBottom: '0.5rem' }}>Préstamos</h1>
                        <p style={{ color: 'var(--text-muted)' }}>Módulo relacional de cartera de crédito, amortizaciones y pagos.</p>
                    </div>
                    <button className="btn btn-primary" onClick={() => setIsCreateModalOpen(true)}>
                        <Plus size={20} /> <span>Solicitar Préstamo</span>
                    </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem', minHeight: '200px' }}>
                    {loading && (
                        <div key="loading-view" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)', gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                            <div className="spinner" style={{ width: '30px', height: '30px', border: '3px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                            <span>Cargando Cartera de Préstamos...</span>
                        </div>
                    )}

                    {!loading && prestamos.length === 0 && (
                        <div key="empty-view" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)', gridColumn: '1 / -1' }}>
                            <AlertCircle size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                            <p>No hay préstamos registrados para esta empresa actualmente.</p>
                        </div>
                    )}

                    {!loading && prestamos.length > 0 && prestamos.map((p) => (
                        <div key={`loan-card-${p.id}`} className="card glass animate-up" style={{ padding: '1.5rem', borderTop: p.estado === 'Saldado' ? '4px solid var(--success)' : '4px solid var(--primary)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                <span style={{
                                    padding: '3px 10px',
                                    background: 'rgba(59, 130, 246, 0.1)',
                                    color: 'var(--primary)',
                                    borderRadius: '12px',
                                    fontSize: '0.7rem',
                                    fontWeight: 800
                                }}>
                                    ID: {p.id.slice(-6).toUpperCase()}
                                </span>
                                <span style={{ color: p.estado === 'Saldado' ? 'var(--success)' : (p.estado === 'Mora' ? 'var(--danger)' : 'var(--primary)'), fontWeight: 700, fontSize: '0.8rem' }}>{p.estado}</span>
                            </div>

                            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>{p.cliente_nombre}</h3>
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '1.5rem' }}>
                                <span>Desembolso: </span>
                                <span>{p.fecha_desembolso ? new Date(p.fecha_desembolso).toLocaleDateString() : 'N/A'}</span>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                                <div>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Balance Pendiente</div>
                                    <div style={{ fontWeight: 800, fontSize: '1.125rem' }}>{formatMoney(p.balance_pendiente)}</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Monto Original</div>
                                    <div style={{ fontWeight: 800, fontSize: '1.125rem', color: 'var(--text)' }}>{formatMoney(p.monto)}</div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button className="btn btn-secondary" style={{ flex: 1, fontSize: '0.8rem' }} onClick={() => openAmortizacion(p)}>
                                    <List size={14} /> <span>Amortización</span>
                                </button>
                                {p.estado !== 'Saldado' && (
                                    <button className="btn btn-primary" style={{ flex: 1, fontSize: '0.8rem' }} onClick={() => openPago(p)}>
                                        <DollarSign size={14} /> <span>Cobrar</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Modal Creación Préstamo */}
            {isCreateModalOpen && createPortal(
                <div className="modal-overlay" key="modal-create-p-overlay">
                    <div className="card" style={{ width: '90%', maxWidth: '900px', height: '80vh', display: 'grid', gridTemplateColumns: '400px 1fr', overflow: 'hidden', padding: 0 }}>
                        <div style={{ padding: '2rem', borderRight: '1px solid var(--border)', overflowY: 'auto' }}>
                            <h2 style={{ marginBottom: '1.5rem' }}>Nuevo Préstamo</h2>
                            <form onSubmit={handleCreateSubmit}>
                                <div className="input-group">
                                    <label className="input-label">Socio Solicitante</label>
                                    <select className="input-field" value={formData.socioId} onChange={e => setFormData({ ...formData, socioId: e.target.value })} required>
                                        <option value="">-- Seleccione un socio --</option>
                                        {socios.map(s => {
                                            const sc = calcularSocioScore(s);
                                            return <option key={s.id} value={s.id}>{s.nombre} | Score: {sc}</option>
                                        })}
                                    </select>
                                </div>

                                {formData.socioId && (() => {
                                    const s = socios.find(x => x.id === formData.socioId);
                                    const sc = calcularSocioScore(s);
                                    const color = sc >= 85 ? 'var(--success)' : sc >= 60 ? 'var(--warning)' : 'var(--danger)';
                                    return (
                                        <div style={{
                                            background: `${color}11`,
                                            padding: '1rem',
                                            borderRadius: '8px',
                                            marginBottom: '1.5rem',
                                            border: `1px solid ${color}44`,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between'
                                        }}>
                                            <div>
                                                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Analítica de Riesgo</div>
                                                <div style={{ fontSize: '1rem', fontWeight: 800, color }}>Socio Score: {sc} / 100</div>
                                            </div>
                                            <div style={{
                                                fontSize: '0.65rem',
                                                fontWeight: 800,
                                                padding: '4px 8px',
                                                borderRadius: '4px',
                                                background: color,
                                                color: 'white'
                                            }}>
                                                {sc >= 85 ? 'RIESGO MÍNIMO' : sc >= 60 ? 'RIESGO MEDIO' : 'RIESGO ALTO'}
                                            </div>
                                        </div>
                                    );
                                })()}
                                <div className="input-group">
                                    <label className="input-label">Monto Solicitado (DOP)</label>
                                    <input className="input-field" type="number" value={formData.monto} onChange={e => { setFormData({ ...formData, monto: e.target.value }); }} placeholder="0.00" required />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div className="input-group">
                                        <label className="input-label">Tasa Anual (%)</label>
                                        <input className="input-field" type="number" value={formData.tasa} onChange={e => setFormData({ ...formData, tasa: e.target.value })} required />
                                    </div>
                                    <div className="input-group">
                                        <label className="input-label">Plazo (Meses)</label>
                                        <input className="input-field" type="number" value={formData.plazo} onChange={e => setFormData({ ...formData, plazo: e.target.value })} required />
                                    </div>
                                </div>
                                <div className="input-group">
                                    <label className="input-label">Sistema de Amortización</label>
                                    <select className="input-field" value={formData.sistema} onChange={e => setFormData({ ...formData, sistema: e.target.value })}>
                                        <option value="Frances">Cuota Fija (Francés)</option>
                                        <option value="Aleman">Capital Fijo (Alemán)</option>
                                    </select>
                                </div>

                                <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                                    <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={handlePreview}>Pre-visualizar</button>
                                    <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={loadingAction}>{loadingAction ? '...' : 'Desembolsar'}</button>
                                </div>
                                <button type="button" className="btn" style={{ width: '100%', marginTop: '1rem' }} onClick={() => setIsCreateModalOpen(false)}>Cancelar</button>
                            </form>
                        </div>

                        <div style={{ background: 'var(--background-alt)', padding: '2rem', overflowY: 'auto' }}>
                            <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Calculator size={20} /> <span>Proyección de Pagos Frontend</span>
                            </h3>

                            {previewTabla.length > 0 ? (
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                                    <thead>
                                        <tr style={{ textAlign: 'left', borderBottom: '2px solid var(--border)' }}>
                                            <th style={{ padding: '0.5rem' }}>Mes</th>
                                            <th style={{ padding: '0.5rem', textAlign: 'right' }}>Capital</th>
                                            <th style={{ padding: '0.5rem', textAlign: 'right' }}>Interés</th>
                                            <th style={{ padding: '0.5rem', textAlign: 'right' }}>Cuota</th>
                                            <th style={{ padding: '0.5rem', textAlign: 'right' }}>Balance</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {previewTabla.map(row => (
                                            <tr key={row.mes} style={{ borderBottom: '1px solid var(--border)' }}>
                                                <td style={{ padding: '0.5rem' }}>{row.mes}</td>
                                                <td style={{ padding: '0.5rem', textAlign: 'right' }}>{formatMoney(row.capital)}</td>
                                                <td style={{ padding: '0.5rem', textAlign: 'right' }}>{formatMoney(row.interes)}</td>
                                                <td style={{ padding: '0.5rem', textAlign: 'right', fontWeight: 700 }}>{formatMoney(row.cuota)}</td>
                                                <td style={{ padding: '0.5rem', textAlign: 'right', color: 'var(--text-muted)' }}>{formatMoney(row.balance)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', textAlign: 'center' }}>
                                    <FileText size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                                    <p><span>Ingresa los datos y presiona "Pre-visualizar"</span> <br /> <span>para ver la tabla simulada.</span></p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* Modal de Amortización (Tabla Guardada) */}
            {isAmortizacionModalOpen && selectedPrestamo && createPortal(
                <div className="modal-overlay" key="modal-amort-p-overlay">
                    <div className="card" style={{ width: '90%', maxWidth: '800px', maxHeight: '80vh', display: 'flex', flexDirection: 'column', padding: '2rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <div>
                                <h2 style={{ marginBottom: '0.25rem' }}>Amortización Definitiva</h2>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{selectedPrestamo.cliente_nombre}</p>
                            </div>
                            <button className="btn" onClick={() => setIsAmortizacionModalOpen(false)}><X size={20} /></button>
                        </div>

                        <div style={{ overflowY: 'auto' }}>
                            {loadingAction ? <div style={{ padding: '2rem', textAlign: 'center' }}><span>Cargando cuotas...</span></div> : (
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                                    <thead>
                                        <tr style={{ textAlign: 'left', borderBottom: '2px solid var(--border)' }}>
                                            <th style={{ padding: '0.5rem' }}>#</th>
                                            <th style={{ padding: '0.5rem' }}>Vencimiento</th>
                                            <th style={{ padding: '0.5rem', textAlign: 'right' }}>Capital</th>
                                            <th style={{ padding: '0.5rem', textAlign: 'right' }}>Interés</th>
                                            <th style={{ padding: '0.5rem', textAlign: 'right' }}>Total</th>
                                            <th style={{ padding: '0.5rem', textAlign: 'right' }}>Estado</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {cuotasPrestamo.map(row => (
                                            <tr key={row.id} style={{ borderBottom: '1px solid var(--border)', background: row.estado === 'Pagada' ? 'rgba(16, 185, 129, 0.05)' : 'transparent' }}>
                                                <td style={{ padding: '0.5rem' }}>{row.numero_cuota}</td>
                                                <td style={{ padding: '0.5rem' }}>{new Date(row.fecha_vencimiento).toLocaleDateString()}</td>
                                                <td style={{ padding: '0.5rem', textAlign: 'right' }}>{formatMoney(row.capital)}</td>
                                                <td style={{ padding: '0.5rem', textAlign: 'right' }}>{formatMoney(row.interes)}</td>
                                                <td style={{ padding: '0.5rem', textAlign: 'right', fontWeight: 700 }}>{formatMoney(row.monto_total)}</td>
                                                <td style={{ padding: '0.5rem', textAlign: 'right' }}>
                                                    <span style={{
                                                        padding: '3px 8px', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 700,
                                                        background: row.estado === 'Pagada' ? 'var(--success)' : (row.estado === 'Atrasada' ? 'var(--danger)' : '#e2e8f0'),
                                                        color: row.estado === 'Pendiente' ? '#475569' : 'white'
                                                    }}>
                                                        {row.estado}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* Modal de Pago (Cobrar) */}
            {isPagoModalOpen && selectedPrestamo && createPortal(
                <div className="modal-overlay" key="modal-pago-p-overlay">
                    <div className="card" style={{ width: '90%', maxWidth: '400px', display: 'flex', flexDirection: 'column', padding: '2rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                            <div>
                                <h2 style={{ marginBottom: '0.25rem' }}>Cobrar Cuota</h2>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{selectedPrestamo.cliente_nombre}</p>
                            </div>
                            <button className="btn" onClick={() => setIsPagoModalOpen(false)}><X size={20} /></button>
                        </div>

                        {loadingAction ? <div style={{ padding: '2rem', textAlign: 'center' }}><span>Consultando estado...</span></div> : (() => {
                            const pendiente = cuotaPendiente(cuotasPrestamo);
                            if (!pendiente) return <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--success)' }}><span>No hay cuotas pendientes. El préstamo está saldado.</span></div>;

                            return (
                                <div>
                                    <div style={{ background: 'var(--background-alt)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
                                        <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '0.5rem' }}><span>Cuota Activa #</span><span>{pendiente.numero_cuota}</span></div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}><span>Vencimiento:</span> <strong>{new Date(pendiente.fecha_vencimiento).toLocaleDateString()}</strong></div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}><span>Capital:</span> <span>{formatMoney(pendiente.capital)}</span></div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}><span>Interés:</span> <span>{formatMoney(pendiente.interes)}</span></div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                                            <span style={{ fontWeight: 800 }}>Monto a Pagar:</span>
                                            <span style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '1.25rem' }}>{formatMoney(pendiente.monto_total)}</span>
                                        </div>
                                    </div>
                                    <button
                                        className="btn btn-primary"
                                        style={{ width: '100%', padding: '1rem', fontSize: '1rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                                        onClick={() => handlePagarCuota(pendiente)}
                                        disabled={loadingAction}
                                    >
                                        <DollarSign size={20} /> <span>Autenticar Pago</span>
                                    </button>
                                </div>
                            );
                        })()}
                    </div>
                </div>,
                document.body
            )}
        </React.Fragment>
    );
};

export default Prestamos;

