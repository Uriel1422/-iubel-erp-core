import React, { useState, useEffect } from 'react';
import { X, Save, Building2 } from 'lucide-react';
import { useCuentas } from '../context/CuentasContext';

const ProveedorModal = ({ isOpen, onClose, onSave, proveedorEdit = null }) => {
    const { cuentas, hasLoaded } = useCuentas();
    
    // Solo mostramos cuentas que puedan ser de Gasto (6), Activo (1) o Pasivo (2)
    const cuentasSugeridas = cuentas.filter(c => 
        c.activa && 
        c.subtipo === 'Cuenta Detalle' && 
        (c.codigo.startsWith('6') || c.codigo.startsWith('1') || c.codigo.startsWith('2'))
    );

    const [formData, setFormData] = useState({
        nombre: '',
        rnc: '',
        tipoProveedor: 'Empresa Formal',
        telefono: '',
        direccion: '',
        cuentaDefectoId: '',
        tipo: 'Proveedor' // Fijo para ContactosContext
    });

    useEffect(() => {
        if (proveedorEdit) {
            setFormData({
                nombre: proveedorEdit.nombre || '',
                rnc: proveedorEdit.rnc || proveedorEdit.cedula || '',
                tipoProveedor: proveedorEdit.tipoProveedor || 'Empresa Formal',
                telefono: proveedorEdit.telefono || '',
                direccion: proveedorEdit.direccion || '',
                cuentaDefectoId: proveedorEdit.cuentaDefectoId || '',
                tipo: 'Proveedor'
            });
        } else {
            setFormData({
                nombre: '',
                rnc: '',
                tipoProveedor: 'Empresa Formal',
                telefono: '',
                direccion: '',
                cuentaDefectoId: '',
                tipo: 'Proveedor'
            });
        }
    }, [proveedorEdit, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
        onClose();
    };

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1050, backdropFilter: 'blur(4px)' }}>
            <div className="card" style={{ width: '100%', maxWidth: '500px', margin: '1rem', maxHeight: '90vh', overflowY: 'auto', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)' }}>
                        <Building2 size={24} /> {proveedorEdit ? 'Editar Proveedor' : 'Nuevo Proveedor'}
                    </h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    
                    <div className="input-group">
                        <label className="input-label">Tipo de Proveedor</label>
                        <select className="input-field" value={formData.tipoProveedor} onChange={e => setFormData({ ...formData, tipoProveedor: e.target.value })}>
                            <option value="Empresa Formal">Empresa Formal (Persona Jurídica)</option>
                            <option value="Proveedor Informal">Proveedor Informal (Persona Física)</option>
                            <option value="Gasto Menor">Gasto Menor / Ocasional</option>
                        </select>
                    </div>

                    <div className="input-group">
                        <label className="input-label">Nombre / Razón Social <span style={{color:'red'}}>*</span></label>
                        <input type="text" className="input-field" required value={formData.nombre} onChange={e => setFormData({ ...formData, nombre: e.target.value })} placeholder="Ej: Importadora SRL" />
                    </div>

                    <div className="input-group">
                        <label className="input-label">Cédula o RNC <span style={{color:'red'}}>*</span></label>
                        <input type="text" className="input-field" required value={formData.rnc} onChange={e => setFormData({ ...formData, rnc: e.target.value })} placeholder="Ej: 130123456" />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div className="input-group">
                            <label className="input-label">Teléfono</label>
                            <input type="text" className="input-field" value={formData.telefono} onChange={e => setFormData({ ...formData, telefono: e.target.value })} placeholder="809-000-0000" />
                        </div>
                        <div className="input-group">
                            <label className="input-label">Dirección</label>
                            <input type="text" className="input-field" value={formData.direccion} onChange={e => setFormData({ ...formData, direccion: e.target.value })} placeholder="Ciudad, Sector" />
                        </div>
                    </div>

                    <div className="input-group" style={{ background: 'var(--primary-light)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                        <label className="input-label" style={{ color: 'var(--primary)', fontWeight: 700 }}>Cuenta Contable Predeterminada (Gasto/Costo)</label>
                        <p style={{ fontSize: '0.75rem', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Esta cuenta se seleccionará automáticamente al elegir este proveedor.</p>
                        <select className="input-field" value={formData.cuentaDefectoId} onChange={e => setFormData({ ...formData, cuentaDefectoId: e.target.value })}>
                            <option value="">-- Sin cuenta predeterminada --</option>
                            {cuentasSugeridas.map(c => <option key={c.id} value={c.id}>{c.codigo} - {c.nombre}</option>)}
                        </select>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
                        <button type="submit" className="btn btn-primary" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <Save size={18} /> Guardar Proveedor
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProveedorModal;
