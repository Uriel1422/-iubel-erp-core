import React, { useState } from 'react';
import { useContactos } from '../context/ContactosContext';
import { Users, Plus, Contact, Mail, Phone, MapPin, Trash2, Edit } from 'lucide-react';
import ConfirmModal from '../components/ConfirmModal';

const Contactos = () => {
    const { contactos, agregarContacto, editarContacto, eliminarContacto } = useContactos();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState({ open: false, id: null });
    const [editingId, setEditingId] = useState(null);

    // Form State
    const [formData, setFormData] = useState({
        nombre: '',
        rnc: '',
        tipo: 'Cliente',
        email: '',
        telefono: '',
        direccion: ''
    });

    const handleEdit = (contacto) => {
        setEditingId(contacto.id);
        setFormData({
            nombre: contacto.nombre || '',
            rnc: contacto.rnc || '',
            tipo: contacto.tipo || 'Cliente',
            email: contacto.email || '',
            telefono: contacto.telefono || '',
            direccion: contacto.direccion || ''
        });
        setIsModalOpen(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingId) {
            editarContacto(editingId, formData);
        } else {
            agregarContacto(formData);
        }
        setIsModalOpen(false);
        setEditingId(null);
        setFormData({ nombre: '', rnc: '', tipo: 'Cliente', email: '', telefono: '', direccion: '' });
    };

    return (
        <>
            <div className="animate-up">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                    <div>
                        <h1 className="page-title" style={{ marginBottom: '0.5rem' }}>Gestión de Contactos</h1>
                        <p style={{ color: 'var(--text-muted)' }}>Administra tus Clientes y Proveedores de forma centralizada.</p>
                    </div>
                    <button className="btn btn-primary" onClick={() => { setEditingId(null); setFormData({ nombre: '', rnc: '', tipo: 'Cliente', email: '', telefono: '', direccion: '' }); setIsModalOpen(true); }}>
                        <Plus size={20} /> Nuevo Contacto
                    </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
                    {contactos.map(contacto => (
                        <div key={contacto.id} className="card glass animate-up" style={{ padding: '1.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                <div style={{ padding: '0.75rem', background: contacto.tipo === 'Cliente' ? 'var(--primary-light)' : 'rgba(245, 158, 11, 0.1)', color: contacto.tipo === 'Cliente' ? 'var(--primary)' : 'var(--warning)', borderRadius: 'var(--radius-md)' }}>
                                    <Users size={24} />
                                </div>
                                <span style={{
                                    fontSize: '0.75rem',
                                    fontWeight: 700,
                                    background: contacto.tipo === 'Cliente' ? 'var(--primary-light)' : 'rgba(245, 158, 11, 0.1)',
                                    color: contacto.tipo === 'Cliente' ? 'var(--primary)' : 'var(--warning)',
                                    padding: '0.25rem 0.75rem',
                                    borderRadius: '1rem',
                                    textTransform: 'uppercase'
                                }}>
                                    {contacto.tipo}
                                </span>
                            </div>

                            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.25rem' }}>{contacto.nombre}</h3>
                            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Contact size={14} /> RNC: {contacto.rnc}
                            </p>

                            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.25rem', marginBottom: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.875rem', color: 'var(--text-main)' }}>
                                    <Mail size={16} color="var(--text-muted)" /> {contacto.email}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.875rem', color: 'var(--text-main)' }}>
                                    <Phone size={16} color="var(--text-muted)" /> {contacto.telefono}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.875rem', color: 'var(--text-main)', opacity: 0.8 }}>
                                    <MapPin size={16} color="var(--text-muted)" /> {contacto.direccion}
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button className="btn btn-secondary" style={{ flex: 1, padding: '0.5rem' }} onClick={() => handleEdit(contacto)}>
                                    <Edit size={16} /> Editar
                                </button>
                                <button className="btn btn-secondary" style={{ color: 'var(--danger)', borderColor: 'rgba(239, 68, 68, 0.2)' }} onClick={() => setConfirmDelete({ open: true, id: contacto.id })}>
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Modal de Contacto Refinado */}
            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="card glass animate-up" style={{
                        width: '100%',
                        maxWidth: '550px',
                        padding: 0,
                        overflowY: 'auto',
                        background: 'var(--white)',
                        zIndex: 10
                    }}>
                        <div style={{ padding: '2rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>{editingId ? 'Editar Contacto' : 'Añadir Nuevo Contacto'}</h2>
                            <button onClick={() => setIsModalOpen(false)} style={{ color: 'var(--text-muted)', fontSize: '1.5rem' }}>×</button>
                        </div>
                        <form onSubmit={handleSubmit} style={{ padding: '2rem' }}>
                            <div className="input-group">
                                <label className="input-label">Tipo de Contacto</label>
                                <select className="input-field" value={formData.tipo} onChange={e => setFormData({ ...formData, tipo: e.target.value })} style={{ height: '3.5rem' }}>
                                    <option value="Cliente">Cliente</option>
                                    <option value="Proveedor">Proveedor</option>
                                </select>
                            </div>
                            <div className="input-group">
                                <label className="input-label">Nombre Completo / Razón Social</label>
                                <input required className="input-field" value={formData.nombre} onChange={e => setFormData({ ...formData, nombre: e.target.value })} placeholder="Ej: Juan Pérez" style={{ height: '3.5rem' }} />
                            </div>
                            <div className="input-group">
                                <label className="input-label">RNC / Cédula</label>
                                <input required className="input-field" value={formData.rnc} onChange={e => setFormData({ ...formData, rnc: e.target.value })} placeholder="001-0000000-0" style={{ height: '3.5rem' }} />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                <div className="input-group">
                                    <label className="input-label">Email</label>
                                    <input className="input-field" type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} placeholder="correo@ejemplo.com" style={{ height: '3.5rem' }} />
                                </div>
                                <div className="input-group">
                                    <label className="input-label">Teléfono</label>
                                    <input className="input-field" value={formData.telefono} onChange={e => setFormData({ ...formData, telefono: e.target.value })} placeholder="809-000-0000" style={{ height: '3.5rem' }} />
                                </div>
                            </div>
                            <div className="input-group">
                                <label className="input-label">Dirección</label>
                                <input className="input-field" value={formData.direccion} onChange={e => setFormData({ ...formData, direccion: e.target.value })} placeholder="Av. Winston Churchill #10" style={{ height: '3.5rem' }} />
                            </div>

                            <div style={{ display: 'flex', gap: '1.25rem', marginTop: '2rem' }}>
                                <button type="button" className="btn btn-secondary" style={{ flex: 1, height: '3.5rem' }} onClick={() => setIsModalOpen(false)}>Cancelar</button>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1, height: '3.5rem' }}>{editingId ? 'Guardar Cambios' : 'Guardar Contacto'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <ConfirmModal
                isOpen={confirmDelete.open}
                onClose={() => setConfirmDelete({ open: false, id: null })}
                onConfirm={() => { eliminarContacto(confirmDelete.id); setConfirmDelete({ open: false, id: null }); }}
                title="Eliminar Contacto"
                message="¿Estás seguro de que deseas eliminar este contacto? Esta acción no se puede deshacer."
            />
        </>
    );
};

export default Contactos;
