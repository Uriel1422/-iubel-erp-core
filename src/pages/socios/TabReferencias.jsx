import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';

const subTabs = ['Referencias del Socio', 'Dependientes', 'Beneficiarios Transferencias'];

const blankRef = { parentesco: '', nombre: '', cedula: '', telefono: '', sexo: '', nacimiento: '', direccion: '', referenciaComercial: '', referenciaPersonal: '', referenciaCrediticia: '' };
const blankDep = { nombre: '', parentesco: '', cedula: '', fechaNac: '', sexo: '' };
const blankBen = { nombre: '', parentesco: '', cedula: '', porcentaje: 0, banco: '', cuenta: '' };

const calcEdad = (fechaNac) => {
    if (!fechaNac) return 0;
    return Math.floor((new Date() - new Date(fechaNac)) / (365.25 * 24 * 3600 * 1000));
};

const TabReferencias = ({ socio, onAgregarReferencia, onEliminarReferencia, onAgregarDependiente, onEliminarDependiente, onAgregarBeneficiario, onEliminarBeneficiario }) => {
    const [sub, setSub] = useState('Referencias del Socio');
    const [formR, setFormR] = useState(blankRef);
    const [formD, setFormD] = useState(blankDep);
    const [formB, setFormB] = useState(blankBen);
    const [selR, setSelR] = useState(null);
    const [selD, setSelD] = useState(null);
    const [selBe, setSelBe] = useState(null);

    if (!socio) return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Selecciona un socio en la pestaña Buscar</div>;

    const refs = socio.referencias || [];
    const deps = socio.dependientes || [];
    const bens = socio.beneficiarios || [];

    const Row = ({ label, children, col = 1 }) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', gridColumn: col > 1 ? `span ${col}` : undefined }}>
            <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)' }}>{label}</label>
            {children}
        </div>
    );
    const TF = (form, setForm, field, type = 'text', opts) => (
        type === 'select' ? (
            <select className="input-field" style={{ height: '2rem', fontSize: '0.82rem', padding: '0 0.4rem' }}
                value={form[field] || ''} onChange={e => setForm(p => ({ ...p, [field]: e.target.value }))}>
                <option value=""></option>
                {opts.map(o => <option key={o}>{o}</option>)}
            </select>
        ) : (
            <input type={type} className="input-field" style={{ height: '2rem', fontSize: '0.82rem', padding: '0 0.4rem' }}
                value={form[field] || ''} onChange={e => setForm(p => ({ ...p, [field]: e.target.value }))} />
        )
    );

    // ── Tabla genérica ──────────────────────────────────────────────────────
    const Tabla = ({ headers, rows, selId, onSel }) => (
        <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', overflow: 'hidden', marginBottom: '0.75rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${headers.length}, 1fr)`, background: 'var(--primary)', padding: '0.3rem 0.5rem' }}>
                {headers.map(h => <span key={h} style={{ color: 'white', fontSize: '0.72rem', fontWeight: 700 }}>{h}</span>)}
            </div>
            <div style={{ maxHeight: '150px', overflowY: 'auto' }}>
                {rows.length === 0 ? (
                    <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>Sin registros</div>
                ) : rows.map(r => (
                    <div key={r.id} onClick={() => onSel(r)}
                        style={{ display: 'grid', gridTemplateColumns: `repeat(${headers.length}, 1fr)`, padding: '0.3rem 0.5rem', fontSize: '0.75rem', background: selId === r.id ? 'var(--primary-light)' : 'transparent', cursor: 'pointer', borderBottom: '1px solid var(--border-light)' }}>
                        {r.cells.map((c, i) => <span key={i} style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c}</span>)}
                    </div>
                ))}
            </div>
        </div>
    );

    // ── REFERENCIAS ─────────────────────────────────────────────────────────
    const renderReferencias = () => {
        const refRows = refs.map(r => ({ id: r.id, cells: [r.parentesco, r.nombre, r.cedula, r.telefono, r.sexo, calcEdad(r.nacimiento), r.direccion] }));
        return (
            <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <input type="text" className="input-field" style={{ height: '2rem', width: '200px', fontSize: '0.82rem' }} placeholder="Buscar referencia..." />
                </div>
                <Tabla headers={['Parentesco', 'Nombre', 'Cédula', 'Teléfono', 'Sexo', 'Edad', 'Dirección']} rows={refRows} selId={selR}
                    onSel={r => { setSelR(r.id); const ref = refs.find(x => x.id === r.id); if (ref) setFormR(ref); }} />

                {/* Formulario */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.6rem', padding: '0.75rem', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
                    <Row label="Socio No."><div className="input-field" style={{ height: '2rem', display: 'flex', alignItems: 'center', fontSize: '0.82rem', padding: '0 0.5rem' }}>{socio.codigo}</div></Row>
                    <Row label="Nombre" col={2}>{TF(formR, setFormR, 'nombre')}</Row>
                    <Row label="Parentesco">{TF(formR, setFormR, 'parentesco', 'select', ['Padre', 'Madre', 'Cónyuge', 'Hijo/a', 'Hermano/a', 'Amigo/a', 'Compañero/a', 'Otro'])}</Row>
                    <Row label="Cédula">{TF(formR, setFormR, 'cedula')}</Row>

                    <Row label="Nacimiento">{TF(formR, setFormR, 'nacimiento', 'date')}</Row>
                    <Row label="Edad"><div className="input-field" style={{ height: '2rem', display: 'flex', alignItems: 'center', fontSize: '0.82rem', padding: '0 0.5rem', color: 'var(--primary)', fontWeight: 700 }}>{calcEdad(formR.nacimiento)}</div></Row>
                    <Row label="Sexo">{TF(formR, setFormR, 'sexo', 'select', ['Masculino', 'Femenino'])}</Row>
                    <Row label="Teléfono">{TF(formR, setFormR, 'telefono')}</Row>

                    <Row label="Dirección" col={2}>{TF(formR, setFormR, 'direccion')}</Row>
                    <Row label="Referencia Comercial">{TF(formR, setFormR, 'referenciaComercial')}</Row>
                    <Row label="Referencias Personales">{TF(formR, setFormR, 'referenciaPersonal')}</Row>

                    <Row label="Referencia Crediticia" col={2}>{TF(formR, setFormR, 'referenciaCrediticia')}</Row>

                    <div style={{ gridColumn: 'span 4', display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                        <button className="btn btn-primary" style={{ fontSize: '0.78rem' }}
                            onClick={() => { onAgregarReferencia(socio.id, formR); setFormR(blankRef); setSelR(null); }}>
                            <Plus size={13} /> Agregar
                        </button>
                        {selR && <button className="btn btn-secondary" style={{ fontSize: '0.78rem', color: 'var(--danger)' }}
                            onClick={() => { onEliminarReferencia(socio.id, selR); setSelR(null); setFormR(blankRef); }}>
                            <Trash2 size={13} /> Eliminar
                        </button>}
                    </div>
                </div>
            </div>
        );
    };

    // ── DEPENDIENTES ─────────────────────────────────────────────────────────
    const renderDependientes = () => {
        const depRows = deps.map(d => ({ id: d.id, cells: [d.parentesco, d.nombre, d.cedula, d.fechaNac, d.sexo, calcEdad(d.fechaNac)] }));
        return (
            <div>
                <Tabla headers={['Parentesco', 'Nombre', 'Cédula', 'Nacimiento', 'Sexo', 'Edad']} rows={depRows} selId={selD}
                    onSel={r => { setSelD(r.id); const d = deps.find(x => x.id === r.id); if (d) setFormD(d); }} />
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '0.6rem', padding: '0.75rem', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
                    <Row label="Nombre" col={2}>{TF(formD, setFormD, 'nombre')}</Row>
                    <Row label="Parentesco">{TF(formD, setFormD, 'parentesco', 'select', ['Hijo/a', 'Padre', 'Madre', 'Hermano/a', 'Abuelo/a', 'Otro'])}</Row>
                    <Row label="Cédula">{TF(formD, setFormD, 'cedula')}</Row>
                    <Row label="Fecha Nac.">{TF(formD, setFormD, 'fechaNac', 'date')}</Row>
                    <Row label="Sexo">{TF(formD, setFormD, 'sexo', 'select', ['Masculino', 'Femenino'])}</Row>
                    <Row label="Edad"><div className="input-field" style={{ height: '2rem', display: 'flex', alignItems: 'center', fontSize: '0.82rem', padding: '0 0.5rem', color: 'var(--primary)', fontWeight: 700 }}>{calcEdad(formD.fechaNac)}</div></Row>
                    <div style={{ gridColumn: 'span 4', display: 'flex', gap: '0.5rem' }}>
                        <button className="btn btn-primary" style={{ fontSize: '0.78rem' }}
                            onClick={() => { onAgregarDependiente(socio.id, formD); setFormD(blankDep); setSelD(null); }}>
                            <Plus size={13} /> Agregar
                        </button>
                        {selD && <button className="btn btn-secondary" style={{ fontSize: '0.78rem', color: 'var(--danger)' }}
                            onClick={() => { onEliminarDependiente(socio.id, selD); setSelD(null); setFormD(blankDep); }}>
                            <Trash2 size={13} /> Eliminar
                        </button>}
                    </div>
                </div>
            </div>
        );
    };

    // ── BENEFICIARIOS ────────────────────────────────────────────────────────
    const renderBeneficiarios = () => {
        const benRows = bens.map(b => ({ id: b.id, cells: [b.nombre, b.parentesco, b.cedula, `${b.porcentaje}%`, b.banco, b.cuenta] }));
        return (
            <div>
                <Tabla headers={['Nombre', 'Parentesco', 'Cédula', '%', 'Banco', 'Cuenta']} rows={benRows} selId={selBe}
                    onSel={r => { setSelBe(r.id); const b = bens.find(x => x.id === r.id); if (b) setFormB(b); }} />
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '0.6rem', padding: '0.75rem', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
                    <Row label="Nombre" col={2}>{TF(formB, setFormB, 'nombre')}</Row>
                    <Row label="Parentesco">{TF(formB, setFormB, 'parentesco', 'select', ['Hijo/a', 'Cónyuge', 'Padre', 'Madre', 'Hermano/a', 'Otro'])}</Row>
                    <Row label="Cédula">{TF(formB, setFormB, 'cedula')}</Row>
                    <Row label="% Beneficio">{TF(formB, setFormB, 'porcentaje', 'number')}</Row>
                    <Row label="Banco">{TF(formB, setFormB, 'banco', 'select', ['BHD León', 'Banco Popular', 'Banreservas', 'Scotiabank', 'Apap', 'Otro'])}</Row>
                    <Row label="No. Cuenta" col={2}>{TF(formB, setFormB, 'cuenta')}</Row>
                    <div style={{ gridColumn: 'span 4', display: 'flex', gap: '0.5rem' }}>
                        <button className="btn btn-primary" style={{ fontSize: '0.78rem' }}
                            onClick={() => { onAgregarBeneficiario(socio.id, formB); setFormB(blankBen); setSelBe(null); }}>
                            <Plus size={13} /> Agregar
                        </button>
                        {selBe && <button className="btn btn-secondary" style={{ fontSize: '0.78rem', color: 'var(--danger)' }}
                            onClick={() => { onEliminarBeneficiario(socio.id, selBe); setSelBe(null); setFormB(blankBen); }}>
                            <Trash2 size={13} /> Eliminar
                        </button>}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div>
            <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid var(--border)', marginBottom: '1rem' }}>
                {subTabs.map(s => (
                    <button key={s} onClick={() => setSub(s)}
                        style={{ padding: '0.4rem 1rem', fontSize: '0.8rem', fontWeight: sub === s ? 700 : 500, borderBottom: sub === s ? '2px solid var(--primary)' : '2px solid transparent', color: sub === s ? 'var(--primary)' : 'var(--text-muted)', background: 'transparent', cursor: 'pointer' }}>
                        {s}
                    </button>
                ))}
            </div>
            {sub === 'Referencias del Socio' && renderReferencias()}
            {sub === 'Dependientes' && renderDependientes()}
            {sub === 'Beneficiarios Transferencias' && renderBeneficiarios()}
        </div>
    );
};

export default TabReferencias;
