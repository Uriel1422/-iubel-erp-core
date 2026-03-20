import React, { useState } from 'react';
import { useInventario } from '../context/InventarioContext';
import { Edit2, Play, Square, Package, Trash2, ShoppingBag } from 'lucide-react';
import ArticuloFormModal from '../components/ArticuloFormModal';
import ConfirmModal from '../components/ConfirmModal';
import CompraAvanzadaModal from '../components/CompraAvanzadaModal';

const Inventario = () => {
    const { articulos, toggleStatusArticulo, eliminarArticulo } = useInventario();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isCompraAvanzadaOpen, setIsCompraAvanzadaOpen] = useState(false);
    const [articuloToEdit, setArticuloToEdit] = useState(null);
    const [confirmDelete, setConfirmDelete] = useState({ open: false, id: null, name: '' });

    const handleDelete = (id) => {
        const art = articulos.find(a => a.id === id);
        setConfirmDelete({ open: true, id, name: art?.nombre });
    };

    const confirmDeleteAction = () => {
        if (confirmDelete.id) {
            eliminarArticulo(confirmDelete.id);
            setConfirmDelete({ open: false, id: null, name: '' });
        }
    };

    const handleEdit = (articulo) => {
        setArticuloToEdit(articulo);
        setIsModalOpen(true);
    };

    const handleCreate = () => {
        setArticuloToEdit(null);
        setIsModalOpen(true);
    };

    // Helper para formato de moneda (DOP)
    const formatMoney = (amount) => {
        return new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP' }).format(amount);
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div>
                    <h1 className="page-title" style={{ marginBottom: '0.25rem' }}>Inventario y Servicios</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Gestiona los productos, servicios y sus vinculaciones contables.</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button className="btn btn-secondary" onClick={() => setIsCompraAvanzadaOpen(true)} style={{ color: 'var(--primary)', borderColor: 'var(--primary)', background: 'var(--primary-light)' }}>
                        <ShoppingBag size={18} /> Registrar Compra (Factura)
                    </button>
                    <button className="btn btn-primary" onClick={handleCreate}>
                        <Package size={18} /> Nuevo Artículo
                    </button>
                </div>
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead style={{ backgroundColor: 'var(--background)', borderBottom: '1px solid var(--border)' }}>
                        <tr>
                            <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.875rem' }}>Código</th>
                            <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.875rem' }}>Descripción</th>
                            <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.875rem' }}>Tipo / ITBIS</th>
                            <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.875rem', textAlign: 'right' }}>Entrada</th>
                            <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.875rem', textAlign: 'right' }}>Existencia</th>
                            <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.875rem', textAlign: 'right' }}>Precio</th>
                            <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.875rem', textAlign: 'center' }}>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {articulos.map(articulo => (
                            <tr key={articulo.id} style={{ borderBottom: '1px solid var(--border)', opacity: articulo.activa ? 1 : 0.5 }}>
                                <td style={{ padding: '1rem', fontWeight: 500, color: 'var(--primary)' }}>{articulo.codigo}</td>
                                <td style={{ padding: '1rem' }}>{articulo.nombre}</td>
                                <td style={{ padding: '1rem' }}>
                                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                        <span style={{ fontSize: '0.75rem', padding: '0.125rem 0.5rem', background: articulo.tipo === 'Producto' ? 'var(--primary-light)' : 'var(--background)', color: articulo.tipo === 'Producto' ? 'var(--primary)' : 'var(--text-main)', borderRadius: '1rem', fontWeight: 500 }}>
                                            {articulo.tipo}
                                        </span>
                                        {articulo.gravado && (
                                            <span style={{ fontSize: '0.75rem', padding: '0.125rem 0.5rem', background: 'var(--warning)', color: 'white', borderRadius: '1rem', fontWeight: 600 }}>
                                                18%
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td style={{ padding: '1rem', textAlign: 'right' }}>
                                    {articulo.tipo === 'Producto' && (
                                        <button 
                                            className="btn-circle-elite"
                                            onClick={() => setIsCompraAvanzadaOpen(true)}
                                            title="Añadir Stock"
                                            style={{ 
                                                width: '24px', height: '24px', padding: 0, 
                                                borderRadius: '50%', background: 'var(--success-light)', 
                                                color: 'var(--success)', border: 'none',
                                                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                                cursor: 'pointer', transition: 'all 0.2s'
                                            }}
                                        >
                                            <FilePlus size={14} />
                                        </button>
                                    )}
                                </td>
                                <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 600, color: articulo.tipo === 'Servicio' ? 'var(--text-muted)' : (articulo.existencia <= 0 ? 'var(--danger)' : 'var(--text-main)') }}>
                                    {articulo.tipo === 'Servicio' ? '--' : articulo.existencia}
                                </td>
                                <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 500 }}>
                                    {formatMoney(articulo.precioVenta)}
                                </td>
                                <td style={{ padding: '1rem', textAlign: 'center' }}>
                                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                                        {articulo.tipo === 'Producto' && (
                                            <button
                                                className="btn btn-secondary"
                                                style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', color: 'var(--primary)' }}
                                                onClick={() => setIsCompraAvanzadaOpen(true)}
                                                title="Registrar Compra / Entrada"
                                            >
                                                Comprar
                                            </button>
                                        )}
                                        <button className="btn" style={{ padding: '0.25rem', color: 'var(--text-muted)' }} onClick={() => handleEdit(articulo)} title="Editar">
                                            <Edit2 size={16} />
                                        </button>
                                        <button
                                            className="btn"
                                            style={{ padding: '0.25rem', color: articulo.activa ? 'var(--danger)' : 'var(--success)' }}
                                            onClick={() => toggleStatusArticulo(articulo.id)}
                                            title={articulo.activa ? "Desactivar" : "Activar"}
                                        >
                                            {articulo.activa ? <Square size={16} /> : <Play size={16} />}
                                        </button>
                                        <button
                                            className="btn"
                                            style={{ padding: '0.25rem', color: 'var(--danger)' }}
                                            onClick={() => handleDelete(articulo.id)}
                                            title="Eliminar"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {articulos.length === 0 && (
                            <tr>
                                <td colSpan="6" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                    No hay artículos en el inventario.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <ArticuloFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                articuloToEdit={articuloToEdit}
            />

            <ConfirmModal
                isOpen={confirmDelete.open}
                onClose={() => setConfirmDelete({ ...confirmDelete, open: false })}
                onConfirm={confirmDeleteAction}
                title="Eliminar Artículo"
                message={`¿Está completamente seguro de que desea ELIMINAR '${confirmDelete.name}'? \n\n⚠️ Esta acción es permanente y no se puede deshacer.`}
            />

            <CompraAvanzadaModal
                isOpen={isCompraAvanzadaOpen}
                onClose={() => setIsCompraAvanzadaOpen(false)}
            />
        </div>
    );
};

export default Inventario;
