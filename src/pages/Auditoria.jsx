import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Activity, Search, ShieldAlert } from 'lucide-react';

const Auditoria = () => {
    const { token, user } = useAuth();
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        try {
            const res = await fetch('http://localhost:3001/api/auditoria', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setLogs(data);
            }
        } catch (err) {
            console.error('Error fetching audit logs:', err);
        } finally {
            setLoading(false);
        }
    };

    const filtrados = logs.filter(log =>
        (log.accion || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (log.entidad || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (log.usuario_id || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (user.role !== 'admin' && user.role !== 'auditor') {
        return (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--danger)' }}>
                <ShieldAlert size={48} style={{ margin: '0 auto 1rem' }} />
                <h2>Acceso Denegado</h2>
                <p>No tienes permisos suficientes para ver el registro de auditoría.</p>
            </div>
        );
    }

    return (
        <div className="animate-fade-in" style={{ padding: '1.5rem', height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div>
                    <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                        <Activity className="text-primary" /> Registro de Auditoría
                    </h1>
                    <p style={{ color: 'var(--text-muted)' }}>Historial inmutable de operaciones y eventos de seguridad</p>
                </div>
            </div>

            <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: 0 }}>
                <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', gap: '1rem', background: 'var(--background)' }}>
                    <div style={{ position: 'relative', width: '350px' }}>
                        <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input
                            type="text"
                            className="input-field"
                            style={{ paddingLeft: '2.5rem', marginBottom: 0 }}
                            placeholder="Buscar por acción, módulo o usuario..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div style={{ flex: 1, overflowY: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead style={{ background: '#f8fafc', position: 'sticky', top: 0, zIndex: 10 }}>
                            <tr>
                                <th style={{ padding: '1rem', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Fecha / Hora</th>
                                <th style={{ padding: '1rem', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Acción</th>
                                <th style={{ padding: '1rem', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Módulo / Entidad</th>
                                <th style={{ padding: '1rem', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>ID Registro</th>
                                <th style={{ padding: '1rem', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Usuario</th>
                                <th style={{ padding: '1rem', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Dirección IP</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={6} style={{ padding: '2rem', textAlign: 'center' }}>Cargando registros...</td></tr>
                            ) : filtrados.length === 0 ? (
                                <tr><td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>No se encontraron eventos en el registro.</td></tr>
                            ) : (
                                filtrados.map(log => (
                                    <tr key={log.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                        <td style={{ padding: '1rem', whiteSpace: 'nowrap', fontSize: '0.85rem' }}>{new Date(log.created_at).toLocaleString()}</td>
                                        <td style={{ padding: '1rem', fontWeight: 600 }}>
                                            <span style={{
                                                padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem',
                                                background: log.accion.includes('DELETE') ? '#fee2e2' : log.accion.includes('UPDATE') ? '#fef3c7' : '#e0e7ff',
                                                color: log.accion.includes('DELETE') ? '#991b1b' : log.accion.includes('UPDATE') ? '#92400e' : '#3730a3'
                                            }}>
                                                {log.accion}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1rem' }}>{log.entidad || '-'}</td>
                                        <td style={{ padding: '1rem', fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--text-muted)' }}>{log.registro_id || '-'}</td>
                                        <td style={{ padding: '1rem', fontSize: '0.85rem' }}>{log.usuario_id || 'Sistema'}</td>
                                        <td style={{ padding: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>{log.ip || '-'}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Auditoria;
