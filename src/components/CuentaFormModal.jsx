import React, { useState, useEffect } from 'react';
import { useCuentas } from '../context/CuentasContext';
import { X } from 'lucide-react';

const CuentaFormModal = ({ isOpen, onClose, cuentaToEdit }) => {
    const { cuentas, addCuenta, updateCuenta } = useCuentas();

    const initialFormState = {
        codigo: '',
        nombre: '',
        tipo: 'Activo',
        subtipo: 'Cuenta Detalle',
        padreId: '',
        activa: true
    };

    const [formData, setFormData] = useState(initialFormState);

    useEffect(() => {
        if (cuentaToEdit) {
            setFormData(cuentaToEdit);
        } else {
            setFormData(initialFormState);
        }
    }, [cuentaToEdit, isOpen]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Determine Nivel based on padreId
        let nivel = 1;
        if (formData.padreId) {
            const padre = cuentas.find(c => c.id === formData.padreId);
            if (padre) {
                nivel = padre.nivel + 1;
            }
        }

        const cuentaData = {
            ...formData,
            padreId: formData.padreId === '' ? null : formData.padreId,
            nivel
        };

        if (cuentaToEdit) {
            updateCuenta(cuentaToEdit.id, cuentaData);
        } else {
            addCuenta(cuentaData);
        }
        onClose();
    };

    // Only allow selecting parent accounts (not level 4 details)
    const posiblesPadres = cuentas.filter(c => c.nivel < 4);

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
            <div className="card" style={{ width: '100%', maxWidth: '500px', padding: '0' }}>
                <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>
                        {cuentaToEdit ? 'Editar Cuenta' : 'Nueva Cuenta'}
                    </h2>
                    <button onClick={onClose} style={{ color: 'var(--text-muted)' }}><X size={20} /></button>
                </div>

                <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
                    <div className="input-group">
                        <label className="input-label">Cuenta Padre</label>
                        <select className="input-field" name="padreId" value={formData.padreId || ''} onChange={handleChange}>
                            <option value="">-- Ninguna (Cuenta Principal/Nivel 1) --</option>
                            {posiblesPadres.map(c => (
                                <option key={c.id} value={c.id}>
                                    {c.codigo} - {c.nombre} (Nivel {c.nivel})
                                </option>
                            ))}
                        </select>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Las cuentas de nivel 4 no pueden tener subcuentas.</span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem' }}>
                        <div className="input-group">
                            <label className="input-label">Código</label>
                            <input required type="text" className="input-field" name="codigo" value={formData.codigo} onChange={handleChange} placeholder="Ej: 1105" />
                        </div>

                        <div className="input-group">
                            <label className="input-label">Nombre de Cuenta</label>
                            <input required type="text" className="input-field" name="nombre" value={formData.nombre} onChange={handleChange} placeholder="Ej: Gastos de Viaje" />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div className="input-group">
                            <label className="input-label">Tipo</label>
                            <select className="input-field" name="tipo" value={formData.tipo} onChange={handleChange} required>
                                <option value="Activo">Activo</option>
                                <option value="Pasivo">Pasivo</option>
                                <option value="Capital">Capital (Patrimonio)</option>
                                <option value="Ingreso">Ingreso</option>
                                <option value="Costo">Costo</option>
                                <option value="Gasto">Gasto</option>
                            </select>
                        </div>

                        <div className="input-group">
                            <label className="input-label">Subtipo</label>
                            <select className="input-field" name="subtipo" value={formData.subtipo} onChange={handleChange} required>
                                <option value="General">General (Nivel 1)</option>
                                <option value="Circulante">Circulante / Fijo</option>
                                <option value="Cuenta Control">Cuenta Control (Agrupadora)</option>
                                <option value="Cuenta Detalle">Cuenta Detalle (Asentable)</option>
                            </select>
                        </div>
                    </div>

                    <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
                        <button type="submit" className="btn btn-primary">
                            {cuentaToEdit ? 'Guardar Cambios' : 'Crear Cuenta'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CuentaFormModal;
