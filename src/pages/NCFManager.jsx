import React, { useState } from 'react';
import { useNCF } from '../context/NCFContext';
import { ShieldCheck, Plus, Trash2, AlertTriangle, CheckCircle } from 'lucide-react';
import ConfirmModal from '../components/ConfirmModal';

const NCFManager = () => {
    const { rangos, agregarRango, eliminarRango } = useNCF();
    const [showModal, setShowModal] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState({ open: false, id: null });

    const [form, setForm] = useState({
        tipo: 'B01',
        inicio: '',
        fin: '',
        descripcion: ''
    });

    const tiposNCF = [
        { code: 'B01', label: 'Crédito Fiscal (B01)' },
        { code: 'B02', label: 'Consumo Final (B02)' },
        { code: 'B04', label: 'Nota de Crédito (B04)' },
        { code: 'B03', label: 'Nota de Débito (B03)' },
        { code: 'B11', label: 'Proveedor Informal (B11)' },
        { code: 'B12', label: 'Registro Único de Ingresos (B12)' },
        { code: 'B13', label: 'Gastos Menores (B13)' },
        { code: 'B14', label: 'Regímenes Especiales (B14)' },
        { code: 'B15', label: 'Gubernamental (B15)' },
    ];

    const handleSubmit = (e) => {
        e.preventDefault();
        agregarRango(form);
        setShowModal(false);
        setForm({ tipo: 'B01', inicio: '', fin: '', descripcion: '' });
    };

    const calculateProgress = (r) => {
        const total = Number(r.fin) - Number(r.inicio) + 1;
        const usado = Number(r.actual) - Number(r.inicio);
        return Math.min(100, Math.round((usado / total) * 100));
    };

    return (
        <>
            <div className="animate-up">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <div>
                        <h1 className="page-title" style={{ marginBottom: '0.25rem' }}>Gestión de Comprobantes (NCF)</h1>
                        <p style={{ color: 'var(--text-muted)' }}>Administra los rangos de NCF autorizados por la DGII para tu empresa.</p>
                    </div>
                    <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                        <Plus size={18} /> Nuevo Rango Autorizado
                    </button>
                </div>

                <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
                    {rangos.map(r => {
                        const progress = calculateProgress(r);
                        const isAgotado = Number(r.actual) > Number(r.fin);
                        const isCritico = progress >= 90;

                        return (
                            <div key={r.id} className="card glass" style={{ padding: '1.5rem', borderLeft: `4px solid ${isAgotado ? 'var(--danger)' : isCritico ? 'var(--warning)' : 'var(--success)'}` }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                                            <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)' }}>{tiposNCF.find(t => t.code === r.tipo)?.label || r.tipo}</span>
                                            {r.activo ? (
                                                <span style={{ fontSize: '0.7rem', padding: '0.1rem 0.5rem', background: 'rgba(34, 197, 94, 0.1)', color: 'var(--success)', borderRadius: '10px', fontWeight: 600 }}>ACTIVO</span>
                                            ) : (
                                                <span style={{ fontSize: '0.7rem', padding: '0.1rem 0.5rem', background: 'rgba(148, 163, 184, 0.1)', color: 'var(--text-muted)', borderRadius: '10px', fontWeight: 600 }}>INACTIVO</span>
                                            )}
                                        </div>
                                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{r.descripcion || 'Sin descripción'}</p>
                                    </div>
                                    <button className="btn-icon btn-hover-gray" onClick={() => setConfirmDelete({ open: true, id: r.id })} title="Eliminar Rango">
                                        <Trash2 size={16} color="var(--danger)" />
                                    </button>
                                </div>

                                <div style={{ marginBottom: '1rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.5rem' }}>
                                        <span style={{ color: 'var(--text-muted)' }}>Progreso: {progress}%</span>
                                        <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{r.actual} de {r.fin}</span>
                                    </div>
                                    <div className="progress-bg" style={{ height: '8px', borderRadius: '4px' }}>
                                        <div
                                            className={isAgotado ? 'progress-bar-danger' : isCritico ? 'progress-bar-warning' : 'progress-bar-vibrant'}
                                            style={{ width: `${progress}%`, height: '100%', borderRadius: '4px' }}
                                        />
                                    </div>
                                </div>

                                {isAgotado && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--danger)', fontSize: '0.8rem', marginTop: '0.5rem', padding: '0.5rem', background: 'rgba(239, 68, 68, 0.05)', borderRadius: '4px' }}>
                                        <AlertTriangle size={14} />
                                        <span>Rango agotado. Configure uno nuevo.</span>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {showModal && (
                <div className="modal-overlay">
                    <div className="card glass animate-up" style={{
                        width: '100%',
                        maxWidth: '650px',
                        padding: 0,
                        overflowY: 'auto',
                        border: '1px solid var(--glass-border)',
                        boxShadow: '0 40px 80px -20px rgba(0, 0, 0, 0.35)',
                        background: 'var(--white)',
                        zIndex: 2001
                    }}>
                        <div style={{
                            padding: '2.5rem',
                            borderBottom: '1px solid var(--border)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            background: 'linear-gradient(to right, rgba(255,255,255,0.8), rgba(255,255,255,0.4))'
                        }}>
                            <div>
                                <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>Registrar Rango DGII</h2>
                                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>Configuración de nueva secuencia autorizada con validez fiscal</p>
                            </div>
                            <button onClick={() => setShowModal(false)} style={{ color: 'var(--text-muted)', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', fontSize: '1.5rem' }} className="btn-hover-gray">×</button>
                        </div>
                        <form onSubmit={handleSubmit} style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1.5rem' }}>
                                <div className="input-group" style={{ marginBottom: 0 }}>
                                    <label className="input-label">Tipo de Comprobante</label>
                                    <select className="input-field" value={form.tipo} onChange={e => setForm({ ...form, tipo: e.target.value })} required style={{ fontWeight: 600, height: '3.5rem' }}>
                                        {tiposNCF.map(t => <option key={t.code} value={t.code}>{t.label}</option>)}
                                    </select>
                                </div>
                                <div className="input-group" style={{ marginBottom: 0 }}>
                                    <label className="input-label">Descripción / Referencia</label>
                                    <input type="text" className="input-field" value={form.descripcion} onChange={e => setForm({ ...form, descripcion: e.target.value })} placeholder="Ej: DGII 2024" style={{ height: '3.5rem' }} />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                <div className="input-group" style={{ marginBottom: 0 }}>
                                    <label className="input-label">Secuencia Inicial</label>
                                    <input type="number" className="input-field" value={form.inicio} onChange={e => setForm({ ...form, inicio: e.target.value })} placeholder="Ej: 1" required style={{ height: '3.5rem' }} />
                                </div>
                                <div className="input-group" style={{ marginBottom: 0 }}>
                                    <label className="input-label">Secuencia Final</label>
                                    <input type="number" className="input-field" value={form.fin} onChange={e => setForm({ ...form, fin: e.target.value })} placeholder="Ej: 1000" required style={{ height: '3.5rem' }} />
                                </div>
                            </div>

                            <div style={{ padding: '1.5rem', background: 'rgba(37, 99, 235, 0.08)', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(37, 99, 235, 0.15)', fontSize: '0.95rem', color: 'var(--primary)', lineHeight: 1.7, display: 'flex', gap: '1rem' }}>
                                <ShieldCheck size={24} style={{ flexShrink: 0, marginTop: '2px', color: 'var(--primary)' }} />
                                <span>Al registrar este nuevo rango, cualquier rango anterior del mismo tipo será marcado como <strong>inactivo</strong>. Las nuevas facturas seguirán la secuencia aquí definida.</span>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1.25rem', marginTop: '0.5rem' }}>
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)} style={{ minWidth: '140px', height: '3.5rem' }}>Cancelar</button>
                                <button type="submit" className="btn btn-primary" style={{ minWidth: '200px', height: '3.5rem', fontSize: '1rem' }}>Sincronizar Rango</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <ConfirmModal
                isOpen={confirmDelete.open}
                onClose={() => setConfirmDelete({ open: false, id: null })}
                onConfirm={() => { eliminarRango(confirmDelete.id); setConfirmDelete({ open: false, id: null }); }}
                title="Eliminar Rango de NCF"
                message="¿Estás seguro de que deseas eliminar este registro de rango? Esto no afectará las facturas ya emitidas."
            />
        </>
    );
};

export default NCFManager;
