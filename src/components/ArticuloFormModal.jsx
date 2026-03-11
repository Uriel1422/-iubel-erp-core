import React, { useState, useEffect } from 'react';
import { useInventario } from '../context/InventarioContext';
import { useCuentas } from '../context/CuentasContext';
import { X } from 'lucide-react';

const ArticuloFormModal = ({ isOpen, onClose, articuloToEdit }) => {
    const { addArticulo, updateArticulo } = useInventario();
    const { cuentas } = useCuentas();

    const initialFormState = {
        codigo: '',
        nombre: '',
        tipo: 'Producto', // 'Producto' o 'Servicio'
        costo: 0,
        precioVenta: 0,
        gravado: true,
        existencia: 0,
        cuentaIngresoId: '4101',
        cuentaInventarioId: '110401', // Solo si es Producto
        cuentaCostoId: '5101',        // Solo si es Producto
        metodoCosteo: 'PROMEDIO',     // 'PROMEDIO' o 'FIFO'
        activa: true
    };

    const [formData, setFormData] = useState(initialFormState);

    useEffect(() => {
        if (articuloToEdit) {
            setFormData(articuloToEdit);
        } else {
            setFormData(initialFormState);
        }
    }, [articuloToEdit, isOpen]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (articuloToEdit) {
            updateArticulo(articuloToEdit.id, formData);
        } else {
            addArticulo(formData);
        }
        onClose();
    };

    // Filtrar cuentas de detalle para asignar a los artículos
    const cuentasAsentables = cuentas.filter(c => c.activa && c.subtipo === 'Cuenta Detalle');
    const cuentasIngreso = cuentasAsentables.filter(c => c.codigo.startsWith('4'));
    const cuentasInv = cuentasAsentables.filter(c => c.codigo.startsWith('1104'));
    const cuentasCosto = cuentasAsentables.filter(c => c.codigo.startsWith('5'));

    return (
        <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
        }}>
            <div className="card" style={{ width: '100%', maxWidth: '600px', padding: '0', maxHeight: '90vh', overflowY: 'auto' }}>
                <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>
                        {articuloToEdit ? 'Editar Artículo' : 'Nuevo Artículo / Servicio'}
                    </h2>
                    <button onClick={onClose} style={{ color: 'var(--text-muted)' }}><X size={20} /></button>
                </div>

                <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem' }}>
                        <div className="input-group">
                            <label className="input-label">Código</label>
                            <input required type="text" className="input-field" name="codigo" value={formData.codigo} onChange={handleChange} placeholder="Ej: PROD-001" />
                        </div>

                        <div className="input-group">
                            <label className="input-label">Descripción</label>
                            <input required type="text" className="input-field" name="nombre" value={formData.nombre} onChange={handleChange} placeholder="Ej: Licencia de Software" />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div className="input-group">
                            <label className="input-label">Tipo de Elemento</label>
                            <select className="input-field" name="tipo" value={formData.tipo} onChange={handleChange} required>
                                <option value="Producto">Físico / Producto (Controla Stock)</option>
                                <option value="Servicio">Servicio (No controla Stock)</option>
                            </select>
                        </div>

                        <div className="input-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '0.5rem', marginTop: '1.5rem' }}>
                            <input type="checkbox" id="gravado" name="gravado" checked={formData.gravado} onChange={handleChange} style={{ width: '18px', height: '18px' }} />
                            <label htmlFor="gravado" className="input-label" style={{ marginBottom: 0 }}>Gravado ITBIS (18%)</label>
                        </div>
                    </div>

                    {formData.tipo === 'Producto' && (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                            <div className="input-group">
                                <label className="input-label">Método de Costeo</label>
                                <select className="input-field" name="metodoCosteo" value={formData.metodoCosteo || 'PROMEDIO'} onChange={handleChange} required>
                                    <option value="PROMEDIO">Promedio Ponderado</option>
                                    <option value="FIFO">Primeras Entradas, Primeras Salidas (FIFO)</option>
                                </select>
                            </div>
                        </div>
                    )}

                    <div style={{ display: 'grid', gridTemplateColumns: formData.tipo === 'Producto' ? '1fr 1fr 1fr' : '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                        <div className="input-group">
                            <label className="input-label">Costo</label>
                            <div style={{ position: 'relative' }}>
                                <span style={{ position: 'absolute', left: '0.75rem', top: '0.5rem', color: 'var(--text-muted)' }}>$</span>
                                <input required type="number" step="0.01" min="0" className="input-field" name="costo" value={formData.costo} onChange={handleChange} style={{ paddingLeft: '1.5rem', width: '100%' }} />
                            </div>
                        </div>

                        <div className="input-group">
                            <label className="input-label">Precio de Venta</label>
                            <div style={{ position: 'relative' }}>
                                <span style={{ position: 'absolute', left: '0.75rem', top: '0.5rem', color: 'var(--text-muted)' }}>$</span>
                                <input required type="number" step="0.01" min="0" className="input-field" name="precioVenta" value={formData.precioVenta} onChange={handleChange} style={{ paddingLeft: '1.5rem', width: '100%' }} />
                            </div>
                        </div>

                        {formData.tipo === 'Producto' && (
                            <div className="input-group">
                                <label className="input-label">Ex. Inicial (Opcional)</label>
                                <input type="number" step="1" min="0" className="input-field" name="existencia" value={formData.existencia} onChange={handleChange} disabled={!!articuloToEdit} title={articuloToEdit ? "Para cambiar la existencia use el Módulo de Compras o un Ajuste" : ""} />
                            </div>
                        )}
                    </div>

                    <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'var(--background)', borderRadius: 'var(--radius-md)' }}>
                        <h3 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--text-main)' }}>Integración Contable</h3>

                        <div className="input-group">
                            <label className="input-label">Cuenta de Ingreso (Ventas)</label>
                            <select className="input-field" name="cuentaIngresoId" value={formData.cuentaIngresoId} onChange={handleChange} required>
                                <option value="">-- Seleccionar Cuenta --</option>
                                {cuentasIngreso.map(c => <option key={c.id} value={c.id}>{c.codigo} - {c.nombre}</option>)}
                            </select>
                        </div>

                        {formData.tipo === 'Producto' && (
                            <>
                                <div className="input-group">
                                    <label className="input-label">Cuenta de Inventario (Activo)</label>
                                    <select className="input-field" name="cuentaInventarioId" value={formData.cuentaInventarioId} onChange={handleChange} required>
                                        <option value="">-- Seleccionar Cuenta --</option>
                                        {cuentasInv.map(c => <option key={c.id} value={c.id}>{c.codigo} - {c.nombre}</option>)}
                                    </select>
                                </div>

                                <div className="input-group">
                                    <label className="input-label">Cuenta de Costo de Venta (Gasto)</label>
                                    <select className="input-field" name="cuentaCostoId" value={formData.cuentaCostoId} onChange={handleChange} required>
                                        <option value="">-- Seleccionar Cuenta --</option>
                                        {cuentasCosto.map(c => <option key={c.id} value={c.id}>{c.codigo} - {c.nombre}</option>)}
                                    </select>
                                </div>
                            </>
                        )}
                    </div>

                    <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
                        <button type="submit" className="btn btn-primary">
                            {articuloToEdit ? 'Guardar Cambios' : 'Crear Artículo'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ArticuloFormModal;
