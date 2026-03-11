import React, { useState } from 'react';
import { useBancos } from '../context/BancosContext';
import { Landmark, ArrowUpCircle, ArrowDownCircle, AlertCircle, Info, CheckCircle2, Trash2 } from 'lucide-react';
import ConfirmModal from '../components/ConfirmModal';

const Bancos = () => {
    const { saldoLibros, saldoBancoReal, movimientosExtra, agregarMovimientoBanco, eliminarMovimientoBanco } = useBancos();
    const [monto, setMonto] = useState('');
    const [conciliado, setConciliado] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState({ open: false, id: null });

    const handleAjuste = (tipo) => {
        if (!monto || isNaN(monto)) return;
        agregarMovimientoBanco({
            descripcion: tipo === 'debito' ? 'Comisión Bancaria' : 'Intereses Ganados',
            monto: parseFloat(monto),
            tipo: tipo
        });
        setMonto('');
    };

    const handleDeleteMovimiento = (id) => {
        setConfirmDelete({ open: true, id });
    };

    const confirmDeleteAction = () => {
        if (confirmDelete.id) {
            eliminarMovimientoBanco(confirmDelete.id);
            setConfirmDelete({ open: false, id: null });
        }
    };

    const formatMoney = (amount) => {
        return new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP' }).format(amount);
    };

    return (
        <div className="animate-up">
            <div style={{ marginBottom: '2.5rem' }}>
                <h1 className="page-title" style={{ marginBottom: '0.5rem' }}>Conciliación Bancaria</h1>
                <p style={{ color: 'var(--text-muted)' }}>Compara el saldo en tus libros contables con el estado de cuenta bancario.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
                <div className="card glass" style={{ borderLeft: '4px solid var(--primary)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                        <div style={{ padding: '0.75rem', background: 'var(--primary-light)', color: 'var(--primary)', borderRadius: '12px' }}>
                            <Landmark size={24} />
                        </div>
                        <div>
                            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Saldo según Libros</div>
                            <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-main)' }}>{formatMoney(saldoLibros)}</div>
                        </div>
                    </div>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Este saldo se deriva automáticamente de tus entradas de diario y facturación.</p>
                </div>

                <div className="card glass" style={{ borderLeft: `4px solid ${saldoBancoReal === saldoLibros ? 'var(--success)' : 'var(--warning)'}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                        <div style={{ padding: '0.75rem', background: saldoBancoReal === saldoLibros ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)', color: saldoBancoReal === saldoLibros ? 'var(--success)' : 'var(--warning)', borderRadius: '12px' }}>
                            {saldoBancoReal === saldoLibros ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
                        </div>
                        <div>
                            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Saldo del Banco (Ajustado)</div>
                            <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-main)' }}>{formatMoney(saldoBancoReal)}</div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Diferencia: {formatMoney(saldoBancoReal - saldoLibros)}</span>
                        <button className="btn btn-secondary" onClick={() => setConciliado(true)} style={{ padding: '0.5rem 1rem', fontSize: '0.75rem' }}>
                            Marcar como Conciliado
                        </button>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                <div className="card">
                    <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Info size={20} color="var(--primary)" /> Registrar Ajuste Bancario
                    </h3>
                    <div className="input-group">
                        <label className="input-label">Monto del Movimiento</label>
                        <input
                            type="number"
                            className="input-field"
                            value={monto}
                            onChange={(e) => setMonto(e.target.value)}
                            placeholder="RD$ 0.00"
                        />
                    </div>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button className="btn btn-secondary" style={{ flex: 1, color: 'var(--danger)' }} onClick={() => handleAjuste('debito')}>
                            <ArrowDownCircle size={18} /> Comisión / Cargo
                        </button>
                        <button className="btn btn-secondary" style={{ flex: 1, color: 'var(--success)' }} onClick={() => handleAjuste('credito')}>
                            <ArrowUpCircle size={18} /> Interés / Crédito
                        </button>
                    </div>
                </div>

                <div className="card">
                    <h3 style={{ marginBottom: '1.5rem' }}>Últimos Ajustes de Banco</h3>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
                                    <th style={{ padding: '1rem', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Fecha</th>
                                    <th style={{ padding: '1rem', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Descripción</th>
                                    <th style={{ padding: '1rem', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', textAlign: 'right' }}>Monto</th>
                                    <th style={{ padding: '1rem', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', textAlign: 'center' }}>X</th>
                                </tr>
                            </thead>
                            <tbody>
                                {movimientosExtra.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No hay ajustes registrados.</td>
                                    </tr>
                                ) : (
                                    movimientosExtra.slice().reverse().map(mov => (
                                        <tr key={mov.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                            <td style={{ padding: '1rem', fontSize: '0.875rem' }}>{new Date(mov.fecha).toLocaleDateString()}</td>
                                            <td style={{ padding: '1rem', fontSize: '0.875rem' }}>{mov.descripcion}</td>
                                            <td style={{ padding: '1rem', fontSize: '0.875rem', textAlign: 'right', color: mov.tipo === 'debito' ? 'var(--danger)' : 'var(--success)' }}>
                                                {mov.tipo === 'debito' ? '-' : '+'}{formatMoney(mov.monto)}
                                            </td>
                                            <td style={{ padding: '1rem', textAlign: 'center' }}>
                                                <button
                                                    className="btn"
                                                    style={{ padding: '0.25rem', color: 'var(--danger)' }}
                                                    onClick={() => handleDeleteMovimiento(mov.id)}
                                                    title="Eliminar Ajuste"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            <ConfirmModal
                isOpen={confirmDelete.open}
                onClose={() => setConfirmDelete({ ...confirmDelete, open: false })}
                onConfirm={confirmDeleteAction}
                title="Eliminar Ajuste Bancario"
                message="¿Está seguro de que desea eliminar este ajuste? Esta acción modificará el saldo conciliado del banco."
            />
        </div>
    );
};

export default Bancos;
