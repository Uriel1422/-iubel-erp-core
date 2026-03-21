import React, { useState } from 'react';
import { useCuentas } from '../context/CuentasContext';
import { ChevronRight, ChevronDown, Edit2, Play, Square, Trash2 } from 'lucide-react';
import CuentaFormModal from '../components/CuentaFormModal';
import ConfirmModal from '../components/ConfirmModal';

const CuentaRow = ({ cuenta, onEdit, onDelete }) => {
    const { toggleStatusCuenta, eliminarCuenta } = useCuentas();
    const [expanded, setExpanded] = useState(false);

    const handleDelete = () => {
        onDelete(cuenta.id, cuenta.nombre);
    };
    const hasChildren = cuenta.children && cuenta.children.length > 0;

    // Nivel 1 (ACTIVOS, PASIVOS) - Bold y color distinto
    // Nivel 2, Nivel 3 - Indentaciones
    const isRoot = cuenta.nivel === 1;

    return (
        <div style={{ marginBottom: isRoot ? '1rem' : '0' }}>
            <div
                className="cuenta-row-elite"
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0.75rem',
                    backgroundColor: isRoot ? 'var(--background)' : 'transparent',
                    borderBottom: isRoot ? 'none' : '1px solid var(--border)',
                    borderRadius: isRoot ? 'var(--radius-md)' : '0',
                    marginLeft: `${(cuenta.nivel - 1) * 1.5}rem`,
                    opacity: cuenta.activa ? 1 : 0.6,
                    transition: 'all 0.2s ease',
                }}
            >
                <div style={{ width: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: hasChildren ? 'pointer' : 'default' }} onClick={() => hasChildren && setExpanded(!expanded)}>
                    {hasChildren ? (expanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />) : null}
                </div>

                <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{ fontWeight: isRoot ? 600 : 500, color: 'var(--primary)', width: '100px' }}>
                        {cuenta.codigo}
                    </span>
                    <span style={{ fontWeight: cuenta.nivel <= 2 ? 600 : 400 }}>
                        {cuenta.nombre}
                    </span>
                    {cuenta.subtipo && (
                        <span style={{ fontSize: '0.75rem', padding: '0.125rem 0.5rem', background: 'var(--border)', borderRadius: '1rem', color: 'var(--text-muted)' }}>
                            {cuenta.subtipo}
                        </span>
                    )}
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', opacity: isRoot ? 0 : 1 }}>
                    {!isRoot && (
                        <>
                            <button className="btn" style={{ padding: '0.25rem', color: 'var(--text-muted)' }} onClick={() => onEdit(cuenta)} title="Editar Cuenta">
                                <Edit2 size={16} />
                            </button>
                            <button
                                className="btn"
                                style={{ padding: '0.25rem', color: cuenta.activa ? 'var(--danger)' : 'var(--success)' }}
                                onClick={() => toggleStatusCuenta(cuenta.id)}
                                title={cuenta.activa ? "Desactivar Cuenta" : "Activar Cuenta"}
                            >
                                {cuenta.activa ? <Square size={16} /> : <Play size={16} />}
                            </button>
                            <button
                                className="btn"
                                style={{ padding: '0.25rem', color: 'var(--danger)' }}
                                onClick={handleDelete}
                                title="Eliminar Cuenta"
                            >
                                <Trash2 size={16} />
                            </button>
                        </>
                    )}
                </div>
            </div>

            {expanded && hasChildren && (
                <div className="cuenta-children">
                    {cuenta.children.map(child => (
                        <CuentaRow key={child.id} cuenta={child} onEdit={onEdit} onDelete={onDelete} />
                    ))}
                </div>
            )}
        </div>
    );
};

const Cuentas = () => {
    const { treeCuentas, eliminarCuenta } = useCuentas();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [cuentaToEdit, setCuentaToEdit] = useState(null);
    const [confirmDelete, setConfirmDelete] = useState({ open: false, id: null, name: '' });

    const handleEdit = (cuenta) => {
        setCuentaToEdit(cuenta);
        setIsModalOpen(true);
    };

    const handleCreate = () => {
        setCuentaToEdit(null);
        setIsModalOpen(true);
    };

    const handleDelete = (id, name) => {
        setConfirmDelete({ open: true, id, name });
    };

    const confirmDeleteAction = () => {
        if (confirmDelete.id) {
            eliminarCuenta(confirmDelete.id);
            setConfirmDelete({ open: false, id: null, name: '' });
        }
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div>
                    <h1 className="page-title" style={{ marginBottom: '0.25rem' }}>Catálogo de Cuentas</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Gestiona la estructura contable de la empresa.</p>
                </div>
                <button className="btn btn-primary" onClick={handleCreate}>
                    + Nueva Cuenta
                </button>
            </div>

            <div className="card" style={{ padding: '1rem' }}>
                <div style={{ display: 'flex', padding: '0.75rem', borderBottom: '2px solid var(--border)', fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                    <div style={{ width: '24px' }}></div>
                    <div style={{ width: '100px', paddingLeft: '1rem' }}>Código</div>
                    <div style={{ flex: 1 }}>Descripción de la Cuenta</div>
                    <div style={{ width: '100px', textAlign: 'right', paddingRight: '1rem' }}>Acciones</div>
                </div>

                <div className="tree-container">
                    {(treeCuentas || []).map((cuenta) => (
                        <CuentaRow key={`cr-${cuenta.id}`} cuenta={cuenta} onEdit={handleEdit} onDelete={handleDelete} />
                    ))}
                </div>
            </div>

            <CuentaFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                cuentaToEdit={cuentaToEdit}
            />

            <ConfirmModal
                isOpen={confirmDelete.open}
                onClose={() => setConfirmDelete({ ...confirmDelete, open: false })}
                onConfirm={confirmDeleteAction}
                title="Eliminar Cuenta Contable"
                message={`¿Está seguro de que desea eliminar la cuenta '${confirmDelete.name}'? ⚠️ Si tiene movimientos o subcuentas, el sistema podría impedir la operación por integridad referencial.`}
            />
        </div>
    );
};

export default Cuentas;
