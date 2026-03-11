import React, { useState } from 'react';
import { Plus, Trash2, Car, Home, Wifi } from 'lucide-react';

// ── helpers ────────────────────────────────────────────────────────────────────
const fmtMoney = n => new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP' }).format(Number(n) || 0);

// ══════════════════════════════════════════════════════════════════════════════
// SUB-TAB: INMUEBLES
// ══════════════════════════════════════════════════════════════════════════════
const subTabs = ['Inmuebles', 'Vehículos', 'Comunicaciones', 'Distritos'];

const blankInmueble = { tipoBien: 'Casa', claveCatastral: '', valorComercial: 0, hipotecada: false, valorHipoteca: 0, ubicacion: '' };
const blankVehiculo = { tipo: 'Automóvil', marca: '', modelo: '', anio: '', color: '', placa: '', valorComercial: 0, hipotecado: false, valorHipoteca: 0 };

const TabGestion = ({ socio, onAgregarInmueble, onEliminarInmueble, onAgregarVehiculo, onEliminarVehiculo }) => {
    const [sub, setSub] = useState('Inmuebles');
    const [formI, setFormI] = useState(blankInmueble);
    const [formV, setFormV] = useState(blankVehiculo);
    const [selI, setSelI] = useState(null);
    const [selV, setSelV] = useState(null);

    if (!socio) return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Selecciona un socio en la pestaña Buscar</div>;

    const inmuebles = socio.inmuebles || [];
    const vehiculos = socio.vehiculos || [];

    const subTabBtn = (label) => (
        <button key={label}
            onClick={() => setSub(label)}
            style={{ padding: '0.4rem 1rem', fontSize: '0.8rem', fontWeight: sub === label ? 700 : 500, borderBottom: sub === label ? '2px solid var(--primary)' : '2px solid transparent', color: sub === label ? 'var(--primary)' : 'var(--text-muted)', background: 'transparent', cursor: 'pointer', transition: 'all 0.15s' }}>
            {label}
        </button>
    );

    /* ─ INMUEBLES ─ */
    const renderInmuebles = () => (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            {/* Tabla listado */}
            <div>
                <h3 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--primary)' }}>Inmuebles o Activos del Socio</h3>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, display: 'grid', gridTemplateColumns: '80px 90px 90px 70px 90px 1fr', gap: '0.25rem', padding: '0.3rem 0.5rem', background: 'var(--primary)', color: 'white', borderRadius: 'var(--radius-sm) var(--radius-sm) 0 0' }}>
                    {['Tipo Bien', 'Clave Cat.', 'Valor Com.', 'Hipoteca', 'Val. Hip.', 'Ubicación'].map(h => <span key={h}>{h}</span>)}
                </div>
                <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid var(--border)', borderTop: 0, borderRadius: '0 0 var(--radius-sm) var(--radius-sm)' }}>
                    {inmuebles.length === 0 ? (
                        <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>Sin inmuebles registrados</div>
                    ) : inmuebles.map(i => (
                        <div key={i.id} onClick={() => { setSelI(i.id); setFormI(i); }}
                            style={{ display: 'grid', gridTemplateColumns: '80px 90px 90px 70px 90px 1fr', gap: '0.25rem', padding: '0.35rem 0.5rem', fontSize: '0.75rem', background: selI === i.id ? 'var(--primary-light)' : 'var(--bg-card)', cursor: 'pointer', borderBottom: '1px solid var(--border-light)' }}>
                            <span>{i.tipoBien}</span>
                            <span>{i.claveCatastral}</span>
                            <span>{fmtMoney(i.valorComercial)}</span>
                            <span>{i.hipotecada ? 'Sí' : 'No'}</span>
                            <span>{fmtMoney(i.valorHipoteca)}</span>
                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{i.ubicacion}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Formulario detalle */}
            <div>
                <h3 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--primary)' }}>Detalles de Bienes e Inmuebles</h3>
                <div style={{ padding: '0.75rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', background: 'var(--bg-secondary)' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                        <div>
                            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.35rem' }}>TIPO DE BIEN</div>
                            {['Casa', 'Terreno', 'Otros'].map(t => (
                                <label key={t} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem', fontSize: '0.82rem', cursor: 'pointer' }}>
                                    <input type="radio" name="tipoBien" value={t} checked={formI.tipoBien === t} onChange={e => setFormI(p => ({ ...p, tipoBien: e.target.value }))} style={{ accentColor: 'var(--primary)' }} /> {t}
                                </label>
                            ))}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                            <div>
                                <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)' }}>CLAVE CATASTRAL</label>
                                <input className="input-field" style={{ height: '2rem', fontSize: '0.82rem', padding: '0 0.5rem', marginTop: '0.2rem' }}
                                    value={formI.claveCatastral} onChange={e => setFormI(p => ({ ...p, claveCatastral: e.target.value }))} />
                            </div>
                            <div>
                                <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)' }}>VALOR COMERCIAL</label>
                                <input type="number" className="input-field" style={{ height: '2rem', fontSize: '0.82rem', padding: '0 0.5rem', marginTop: '0.2rem' }}
                                    value={formI.valorComercial} onChange={e => setFormI(p => ({ ...p, valorComercial: e.target.value }))} />
                            </div>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', cursor: 'pointer' }}>
                                <input type="checkbox" checked={!!formI.hipotecada} onChange={e => setFormI(p => ({ ...p, hipotecada: e.target.checked }))} style={{ accentColor: 'var(--primary)' }} /> Actualmente Hipotecada
                            </label>
                            {formI.hipotecada && (
                                <div>
                                    <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)' }}>VALOR HIPOTECA</label>
                                    <input type="number" className="input-field" style={{ height: '2rem', fontSize: '0.82rem', padding: '0 0.5rem', marginTop: '0.2rem' }}
                                        value={formI.valorHipoteca} onChange={e => setFormI(p => ({ ...p, valorHipoteca: e.target.value }))} />
                                </div>
                            )}
                        </div>
                        <div style={{ gridColumn: 'span 2' }}>
                            <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)' }}>UBICACIÓN</label>
                            <textarea className="input-field" style={{ width: '100%', height: '3rem', fontSize: '0.82rem', padding: '0.4rem 0.5rem', resize: 'none', marginTop: '0.2rem' }}
                                value={formI.ubicacion} onChange={e => setFormI(p => ({ ...p, ubicacion: e.target.value }))} />
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
                        <button className="btn btn-primary" style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem' }}
                            onClick={() => { onAgregarInmueble(socio.id, formI); setFormI(blankInmueble); setSelI(null); }}>
                            <Plus size={14} /> Agregar
                        </button>
                        {selI && (
                            <button className="btn btn-secondary" style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem', color: 'var(--danger)' }}
                                onClick={() => { onEliminarInmueble(socio.id, selI); setSelI(null); setFormI(blankInmueble); }}>
                                <Trash2 size={14} /> Eliminar
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );

    /* ─ VEHÍCULOS ─ */
    const renderVehiculos = () => (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
                <h3 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--primary)' }}>Vehículos del Socio</h3>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: '0.25rem', padding: '0.3rem 0.5rem', background: 'var(--primary)', color: 'white', borderRadius: 'var(--radius-sm) var(--radius-sm) 0 0' }}>
                    {['Tipo', 'Marca', 'Modelo', 'Año', 'Placa', 'Valor'].map(h => <span key={h}>{h}</span>)}
                </div>
                <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid var(--border)', borderTop: 0 }}>
                    {vehiculos.length === 0 ? (
                        <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>Sin vehículos registrados</div>
                    ) : vehiculos.map(v => (
                        <div key={v.id} onClick={() => { setSelV(v.id); setFormV(v); }}
                            style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: '0.25rem', padding: '0.35rem 0.5rem', fontSize: '0.75rem', background: selV === v.id ? 'var(--primary-light)' : 'var(--bg-card)', cursor: 'pointer', borderBottom: '1px solid var(--border-light)' }}>
                            <span>{v.tipo}</span><span>{v.marca}</span><span>{v.modelo}</span><span>{v.anio}</span><span>{v.placa}</span><span>{fmtMoney(v.valorComercial)}</span>
                        </div>
                    ))}
                </div>
            </div>
            <div>
                <h3 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--primary)' }}>Detalles del Vehículo</h3>
                <div style={{ padding: '0.75rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', background: 'var(--bg-secondary)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
                    {[['tipo', 'Tipo', 'select', ['Automóvil', 'Motocicleta', 'Camioneta', 'Camión', 'Otro']],
                    ['marca', 'Marca'], ['modelo', 'Modelo'], ['anio', 'Año', 'number'], ['color', 'Color'], ['placa', 'Placa'],
                    ['valorComercial', 'Valor Comercial', 'number']
                    ].map(([f, lbl, type, opts]) => (
                        <div key={f}>
                            <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)' }}>{lbl.toUpperCase()}</label>
                            {type === 'select' ? (
                                <select className="input-field" style={{ height: '2rem', fontSize: '0.82rem', padding: '0 0.5rem', marginTop: '0.2rem', width: '100%' }}
                                    value={formV[f]} onChange={e => setFormV(p => ({ ...p, [f]: e.target.value }))}>
                                    {opts.map(o => <option key={o}>{o}</option>)}
                                </select>
                            ) : (
                                <input type={type || 'text'} className="input-field" style={{ height: '2rem', fontSize: '0.82rem', padding: '0 0.5rem', marginTop: '0.2rem', width: '100%' }}
                                    value={formV[f]} onChange={e => setFormV(p => ({ ...p, [f]: e.target.value }))} />
                            )}
                        </div>
                    ))}
                    <div style={{ display: 'flex', gap: '0.5rem', gridColumn: 'span 2', marginTop: '0.5rem' }}>
                        <button className="btn btn-primary" style={{ fontSize: '0.78rem' }}
                            onClick={() => { onAgregarVehiculo(socio.id, formV); setFormV(blankVehiculo); setSelV(null); }}>
                            <Plus size={14} /> Agregar
                        </button>
                        {selV && <button className="btn btn-secondary" style={{ fontSize: '0.78rem', color: 'var(--danger)' }}
                            onClick={() => { onEliminarVehiculo(socio.id, selV); setSelV(null); setFormV(blankVehiculo); }}>
                            <Trash2 size={14} /> Eliminar
                        </button>}
                    </div>
                </div>
            </div>
        </div>
    );

    /* ─ COMUNICACIONES ─ */
    const renderComunicaciones = () => (
        <div style={{ padding: '1rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', background: 'var(--bg-secondary)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1rem' }}>
                {[['Celular Principal', 'celular'], ['Teléfono Casa', 'telefono'], ['Email Personal', 'email'],
                ['Tel. Oficina', 'telefonoOficina'], ['Email Trabajo', 'emailTrabajo'], ['WhatsApp', 'whatsapp'],
                ['Telegram', 'telegram'], ['Redes Sociales', 'redesSociales']].map(([lbl, key]) => (
                    <div key={key}>
                        <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)' }}>{lbl.toUpperCase()}</label>
                        <div className="input-field" style={{ height: '2rem', display: 'flex', alignItems: 'center', fontSize: '0.82rem', padding: '0 0.5rem', marginTop: '0.2rem' }}>
                            {socio[key] || '—'}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <div>
            {/* Sub-tabs */}
            <div style={{ display: 'flex', gap: '0', borderBottom: '1px solid var(--border)', marginBottom: '1rem' }}>
                {subTabs.map(subTabBtn)}
            </div>
            {sub === 'Inmuebles' && renderInmuebles()}
            {sub === 'Vehículos' && renderVehiculos()}
            {sub === 'Comunicaciones' && renderComunicaciones()}
            {sub === 'Distritos' && <div style={{ padding: '1rem', color: 'var(--text-muted)' }}>Módulo de Distritos — próximamente</div>}
        </div>
    );
};

export default TabGestion;
