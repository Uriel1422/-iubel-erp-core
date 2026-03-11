import React, { useRef } from 'react';
import { Camera, FileSignature, Upload, User } from 'lucide-react';

const TabFotos = ({ socio, onActualizar }) => {
    const fotoRef = useRef();
    const firmaRef = useRef();

    if (!socio) return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Selecciona un socio en la pestaña Buscar</div>;

    const handleFile = (field, e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = ev => onActualizar(socio.id, { [field]: ev.target.result });
        reader.readAsDataURL(file);
    };

    const fmtMoney = n => new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP' }).format(Number(n) || 0);

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            {/* FOTO */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--primary)', alignSelf: 'flex-start' }}>Foto del Socio</h3>
                <div style={{ width: '200px', height: '240px', border: '2px dashed var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-secondary)', cursor: 'pointer', position: 'relative' }}
                    onClick={() => fotoRef.current?.click()}>
                    {socio.foto ? (
                        <img src={socio.foto} alt="Foto socio" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
                            <User size={48} strokeWidth={1} />
                            <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>Click para cargar foto</span>
                        </div>
                    )}
                    <div style={{ position: 'absolute', bottom: '0.5rem', right: '0.5rem', background: 'var(--primary)', color: 'white', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Camera size={16} />
                    </div>
                </div>
                <input ref={fotoRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleFile('foto', e)} />
                <button className="btn btn-secondary" style={{ fontSize: '0.8rem', gap: '0.4rem' }} onClick={() => fotoRef.current?.click()}>
                    <Upload size={14} /> Cargar Foto
                </button>
                {socio.foto && (
                    <button className="btn btn-secondary" style={{ fontSize: '0.8rem', color: 'var(--danger)' }}
                        onClick={() => onActualizar(socio.id, { foto: null })}>
                        Eliminar Foto
                    </button>
                )}
            </div>

            {/* FIRMA + INFO */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--primary)' }}>Firma del Socio</h3>
                <div style={{ width: '100%', height: '120px', border: '2px dashed var(--border)', borderRadius: 'var(--radius-md)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-secondary)', cursor: 'pointer', position: 'relative' }}
                    onClick={() => firmaRef.current?.click()}>
                    {socio.firma ? (
                        <img src={socio.firma} alt="Firma" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
                            <FileSignature size={32} strokeWidth={1} />
                            <span style={{ fontSize: '0.8rem' }}>Click para cargar firma</span>
                        </div>
                    )}
                </div>
                <input ref={firmaRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleFile('firma', e)} />
                <button className="btn btn-secondary" style={{ fontSize: '0.8rem', gap: '0.4rem', alignSelf: 'flex-start' }} onClick={() => firmaRef.current?.click()}>
                    <Upload size={14} /> Cargar Firma
                </button>

                {/* Mini estado financiero */}
                <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Resumen Financiero</h4>
                    {[['Ahorros', socio.ahorros, 'var(--primary)'], ['Préstamos', socio.prestamos, 'var(--danger)'], ['Aportaciones', socio.aportacion, 'var(--success)']].map(([lbl, val, color]) => (
                        <div key={lbl} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0.75rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                            <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>{lbl}</span>
                            <span style={{ fontSize: '0.82rem', fontWeight: 700, color }}>{fmtMoney(val)}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default TabFotos;
