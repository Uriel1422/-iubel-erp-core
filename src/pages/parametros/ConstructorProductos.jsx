import React, { useState } from 'react';
import { Plus, Edit2, AlertCircle, Save, X, ArrowRight, Shield, Percent, CreditCard, PiggyBank, Briefcase } from 'lucide-react';

// Productos simulados iniciales (Mock Data)
const initialProducts = {
    prestamos: [
        { id: 'P01', code: 'PREST_CONS', name: 'Préstamo de Consumo', rate: 18, maxTerm: 48, minScore: 650, hasMora: true, moraRate: 5 },
        { id: 'P02', code: 'PREST_HIPO', name: 'Hipotecario Premium', rate: 10.5, maxTerm: 240, minScore: 720, hasMora: true, moraRate: 3 },
    ],
    ahorros: [
        { id: 'A01', code: 'AHORRO_STD', name: 'Cuenta de Ahorro Standard', rate: 2, minOpening: 500, hasMora: false },
        { id: 'A02', code: 'AHORRO_INF', name: 'Ahorro Infantil', rate: 4, minOpening: 100, hasMora: false }
    ]
};

const ConstructorProductos = ({ type }) => {
    const isPrestamo = type === 'prestamos';
    
    // Estado
    const [products, setProducts] = useState(initialProducts[type] || []);
    const [isCreating, setIsCreating] = useState(false);
    
    // Formulario de Nuevo Producto
    const [formData, setFormData] = useState({
        code: '', name: '', rate: '', maxTerm: '', minScore: '', hasMora: false, moraRate: ''
    });

    const handleSave = () => {
        if (!formData.name || !formData.code || !formData.rate) {
            alert('Por favor complete los campos obligatorios (*).');
            return;
        }

        const newProduct = {
            id: Date.now().toString(),
            code: formData.code.toUpperCase().replace(/\s+/g, '_'),
            name: formData.name,
            rate: Number(formData.rate),
            maxTerm: Number(formData.maxTerm) || 0,
            minScore: Number(formData.minScore) || 0,
            hasMora: formData.hasMora,
            moraRate: Number(formData.moraRate) || 0,
            minOpening: Number(formData.maxTerm) || 0 // Reusing field for savings
        };

        setProducts([newProduct, ...products]);
        setIsCreating(false);
        setFormData({ code: '', name: '', rate: '', maxTerm: '', minScore: '', hasMora: false, moraRate: '' });
    };

    return (
        <div className="animate-fade-in" style={{ padding: '2rem' }}>
            
            {/* Cabecera */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '0 0 0.25rem 0', fontSize: '1.4rem' }}>
                        {isPrestamo ? <CreditCard size={28} className="text-primary" /> : <PiggyBank size={28} className="text-primary" />}
                        Motor de Productos ({isPrestamo ? 'Clase de Activo' : 'Clase de Pasivo'})
                    </h3>
                    <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.9rem' }}>
                        Construye productos financieros definiendo sus reglas de negocio. No requiere código.
                    </p>
                </div>
                {!isCreating && (
                    <button className="btn btn-primary" onClick={() => setIsCreating(true)} style={{ gap: '0.5rem' }}>
                        <Plus size={18} /> Diseñar Nuevo Producto
                    </button>
                )}
            </div>

            {/* Panel de Creación (Wizard visual) */}
            {isCreating && (
                <div className="card glass animate-fade-in" style={{ padding: '2rem', marginBottom: '3rem', border: '1px solid var(--primary)', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: 'var(--primary)' }}></div>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
                        <h4 style={{ margin: 0, fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Briefcase size={20} color="var(--primary)" /> Constructor de Producto {isPrestamo ? 'Crediticio' : 'de Ahorro'}
                        </h4>
                        <button className="btn" style={{ padding: '0.4rem', color: 'var(--text-muted)' }} onClick={() => setIsCreating(false)}>
                            <X size={20} />
                        </button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(250px, 1fr) 2fr', gap: '3rem' }}>
                        {/* Blueprint Visual Preview */}
                        <div style={{ background: 'var(--background)', borderRadius: '12px', padding: '1.5rem', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '1rem', border: '1px dashed var(--border)' }}>
                            <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: 'var(--primary-light)', color: 'var(--primary)', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {isPrestamo ? <CreditCard size={32} /> : <PiggyBank size={32} />}
                            </div>
                            <div>
                                <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '1.2rem', color: formData.name ? 'var(--text-main)' : 'var(--text-muted)' }}>
                                    {formData.name || 'Nombre del Producto'}
                                </h4>
                                <div className="badge" style={{ background: 'rgba(0,0,0,0.05)', fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                                    {formData.code || 'SYS_CODE_00'}
                                </div>
                            </div>
                            
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '1rem', textAlign: 'left' }}>
                                <div style={{ background: 'white', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{isPrestamo ? 'Tasa Activa' : 'Tasa Pasiva'}</div>
                                    <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--primary)' }}>{formData.rate || '0'}%</div>
                                </div>
                                {isPrestamo && (
                                    <div style={{ background: 'white', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Plazo Max</div>
                                        <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>{formData.maxTerm || '0'} m</div>
                                    </div>
                                )}
                            </div>
                            
                            {isPrestamo && formData.minScore && (
                                <div style={{ background: 'var(--warning)', color: 'white', padding: '0.5rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600, display: 'flex', justifyContent: 'center', gap: '0.5rem', alignItems: 'center', marginTop: '0.5rem' }}>
                                    <Shield size={14} /> Filtro: Score &gt; {formData.minScore}
                                </div>
                            )}
                        </div>

                        {/* Formularios por Secciones */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                            {/* Sec 1: Identificación */}
                            <div>
                                <h5 style={{ color: 'var(--primary)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <span style={{ width: '24px', height: '24px', background: 'var(--primary-light)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>1</span>
                                    Identificación
                                </h5>
                                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
                                    <div>
                                        <label className="form-label">Nombre Comercial *</label>
                                        <input type="text" className="form-input" placeholder="Ej. Crédito Consumo Vip" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                                    </div>
                                    <div>
                                        <label className="form-label">Código Técnico *</label>
                                        <input type="text" className="form-input" placeholder="Ej. CRED_VIP" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} style={{ fontFamily: 'monospace' }} />
                                    </div>
                                </div>
                            </div>

                            {/* Sec 2: Condiciones Financieras */}
                            <div>
                                <h5 style={{ color: 'var(--primary)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <span style={{ width: '24px', height: '24px', background: 'var(--primary-light)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>2</span>
                                    Condiciones Financieras
                                </h5>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                                    <div>
                                        <label className="form-label">Tasa Anual (%) *</label>
                                        <div style={{ position: 'relative' }}>
                                            <input type="number" className="form-input" placeholder="0.00" value={formData.rate} onChange={e => setFormData({...formData, rate: e.target.value})} />
                                            <Percent size={14} style={{ position: 'absolute', right: '10px', top: '12px', color: 'var(--text-muted)' }} />
                                        </div>
                                    </div>
                                    {isPrestamo ? (
                                        <>
                                            <div>
                                                <label className="form-label">Plazo Máx (Meses)</label>
                                                <input type="number" className="form-input" placeholder="Ej. 60" value={formData.maxTerm} onChange={e => setFormData({...formData, maxTerm: e.target.value})} />
                                            </div>
                                            <div>
                                                <label className="form-label">Score Mínimo (Riesgo)</label>
                                                <input type="number" className="form-input" placeholder="Ej. 650" value={formData.minScore} onChange={e => setFormData({...formData, minScore: e.target.value})} />
                                            </div>
                                        </>
                                    ) : (
                                        <div>
                                            <label className="form-label">Monto Min. Apertura (DOP)</label>
                                            <input type="number" className="form-input" placeholder="Ej. 500" value={formData.maxTerm /* Reusing field */} onChange={e => setFormData({...formData, maxTerm: e.target.value})} />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Sec 3: Reglas de Negocio */}
                            {isPrestamo && (
                                <div>
                                    <h5 style={{ color: 'var(--primary)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <span style={{ width: '24px', height: '24px', background: 'var(--primary-light)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>3</span>
                                        Reglas & Penalidades
                                    </h5>
                                    
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'var(--background)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: 600, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <AlertCircle size={16} className="text-danger" /> Activar Cobro de Mora
                                            </div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>El sistema generará recargos automáticos si el socio se atrasa.</div>
                                        </div>
                                        <label className="switch" style={{ position: 'relative', display: 'inline-block', width: '40px', height: '24px' }}>
                                            <input type="checkbox" checked={formData.hasMora} onChange={e => setFormData({...formData, hasMora: e.target.checked})} style={{ opacity: 0, width: 0, height: 0 }} />
                                            <span className="slider round" style={{ position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: formData.hasMora ? 'var(--primary)' : '#ccc', borderRadius: '24px', transition: '.4s' }}>
                                                <span style={{ position: 'absolute', height: '18px', width: '18px', left: formData.hasMora ? '18px' : '3px', bottom: '3px', backgroundColor: 'white', borderRadius: '50%', transition: '.4s' }}></span>
                                            </span>
                                        </label>
                                    </div>
                                    
                                    {formData.hasMora && (
                                        <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(239,68,68,0.05)', borderRadius: '8px', border: '1px dashed var(--danger)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <div style={{ flex: 1 }}>
                                                <label className="form-label" style={{ color: 'var(--danger)' }}>% de Penalidad (Mora)</label>
                                                <div style={{ position: 'relative', maxWidth: '150px' }}>
                                                    <input type="number" className="form-input" placeholder="Ej. 5" value={formData.moraRate} onChange={e => setFormData({...formData, moraRate: e.target.value})} style={{ borderColor: 'var(--danger)' }} />
                                                    <Percent size={14} style={{ position: 'absolute', right: '10px', top: '12px', color: 'var(--danger)' }} />
                                                </div>
                                            </div>
                                            <div style={{ flex: 2, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                                Este porcentaje se calculará sobre la cuota en atraso. La parametrización contable se enlazará a "Ingresos por Mora".
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Actions */}
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
                                <button className="btn btn-secondary" onClick={() => setIsCreating(false)}>Cancelar</button>
                                <button className="btn btn-primary" onClick={handleSave} style={{ gap: '0.5rem' }}><Save size={16} /> Compilar Producto</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Catálogo Compilado (Grid de Tarjetas) */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                {products.length === 0 && !isCreating ? (
                    <div style={{ gridColumn: '1 / -1', padding: '4rem', textAlign: 'center', background: 'var(--background)', borderRadius: '12px', border: '1px dashed var(--border)' }}>
                        <h4 style={{ color: 'var(--text-main)', marginBottom: '0.5rem' }}>No hay productos parametrizados</h4>
                        <p style={{ color: 'var(--text-muted)' }}>Haga clic en el botón superior para diseñar su primer producto.</p>
                    </div>
                ) : (
                    products.map(p => (
                        <div key={p.id} className="card glass layout-card" style={{ padding: '1.5rem', position: 'relative', overflow: 'hidden' }}>
                            <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: 'var(--primary)' }}></div>
                            
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                <div>
                                    <h4 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        {p.name}
                                    </h4>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'monospace', letterSpacing: '0.05em', marginTop: '0.2rem' }}>
                                        #{p.code}
                                    </div>
                                </div>
                                <button className="btn" style={{ padding: '0.25rem', color: 'var(--text-muted)' }} title="Editar Parámetros">
                                    <Edit2 size={16} />
                                </button>
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.25rem' }}>
                                <div style={{ background: 'var(--background)', padding: '0.75rem', borderRadius: '8px', flex: 1, textAlign: 'center' }}>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Tasa Fija</div>
                                    <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary)' }}>{p.rate}%</div>
                                </div>
                                {isPrestamo && (
                                    <div style={{ background: 'var(--background)', padding: '0.75rem', borderRadius: '8px', flex: 1, textAlign: 'center' }}>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Plazo Max</div>
                                        <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)' }}>{p.maxTerm}m</div>
                                    </div>
                                )}
                            </div>

                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                <span className="badge" style={{ background: 'var(--success)', color: 'white', fontSize: '0.7rem' }}>
                                    Activo
                                </span>
                                {isPrestamo && p.hasMora && (
                                    <span className="badge" style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--danger)', fontSize: '0.7rem', border: '1px solid var(--danger)' }}>
                                        Mora: {p.moraRate}%
                                    </span>
                                )}
                                {isPrestamo && p.minScore > 0 && (
                                    <span className="badge" style={{ background: 'rgba(245,158,11,0.1)', color: 'var(--warning)', fontSize: '0.7rem', border: '1px solid var(--warning)' }}>
                                        Riesgo &gt; {p.minScore}
                                    </span>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
            
        </div>
    );
};

export default ConstructorProductos;
