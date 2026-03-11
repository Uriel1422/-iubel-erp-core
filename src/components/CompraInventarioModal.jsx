import React, { useState } from 'react';
import { X, Search } from 'lucide-react';
import { useInventario } from '../context/InventarioContext';
import { useContactos } from '../context/ContactosContext';
import { useContabilidad } from '../context/ContabilidadContext';

const CompraInventarioModal = ({ isOpen, onClose, articuloId }) => {
    const { articulos, ajustarStock } = useInventario();
    const { contactos } = useContactos();
    const { registrarAsiento } = useContabilidad();

    const articulo = articulos.find(a => a.id === articuloId);
    const proveedores = contactos.filter(c => c.tipo === 'Proveedor');

    const [formData, setFormData] = useState({
        proveedorId: '',
        ncf: '',
        fecha: new Date().toISOString().split('T')[0],
        vencimiento: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString().split('T')[0],
        cantidad: 1,
        costoUnitario: 0,
        condicion: 'Contado'
    });

    if (!isOpen || !articulo) return null;

    const itbisAplicable = articulo.gravado ? 0.18 : 0;
    const subtotal = Number(formData.cantidad) * Number(formData.costoUnitario);
    const itbisCalculado = subtotal * itbisAplicable;
    const totalFactura = subtotal + itbisCalculado;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // 1. Ajustar Inventario Físico
        ajustarStock(articulo.id, formData.cantidad, 'ENTRADA');

        // Lógica de Asiento Contable
        const proveedor = proveedores.find(p => p.id === formData.proveedorId);
        const proveedorNombre = proveedor ? proveedor.nombre : 'Proveedor Genérico';

        const cuentaPasivoBanco = formData.condicion === 'Contado' ? '110101' : '210101'; // Caja General vs Cuentas por Pagar Proveedores

        const detallesAsiento = [
            // Débito al Inventario
            {
                cuentaId: articulo.cuentaInventarioId || '110401',
                descripcion: `Entrada de inventario: ${articulo.nombre} (${formData.cantidad} unds)`,
                debito: subtotal,
                credito: 0
            }
        ];

        // Débito a ITBIS Adelantado si aplica
        if (itbisCalculado > 0) {
            detallesAsiento.push({
                cuentaId: '110301', // ITBIS Adelantado en Compras
                descripcion: `ITBIS en compra de ${articulo.nombre}`,
                debito: itbisCalculado,
                credito: 0
            });
        }

        // Crédito a Pasivo o Banco
        detallesAsiento.push({
            cuentaId: cuentaPasivoBanco,
            descripcion: `Factura ${formData.ncf || 'S/N'} - ${proveedorNombre}`,
            debito: 0,
            credito: totalFactura
        });

        const asiento = {
            fecha: formData.fecha,
            descripcion: `Compra de Inventario - ${articulo.nombre} (Fact: ${formData.ncf || 'S/N'})`,
            referencia: formData.ncf,
            detalles: detallesAsiento
        };

        // 2. Generar Asiento Automático
        registrarAsiento(asiento);

        onClose();

        // Limpiamos form para próxima compra
        setFormData({
            proveedorId: '',
            ncf: '',
            fecha: new Date().toISOString().split('T')[0],
            vencimiento: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString().split('T')[0],
            cantidad: 1,
            costoUnitario: 0,
            condicion: 'Contado'
        });
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
            <div className="card" style={{ width: '100%', maxWidth: '600px', padding: 0 }}>
                <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Registrar Entrada / Compra</h2>
                    <button onClick={onClose} style={{ color: 'var(--text-muted)' }}><X size={20} /></button>
                </div>

                <div style={{ padding: '1.5rem', background: 'var(--background)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                        <Search size={20} />
                    </div>
                    <div>
                        <div style={{ fontWeight: 600 }}>{articulo.nombre}</div>
                        <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Código: {articulo.codigo} | Existencia actual: {articulo.existencia}</div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 200px', gap: '1rem', marginBottom: '1rem' }}>
                        <div className="input-group">
                            <label className="input-label">Proveedor</label>
                            <select className="input-field" name="proveedorId" value={formData.proveedorId} onChange={handleChange} required>
                                <option value="">-- Seleccionar Proveedor --</option>
                                {proveedores.map(p => <option key={p.id} value={p.id}>{p.nombre} ({p.rnc})</option>)}
                            </select>
                        </div>
                        <div className="input-group">
                            <label className="input-label">NCF (Opcional)</label>
                            <input type="text" className="input-field" name="ncf" value={formData.ncf} onChange={handleChange} placeholder="B01..." />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
                        <div className="input-group">
                            <label className="input-label">Fecha Factura</label>
                            <input type="date" className="input-field" name="fecha" value={formData.fecha} onChange={handleChange} required />
                        </div>
                        <div className="input-group">
                            <label className="input-label">Vencimiento</label>
                            <input type="date" className="input-field" name="vencimiento" value={formData.vencimiento} onChange={handleChange} required />
                        </div>
                        <div className="input-group">
                            <label className="input-label">Condición</label>
                            <select className="input-field" name="condicion" value={formData.condicion} onChange={handleChange}>
                                <option value="Contado">Al Contado</option>
                                <option value="Crédito">A Crédito</option>
                            </select>
                        </div>
                    </div>

                    <div style={{ borderTop: '1px solid var(--border)', margin: '1.5rem -1.5rem', padding: '1.5rem 1.5rem 0' }}>
                        <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--primary)', marginBottom: '1rem' }}>Detalle de Compra</h3>

                        <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: '1rem' }}>
                            <div className="input-group">
                                <label className="input-label">Cantidad</label>
                                <input type="number" step="1" min="1" className="input-field" name="cantidad" value={formData.cantidad} onChange={handleChange} required />
                            </div>
                            <div className="input-group">
                                <label className="input-label">Costo Unit. (Sin ITBIS)</label>
                                <input type="number" step="0.01" min="0" className="input-field" name="costoUnitario" value={formData.costoUnitario} onChange={handleChange} required />
                            </div>
                        </div>

                        {/* Resumen Totales */}
                        <div style={{ marginTop: '1rem', padding: '1rem', background: 'var(--background)', borderRadius: 'var(--radius-md)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                                <span>Subtotal:</span>
                                <span>RD$ {subtotal.toLocaleString('es-DO', { minimumFractionDigits: 2 })}</span>
                            </div>
                            {articulo.gravado && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                                    <span>ITBIS (18%):</span>
                                    <span>RD$ {itbisCalculado.toLocaleString('es-DO', { minimumFractionDigits: 2 })}</span>
                                </div>
                            )}
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border)', fontWeight: 700, fontSize: '1.125rem', color: 'var(--text-main)' }}>
                                <span>Total a Pagar:</span>
                                <span>RD$ {totalFactura.toLocaleString('es-DO', { minimumFractionDigits: 2 })}</span>
                            </div>
                        </div>
                    </div>

                    {/* Previsualización del Asiento Contable */}
                    <div style={{ marginTop: '1.5rem', padding: '1rem', border: '1px solid var(--border)', borderLeft: '3px solid var(--primary)', borderRadius: '4px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        <strong>Impacto Contable:</strong> Se registrará automáticamente un Débito a la cuenta de Inventario asociada al artículo, ITBIS Adelantado (si aplica) y un Crédito a la cuenta de {formData.condicion === 'Contado' ? 'Efectivo/Banco' : 'Cuentas por Pagar'}.
                    </div>

                    <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
                        <button type="submit" className="btn btn-primary">Registrar Compra</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CompraInventarioModal;
