import React, { useState } from 'react';
import { useContabilidad } from '../context/ContabilidadContext';
import { useCuentas } from '../context/CuentasContext';
import { Book, Plus, ArrowRight, Trash2, Edit2 } from 'lucide-react';
import ConfirmModal from '../components/ConfirmModal';

const DiarioGeneral = () => {
    const { asientos, registrarAsiento, eliminarAsiento, editarAsiento } = useContabilidad();
    const { cuentas } = useCuentas();

    const [confirmDelete, setConfirmDelete] = useState({ open: false, id: null });

    const handleDeleteAsiento = (id) => {
        setConfirmDelete({ open: true, id });
    };

    const confirmDeleteAction = () => {
        if (confirmDelete.id) {
            eliminarAsiento(confirmDelete.id);
            setConfirmDelete({ open: false, id: null });
        }
    };


    const [isManualEntryOpen, setIsManualEntryOpen] = useState(false);
    const [editingId, setEditingId] = useState(null); // null = creating, id = editing

    // Estados Formulario Asiento Manual
    const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
    const [descripcion, setDescripcion] = useState('');
    const [referencia, setReferencia] = useState('');
    const [lineas, setLineas] = useState([
        { cuentaId: '', debito: '', credito: '' },
        { cuentaId: '', debito: '', credito: '' }
    ]);

    const handleEditAsiento = (asiento) => {
        setEditingId(asiento.id);
        setFecha(asiento.fecha ? asiento.fecha.split('T')[0] : new Date().toISOString().split('T')[0]);
        setDescripcion(asiento.descripcion || '');
        setReferencia(asiento.referencia || '');
        setLineas(asiento.detalles.map(d => ({
            cuentaId: String(d.cuentaId),
            debito: d.debito || '',
            credito: d.credito || ''
        })));
        setIsManualEntryOpen(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setIsManualEntryOpen(false);
        setLineas([{ cuentaId: '', debito: '', credito: '' }, { cuentaId: '', debito: '', credito: '' }]);
        setDescripcion('');
        setReferencia('');
    };

    const formatMoney = (amount) => {
        return new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP' }).format(amount);
    };

    const formatDate = (isoString) => {
        const d = new Date(isoString);
        return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
    };

    const getNombreCuenta = (id) => {
        if (!id) return '[Sin Cuenta]';
        const cuenta = cuentas.find(c => String(c.id) === String(id));
        if (!cuenta) return `[Cuenta ${id} - No Hallada]`;
        return `${cuenta.codigo} - ${cuenta.nombre}`;
    };

    const totalesFormulario = lineas.reduce((acc, linea) => {
        return {
            debito: acc.debito + (Number(linea.debito) || 0),
            credito: acc.credito + (Number(linea.credito) || 0)
        };
    }, { debito: 0, credito: 0 });

    const difFormulario = Math.abs(totalesFormulario.debito - totalesFormulario.credito);
    const isFormBalanced = difFormulario <= 0.05 && totalesFormulario.debito > 0;

    const handleAddLinea = () => {
        setLineas([...lineas, { cuentaId: '', debito: '', credito: '' }]);
    };

    const handleLineaCambio = (index, campo, valor) => {
        const nuevasLineas = [...lineas];
        nuevasLineas[index][campo] = valor;

        // Auto-balance: si pongo un débito, quito el crédito y viceversa
        if (campo === 'debito' && valor) nuevasLineas[index]['credito'] = '';
        if (campo === 'credito' && valor) nuevasLineas[index]['debito'] = '';

        setLineas(nuevasLineas);
    };

    const handleSubmitAsientoManual = (e) => {
        e.preventDefault();
        if (!descripcion) return alert('Ingrese una descripción.');
        if (!isFormBalanced) return alert('El asiento no está cuadrado.');

        try {
            if (editingId) {
                editarAsiento(editingId, descripcion, lineas, fecha, referencia);
            } else {
                registrarAsiento(descripcion, lineas, fecha, 'Manual', referencia);
            }
            setLineas([{ cuentaId: '', debito: '', credito: '' }, { cuentaId: '', debito: '', credito: '' }]);
            setDescripcion('');
            setReferencia('');
            setIsManualEntryOpen(false);
            setEditingId(null);
        } catch (e) {
            alert(e.message);
        }
    };

    const cuentasAsentables = cuentas.filter(c => c.activa && c.subtipo === 'Cuenta Detalle');

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div>
                    <h1 className="page-title" style={{ marginBottom: '0.25rem' }}>Libro Diario General</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Visualiza los asientos automáticos y registra transacciones manuales ajustadas a las normas locales.</p>
                </div>
                <button className="btn btn-primary" onClick={() => { handleCancelEdit(); setIsManualEntryOpen(!isManualEntryOpen); }}>
                    <Plus size={18} /> {isManualEntryOpen ? 'Cerrar Formulario' : 'Nuevo Asiento Manual'}
                </button>
            </div>

            {isManualEntryOpen && (
                <div className="card" style={{ marginBottom: '2rem', border: `1px solid ${editingId ? 'var(--warning)' : 'var(--primary)'}`, position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: editingId ? 'var(--warning)' : 'var(--primary)' }} />
                    <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1.5rem', color: editingId ? 'var(--warning)' : 'inherit' }}>
                        {editingId ? '✏️ Editando Asiento Existente' : 'Registro de Entrada de Diario (Manual)'}
                    </h2>

                    <form onSubmit={handleSubmitAsientoManual}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                            <div className="input-group">
                                <label className="input-label">Fecha</label>
                                <input required type="date" className="input-field" value={fecha} onChange={e => setFecha(e.target.value)} />
                            </div>
                            <div className="input-group">
                                <label className="input-label">Descripción (Concepto)</label>
                                <input required type="text" className="input-field" value={descripcion} onChange={e => setDescripcion(e.target.value)} placeholder="Ej: Registro de Ajuste por Depreciación" />
                            </div>
                            <div className="input-group">
                                <label className="input-label">Referencia / Doc.</label>
                                <input type="text" className="input-field" value={referencia} onChange={e => setReferencia(e.target.value)} placeholder="Opcional" />
                            </div>
                        </div>

                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', marginBottom: '1rem' }}>
                            <thead style={{ backgroundColor: 'var(--background)' }}>
                                <tr>
                                    <th style={{ padding: '0.75rem', fontSize: '0.875rem', fontWeight: 600 }}>Cuenta Contable</th>
                                    <th style={{ padding: '0.75rem', fontSize: '0.875rem', fontWeight: 600, width: '150px' }}>Débito (RD$)</th>
                                    <th style={{ padding: '0.75rem', fontSize: '0.875rem', fontWeight: 600, width: '150px' }}>Crédito (RD$)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {lineas.map((linea, index) => (
                                    <tr key={index} style={{ borderBottom: '1px solid var(--border)' }}>
                                        <td style={{ padding: '0.5rem' }}>
                                            <select required className="input-field" style={{ width: '100%' }} value={linea.cuentaId} onChange={e => handleLineaCambio(index, 'cuentaId', e.target.value)}>
                                                <option value="">-- Seleccionar Cuenta --</option>
                                                {cuentasAsentables.map(c => <option key={c.id} value={c.id}>{c.codigo} - {c.nombre}</option>)}
                                            </select>
                                        </td>
                                        <td style={{ padding: '0.5rem' }}>
                                            <input type="number" step="0.01" min="0" className="input-field" style={{ width: '100%' }} value={linea.debito} onChange={e => handleLineaCambio(index, 'debito', e.target.value)} disabled={!!linea.credito} />
                                        </td>
                                        <td style={{ padding: '0.5rem' }}>
                                            <input type="number" step="0.01" min="0" className="input-field" style={{ width: '100%' }} value={linea.credito} onChange={e => handleLineaCambio(index, 'credito', e.target.value)} disabled={!!linea.debito} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        <button type="button" className="btn btn-secondary" style={{ fontSize: '0.75rem', marginBottom: '1.5rem' }} onClick={handleAddLinea}>
                            + Agregar Línea
                        </button>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '2rem', padding: '1rem', background: 'var(--background)', borderRadius: 'var(--radius-md)' }}>
                            <div style={{ display: 'flex', gap: '2rem', fontSize: '0.875rem' }}>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <span style={{ color: 'var(--text-muted)' }}>Tot. Débitos</span>
                                    <span style={{ fontWeight: 600 }}>{formatMoney(totalesFormulario.debito)}</span>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <span style={{ color: 'var(--text-muted)' }}>Tot. Créditos</span>
                                    <span style={{ fontWeight: 600 }}>{formatMoney(totalesFormulario.credito)}</span>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <span style={{ color: 'var(--text-muted)' }}>Diferencia</span>
                                    <span style={{ fontWeight: 600, color: isFormBalanced ? 'var(--success)' : 'var(--danger)' }}>{formatMoney(difFormulario)}</span>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                {editingId && (
                                    <button type="button" className="btn btn-secondary" onClick={handleCancelEdit}>Cancelar Edición</button>
                                )}
                                <button type="submit" className="btn btn-primary" disabled={!isFormBalanced}>
                                    {editingId ? 'Guardar Cambios' : 'Asentar en Diario'}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {asientos.length === 0 ? (
                    <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                        <Book size={48} style={{ margin: '0 auto 1rem auto', opacity: 0.5 }} />
                        <p>No hay asientos registrados en el Diario General.</p>
                        <p style={{ fontSize: '0.875rem' }}>Cree una factura o registre una entrada manual.</p>
                    </div>
                ) : (
                    [...asientos].reverse().map(asiento => (
                        <div key={asiento.id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
                            <div style={{ padding: '1rem 1.5rem', background: 'var(--background)', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <span style={{ fontWeight: 600, color: 'var(--primary)' }}>{asiento.numero}</span>
                                    <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{formatDate(asiento.fecha)}</span>
                                    <span style={{ background: 'var(--primary-light)', color: 'var(--primary)', padding: '0.125rem 0.5rem', borderRadius: '1rem', fontSize: '0.75rem', fontWeight: 600 }}>{asiento.origen}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    {asiento.referencia && <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Ref: {asiento.referencia}</span>}
                                    {asiento.origen === 'Manual' && (
                                        <button
                                            className="btn"
                                            style={{ padding: '0.25rem', color: 'var(--primary)' }}
                                            onClick={() => handleEditAsiento(asiento)}
                                            title="Editar Asiento"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                    )}
                                    <button
                                        className="btn"
                                        style={{ padding: '0.25rem', color: 'var(--danger)' }}
                                        onClick={() => handleDeleteAsiento(asiento.id)}
                                        title="Eliminar Asiento"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>

                            <div style={{ padding: '1rem 1.5rem' }}>
                                <p style={{ fontWeight: 500, marginBottom: '1rem' }}>{asiento.descripcion}</p>

                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                                    <tbody>
                                        {(asiento.detalles || []).map((detalle, idx) => {
                                            const isDebito = Number(detalle.debito) > 0;
                                            return (
                                                <tr key={idx} style={{ borderBottom: '1px solid var(--border)' }}>
                                                    <td style={{ padding: '0.5rem', paddingLeft: isDebito ? '0.5rem' : '2rem' }}>
                                                        {getNombreCuenta(detalle.cuentaId)}
                                                    </td>
                                                    <td style={{ padding: '0.5rem', textAlign: 'right', width: '150px', color: isDebito ? 'var(--text-main)' : 'transparent' }}>
                                                        {isDebito ? formatMoney(detalle.debito) : ''}
                                                    </td>
                                                    <td style={{ padding: '0.5rem', textAlign: 'right', width: '150px', color: !isDebito ? 'var(--text-main)' : 'transparent' }}>
                                                        {!isDebito ? formatMoney(detalle.credito) : ''}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <ConfirmModal
                isOpen={confirmDelete.open}
                onClose={() => setConfirmDelete({ open: false, id: null })}
                onConfirm={confirmDeleteAction}
                title="Eliminar Asiento Contable"
                message="¿Está seguro de que desea eliminar este asiento de diario? Esta acción afectará los reportes financieros inmediatamente y no se puede deshacer."
            />

        </div>
    );
};

export default DiarioGeneral;
