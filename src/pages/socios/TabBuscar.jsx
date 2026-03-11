import React, { useState } from 'react';
import { Search } from 'lucide-react';

const TabBuscar = ({ socios, onSelectSocio, selectedId }) => {
    const [filtros, setFiltros] = useState({ codigo: '', nombre: '', cedula: '', empresa: '' });

    const empresas = [...new Set(socios.map(s => s.empresa).filter(Boolean))];

    const filtrados = socios.filter(s => {
        const q = v => (v || '').toLowerCase();
        return (
            (!filtros.codigo || q(s.codigo).includes(q(filtros.codigo))) &&
            (!filtros.nombre || q(s.nombre).includes(q(filtros.nombre))) &&
            (!filtros.cedula || q(s.cedula).includes(q(filtros.cedula))) &&
            (!filtros.empresa || s.empresa === filtros.empresa)
        );
    });

    const F = (label, key, type = 'text') => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>{label}</label>
            {type === 'select' ? (
                <select className="input-field" style={{ height: '2.2rem', fontSize: '0.85rem' }}
                    value={filtros[key]} onChange={e => setFiltros(p => ({ ...p, [key]: e.target.value }))}>
                    <option value="">Todas</option>
                    {empresas.map(emp => <option key={emp}>{emp}</option>)}
                </select>
            ) : (
                <input type="text" className="input-field" style={{ height: '2.2rem', fontSize: '0.85rem' }}
                    value={filtros[key]} onChange={e => setFiltros(p => ({ ...p, [key]: e.target.value }))} />
            )}
        </div>
    );

    return (
        <div>
            {/* Filtros */}
            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr 1fr 1fr auto', gap: '0.75rem', alignItems: 'end', marginBottom: '1rem', padding: '0.75rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                {F('Código', 'codigo')}
                {F('Nombre', 'nombre')}
                {F('Cédula', 'cedula')}
                {F('Empresa', 'empresa', 'select')}
                <button className="btn btn-primary" style={{ height: '2.2rem', gap: '0.4rem' }}
                    onClick={() => { }}>
                    <Search size={15} /> Buscar
                </button>
            </div>

            {/* Tabla */}
            <div style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', overflow: 'hidden' }}>
                <div style={{ background: 'var(--primary)', color: 'white', padding: '0.5rem 1rem', fontWeight: 700, fontSize: '0.85rem', textAlign: 'center' }}>
                    Socios Disponibles — {filtrados.length} registro(s)
                </div>
                <div style={{ maxHeight: '380px', overflowY: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                        <thead style={{ position: 'sticky', top: 0, background: 'var(--bg-card)', zIndex: 1 }}>
                            <tr>{['Código', 'Nombre', 'Cédula', 'Empresa', 'Estado'].map(h => (
                                <th key={h} style={{ padding: '0.5rem 0.75rem', textAlign: 'left', fontWeight: 700, color: 'var(--text-muted)', borderBottom: '2px solid var(--border)', whiteSpace: 'nowrap' }}>{h}</th>
                            ))}</tr>
                        </thead>
                        <tbody>
                            {filtrados.length === 0 ? (
                                <tr><td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No se encontraron socios</td></tr>
                            ) : filtrados.map(s => (
                                <tr key={s.id}
                                    onClick={() => onSelectSocio(s)}
                                    style={{ cursor: 'pointer', background: selectedId === s.id ? 'var(--primary-light)' : 'transparent', transition: 'background 0.15s' }}
                                    onMouseEnter={e => { if (selectedId !== s.id) e.currentTarget.style.background = 'var(--bg-secondary)'; }}
                                    onMouseLeave={e => { if (selectedId !== s.id) e.currentTarget.style.background = 'transparent'; }}>
                                    <td style={{ padding: '0.45rem 0.75rem', borderBottom: '1px solid var(--border-light)', color: 'var(--primary)', fontWeight: 600 }}>{s.codigo}</td>
                                    <td style={{ padding: '0.45rem 0.75rem', borderBottom: '1px solid var(--border-light)', fontWeight: 500 }}>{s.nombre}</td>
                                    <td style={{ padding: '0.45rem 0.75rem', borderBottom: '1px solid var(--border-light)' }}>{s.cedula}</td>
                                    <td style={{ padding: '0.45rem 0.75rem', borderBottom: '1px solid var(--border-light)' }}>{s.empresa}</td>
                                    <td style={{ padding: '0.45rem 0.75rem', borderBottom: '1px solid var(--border-light)' }}>
                                        <span style={{ padding: '0.15rem 0.6rem', borderRadius: '10px', fontSize: '0.72rem', fontWeight: 700, background: s.estado === 'Activo' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', color: s.estado === 'Activo' ? 'var(--success)' : 'var(--danger)' }}>{s.estado}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {/* Footer info */}
                <div style={{ padding: '0.5rem 1rem', borderTop: '1px solid var(--border)', fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', gap: '2rem' }}>
                    {['Cuenta', 'Apertura', 'Descripción', 'Saldo', 'Cuota', 'Total'].map(h => (
                        <span key={h} style={{ fontWeight: 600 }}>{h}</span>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default TabBuscar;
