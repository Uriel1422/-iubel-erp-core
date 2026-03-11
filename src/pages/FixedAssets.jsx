import React, { useState } from 'react';
import { useFixedAssets } from '../context/FixedAssetsContext';
import { useCuentas } from '../context/CuentasContext';
import { HardDrive, Plus, Calculator, History, Trash2, DollarSign } from 'lucide-react';
import ConfirmModal from '../components/ConfirmModal';

const FixedAssets = () => {
    const { activos, agregarActivo, procesarDepreciacionMensual, eliminarActivo } = useFixedAssets();
    const { cuentas } = useCuentas();
    const [confirmDelete, setConfirmDelete] = useState({ open: false, id: null, name: '' });

    const handleDeleteActivo = (id) => {
        const activo = activos.find(a => a.id === id);
        setConfirmDelete({ open: true, id, name: activo?.nombre });
    };

    const confirmDeleteAction = () => {
        if (confirmDelete.id) {
            eliminarActivo(confirmDelete.id);
            setConfirmDelete({ open: false, id: null });
        }
    };

    const [showModal, setShowModal] = useState(false);
    const [nuevoActivo, setNuevoActivo] = useState({
        nombre: '',
        tipo: 'Mobiliario',
        valor: 0,
        fechaCompra: new Date().toISOString().split('T')[0],
        vidaUtil: 5, // Años
        valorRescate: 0,
        cuentaActivoId: '1201', // Activos Fijos
        cuentaDepreciacionAcumuladaId: '120101',
        cuentaGastoDepreciacionId: '6101'
    });

    const formatMoney = (amount) => {
        return new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP' }).format(amount);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        agregarActivo({
            ...nuevoActivo,
            valor: Number(nuevoActivo.valor),
            vidaUtil: Number(nuevoActivo.vidaUtil),
            valorRescate: Number(nuevoActivo.valorRescate),
            depreciacionAcumulada: 0
        });
        setShowModal(false);
        setNuevoActivo({
            nombre: '',
            tipo: 'Mobiliario',
            valor: 0,
            fechaCompra: new Date().toISOString().split('T')[0],
            vidaUtil: 5,
            valorRescate: 0,
            cuentaActivoId: '1201',
            cuentaDepreciacionAcumuladaId: '120101',
            cuentaGastoDepreciacionId: '6101'
        });
    };

    return (
        <div className="animate-up">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 className="page-title" style={{ marginBottom: '0.25rem' }}>Gestión de Activos Fijos</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Control de bienes, vida útil y depreciación automática.</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button className="btn btn-secondary" onClick={() => procesarDepreciacionMensual(new Date().toLocaleString('default', { month: 'long', year: 'numeric' }))}>
                        <Calculator size={18} /> Procesar Depreciación
                    </button>
                    <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                        <Plus size={18} /> Nuevo Activo
                    </button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                <div className="card glass" style={{ textAlign: 'center', padding: '2rem' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Valor Total en Libros</div>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--primary)' }}>
                        {formatMoney(activos.reduce((acc, a) => acc + a.valor, 0))}
                    </div>
                </div>
                <div className="card glass" style={{ textAlign: 'center', padding: '2rem' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Depreciación Acumulada</div>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--danger)' }}>
                        {formatMoney(activos.reduce((acc, a) => acc + (a.depreciacionAcumulada || 0), 0))}
                    </div>
                </div>
                <div className="card glass" style={{ textAlign: 'center', padding: '2rem' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Valor Residual Neto</div>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--success)' }}>
                        {formatMoney(activos.reduce((acc, a) => acc + (a.residual || a.valor), 0))}
                    </div>
                </div>
            </div>

            <div className="card">
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--border)' }}>
                                <th style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Nombre / Tipo</th>
                                <th style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Compra</th>
                                <th style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', textAlign: 'right' }}>Valor Orig.</th>
                                <th style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', textAlign: 'right' }}>Dep. Acum.</th>
                                <th style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', textAlign: 'right' }}>V. Residual</th>
                                <th style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', textAlign: 'center' }}>V. Útil</th>
                                <th style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', textAlign: 'center' }}>X</th>
                            </tr>
                        </thead>
                        <tbody>
                            {activos.map(activo => (
                                <tr key={activo.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ fontWeight: 600 }}>{activo.nombre}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{activo.tipo}</div>
                                    </td>
                                    <td style={{ padding: '1rem', fontSize: '0.875rem' }}>{activo.fechaCompra}</td>
                                    <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 500 }}>{formatMoney(activo.valor)}</td>
                                    <td style={{ padding: '1rem', textAlign: 'right', color: 'var(--danger)' }}>{formatMoney(activo.depreciacionAcumulada || 0)}</td>
                                    <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 600, color: 'var(--success)' }}>{formatMoney(activo.residual || activo.valor)}</td>
                                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                                        <span className="badge badge-info">{activo.vidaUtil} años</span>
                                    </td>
                                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                                        <button
                                            className="btn"
                                            style={{ padding: '0.25rem', color: 'var(--danger)' }}
                                            onClick={() => handleDeleteActivo(activo.id)}
                                            title="Eliminar Activo"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {activos.length === 0 && (
                                <tr>
                                    <td colSpan="7" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                        No hay activos registrados. Registre su primer bien para comenzar el control.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal de Nuevo Activo */}
            {showModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
                    <div className="card" style={{ width: '100%', maxWidth: '500px', padding: '2rem' }}>
                        <h2 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>Registrar Nuevo Activo Fijo</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="input-group">
                                <label className="input-label">Nombre del Activo</label>
                                <input type="text" className="input-field" required value={nuevoActivo.nombre} onChange={e => setNuevoActivo({ ...nuevoActivo, nombre: e.target.value })} placeholder="Ej: Laptop Dell XPS 15" />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="input-group">
                                    <label className="input-label">Tipo</label>
                                    <select className="input-field" value={nuevoActivo.tipo} onChange={e => setNuevoActivo({ ...nuevoActivo, tipo: e.target.value })}>
                                        <option value="Mobiliario">Mobiliario y Equipo de Oficina</option>
                                        <option value="Maquinaria">Maquinaria y Equipos</option>
                                        <option value="Vehiculos">Vehículos</option>
                                        <option value="Edificaciones">Edificaciones</option>
                                        <option value="Tecnologia">Equipo de Cómputo</option>
                                    </select>
                                </div>
                                <div className="input-group">
                                    <label className="input-label">Valor de Compra</label>
                                    <input type="number" className="input-field" required value={nuevoActivo.valor} onChange={e => setNuevoActivo({ ...nuevoActivo, valor: e.target.value })} />
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="input-group">
                                    <label className="input-label">Fecha Compra</label>
                                    <input type="date" className="input-field" required value={nuevoActivo.fechaCompra} onChange={e => setNuevoActivo({ ...nuevoActivo, fechaCompra: e.target.value })} />
                                </div>
                                <div className="input-group">
                                    <label className="input-label">Vida Útil (Años)</label>
                                    <input type="number" className="input-field" required value={nuevoActivo.vidaUtil} onChange={e => setNuevoActivo({ ...nuevoActivo, vidaUtil: e.target.value })} />
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Cancelar</button>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Guardar Activo</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            <ConfirmModal
                isOpen={confirmDelete.open}
                onClose={() => setConfirmDelete({ ...confirmDelete, open: false })}
                onConfirm={confirmDeleteAction}
                title="Eliminar Activo Fijo"
                message={`¿Está completamente seguro de que desea eliminar '${confirmDelete.name}'? ⚠️ Esto eliminará el registro histórico y detendrá su depreciación.`}
            />
        </div>
    );
};

export default FixedAssets;
