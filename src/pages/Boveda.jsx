import React, { useState } from 'react';
import { useBoveda } from '../context/BovedaContext';
import { Landmark, ArrowUpRight, ArrowDownLeft, ShieldCheck, History, DollarSign, Wallet } from 'lucide-react';

const Boveda = () => {
    const { balanceTotal, movimientos, registrarMovimiento } = useBoveda();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({ tipo: 'Entrada', monto: '', concepto: '' });

    const formatMoney = (amount) =>
        new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP' }).format(amount || 0);

    const handleSubmit = (e) => {
        e.preventDefault();
        registrarMovimiento(formData.tipo, formData.monto, formData.concepto);
        setIsModalOpen(false);
        setFormData({ tipo: 'Entrada', monto: '', concepto: '' });
    };

    return (
        <div className="animate-up">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 className="page-title" style={{ marginBottom: '0.5rem' }}>Control de Bóveda Central</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Custodia de valores, fondeo de cajas y reservas bancarias.</p>
                </div>
                <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
                    <ShieldCheck size={20} /> Registrar Movimiento
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '3rem' }}>
                <div className="card glass" style={{
                    padding: '2.5rem',
                    background: 'linear-gradient(135deg, var(--primary), #1e40af)',
                    color: 'white',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    border: 'none'
                }}>
                    <Landmark size={48} style={{ marginBottom: '1rem', opacity: 0.8 }} />
                    <div style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem', opacity: 0.9 }}>Saldo Total en Bóveda</div>
                    <div style={{ fontSize: '3rem', fontWeight: 900 }}>{formatMoney(balanceTotal)}</div>
                </div>

                <div style={{ display: 'grid', gridRowGap: '1rem' }}>
                    <div className="card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                        <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center' }}>
                            <ArrowDownLeft size={28} />
                        </div>
                        <div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Entradas Recientes</div>
                            <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>{formatMoney(movimientos.filter(m => m.tipo === 'Entrada').reduce((acc, m) => acc + m.monto, 0))}</div>
                        </div>
                    </div>
                    <div className="card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                        <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center' }}>
                            <ArrowUpRight size={28} />
                        </div>
                        <div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Salidas (Fondeos)</div>
                            <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>{formatMoney(movimientos.filter(m => m.tipo === 'Salida').reduce((acc, m) => acc + m.monto, 0))}</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="card">
                <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <History size={20} color="var(--primary)" />
                    <h2 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Historial de Movimientos de Bóveda</h2>
                </div>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ textAlign: 'left', background: 'var(--background)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                <th style={{ padding: '1rem' }}>Fecha y Hora</th>
                                <th style={{ padding: '1rem' }}>Tipo</th>
                                <th style={{ padding: '1rem' }}>Concepto</th>
                                <th style={{ padding: '1rem', textAlign: 'right' }}>Monto</th>
                            </tr>
                        </thead>
                        <tbody>
                            {movimientos.slice().reverse().map(m => (
                                <tr key={m.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                    <td style={{ padding: '1rem', fontSize: '0.875rem' }}>
                                        {new Date(m.fecha).toLocaleDateString()} {new Date(m.fecha).toLocaleTimeString()}
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <span style={{
                                            padding: '4px 10px',
                                            borderRadius: '20px',
                                            fontSize: '0.75rem',
                                            fontWeight: 700,
                                            background: m.tipo === 'Entrada' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                            color: m.tipo === 'Entrada' ? 'var(--success)' : 'var(--danger)'
                                        }}>
                                            {m.tipo}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem', fontSize: '0.875rem' }}>{m.concepto}</td>
                                    <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 800, color: m.tipo === 'Entrada' ? 'var(--success)' : 'var(--danger)' }}>
                                        {m.tipo === 'Entrada' ? '+' : '-'} {formatMoney(m.monto)}
                                    </td>
                                </tr>
                            ))}
                            {movimientos.length === 0 && (
                                <tr><td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No hay movimientos registrados.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="card" style={{ width: '100%', maxWidth: '400px', padding: '2rem' }}>
                        <h2 style={{ marginBottom: '1.5rem' }}>Ajuste de Bóveda</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="input-group">
                                <label className="input-label">Tipo de Operación</label>
                                <select className="input-field" value={formData.tipo} onChange={e => setFormData({ ...formData, tipo: e.target.value })}>
                                    <option value="Entrada">Entrada (Depósito Central)</option>
                                    <option value="Salida">Salida (Fondeo / Retiro)</option>
                                </select>
                            </div>
                            <div className="input-group">
                                <label className="input-label">Monto (DOP)</label>
                                <input className="input-field" type="number" required value={formData.monto} onChange={e => setFormData({ ...formData, monto: e.target.value })} placeholder="0.00" />
                            </div>
                            <div className="input-group">
                                <label className="input-label">Concepto</label>
                                <input className="input-field" required value={formData.concepto} onChange={e => setFormData({ ...formData, concepto: e.target.value })} placeholder="Ej: Fondeo de Caja 01" />
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setIsModalOpen(false)}>Cancelar</button>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Confirmar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Boveda;
