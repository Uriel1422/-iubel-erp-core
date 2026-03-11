import React, { useRef, useState } from 'react';

const TabGenerales = ({ datos, onChange }) => {
    const fileInputRef = useRef(null);
    const [showEditMenu, setShowEditMenu] = useState(false);

    const handleFotoSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = ev => {
            onChange('foto', ev.target.result);
        };
        reader.readAsDataURL(file);
        setShowEditMenu(false);
        // Reset input so same file can be re-selected
        e.target.value = '';
    };
    const F = ({ label, field, type = 'text', opts, half, third, span, ph }) => {
        const base = { display: 'flex', flexDirection: 'column', gap: '0.25rem' };
        if (span === 2) base.gridColumn = 'span 2';
        return (
            <div style={base}>
                <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{label}</label>
                {type === 'select' ? (
                    <select className="input-field" style={{ height: '2rem', fontSize: '0.82rem', padding: '0 0.5rem' }}
                        value={datos[field] || ''} onChange={e => onChange(field, e.target.value)}>
                        <option value=""></option>
                        {opts.map(o => <option key={o}>{o}</option>)}
                    </select>
                ) : type === 'checkbox' ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.4rem' }}>
                        <input type="checkbox" checked={!!datos[field]} onChange={e => onChange(field, e.target.checked)} style={{ width: '16px', height: '16px', accentColor: 'var(--primary)' }} />
                        <span style={{ fontSize: '0.82rem', fontWeight: 500 }}>{ph || label}</span>
                    </div>
                ) : (
                    <input type={type} className="input-field" style={{ height: '2rem', fontSize: '0.82rem', padding: '0 0.5rem' }}
                        placeholder={ph} value={datos[field] || ''} onChange={e => onChange(field, e.target.value)} />
                )}
            </div>
        );
    };

    const calcEdad = () => {
        if (!datos.fechaNac) return { years: 0, months: 0, days: 0 };
        const b = new Date(datos.fechaNac), today = new Date();
        let years = today.getFullYear() - b.getFullYear();
        let months = today.getMonth() - b.getMonth();
        if (months < 0) { years--; months += 12; }
        return { years, months, days: today.getDate() - b.getDate() };
    };
    const edad = calcEdad();

    const SectionTitle = ({ children }) => (
        <div style={{ gridColumn: '1 / -1', borderBottom: '2px solid var(--primary)', paddingBottom: '0.25rem', marginTop: '0.5rem' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '1px' }}>{children}</span>
        </div>
    );

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* ── DATOS GENERALES ── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '0.6rem', padding: '0.75rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                <SectionTitle>Datos Generales</SectionTitle>

                {/* ── FOTO DEL SOCIO ── */}
                <div style={{ gridColumn: '1', gridRow: '2 / 4', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem' }}>
                    {/* Círculo de foto */}
                    <div
                        style={{
                            width: '80px', height: '80px', borderRadius: '50%',
                            border: '3px solid var(--primary)',
                            overflow: 'hidden', background: 'var(--primary-light)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: datos.foto ? 'default' : 'pointer',
                            flexShrink: 0,
                            boxShadow: '0 4px 12px rgba(37,99,235,0.18)',
                        }}
                        onClick={() => !datos.foto && fileInputRef.current?.click()}
                        title={datos.foto ? '' : 'Clic para agregar foto'}
                    >
                        {datos.foto ? (
                            <img src={datos.foto} alt="Foto" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                            <span style={{ fontSize: '2rem' }}>🧑</span>
                        )}
                    </div>

                    {/* Botones */}
                    {!datos.foto ? (
                        <button
                            type="button"
                            className="btn btn-primary"
                            style={{ fontSize: '0.68rem', padding: '0.2rem 0.6rem', height: '1.7rem' }}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            + Agregar
                        </button>
                    ) : (
                        <div style={{ position: 'relative' }}>
                            <button
                                type="button"
                                className="btn btn-secondary"
                                style={{ fontSize: '0.68rem', padding: '0.2rem 0.6rem', height: '1.7rem' }}
                                onClick={() => setShowEditMenu(p => !p)}
                            >
                                ✏️ Editar
                            </button>
                            {showEditMenu && (
                                <div style={{
                                    position: 'absolute', top: '110%', left: '50%', transform: 'translateX(-50%)',
                                    background: 'var(--bg-card)', border: '1px solid var(--border)',
                                    borderRadius: 'var(--radius-md)', boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                                    zIndex: 100, minWidth: '130px', overflow: 'hidden',
                                }}>
                                    <button
                                        type="button"
                                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', padding: '0.5rem 0.75rem', fontSize: '0.78rem', background: 'transparent', cursor: 'pointer', borderBottom: '1px solid var(--border-light)' }}
                                        onClick={() => { fileInputRef.current?.click(); }}
                                    >
                                        🔄 Cambiar foto
                                    </button>
                                    <button
                                        type="button"
                                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', padding: '0.5rem 0.75rem', fontSize: '0.78rem', background: 'transparent', cursor: 'pointer', color: 'var(--danger)' }}
                                        onClick={() => { onChange('foto', null); setShowEditMenu(false); }}
                                    >
                                        🗑️ Eliminar foto
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Input de archivo oculto */}
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={handleFotoSelect}
                    />
                </div>

                {/* Campos de la fila 2 — col 2 a 6 */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Persona</label>
                    <select className="input-field" style={{ height: '2rem', fontSize: '0.82rem', padding: '0 0.5rem' }}
                        value={datos.persona || 'Fisica'} onChange={e => onChange('persona', e.target.value)}>
                        <option value="Fisica">🧑 Física</option>
                        <option value="Juridica">🏢 Jurídica</option>
                    </select>
                </div>
                <F label="Código" field="codigo" ph="SOC-XXXX" />
                <F label="Ficha" field="ficha" ph="F-XXX" />
                <F label="Cédula" field="cedula" ph="000-0000000-0" />
                <F label="Ing. Coop" field="ingCoop" />
                <F label="Pasaporte" field="pasaporte" />

                {/* Fila 3: nombre y estado — la col 1 ya está ocupada por la foto (rowspan) */}
                <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Nombre Completo</label>
                    <input type="text" className="input-field" style={{ height: '2rem', fontSize: '0.82rem', padding: '0 0.5rem' }}
                        value={datos.nombre || ''} onChange={e => onChange('nombre', e.target.value)} placeholder="Nombre completo" />
                </div>
                <F label="Estado" field="estado" type="select" opts={['Activo', 'Inactivo', 'Suspendido', 'Retirado']} />
                <F label="Oficial" field="oficial" type="select" opts={['Oficial 1', 'Oficial 2', 'Oficial 3', 'Director']} />
                <F label="Condición" field="condicion" type="select" opts={['Regular', 'Moroso', 'Bloqueado', 'Preferencial']} />
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', paddingTop: '1.2rem' }}>
                    <input type="checkbox" checked={!!datos.esSocio} onChange={e => onChange('esSocio', e.target.checked)} style={{ width: '16px', height: '16px', accentColor: 'var(--primary)' }} />
                    <label style={{ fontSize: '0.82rem', fontWeight: 600 }}>Socio</label>
                </div>
            </div>

            {/* ── DATOS PERSONALES ── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '0.6rem', padding: '0.75rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                <SectionTitle>Datos Personales</SectionTitle>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Fecha Nac.</label>
                    <input type="date" className="input-field" style={{ height: '2rem', fontSize: '0.82rem', padding: '0 0.5rem' }}
                        value={datos.fechaNac || ''} onChange={e => onChange('fechaNac', e.target.value)} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Edad</label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.25rem' }}>
                        {[['Años', edad.years], ['Mes', edad.months], ['Días', edad.days]].map(([lbl, val]) => (
                            <div key={lbl} style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem' }}>
                                <span style={{ fontSize: '0.62rem', color: 'var(--primary)', fontWeight: 600 }}>{lbl}</span>
                                <div className="input-field" style={{ height: '2rem', fontSize: '0.82rem', padding: '0 0.4rem', display: 'flex', alignItems: 'center', color: 'var(--primary)', fontWeight: 700 }}>{val}</div>
                            </div>
                        ))}
                    </div>
                </div>
                <F label="Sexo" field="sexo" type="select" opts={['Masculino', 'Femenino']} />
                <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Actividad Económica</label>
                    <select className="input-field" style={{ height: '2rem', fontSize: '0.82rem', padding: '0 0.5rem' }}
                        value={datos.actividadEconomica || ''} onChange={e => onChange('actividadEconomica', e.target.value)}>
                        <option value=""></option>
                        {['Comercio', 'Servicios', 'Industria', 'Agricultura', 'Construcción', 'Educación', 'Salud', 'Transporte', 'Turismo', 'Tecnología'].map(o => <option key={o}>{o}</option>)}
                    </select>
                </div>
                <F label="Estado Civil" field="estadoCivil" type="select" opts={['Soltero/a', 'Casado/a', 'Divorciado/a', 'Viudo/a', 'Unión Libre']} />

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase' }}>Académicos:</label>
                    <F label="Profesión" field="profesion" ph="Contador, Médico..." />
                </div>
                <F label="Educación" field="educacion" type="select" opts={['Primaria', 'Secundaria', 'Técnico', 'Universitaria', 'Posgrado', 'Doctorado']} />
                <div />
                <div style={{ gridColumn: 'span 3' }}></div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase' }}>Contactos:</label>
                    <F label="Celular" field="celular" ph="809-000-0000" />
                </div>
                <F label="Teléfono" field="telefono" ph="809-000-0000" />
                <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Email</label>
                    <input type="email" className="input-field" style={{ height: '2rem', fontSize: '0.82rem', padding: '0 0.5rem' }}
                        value={datos.email || ''} onChange={e => onChange('email', e.target.value)} placeholder="correo@email.com" />
                </div>
            </div>

            {/* ── DATOS DE UBICACIÓN ── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '0.6rem', padding: '0.75rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                <SectionTitle>Datos de Ubicación</SectionTitle>
                <F label="Vivienda" field="vivienda" type="select" opts={['Propia', 'Alquilada', 'Familiar', 'Hipotecada']} />
                <F label="País" field="pais" type="select" opts={['República Dominicana', 'Haití', 'Puerto Rico', 'Estados Unidos', 'España', 'Otro']} />
                <F label="Distrito" field="distrito" type="select" opts={['Distrito Nacional', 'Santiago', 'La Altagracia', 'San Pedro', 'La Romana', 'Otro']} />
                <div style={{ gridColumn: 'span 2' }}></div>
                <F label="Nacionalidad" field="nacionalidad" type="select" opts={['Dominicana', 'Haitiana', 'Puertorriqueña', 'Americana', 'Española', 'Otra']} />

                <F label="Área" field="area" type="select" opts={['Urbana', 'Rural', 'Semiurbana']} />
                <F label="Región" field="region" type="select" opts={['Ozama', 'Cibao Norte', 'Cibao Sur', 'Este', 'Sur', 'Nordeste', 'Norcentral', 'Noroeste', 'Valdesia', 'Enriquillo']} />
                <F label="Ciudad" field="ciudad" type="select" opts={['Santo Domingo', 'Santiago', 'La Vega', 'San Francisco', 'San Pedro', 'Higüey', 'La Romana', 'Barahona', 'Moca', 'Puerto Plata']} />
                <div style={{ gridColumn: 'span 2' }}></div>
                <F label="Municipio" field="municipio" type="select" opts={['Santo Domingo Este', 'Santo Domingo Norte', 'Santo Domingo Oeste', 'Los Alcarrizos', 'Pedro Brand']} />

                <F label="Sector" field="sector" ph="Nombre del sector" />
                <F label="Sección" field="seccion" ph="Sección" />
                <F label="Núm. Casa" field="numCasa" ph="45" />
                <div style={{ gridColumn: 'span 3', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Dirección</label>
                    <input type="text" className="input-field" style={{ height: '2rem', fontSize: '0.82rem', padding: '0 0.5rem' }}
                        value={datos.direccion || ''} onChange={e => onChange('direccion', e.target.value)} placeholder="Dirección completa" />
                </div>
            </div>

            {/* ── DATOS EMPRESARIALES ── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '0.6rem', padding: '0.75rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                <SectionTitle>Datos Empresariales</SectionTitle>
                <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Empresa</label>
                    <input type="text" className="input-field" style={{ height: '2rem', fontSize: '0.82rem', padding: '0 0.5rem' }}
                        value={datos.empresa || ''} onChange={e => onChange('empresa', e.target.value)} placeholder="Empresa empleadora" />
                </div>
                <F label="Frec. Nominal" field="frecNominal" type="select" opts={['Semanal', 'Quincenal', 'Mensual', 'Por hora']} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Fecha Ingreso</label>
                    <input type="date" className="input-field" style={{ height: '2rem', fontSize: '0.82rem', padding: '0 0.5rem' }}
                        value={datos.fechaIngreso || ''} onChange={e => onChange('fechaIngreso', e.target.value)} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Ingreso Mensual</label>
                    <input type="number" className="input-field" style={{ height: '2rem', fontSize: '0.82rem', padding: '0 0.5rem' }}
                        value={datos.ingresoMensual || ''} onChange={e => onChange('ingresoMensual', e.target.value)} />
                </div>

                <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Dirección Trabajo</label>
                    <input type="text" className="input-field" style={{ height: '2rem', fontSize: '0.82rem', padding: '0 0.5rem' }}
                        value={datos.direccionTrabajo || ''} onChange={e => onChange('direccionTrabajo', e.target.value)} />
                </div>
                <F label="Lugar de Trabajo" field="lugarTrabajo" ph="Zona, edificio..." />
                <F label="Tel. Oficina" field="telefonoOficina" ph="809-000-0000" />
                <F label="Cargo" field="cargoTrabajo" ph="Gerente, Analista..." />
                <F label="Vacaciones" field="vacaciones" ph="15 días" />

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Email Trabajo</label>
                    <input type="email" className="input-field" style={{ height: '2rem', fontSize: '0.82rem', padding: '0 0.5rem' }}
                        value={datos.emailTrabajo || ''} onChange={e => onChange('emailTrabajo', e.target.value)} />
                </div>
                <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Cta. Bancaria</label>
                    <select className="input-field" style={{ height: '2rem', fontSize: '0.82rem', padding: '0 0.5rem' }}
                        value={datos.ctaBancaria || ''} onChange={e => onChange('ctaBancaria', e.target.value)}>
                        <option value=""></option>
                        {['BHD León', 'Banco Popular', 'Banreservas', 'Scotiabank', 'Banco BDI', 'Apap'].map(o => <option key={o}>{o}</option>)}
                    </select>
                </div>
            </div>
        </div>
    );
};

export default TabGenerales;
