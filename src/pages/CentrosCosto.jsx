import React, { useState } from 'react';
import { useCentrosCosto } from '../context/CentrosCostoContext';
import { useContabilidad } from '../context/ContabilidadContext';
import { useCuentas } from '../context/CuentasContext';
import { Plus, Trash2, BarChart2, Target } from 'lucide-react';
import ConfirmModal from '../components/ConfirmModal';

const PALETTE = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316', '#ec4899'];

const CentrosCosto = () => {
    const { centros, crearCentro, toggleCentro, eliminarCentro } = useCentrosCosto();
    const { asientos } = useContabilidad();
    const { cuentas } = useCuentas();

    const [showModal, setShowModal] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState({ open: false, id: null });
    const [form, setForm] = useState({ codigo: '', nombre: '', color: PALETTE[0] });
    const [centroSeleccionado, setCentroSeleccionado] = useState(null);

    const formatMoney = (amount) =>
        new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP' }).format(amount || 0);

    // Calcular gasto/ingreso por centro
    const calcularPorCentro = (centroId) => {
        let ingresos = 0, gastos = 0;
        asientos.forEach(a => {
            if (a.centroCostoId !== centroId) return;
            (a.detalles || []).forEach(m => {
                const cuentaId = m.cuentaId;
                if (cuentaId?.startsWith('4')) ingresos += (Number(m.credito) || 0);
                if (cuentaId?.startsWith('5') || cuentaId?.startsWith('6')) gastos += (Number(m.debito) || 0);
            });
        });
        return { ingresos, gastos, neto: ingresos - gastos };
    };

    const handleCrear = (e) => {
        e.preventDefault();
        crearCentro(form);
        setShowModal(false);
        setForm({ codigo: '', nombre: '', color: PALETTE[0] });
    };

    return (
        <div className="animate-up">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 className="page-title" style={{ marginBottom: '0.25rem' }}>Centros de Costo</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Analiza la rentabilidad por departamento, área o proyecto.</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                    <Plus size={18} /> Nuevo Centro
                </button>
            </div>

            {/* Cards de Centros */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                {centros.map(centro => {
                    const stats = calcularPorCentro(centro.id);
                    return (
                        <div key={centro.id} className="card" style={{ padding: '1.75rem', borderTop: `4px solid ${centro.color}`, opacity: centro.activo ? 1 : 0.55, cursor: 'pointer', transition: 'all 0.2s' }}
                            onClick={() => setCentroSeleccionado(centro.id === centroSeleccionado ? null : centro.id)}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
                                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                    <div style={{ width: 40, height: 40, borderRadius: 10, background: centro.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: '0.875rem' }}>
                                        {centro.codigo.slice(0, 2)}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>{centro.nombre}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{centro.codigo}</div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '0.35rem' }}>
                                    <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: centro.activo ? 'var(--success)' : 'var(--text-muted)', padding: '4px' }}
                                        onClick={(e) => { e.stopPropagation(); toggleCentro(centro.id); }} title={centro.activo ? 'Pausar' : 'Activar'}>
                                        <Target size={16} />
                                    </button>
                                    <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)', padding: '4px' }}
                                        onClick={(e) => { e.stopPropagation(); setConfirmDelete({ open: true, id: centro.id }); }}>
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                <div style={{ padding: '0.6rem', background: 'rgba(16,185,129,0.08)', borderRadius: '8px' }}>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '0.15rem' }}>INGRESOS</div>
                                    <div style={{ fontWeight: 700, color: 'var(--success)', fontSize: '0.9rem' }}>{formatMoney(stats.ingresos)}</div>
                                </div>
                                <div style={{ padding: '0.6rem', background: 'rgba(239,68,68,0.08)', borderRadius: '8px' }}>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '0.15rem' }}>GASTOS</div>
                                    <div style={{ fontWeight: 700, color: 'var(--danger)', fontSize: '0.9rem' }}>{formatMoney(stats.gastos)}</div>
                                </div>
                            </div>

                            <div style={{ marginTop: '0.75rem', padding: '0.6rem 1rem', background: 'var(--background)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>RESULTADO</span>
                                <span style={{ fontWeight: 800, color: stats.neto >= 0 ? 'var(--success)' : 'var(--danger)' }}>{formatMoney(stats.neto)}</span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Nota informativa */}
            <div style={{ padding: '1.25rem 1.5rem', background: 'var(--primary-light)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(37,99,235,0.15)', fontSize: '0.875rem', color: 'var(--primary)' }}>
                <strong>💡 ¿Cómo asignar asientos a un centro de costo?</strong> Al registrar entradas de diario manualmente, selecciona el Centro de Costo correspondiente. En futuras actualizaciones, facturas y compras también podrán asignarse a un centro.
            </div>

            {/* Modal Nuevo Centro */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="card" style={{ width: '100%', maxWidth: '450px', padding: 0 }}>
                        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
                            <h2 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Nuevo Centro de Costo</h2>
                            <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.5rem', color: 'var(--text-muted)' }}>×</button>
                        </div>
                        <form onSubmit={handleCrear} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="input-group" style={{ marginBottom: 0 }}>
                                    <label className="input-label">Código</label>
                                    <input className="input-field" style={{ textTransform: 'uppercase' }} value={form.codigo} onChange={e => setForm(p => ({ ...p, codigo: e.target.value.toUpperCase() }))} placeholder="MKTG" required maxLength={6} />
                                </div>
                                <div className="input-group" style={{ marginBottom: 0 }}>
                                    <label className="input-label">Nombre</label>
                                    <input className="input-field" value={form.nombre} onChange={e => setForm(p => ({ ...p, nombre: e.target.value }))} placeholder="Marketing" required />
                                </div>
                            </div>
                            <div className="input-group" style={{ marginBottom: 0 }}>
                                <label className="input-label">Color Identificador</label>
                                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
                                    {PALETTE.map(color => (
                                        <div key={color} onClick={() => setForm(p => ({ ...p, color }))} style={{
                                            width: 32, height: 32, borderRadius: '50%', background: color, cursor: 'pointer',
                                            border: form.color === color ? '3px solid var(--primary)' : '3px solid transparent',
                                            outline: form.color === color ? '2px solid white' : 'none',
                                            transition: 'all 0.15s', transform: form.color === color ? 'scale(1.2)' : 'scale(1)'
                                        }} />
                                    ))}
                                </div>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '0.5rem' }}>
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                                <button type="submit" className="btn btn-primary">Crear Centro</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <ConfirmModal
                isOpen={confirmDelete.open}
                onClose={() => setConfirmDelete({ open: false, id: null })}
                onConfirm={() => { eliminarCentro(confirmDelete.id); setConfirmDelete({ open: false, id: null }); }}
                title="Eliminar Centro de Costo"
                message="¿Estás seguro de eliminar este centro? Los asientos ya asignados conservarán su referencia."
            />
        </div>
    );
};

export default CentrosCosto;
