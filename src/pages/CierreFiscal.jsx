import React, { useState } from 'react';
import { useCierre } from '../context/CierreContext';
import { useContabilidad } from '../context/ContabilidadContext';
import { Lock, AlertTriangle, CheckCircle, TrendingUp, TrendingDown, DollarSign, BookOpen, Archive } from 'lucide-react';
import ConfirmModal from '../components/ConfirmModal';

const CierreFiscal = () => {
    const { cierres, ejecutarCierreFiscal, saldosApertura, guardarSaldoApertura, aplicarSaldosApertura } = useCierre();
    const { asientos } = useContabilidad();

    const [año, setAño] = useState(new Date().getFullYear());
    const [confirmCierre, setConfirmCierre] = useState(false);
    const [resultado, setResultado] = useState(null);
    const [tab, setTab] = useState('cierre');

    const formatMoney = (amount) =>
        new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP' }).format(amount || 0);

    const handleEjecutar = () => {
        try {
            const res = ejecutarCierreFiscal(año);
            setResultado(res);
            setConfirmCierre(false);
        } catch (e) {
            alert('Error al ejecutar el cierre: ' + e.message);
            setConfirmCierre(false);
        }
    };

    return (
        <div className="animate-up">
            <div style={{ marginBottom: '2rem' }}>
                <h1 className="page-title" style={{ marginBottom: '0.25rem' }}>Cierre Fiscal y Apertura</h1>
                <p style={{ color: 'var(--text-muted)' }}>Ejecuta el cierre contable anual y registra los saldos iniciales de migración.</p>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '0', marginBottom: '2rem', background: 'var(--background)', borderRadius: 'var(--radius-md)', padding: '4px', width: 'fit-content', border: '1px solid var(--border)' }}>
                {[{ id: 'cierre', label: '🔒 Cierre de Ejercicio' }, { id: 'apertura', label: '📂 Saldos de Apertura' }, { id: 'historial', label: '📋 Historial' }].map(t => (
                    <button key={t.id} onClick={() => setTab(t.id)}
                        style={{
                            padding: '0.625rem 1.25rem', borderRadius: 'var(--radius-sm)', border: 'none', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600, transition: 'all 0.2s',
                            background: tab === t.id ? 'var(--primary)' : 'transparent',
                            color: tab === t.id ? 'white' : 'var(--text-muted)'
                        }}>{t.label}</button>
                ))}
            </div>

            {/* === TAB: CIERRE === */}
            {tab === 'cierre' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                    <div>
                        <div className="card" style={{ padding: '2rem', borderLeft: '4px solid var(--warning)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                                <AlertTriangle size={24} color="var(--warning)" />
                                <h2 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Ejecutar Cierre de Ejercicio</h2>
                            </div>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.5rem', lineHeight: 1.7 }}>
                                Este proceso <strong>salda todas las cuentas de Ingresos y Gastos</strong> (cuentas 4x, 5x, 6x), transfiere la
                                utilidad/pérdida neta a la cuenta de Resultados del Ejercicio (patrimonio), y deja los libros listos para el nuevo año fiscal.
                            </p>

                            <div className="input-group">
                                <label className="input-label">Año Fiscal a Cerrar</label>
                                <input type="number" className="input-field" value={año} onChange={e => setAño(e.target.value)} min="2000" max="2099" />
                            </div>

                            <div style={{ padding: '1rem', background: 'rgba(239,68,68,0.08)', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', fontSize: '0.8125rem', color: 'var(--danger)' }}>
                                ⚠️ <strong>Esta acción no se puede deshacer.</strong> Asegúrate de tener un respaldo y de que todos los asientos del año estén registrados antes de continuar.
                            </div>

                            <button className="btn btn-primary" style={{ width: '100%', background: 'linear-gradient(135deg, #dc2626, #b91c1c)' }}
                                onClick={() => setConfirmCierre(true)}>
                                <Lock size={18} /> Ejecutar Cierre Fiscal {año}
                            </button>
                        </div>

                        {resultado && (
                            <div className="card" style={{ padding: '2rem', marginTop: '1.5rem', borderLeft: '4px solid var(--success)', background: 'rgba(16,185,129,0.05)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                                    <CheckCircle size={24} color="var(--success)" />
                                    <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--success)' }}>¡Cierre Ejecutado con Éxito!</h2>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Total Ingresos</span>
                                        <span style={{ fontWeight: 700, color: 'var(--success)' }}>{formatMoney(resultado.ingresos)}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Total Gastos</span>
                                        <span style={{ fontWeight: 700, color: 'var(--danger)' }}>{formatMoney(resultado.gastos)}</span>
                                    </div>
                                    <div style={{ borderTop: '2px solid var(--border)', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ fontWeight: 700 }}>Utilidad / Pérdida Neta</span>
                                        <span style={{ fontSize: '1.25rem', fontWeight: 800, color: resultado.utilidad >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                                            {resultado.utilidad >= 0 ? <TrendingUp size={16} style={{ display: 'inline', marginRight: 4 }} /> : <TrendingDown size={16} style={{ display: 'inline', marginRight: 4 }} />}
                                            {formatMoney(resultado.utilidad)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="card" style={{ padding: '2rem' }}>
                        <h2 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1rem' }}>¿Cómo funciona el cierre?</h2>
                        {[
                            { step: '1', title: 'Calcular Resultado', desc: 'El sistema suma todos los ingresos (4xxx) y resta todos los gastos (5xxx, 6xxx) del año.' },
                            { step: '2', title: 'Generar Asiento de Cierre', desc: 'Se crea un asiento que lleva a cero todas las cuentas de resultado (Débito en Ingresos, Crédito en Gastos).' },
                            { step: '3', title: 'Transferir al Patrimonio', desc: 'La utilidad neta se acredita a "Resultados del Ejercicio" (cuenta 3102). Una pérdida se debita.' },
                            { step: '4', title: 'Nuevo Ejercicio Limpio', desc: 'Las cuentas nominales quedan en cero, listas para el año siguiente.' }
                        ].map(s => (
                            <div key={s.step} style={{ display: 'flex', gap: '1rem', marginBottom: '1.25rem' }}>
                                <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, flexShrink: 0, fontSize: '0.875rem' }}>{s.step}</div>
                                <div>
                                    <div style={{ fontWeight: 700, marginBottom: '0.2rem' }}>{s.title}</div>
                                    <div style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', lineHeight: 1.6 }}>{s.desc}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* === TAB: APERTURA === */}
            {tab === 'apertura' && (
                <div className="card" style={{ padding: '2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <div>
                            <h2 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Saldos Iniciales de Apertura</h2>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                                Ingresa los saldos de tu empresa antes de empezar a usar Iubel ERP. Solo debes hacerlo una vez.
                            </p>
                        </div>
                        <button className="btn btn-primary" onClick={aplicarSaldosApertura}>
                            <BookOpen size={18} /> Aplicar como Asiento Inicial
                        </button>
                    </div>

                    <div style={{ display: 'grid', gap: '0.75rem' }}>
                        {[
                            { id: '110101', nombre: 'Caja', tipo: 'deudor' },
                            { id: '110102', nombre: 'Banco (Cuenta Corriente)', tipo: 'deudor' },
                            { id: '110301', nombre: 'Cuentas por Cobrar', tipo: 'deudor' },
                            { id: '110401', nombre: 'Inventario', tipo: 'deudor' },
                            { id: '120101', nombre: 'Activos Fijos', tipo: 'deudor' },
                            { id: '210101', nombre: 'Cuentas por Pagar', tipo: 'acreedor' },
                            { id: '210201', nombre: 'Préstamos por Pagar', tipo: 'acreedor' },
                            { id: '310101', nombre: 'Capital Social', tipo: 'acreedor' },
                            { id: '310201', nombre: 'Resultados Acumulados', tipo: 'acreedor' },
                        ].map(cuenta => {
                            const saldo = saldosApertura.find(s => s.cuentaId === cuenta.id);
                            return (
                                <div key={cuenta.id} style={{ display: 'grid', gridTemplateColumns: '1fr 200px', gap: '1rem', alignItems: 'center', padding: '0.75rem 1rem', background: 'var(--background)', borderRadius: 'var(--radius-md)' }}>
                                    <div>
                                        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{cuenta.nombre}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{cuenta.id} • {cuenta.tipo === 'deudor' ? '⬆ Activo / Deudor' : '⬇ Pasivo / Acreedor'}</div>
                                    </div>
                                    <input
                                        type="number"
                                        className="input-field"
                                        style={{ marginBottom: 0, textAlign: 'right' }}
                                        placeholder="0.00"
                                        value={saldo?.monto || ''}
                                        onChange={e => guardarSaldoApertura(cuenta.id, e.target.value, cuenta.tipo)}
                                    />
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* === TAB: HISTORIAL === */}
            {tab === 'historial' && (
                <div className="card">
                    {cierres.length === 0 ? (
                        <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                            <Archive size={48} style={{ marginBottom: '1rem', opacity: 0.4 }} />
                            <div>No se han ejecutado cierres fiscales aún.</div>
                        </div>
                    ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: 'var(--background)', fontSize: '0.8rem' }}>
                                    <th style={{ padding: '1rem', textAlign: 'left' }}>Año</th>
                                    <th style={{ padding: '1rem', textAlign: 'left' }}>Fecha de Cierre</th>
                                    <th style={{ padding: '1rem', textAlign: 'right' }}>Ingresos</th>
                                    <th style={{ padding: '1rem', textAlign: 'right' }}>Gastos</th>
                                    <th style={{ padding: '1rem', textAlign: 'right' }}>Utilidad/Pérdida</th>
                                </tr>
                            </thead>
                            <tbody>
                                {[...cierres].reverse().map(c => (
                                    <tr key={c.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                        <td style={{ padding: '1rem', fontWeight: 700 }}>{c.año}</td>
                                        <td style={{ padding: '1rem', fontSize: '0.875rem' }}>{new Date(c.fechaCierre).toLocaleDateString('es-DO')}</td>
                                        <td style={{ padding: '1rem', textAlign: 'right', color: 'var(--success)', fontWeight: 600 }}>{formatMoney(c.ingresos)}</td>
                                        <td style={{ padding: '1rem', textAlign: 'right', color: 'var(--danger)', fontWeight: 600 }}>{formatMoney(c.gastos)}</td>
                                        <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 800, color: c.utilidad >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                                            {formatMoney(c.utilidad)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}

            <ConfirmModal
                isOpen={confirmCierre}
                onClose={() => setConfirmCierre(false)}
                onConfirm={handleEjecutar}
                title={`⚠️ Confirmar Cierre Fiscal ${año}`}
                message={`¿Estás seguro de que deseas ejecutar el cierre del ejercicio fiscal ${año}? Esta acción es irreversible y generará el asiento de cierre automáticamente.`}
            />
        </div>
    );
};

export default CierreFiscal;
