import React, { useState } from 'react';
import { useNomina } from '../context/NominaContext';
import { Users, Plus, Calculator, History, CheckCircle, FileText, Trash2 } from 'lucide-react';
import ConfirmModal from '../components/ConfirmModal';

const Nomina = () => {
    const { empleados, nominasProcesadas, procesarNominaMes, calcularDetalleNomina, agregarEmpleado, eliminarEmpleado, eliminarNomina } = useNomina();
    const [showEmpleadoModal, setShowEmpleadoModal] = useState(false);
    const [showProcesarModal, setShowProcesarModal] = useState(false);
    const [nuevoEmpleado, setNuevoEmpleado] = useState({ nombre: '', cargo: '', sueldo: 0, cedula: '' });
    const [mesSeleccionado, setMesSeleccionado] = useState(new Date().toLocaleString('default', { month: 'long', year: 'numeric' }));

    // Estados para Liquidación y Prestaciones
    const [showLiquidacionModal, setShowLiquidacionModal] = useState(false);
    const [calcLiq, setCalcLiq] = useState({ salario: 30000, anios: 1 });

    // Estados para Modales de Confirmación
    const [confirmDeleteEmp, setConfirmDeleteEmp] = useState({ open: false, id: null, name: '' });
    const [confirmDeleteNom, setConfirmDeleteNom] = useState({ open: false, id: null, mes: '' });

    const formatMoney = (amount) => {
        return new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP' }).format(amount);
    };

    const handleAddEmpleado = (e) => {
        e.preventDefault();
        agregarEmpleado({ ...nuevoEmpleado, sueldo: Number(nuevoEmpleado.sueldo) });
        setShowEmpleadoModal(false);
        setNuevoEmpleado({ nombre: '', cargo: '', sueldo: 0, cedula: '' });
    };

    const handleProcesar = () => {
        procesarNominaMes(mesSeleccionado);
        setShowProcesarModal(false);
    };

    const handleDeleteEmpleado = (id) => {
        const emp = empleados.find(e => e.id === id);
        setConfirmDeleteEmp({ open: true, id, name: emp?.nombre });
    };

    const confirmDeleteEmpleadoAction = () => {
        eliminarEmpleado(confirmDeleteEmp.id);
    };

    const handleDeleteNomina = (id) => {
        const nom = nominasProcesadas.find(n => n.id === id);
        setConfirmDeleteNom({ open: true, id, mes: nom?.mes });
    };

    const confirmDeleteNominaAction = () => {
        eliminarNomina(confirmDeleteNom.id);
    };

    return (
        <div className="animate-up">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                <div>
                    <h1 className="page-title" style={{ marginBottom: '0.25rem' }}>Nómina Dominicana (TSS / ISR)</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Gestión de empleados, cálculos de seguridad social e impuestos sobre la renta.</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button className="btn btn-secondary" style={{ background: 'var(--success)', borderColor: 'var(--success)', color: 'white' }} onClick={() => useNomina().exportarTSS()}>
                        <FileText size={18} /> Reporte TSS (CSV)
                    </button>
                    <button className="btn btn-secondary" onClick={() => setShowLiquidacionModal(true)}>
                        <Calculator size={18} /> Calculadora de Liquidación
                    </button>
                    <button className="btn btn-secondary" onClick={() => setShowEmpleadoModal(true)}>
                        <Plus size={18} /> Nuevo Empleado
                    </button>
                    <button className="btn btn-primary" onClick={() => setShowProcesarModal(true)}>
                        <Calculator size={18} /> Procesar Nómina
                    </button>
                </div>
            </div>

            {/* Resumen de Empleados */}
            <div className="card" style={{ marginBottom: '2.5rem' }}>
                <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Users size={20} color="var(--primary)" /> Lista de Colaboradores
                </h2>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
                                <th style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Nombre / Cédula</th>
                                <th style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Cargo</th>
                                <th style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', textAlign: 'right' }}>Sueldo Bruto</th>
                                <th style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', textAlign: 'right' }}>Deducciones (L)</th>
                                <th style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', textAlign: 'right' }}>Neto</th>
                                <th style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', textAlign: 'right' }}>Costo Empresa</th>
                                <th style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', textAlign: 'center' }}>X</th>
                            </tr>
                        </thead>
                        <tbody>
                            {empleados.map(emp => {
                                const calcs = calcularDetalleNomina(emp);
                                return (
                                    <tr key={emp.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                        <td style={{ padding: '1rem' }}>
                                            <div style={{ fontWeight: 600 }}>{emp.nombre}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{emp.cedula}</div>
                                        </td>
                                        <td style={{ padding: '1rem' }}>{emp.cargo}</td>
                                        <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 500 }}>{formatMoney(emp.sueldo)}</td>
                                        <td style={{ padding: '1rem', textAlign: 'right', color: 'var(--danger)', fontSize: '0.85rem' }}>
                                            {formatMoney(calcs.afp + calcs.sfs + calcs.isr)}
                                        </td>
                                        <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 700, color: 'var(--success)' }}>{formatMoney(calcs.sueldoNeto)}</td>
                                        <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 600, color: 'var(--primary)' }}>{formatMoney(calcs.costoTotalEmpresa)}</td>
                                        <td style={{ padding: '1rem', textAlign: 'center' }}>
                                            <button
                                                className="btn"
                                                style={{ padding: '0.25rem', color: 'var(--danger)' }}
                                                onClick={() => handleDeleteEmpleado(emp.id)}
                                                title="Eliminar Colaborador"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Historial de Nóminas */}
            <div className="card" style={{ marginBottom: '2.5rem' }}>
                <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <History size={20} color="var(--primary)" /> Historial de Nóminas Procesadas
                </h2>
                {nominasProcesadas.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                        No se han procesado nóminas aún. Clique en "Procesar Nómina" para generar el primer periodo.
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                        {nominasProcesadas.map(nom => (
                            <div key={nom.id} className="glass" style={{ padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                    <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>{nom.mes}</span>
                                    <span className="badge badge-success">Pagada</span>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                                        <span>Total Sueldos:</span>
                                        <span style={{ fontWeight: 600 }}>{formatMoney(nom.totales.totalSueldos)}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                                        <span>Gasto Patronal:</span>
                                        <span style={{ fontWeight: 600, color: 'var(--primary)' }}>{formatMoney(nom.totales.totalPatronal)}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                                        <span>Total Retenciones:</span>
                                        <span style={{ fontWeight: 600, color: 'var(--danger)' }}>{formatMoney(nom.totales.totalAFP + nom.totales.totalSFS + nom.totales.totalISR)}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem', marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border)' }}>
                                        <span style={{ fontWeight: 700 }}>Total Pagado (Neto):</span>
                                        <span style={{ fontWeight: 700, color: 'var(--primary)' }}>{formatMoney(nom.totales.totalNeto)}</span>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button className="btn btn-secondary" style={{ flex: 1, gap: '0.5rem' }}>
                                        <FileText size={16} /> Volantes
                                    </button>
                                    <button
                                        className="btn btn-secondary"
                                        style={{ color: 'var(--danger)', padding: '0.5rem' }}
                                        onClick={() => handleDeleteNomina(nom.id)}
                                        title="Eliminar Nómina"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal Calculadora de Liquidación (Nuevo Feature Premium) */}
            {showLiquidacionModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
                    <div className="card glass" style={{ width: '100%', maxWidth: '600px' }}>
                        <h2 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Calculator size={24} color="var(--primary)" /> Calculadora de Prestaciones (RD)
                        </h2>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div className="input-group">
                                <label className="input-label">Salario Mensual</label>
                                <input type="number" className="input-field" value={calcLiq.salario} onChange={e => setCalcLiq({ ...calcLiq, salario: e.target.value })} />
                            </div>
                            <div className="input-group">
                                <label className="input-label">Años de Servicio</label>
                                <input type="number" className="input-field" value={calcLiq.anios} onChange={e => setCalcLiq({ ...calcLiq, anios: e.target.value })} />
                            </div>
                        </div>
                        <div style={{ background: 'var(--primary-light)', padding: '1rem', borderRadius: '8px', marginTop: '1rem' }}>
                            <h4 style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.5rem' }}>Resultados Estimados</h4>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.9rem' }}>
                                <span>Preaviso (28 días):</span> <span style={{ textAlign: 'right', fontWeight: 600 }}>{formatMoney((calcLiq.salario / 23.83) * 28)}</span>
                                <span>Cesantía (21 d/año):</span> <span style={{ textAlign: 'right', fontWeight: 600 }}>{formatMoney(((calcLiq.salario / 23.83) * 21) * calcLiq.anios)}</span>
                                <span>Vacaciones (14 días):</span> <span style={{ textAlign: 'right', fontWeight: 600 }}>{formatMoney((calcLiq.salario / 23.83) * 14)}</span>
                                <div style={{ gridColumn: '1 / -1', borderTop: '1px solid var(--border)', marginTop: '0.5rem', paddingTop: '0.5rem', display: 'flex', justifyContent: 'space-between', fontWeight: 800 }}>
                                    <span>TOTAL LIQUIDACIÓN:</span>
                                    <span style={{ color: 'var(--primary)' }}>{formatMoney(((calcLiq.salario / 23.83) * 28) + (((calcLiq.salario / 23.83) * 21) * calcLiq.anios) + ((calcLiq.salario / 23.83) * 14))}</span>
                                </div>
                            </div>
                        </div>
                        <button className="btn btn-secondary" style={{ width: '100%', marginTop: '1.5rem' }} onClick={() => setShowLiquidacionModal(false)}>Cerrar</button>
                    </div>
                </div>
            )}

            {/* Modal Nuevo Empleado */}
            {showEmpleadoModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
                    <div className="card" style={{ width: '100%', maxWidth: '500px' }}>
                        <h2 style={{ marginBottom: '1.5rem' }}>Agregar Nuevo Colaborador</h2>
                        <form onSubmit={handleAddEmpleado}>
                            <div className="input-group">
                                <label className="input-label">Nombre Completo</label>
                                <input type="text" className="input-field" required value={nuevoEmpleado.nombre} onChange={e => setNuevoEmpleado({ ...nuevoEmpleado, nombre: e.target.value })} />
                            </div>
                            <div className="input-group">
                                <label className="input-label">Cédula</label>
                                <input type="text" className="input-field" required value={nuevoEmpleado.cedula} onChange={e => setNuevoEmpleado({ ...nuevoEmpleado, cedula: e.target.value })} />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="input-group">
                                    <label className="input-label">Cargo</label>
                                    <input type="text" className="input-field" required value={nuevoEmpleado.cargo} onChange={e => setNuevoEmpleado({ ...nuevoEmpleado, cargo: e.target.value })} />
                                </div>
                                <div className="input-group">
                                    <label className="input-label">Sueldo Bruto (Mensual)</label>
                                    <input type="number" className="input-field" required value={nuevoEmpleado.sueldo} onChange={e => setNuevoEmpleado({ ...nuevoEmpleado, sueldo: e.target.value })} />
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowEmpleadoModal(false)}>Cancelar</button>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Guardar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Procesar Nómina */}
            {showProcesarModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
                    <div className="card" style={{ width: '100%', maxWidth: '400px', textAlign: 'center' }}>
                        <Calculator size={48} color="var(--primary)" style={{ margin: '0 auto 1.5rem auto' }} />
                        <h2 style={{ marginBottom: '1rem' }}>Procesar Nómina</h2>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Se generarán los asientos contables y las retenciones de ley para todos los empleados activos.</p>
                        <div className="input-group">
                            <label className="input-label">Periodo (Mes/Año)</label>
                            <input type="text" className="input-field" value={mesSeleccionado} onChange={e => setMesSeleccionado(e.target.value)} />
                        </div>
                        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                            <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowProcesarModal(false)}>Cancelar</button>
                            <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleProcesar}>Confirmar y Pagar</button>
                        </div>
                    </div>
                </div>
            )}
            {/* Modales de Confirmación */}
            <ConfirmModal
                isOpen={confirmDeleteEmp.open}
                onClose={() => setConfirmDeleteEmp({ ...confirmDeleteEmp, open: false })}
                onConfirm={confirmDeleteEmpleadoAction}
                title="Eliminar Colaborador"
                message={`¿Está seguro de que desea eliminar a '${confirmDeleteEmp.name}'? Esta acción es permanente y no se puede deshacer.`}
            />

            <ConfirmModal
                isOpen={confirmDeleteNom.open}
                onClose={() => setConfirmDeleteNom({ ...confirmDeleteNom, open: false })}
                onConfirm={confirmDeleteNominaAction}
                title="Eliminar Registro de Nómina"
                message={`¿Está seguro de que desea eliminar el registro de nómina del periodo '${confirmDeleteNom.mes}'?`}
            />
        </div>
    );
};

export default Nomina;
