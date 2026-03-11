import React, { useState } from 'react';
import { useCobros } from '../context/CobrosContext';
import {
    FileText, FileOutput, FileSearch, PieChart,
    CheckCircle, ArrowDownCircle, Users, Download,
    Upload, Play, Filter, RefreshCw
} from 'lucide-react';

const TABS = [
    { id: 'generacion', label: 'Generación Archivo', icon: FileOutput },
    { id: 'lectura', label: 'Archivo de Lectura', icon: FileSearch },
    { id: 'informe', label: 'Informe Archivo', icon: PieChart },
    { id: 'aplicar', label: 'Aplicar Deducciones', icon: CheckCircle },
    { id: 'orden', label: 'Orden Aplicación', icon: ArrowDownCircle },
    { id: 'nomina', label: 'Gestión Nómina', icon: Users },
];

const CobrosYDeducciones = () => {
    const { cobros, deducciones, historial, procesarCobros } = useCobros();
    const [activeTab, setActiveTab] = useState('generacion');
    const [procesando, setProcesando] = useState(false);

    const formatMoney = v => new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP' }).format(Number(v) || 0);

    const handleProcesar = () => {
        setProcesando(true);
        setTimeout(() => {
            procesarCobros();
            setProcesando(false);
            alert('✅ Proceso de deducción aplicado exitosamente a las cuentas correspondientes.');
        }, 1500);
    };

    return (
        <div className="animate-up" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                <div>
                    <h1 className="page-title" style={{ marginBottom: '0.25rem' }}>Cobros y Deducciones</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Procesamiento por lotes, archivos de banco y aplicación de deducciones</p>
                </div>
            </div>

            {/* Custom Ribbon-like Tabs */}
            <div className="card" style={{ padding: '0.5rem', marginBottom: '1.5rem', display: 'flex', gap: '0.5rem', overflowX: 'auto' }}>
                {TABS.map(tab => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '0.75rem 1.25rem',
                                border: 'none',
                                background: isActive ? 'var(--primary-light)' : 'transparent',
                                color: isActive ? 'var(--primary)' : 'var(--text-muted)',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                minWidth: '120px'
                            }}
                        >
                            <Icon size={24} strokeWidth={isActive ? 2.5 : 1.5} />
                            <span style={{ fontSize: '0.75rem', fontWeight: isActive ? 700 : 500, whiteSpace: 'nowrap' }}>
                                {tab.label}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* Tab Contents */}
            <div className="card" style={{ flex: 1, overflowY: 'auto' }}>
                {activeTab === 'generacion' && (
                    <div className="animate-fade-in">
                        <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <FileOutput size={20} className="text-primary" /> Generar Archivo de Cobros al Banco
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
                            <div className="input-group">
                                <label className="input-label">Entidad Bancaria / Empresa</label>
                                <select className="input-field">
                                    <option>Banco Popular Dominicano</option>
                                    <option>Banreservas</option>
                                    <option>Banco BHD</option>
                                    <option>Empresa Privada (Nómina)</option>
                                </select>
                            </div>
                            <div className="input-group">
                                <label className="input-label">Período de Corte</label>
                                <input type="month" className="input-field" defaultValue="2026-03" />
                            </div>
                            <div className="input-group">
                                <label className="input-label">Tipo de Archivo</label>
                                <select className="input-field">
                                    <option>TXT (Formato ACH)</option>
                                    <option>CSV (Separado por comas)</option>
                                    <option>XLSX (Excel)</option>
                                </select>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button className="btn btn-primary"><Download size={18} /> Generar y Descargar Archivo</button>
                            <button className="btn btn-secondary"><Filter size={18} /> Vista Previa de Registros</button>
                        </div>

                        <div style={{ marginTop: '2rem', background: '#f8fafc', padding: '1.5rem', borderRadius: '12px', border: '1px dashed var(--border)' }}>
                            <p style={{ color: 'var(--text-muted)', textAlign: 'center', margin: 0 }}>
                                Hay <strong>{cobros.length}</strong> registros pendientes de cobro domiciliado por un total estimado de <strong>{formatMoney(cobros.reduce((acc, c) => acc + Number(c.monto), 0))}</strong>.
                            </p>
                        </div>
                    </div>
                )}

                {activeTab === 'lectura' && (
                    <div className="animate-fade-in">
                        <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <FileSearch size={20} className="text-primary" /> Leer Respuesta del Banco
                        </h3>
                        <div style={{ border: '2px dashed var(--border)', borderRadius: '12px', padding: '4rem 2rem', textAlign: 'center', background: '#f8fafc', marginBottom: '2rem' }}>
                            <Upload size={48} style={{ color: 'var(--primary)', marginBottom: '1rem', opacity: 0.5 }} />
                            <h4 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Arrastra y suelta el archivo del banco aquí</h4>
                            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Soporta formatos .txt, .csv, .dat de los principales bancos.</p>
                            <button className="btn btn-secondary">Explorar Archivos</button>
                        </div>
                    </div>
                )}

                {activeTab === 'informe' && (
                    <div className="animate-fade-in">
                        <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <PieChart size={20} className="text-primary" /> Informe de Resultados de Cobro
                        </h3>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid var(--border)', textAlign: 'left' }}>
                                    <th style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>Referencia / Archivo</th>
                                    <th style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>Fecha Procesamiento</th>
                                    <th style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>Monto Total</th>
                                    <th style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>Exitosos</th>
                                    <th style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>Rechazados</th>
                                    <th style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>Estado</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                                    <td style={{ padding: '1rem', fontWeight: 600 }}>ACH_POP_022026.txt</td>
                                    <td style={{ padding: '1rem' }}>28/02/2026</td>
                                    <td style={{ padding: '1rem', fontWeight: 700 }}>$1,250,000.00</td>
                                    <td style={{ padding: '1rem', color: 'var(--success)' }}>450</td>
                                    <td style={{ padding: '1rem', color: 'var(--danger)' }}>12</td>
                                    <td style={{ padding: '1rem' }}><span className="badge" style={{ background: 'rgba(16,185,129,0.1)', color: 'var(--success)' }}>Completado</span></td>
                                </tr>
                                <tr>
                                    <td style={{ padding: '1rem', color: 'var(--text-muted)', textAlign: 'center' }} colSpan="6">
                                        No hay más informes recientes.
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                )}

                {activeTab === 'aplicar' && (
                    <div className="animate-fade-in">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                                <CheckCircle size={20} className="text-primary" /> Aplicar Deducciones Internas
                            </h3>
                            <button className="btn btn-primary" onClick={handleProcesar} disabled={procesando}>
                                <Play size={16} className={procesando ? 'spin' : ''} />
                                {procesando ? 'Aplicando...' : 'Ejecutar Aplicación Masiva'}
                            </button>
                        </div>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
                            Este proceso tomará el balance disponible en las cuentas de ahorro transaccional y lo aplicará para saldar deducciones programadas (ej. Cuotas de Préstamo, Aportaciones, Seguros).
                        </p>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                            <div style={{ padding: '1.5rem', border: '1px solid var(--border)', borderRadius: '12px' }}>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Deducciones Pendientes</div>
                                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-dark)' }}>{deducciones.length}</div>
                                <div style={{ fontSize: '0.85rem', color: 'var(--danger)', marginTop: '0.5rem' }}>Aplica para este período</div>
                            </div>
                            <div style={{ padding: '1.5rem', border: '1px solid var(--border)', borderRadius: '12px' }}>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Monto a Distribuir Est.</div>
                                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary)' }}>{formatMoney(deducciones.reduce((acc, d) => acc + Number(d.monto), 0))}</div>
                                <div style={{ fontSize: '0.85rem', color: 'var(--success)', marginTop: '0.5rem' }}>Basado en prioridades de orden</div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'orden' && (
                    <div className="animate-fade-in">
                        <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <ArrowDownCircle size={20} className="text-primary" /> Orden de Aplicación de Pagos
                        </h3>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
                            Define la prioridad en la que el sistema cobrará las deudas cuando haga la aplicación masiva desde la nómina o los ahorros disponibles.
                        </p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxWidth: '600px' }}>
                            {[
                                { id: 1, name: '1. Seguros de Vida y Préstamos', desc: 'Prioridad máxima legal' },
                                { id: 2, name: '2. Cuotas de Préstamos Vigentes', desc: 'Amortización de capital e intereses' },
                                { id: 3, name: '3. Aportaciones de Capital Social', desc: 'Cuota estatutaria obligatoria' },
                                { id: 4, name: '4. Ahorro San / Navideño', desc: 'Ahorro programado voluntario' },
                                { id: 5, name: '5. Otros Servicios Generales', desc: 'Farmacia, supermercado, etc.' },
                            ].map(item => (
                                <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: '#f8fafc', border: '1px solid var(--border)', borderRadius: '8px' }}>
                                    <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                                        {item.id}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 600 }}>{item.name}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.desc}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'nomina' && (
                    <div className="animate-fade-in">
                        <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Users size={20} className="text-primary" /> Acceso a Gestión de Nómina
                        </h3>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
                            La generación de deducciones se integra con el módulo de RRHH y Nómina.
                        </p>
                        <button className="btn btn-primary" onClick={() => window.location.href = '/nomina'}>
                            Ir al Módulo de Nómina
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CobrosYDeducciones;
