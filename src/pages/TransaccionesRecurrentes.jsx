import React, { useState } from 'react';
import { useRecurrentes } from '../context/RecurrentesContext';
import { useContabilidad } from '../context/ContabilidadContext';
import { useCuentas } from '../context/CuentasContext';
import { RefreshCw, Plus, Pause, Play, Trash2, Zap } from 'lucide-react';
import ConfirmModal from '../components/ConfirmModal';

const FRECUENCIAS = ['Diaria', 'Semanal', 'Quincenal', 'Mensual', 'Trimestral', 'Anual'];

const TransaccionesRecurrentes = () => {
    const { plantillas, crearPlantilla, togglePlantilla, eliminarPlantilla, marcarEjecucion } = useRecurrentes();
    const { registrarAsiento } = useContabilidad();
    const { cuentas } = useCuentas();

    const [showModal, setShowModal] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState({ open: false, id: null });
    const [nombre, setNombre] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [frecuencia, setFrecuencia] = useState('Mensual');
    const [lineas, setLineas] = useState([
        { cuentaId: '', debe: '', haber: '' },
        { cuentaId: '', debe: '', haber: '' }
    ]);

    const cuentasDetalle = cuentas.filter(c => c.subtipo === 'Cuenta Detalle');

    const updateLinea = (idx, field, val) => {
        setLineas(prev => prev.map((l, i) => i === idx ? { ...l, [field]: val } : l));
    };

    const addLinea = () => setLineas(prev => [...prev, { cuentaId: '', debe: '', haber: '' }]);

    const handleEjecutar = (plantilla) => {
        const movimientos = plantilla.lineas.map(l => ({
            cuentaId: l.cuentaId,
            debito: parseFloat(l.debe) || 0,
            credito: parseFloat(l.haber) || 0
        }));
        try {
            registrarAsiento(
                `Recurrente: ${plantilla.nombre}`,
                movimientos,
                new Date().toISOString(),
                'Recurrente',
                plantilla.id
            );
            marcarEjecucion(plantilla.id);
            alert(`✅ "${plantilla.nombre}" ejecutada correctamente.`);
        } catch (e) {
            alert('Error al ejecutar: ' + e.message);
        }
    };

    const handleCrear = (e) => {
        e.preventDefault();
        crearPlantilla({ nombre, descripcion, frecuencia, lineas });
        setShowModal(false);
        setNombre(''); setDescripcion(''); setFrecuencia('Mensual');
        setLineas([{ cuentaId: '', debe: '', haber: '' }, { cuentaId: '', debe: '', haber: '' }]);
    };

    const formatMoney = (amount) =>
        new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP' }).format(amount || 0);

    return (
        <div className="animate-up">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 className="page-title" style={{ marginBottom: '0.25rem' }}>Transacciones Recurrentes</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Configura asientos que se repiten periódicamente (alquiler, seguros, depreciación, etc.).</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                    <Plus size={18} /> Nueva Plantilla
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.5rem' }}>
                {plantillas.length === 0 ? (
                    <div className="card" style={{ gridColumn: '1/-1', padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                        No hay plantillas configuradas. Crea una para automatizar tus asientos periódicos.
                    </div>
                ) : (
                    plantillas.map(p => (
                        <div key={p.id} className="card" style={{ padding: '1.5rem', opacity: p.activa ? 1 : 0.6 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                <div>
                                    <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>{p.nombre}</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{p.descripcion}</div>
                                </div>
                                <span style={{
                                    padding: '0.25rem 0.75rem', borderRadius: '1rem', fontSize: '0.7rem', fontWeight: 700,
                                    background: 'var(--primary-light)', color: 'var(--primary)'
                                }}>{p.frecuencia}</span>
                            </div>

                            <div style={{ marginBottom: '1rem', borderTop: '1px solid var(--border)', paddingTop: '0.75rem' }}>
                                {p.lineas.map((l, idx) => {
                                    const cuenta = cuentas.find(c => c.id === l.cuentaId);
                                    return (
                                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', padding: '0.2rem 0' }}>
                                            <span>{cuenta?.nombre || l.cuentaId}</span>
                                            <span>{parseFloat(l.debe) > 0 ? `Dr. ${formatMoney(l.debe)}` : `Cr. ${formatMoney(l.haber)}`}</span>
                                        </div>
                                    );
                                })}
                            </div>

                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                                Ejecutada {p.vecesEjecutada} vez/veces
                                {p.ultimaEjecucion && ` · Última: ${new Date(p.ultimaEjecucion).toLocaleDateString('es-DO')}`}
                            </div>

                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                <button className="btn btn-secondary" style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}
                                    onClick={() => togglePlantilla(p.id)}>
                                    {p.activa ? <><Pause size={14} /> Pausar</> : <><Play size={14} /> Reanudar</>}
                                </button>
                                <button className="btn btn-primary" style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}
                                    onClick={() => handleEjecutar(p)} disabled={!p.activa}>
                                    <Zap size={14} /> Ejecutar Ahora
                                </button>
                                <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)' }}
                                    onClick={() => setConfirmDelete({ open: true, id: p.id })}>
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {showModal && (
                <div className="modal-overlay">
                    <div className="card" style={{ width: '100%', maxWidth: '620px', padding: 0, maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
                            <h2 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Nueva Plantilla Recurrente</h2>
                            <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.5rem', color: 'var(--text-muted)' }}>×</button>
                        </div>
                        <form onSubmit={handleCrear} style={{ padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
                                <div className="input-group" style={{ marginBottom: 0 }}>
                                    <label className="input-label">Nombre de la Plantilla</label>
                                    <input className="input-field" value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Ej: Alquiler de oficina" required />
                                </div>
                                <div className="input-group" style={{ marginBottom: 0 }}>
                                    <label className="input-label">Frecuencia</label>
                                    <select className="input-field" value={frecuencia} onChange={e => setFrecuencia(e.target.value)}>
                                        {FRECUENCIAS.map(f => <option key={f}>{f}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="input-group" style={{ marginBottom: 0 }}>
                                <label className="input-label">Descripción (Referencia del Asiento)</label>
                                <input className="input-field" value={descripcion} onChange={e => setDescripcion(e.target.value)} placeholder="Pago mensual de alquiler..." />
                            </div>

                            <div>
                                <label className="input-label">Líneas del Asiento</label>
                                <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr 1fr', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                                    <span>Cuenta</span><span>Débito</span><span>Crédito</span>
                                </div>
                                {lineas.map((l, idx) => (
                                    <div key={idx} style={{ display: 'grid', gridTemplateColumns: '3fr 1fr 1fr', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                        <select className="input-field" style={{ marginBottom: 0 }} value={l.cuentaId} onChange={e => updateLinea(idx, 'cuentaId', e.target.value)} required>
                                            <option value="">-- Cuenta --</option>
                                            {cuentasDetalle.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                                        </select>
                                        <input className="input-field" style={{ marginBottom: 0 }} type="number" placeholder="0.00" value={l.debe} onChange={e => updateLinea(idx, 'debe', e.target.value)} />
                                        <input className="input-field" style={{ marginBottom: 0 }} type="number" placeholder="0.00" value={l.haber} onChange={e => updateLinea(idx, 'haber', e.target.value)} />
                                    </div>
                                ))}
                                <button type="button" className="btn btn-secondary" style={{ width: '100%', marginTop: '0.5rem', padding: '0.5rem' }} onClick={addLinea}>
                                    <Plus size={14} /> Agregar Línea
                                </button>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '0.5rem' }}>
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                                <button type="submit" className="btn btn-primary">Guardar Plantilla</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <ConfirmModal
                isOpen={confirmDelete.open}
                onClose={() => setConfirmDelete({ open: false, id: null })}
                onConfirm={() => { eliminarPlantilla(confirmDelete.id); setConfirmDelete({ open: false, id: null }); }}
                title="Eliminar Plantilla"
                message="¿Seguro que desea eliminar esta plantilla recurrente?"
            />
        </div>
    );
};

export default TransaccionesRecurrentes;
