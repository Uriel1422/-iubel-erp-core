import React, { useState } from 'react';
import { useNotas } from '../context/NotasContext';
import { useContactos } from '../context/ContactosContext';
import { useCuentas } from '../context/CuentasContext';
import { useFacturacion } from '../context/FacturacionContext';
import { FileX, FilePlus, Trash2, Plus } from 'lucide-react';
import ConfirmModal from '../components/ConfirmModal';

const NotasCreditoDebito = () => {
    const { notas, registrarNota, eliminarNota } = useNotas();
    const { contactos } = useContactos();
    const { cuentas } = useCuentas();
    const { facturas } = useFacturacion();

    const [showModal, setShowModal] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState({ open: false, id: null });
    const [tipoNota, setTipoNota] = useState('credito');
    const [filtro, setFiltro] = useState('todos');

    const [form, setForm] = useState({
        tipoNota: 'credito',
        contactoId: '',
        facturaRefId: '',
        ncf: '',
        descripcion: '',
        subtotal: '',
        itbis: '',
    });

    const contacts = contactos;
    const cuentasIngreso = cuentas.filter(c => c.codigo?.startsWith('4'));
    const cuentasGasto = cuentas.filter(c => c.codigo?.startsWith('5') || c.codigo?.startsWith('6'));
    const cuentasDeudor = cuentas.filter(c => c.codigo?.startsWith('11'));

    const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const handleRefInvoiceChange = (e) => {
        const invId = e.target.value;
        if (!invId) return;

        const inv = facturas.find(f => f.id === invId);
        if (!inv) return;

        // Intentar encontrar el contacto ID por RNC o Nombre
        const contacto = contacts.find(c => c.rnc === inv.clienteRnc || c.nombre === inv.clienteNombre);

        setForm(prev => ({
            ...prev,
            contactoId: contacto?.id || '',
            facturaRefId: inv.ncf || inv.numeroInterno,
            subtotal: inv.subtotal.toString(),
            itbis: inv.itbis.toString(),
            descripcion: `Devolución/Ajuste de Factura ${inv.ncf || inv.numeroInterno}`
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const contacto = contacts.find(c => c.id === form.contactoId);
        const subtotal = parseFloat(form.subtotal) || 0;
        const itbisVal = parseFloat(form.itbis) || 0;

        registrarNota({
            ...form,
            tipoNota: tipoNota,
            contactoNombre: contacto?.nombre || 'Sin contacto',
            subtotal,
            itbis: itbisVal,
            total: subtotal + itbisVal,
        });

        setShowModal(false);
        setForm({ tipoNota: 'credito', contactoId: '', facturaRefId: '', ncf: '', descripcion: '', subtotal: '', itbis: '' });
    };

    const formatMoney = (amount) =>
        new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP' }).format(amount || 0);

    const notasFiltradas = filtro === 'todos' ? notas : notas.filter(n => n.tipoNota === filtro);

    return (
        <div className="animate-up">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 className="page-title" style={{ marginBottom: '0.25rem' }}>Notas de Crédito y Débito</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Gestiona devoluciones de ventas y ajustes sobre facturas emitidas.</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button className="btn" style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--danger)' }}
                        onClick={() => { setTipoNota('debito'); setShowModal(true); }}>
                        <FilePlus size={18} /> Nueva Nota de Débito
                    </button>
                    <button className="btn btn-primary"
                        onClick={() => { setTipoNota('credito'); setShowModal(true); }}>
                        <FileX size={18} /> Nueva Nota de Crédito
                    </button>
                </div>
            </div>

            {/* Filtros */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
                {['todos', 'credito', 'debito'].map(f => (
                    <button key={f} className="btn btn-secondary"
                        style={{ background: filtro === f ? 'var(--primary)' : undefined, color: filtro === f ? 'white' : undefined, padding: '0.5rem 1.25rem' }}
                        onClick={() => setFiltro(f)}>
                        {f === 'todos' ? 'Todas' : f === 'credito' ? 'Notas de Crédito' : 'Notas de Débito'}
                    </button>
                ))}
            </div>

            <div className="card">
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: 'var(--background)', fontSize: '0.8rem' }}>
                                <th style={{ padding: '1rem', textAlign: 'left' }}>Número</th>
                                <th style={{ padding: '1rem', textAlign: 'left' }}>Fecha</th>
                                <th style={{ padding: '1rem', textAlign: 'left' }}>Tipo</th>
                                <th style={{ padding: '1rem', textAlign: 'left' }}>Contacto</th>
                                <th style={{ padding: '1rem', textAlign: 'left' }}>Descripción</th>
                                <th style={{ padding: '1rem', textAlign: 'right' }}>Subtotal</th>
                                <th style={{ padding: '1rem', textAlign: 'right' }}>ITBIS</th>
                                <th style={{ padding: '1rem', textAlign: 'right' }}>Total</th>
                                <th style={{ padding: '1rem' }}></th>
                            </tr>
                        </thead>
                        <tbody>
                            {notasFiltradas.length === 0 ? (
                                <tr><td colSpan={9} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>No hay notas registradas.</td></tr>
                            ) : (
                                [...notasFiltradas].reverse().map(n => (
                                    <tr key={n.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                        <td style={{ padding: '1rem', fontWeight: 700 }}>{n.numeroInterno}</td>
                                        <td style={{ padding: '1rem', fontSize: '0.875rem' }}>{new Date(n.fechaRegistro).toLocaleDateString('es-DO')}</td>
                                        <td style={{ padding: '1rem' }}>
                                            <span style={{
                                                padding: '0.2rem 0.65rem', borderRadius: '1rem', fontSize: '0.75rem', fontWeight: 700,
                                                background: n.tipoNota === 'credito' ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)',
                                                color: n.tipoNota === 'credito' ? 'var(--success)' : 'var(--danger)'
                                            }}>
                                                {n.tipoNota === 'credito' ? 'Crédito' : 'Débito'}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1rem', fontSize: '0.875rem' }}>{n.contactoNombre}</td>
                                        <td style={{ padding: '1rem', fontSize: '0.875rem', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{n.descripcion}</td>
                                        <td style={{ padding: '1rem', textAlign: 'right' }}>{formatMoney(n.subtotal)}</td>
                                        <td style={{ padding: '1rem', textAlign: 'right' }}>{formatMoney(n.itbis)}</td>
                                        <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 700 }}>{formatMoney(n.total)}</td>
                                        <td style={{ padding: '1rem' }}>
                                            <button onClick={() => setConfirmDelete({ open: true, id: n.id })}
                                                style={{ color: 'var(--danger)', background: 'none', border: 'none', cursor: 'pointer' }}>
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

            {showModal && (
                <div className="modal-overlay">
                    <div className="card" style={{ width: '100%', maxWidth: '580px', padding: 0 }}>
                        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h2 style={{ fontSize: '1.125rem', fontWeight: 700 }}>
                                {tipoNota === 'credito' ? '📄 Nueva Nota de Crédito' : '📄 Nueva Nota de Débito'}
                            </h2>
                            <button onClick={() => setShowModal(false)} style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.5rem' }}>×</button>
                        </div>
                        <form onSubmit={handleSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div className="input-group" style={{ marginBottom: 0 }}>
                                <label className="input-label" style={{ color: 'var(--primary)', fontWeight: 600 }}>🔍 Buscar Factura Original (Opcional)</label>
                                <select className="input-field" onChange={handleRefInvoiceChange} style={{ border: '2px solid var(--primary-light)' }}>
                                    <option value="">-- Seleccionar factura para autocompletar --</option>
                                    {[...facturas].reverse().slice(0, 20).map(f => (
                                        <option key={f.id} value={f.id}>
                                            {f.ncf} | {f.clienteNombre} | {new Date(f.fecha || f.fechaEmision).toLocaleDateString()} | {formatMoney(f.total)}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="input-group" style={{ marginBottom: 0 }}>
                                <label className="input-label">Contacto</label>
                                <select name="contactoId" className="input-field" value={form.contactoId} onChange={handleChange} required>
                                    <option value="">-- Seleccionar --</option>
                                    {contacts.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                                </select>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="input-group" style={{ marginBottom: 0 }}>
                                    <label className="input-label">NCF de la Nota</label>
                                    <input name="ncf" className="input-field" value={form.ncf} onChange={handleChange} placeholder="Dejar vacío para auto-generar" />
                                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>* Se usará el siguiente número del rango activo.</span>
                                </div>
                                <div className="input-group" style={{ marginBottom: 0 }}>
                                    <label className="input-label">NCF Factura Original</label>
                                    <input name="facturaRefId" className="input-field" value={form.facturaRefId} onChange={handleChange} placeholder="B0100000001" />
                                </div>
                            </div>
                            <div className="input-group" style={{ marginBottom: 0 }}>
                                <label className="input-label">Descripción / Motivo</label>
                                <input name="descripcion" className="input-field" value={form.descripcion} onChange={handleChange} placeholder="Devolución de mercancía..." required />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="input-group" style={{ marginBottom: 0 }}>
                                    <label className="input-label">Subtotal</label>
                                    <input name="subtotal" type="number" className="input-field" value={form.subtotal} onChange={handleChange} placeholder="0.00" required />
                                </div>
                                <div className="input-group" style={{ marginBottom: 0 }}>
                                    <label className="input-label">ITBIS (18%)</label>
                                    <input name="itbis" type="number" className="input-field" value={form.itbis} onChange={handleChange} placeholder="0.00" />
                                </div>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', paddingTop: '0.5rem' }}>
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                                <button type="submit" className="btn btn-primary">Registrar {tipoNota === 'credito' ? 'Nota de Crédito' : 'Nota de Débito'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <ConfirmModal
                isOpen={confirmDelete.open}
                onClose={() => setConfirmDelete({ open: false, id: null })}
                onConfirm={() => { eliminarNota(confirmDelete.id); setConfirmDelete({ open: false, id: null }); }}
                title="Eliminar Nota"
                message="¿Seguro que desea eliminar esta nota? El asiento contable asociado no se revertirá automáticamente."
            />
        </div>
    );
};

export default NotasCreditoDebito;
