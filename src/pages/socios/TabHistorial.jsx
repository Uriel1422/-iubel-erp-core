import React from 'react';
import { useAhorros } from '../../context/AhorrosContext';
import { usePrestamos } from '../../context/PrestamosContext';
import { useSocios } from '../../context/SociosContext';
import { ArrowUpRight, ArrowDownLeft, Receipt, CreditCard, Wallet } from 'lucide-react';

const TabHistorial = ({ socioId }) => {
    const { movimientos, cuentas } = useAhorros();
    const { prestamos } = usePrestamos();

    // Filtrar cuentas del socio
    const cuentasSocio = cuentas.filter(c => c.socioId === socioId);
    const cuentasIds = cuentasSocio.map(c => c.id);

    // Movimientos de ahorros
    const movimientosAhorros = movimientos.filter(m => cuentasIds.includes(m.cuentaId)).map(m => ({
        ...m,
        origen: 'Ahorros',
        clase: m.tipo === 'Deposito' ? 'entrada' : 'salida'
    }));

    // Préstamos del socio
    const prestamosSocio = prestamos.filter(p => p.socioId === socioId).map(p => ({
        id: p.id,
        fecha: p.fechaDesembolso,
        tipo: 'Desembolso Préstamo',
        monto: p.monto,
        nota: `Préstamo No. ${p.id.substring(0, 6)}`,
        origen: 'Préstamos',
        clase: 'entrada'
    }));

    // Unir y ordenar por fecha (descendente)
    const historial = [...movimientosAhorros, ...prestamosSocio].sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

    const formatCurrency = (val) => new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP' }).format(val);

    return (
        <div className="animate-fade-in">
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.5rem', color: 'var(--text-dark)' }}>Historial Transaccional del Socio</h3>

            {historial.length === 0 ? (
                <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    <Receipt size={48} style={{ marginBottom: '1rem', opacity: 0.3 }} />
                    <p>No se han registrado transacciones financieras para este socio.</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {historial.map(item => (
                        <div key={item.id} className="card" style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #f1f5f9' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '10px',
                                    background: item.clase === 'entrada' ? '#dcfce7' : '#fee2e2',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    {item.clase === 'entrada' ? <ArrowDownLeft size={20} color="#10b981" /> : <ArrowUpRight size={20} color="#ef4444" />}
                                </div>
                                <div>
                                    <p style={{ fontWeight: 600, fontSize: '0.95rem', margin: 0 }}>{item.tipo || item.tipoMovimiento}</p>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
                                        {new Date(item.fecha).toLocaleString()} • <span style={{ fontWeight: 600 }}>{item.origen}</span>
                                    </p>
                                </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <p style={{
                                    fontWeight: 700,
                                    fontSize: '1rem',
                                    margin: 0,
                                    color: item.clase === 'entrada' ? '#059669' : '#dc2626'
                                }}>
                                    {item.clase === 'entrada' ? '+' : '-'}{formatCurrency(item.monto)}
                                </p>
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>{item.nota}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default TabHistorial;
