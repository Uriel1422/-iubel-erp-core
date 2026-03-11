import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { FileText, Upload, Download, Search, Folder, FolderOpen, Plus, Trash2, Eye, FileCheck, FileLock, Tag } from 'lucide-react';
import ConfirmModal from '../components/ConfirmModal';

const CATEGORIAS = ['Contratos', 'RRHH', 'Fiscal', 'Legal', 'Auditoría', 'Financiero', 'Operativo', 'Otros'];

const estadoStyle = {
    vigente:  { bg: 'rgba(16,185,129,0.1)', color: '#065f46', label: 'Vigente' },
    vencido:  { bg: 'rgba(239,68,68,0.1)',  color: '#991b1b',  label: 'Vencido' },
    revision: { bg: 'rgba(245,158,11,0.1)', color: '#92400e', label: 'En Revisión' },
    borrador: { bg: 'rgba(100,116,139,0.1)',color: '#334155',  label: 'Borrador' },
};

const GestionDocumental = () => {
    const [documentos, setDocumentos] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // 🔄 API PERSISTENCE
    useEffect(() => {
        const loadDocs = async () => {
            const data = await api.get('documentos');
            if (data && Array.isArray(data)) setDocumentos(data);
            setIsLoading(false);
        };
        loadDocs();
    }, []);

    useEffect(() => {
        if (!isLoading) {
            api.save('documentos', documentos);
        }
    }, [documentos, isLoading]);
    const [categoriaActiva, setCategoriaActiva] = useState('Todos');
    const [search, setSearch] = useState('');
    const [showUpload, setShowUpload] = useState(false);
    const [confirmDel, setConfirmDel] = useState({ open: false, id: null, nombre: '' });
    const [previewDoc, setPreviewDoc] = useState(null);
    const [nuevoDoc, setNuevoDoc] = useState({ nombre: '', categoria: 'Contratos', estado: 'borrador', vencimiento: '', tags: '' });

    const filtrados = documentos.filter(d =>
        (categoriaActiva === 'Todos' || d.categoria === categoriaActiva) &&
        (d.nombre.toLowerCase().includes(search.toLowerCase()) || d.tags.some(t => t.includes(search.toLowerCase())))
    );

    const handleUpload = (e) => {
        e.preventDefault();
        const nuevo = {
            id: Date.now().toString(),
            nombre: nuevoDoc.nombre,
            categoria: nuevoDoc.categoria,
            estado: nuevoDoc.estado,
            fecha: new Date().toISOString().slice(0, 10),
            vencimiento: nuevoDoc.vencimiento || null,
            size: `${Math.floor(Math.random() * 500 + 50)} KB`,
            autor: 'Usuario',
            tags: nuevoDoc.tags.split(',').map(t => t.trim()).filter(Boolean),
        };
        setDocumentos(prev => [...prev, nuevo]);
        setShowUpload(false);
        setNuevoDoc({ nombre: '', categoria: 'Contratos', estado: 'borrador', vencimiento: '', tags: '' });
    };

    const counts = {
        Todos: documentos.length,
        ...Object.fromEntries(CATEGORIAS.map(c => [c, documentos.filter(d => d.categoria === c).length]))
    };

    const stats = {
        total: documentos.length,
        vigentes: documentos.filter(d => d.estado === 'vigente').length,
        vencidos: documentos.filter(d => d.estado === 'vencido').length,
        revision: documentos.filter(d => d.estado === 'revision').length,
    };

    return (
        <div className="animate-up">
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem' }}>
                        <div style={{ width: 44, height: 44, borderRadius: '12px', background: 'linear-gradient(135deg,#7c3aed,#6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 20px rgba(124,58,237,0.3)' }}>
                            <FileLock size={22} color="white" />
                        </div>
                        <div>
                            <h1 className="page-title" style={{ margin: 0 }}>Gestión Documental</h1>
                            <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.875rem' }}>Repositorio centralizado y seguro de documentos institucionales</p>
                        </div>
                    </div>
                </div>
                <button className="btn btn-primary" onClick={() => setShowUpload(true)}>
                    <Plus size={18} /> Nuevo Documento
                </button>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px,1fr))', gap: '1rem', marginBottom: '2rem' }} className="stagger-children">
                {[
                    { label: 'Total Docs', val: stats.total,    grad: 'linear-gradient(135deg,#6366f1,#8b5cf6)', Icon: FileText },
                    { label: 'Vigentes',   val: stats.vigentes, grad: 'linear-gradient(135deg,#10b981,#34d399)', Icon: FileCheck },
                    { label: 'Vencidos',   val: stats.vencidos, grad: 'linear-gradient(135deg,#ef4444,#f87171)', Icon: FileLock },
                    { label: 'En Revisión',val: stats.revision, grad: 'linear-gradient(135deg,#f59e0b,#fbbf24)', Icon: Eye },
                ].map(({ label, val, grad, Icon }) => (
                    <div key={label} className="card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ width: 40, height: 40, borderRadius: '10px', background: grad, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <Icon size={18} color="white" />
                        </div>
                        <div>
                            <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-main)' }}>{val}</div>
                        </div>
                    </div>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '1.5rem' }}>
                {/* Sidebar Categorías */}
                <div className="card" style={{ padding: '1.25rem', height: 'fit-content', position: 'sticky', top: '1rem' }}>
                    <div style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.875rem' }}>CATEGORÍAS</div>
                    {['Todos', ...CATEGORIAS].map(cat => (
                        <button key={cat} onClick={() => setCategoriaActiva(cat)} style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            width: '100%', padding: '0.6rem 0.875rem', borderRadius: '8px', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.875rem', fontWeight: categoriaActiva === cat ? 700 : 500, marginBottom: '0.25rem',
                            background: categoriaActiva === cat ? 'linear-gradient(135deg,rgba(124,58,237,0.12),rgba(99,102,241,0.08))' : 'transparent',
                            color: categoriaActiva === cat ? 'var(--accent,#7c3aed)' : 'var(--text-muted)',
                            borderLeft: categoriaActiva === cat ? '3px solid var(--accent,#7c3aed)' : '3px solid transparent',
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                {categoriaActiva === cat ? <FolderOpen size={14} /> : <Folder size={14} />}
                                {cat}
                            </div>
                            <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '0.1rem 0.4rem', borderRadius: '4px', background: 'var(--primary-light)', color: 'var(--primary)' }}>
                                {counts[cat] || 0}
                            </span>
                        </button>
                    ))}
                </div>

                {/* Document List */}
                <div>
                    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                            <div style={{ position: 'relative', flex: 1, maxWidth: '380px' }}>
                                <Search size={15} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                <input className="input-field" value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar documentos o etiquetas..." style={{ paddingLeft: '2.25rem', marginBottom: 0 }} />
                            </div>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>{filtrados.length} documentos</span>
                        </div>

                        {filtrados.length === 0 ? (
                            <div className="empty-state"><FileText size={48} /><p>No hay documentos en esta categoría</p></div>
                        ) : (
                            <div style={{ display: 'grid', gap: '0' }}>
                                {filtrados.map((doc, i) => {
                                    const st = estadoStyle[doc.estado] || estadoStyle.borrador;
                                    return (
                                        <div key={doc.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'var(--bg-card)' : 'var(--background)' }}>
                                            <div style={{ width: 40, height: 40, borderRadius: '10px', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                <FileText size={18} color="var(--primary)" />
                                            </div>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)', marginBottom: '0.2rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{doc.nombre}</div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                                                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{doc.categoria} · {doc.fecha} · {doc.size}</span>
                                                    {doc.tags.map(t => (
                                                        <span key={t} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.65rem', fontWeight: 600, padding: '0.1rem 0.4rem', borderRadius: '4px', background: 'var(--accent-light,rgba(124,58,237,0.08))', color: 'var(--accent,#7c3aed)' }}>
                                                            <Tag size={9} />{t}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', flexShrink: 0 }}>
                                                <span style={{ padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 700, background: st.bg, color: st.color }}>{st.label}</span>
                                                <button onClick={() => setPreviewDoc(doc)} style={{ padding: '0.4rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'transparent', cursor: 'pointer', color: 'var(--text-muted)' }} title="Ver">
                                                    <Eye size={15} />
                                                </button>
                                                <button style={{ padding: '0.4rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'transparent', cursor: 'pointer', color: 'var(--primary)' }} title="Descargar">
                                                    <Download size={15} />
                                                </button>
                                                <button onClick={() => setConfirmDel({ open: true, id: doc.id, nombre: doc.nombre })} style={{ padding: '0.4rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'transparent', cursor: 'pointer', color: 'var(--danger)' }} title="Eliminar">
                                                    <Trash2 size={15} />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Upload Modal */}
            {showUpload && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
                    <div className="card glass" style={{ width: '100%', maxWidth: '500px' }}>
                        <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Upload size={22} color="var(--primary)" /> Registrar Documento
                        </h2>
                        <form onSubmit={handleUpload}>
                            <div className="input-group">
                                <label className="input-label">Nombre del Documento</label>
                                <input required className="input-field" value={nuevoDoc.nombre} onChange={e => setNuevoDoc({...nuevoDoc, nombre: e.target.value})} placeholder="ej. Contrato de Servicios 2025" />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="input-group">
                                    <label className="input-label">Categoría</label>
                                    <select className="input-field" value={nuevoDoc.categoria} onChange={e => setNuevoDoc({...nuevoDoc, categoria: e.target.value})}>
                                        {CATEGORIAS.map(c => <option key={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div className="input-group">
                                    <label className="input-label">Estado</label>
                                    <select className="input-field" value={nuevoDoc.estado} onChange={e => setNuevoDoc({...nuevoDoc, estado: e.target.value})}>
                                        {Object.entries(estadoStyle).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="input-group">
                                <label className="input-label">Fecha de Vencimiento (opcional)</label>
                                <input type="date" className="input-field" value={nuevoDoc.vencimiento} onChange={e => setNuevoDoc({...nuevoDoc, vencimiento: e.target.value})} />
                            </div>
                            <div className="input-group">
                                <label className="input-label">Etiquetas (separadas por coma)</label>
                                <input className="input-field" value={nuevoDoc.tags} onChange={e => setNuevoDoc({...nuevoDoc, tags: e.target.value})} placeholder="ej. DGII, fiscal, 2025" />
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowUpload(false)}>Cancelar</button>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}><Upload size={16} /> Registrar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Preview Modal */}
            {previewDoc && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
                    <div className="card" style={{ width: '100%', maxWidth: '520px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                            <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>{previewDoc.nombre}</h2>
                            <button onClick={() => setPreviewDoc(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontWeight: 700, fontSize: '1.1rem' }}>✕</button>
                        </div>
                        {[
                            ['Categoría', previewDoc.categoria], ['Estado', estadoStyle[previewDoc.estado]?.label],
                            ['Fecha', previewDoc.fecha], ['Vencimiento', previewDoc.vencimiento || 'Sin vencimiento'],
                            ['Tamaño', previewDoc.size], ['Autor', previewDoc.autor],
                        ].map(([k, v]) => (
                            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0', borderBottom: '1px solid var(--border)', fontSize: '0.875rem' }}>
                                <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>{k}</span>
                                <span style={{ fontWeight: 700 }}>{v}</span>
                            </div>
                        ))}
                        <div style={{ marginTop: '1rem', display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                            {previewDoc.tags.map(t => <span key={t} style={{ fontSize: '0.72rem', fontWeight: 700, padding: '0.2rem 0.5rem', borderRadius: '4px', background: 'var(--accent-light,rgba(124,58,237,0.08))', color: 'var(--accent,#7c3aed)' }}>{t}</span>)}
                        </div>
                        <button className="btn btn-secondary" style={{ width: '100%', marginTop: '1.5rem' }} onClick={() => setPreviewDoc(null)}>Cerrar</button>
                    </div>
                </div>
            )}

            <ConfirmModal
                isOpen={confirmDel.open}
                onClose={() => setConfirmDel({ ...confirmDel, open: false })}
                onConfirm={() => { setDocumentos(prev => prev.filter(d => d.id !== confirmDel.id)); }}
                title="Eliminar Documento"
                message={`¿Eliminar "${confirmDel.nombre}"? Esta acción no se puede deshacer.`}
            />
        </div>
    );
};

export default GestionDocumental;
