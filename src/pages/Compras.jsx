import React, { useState } from 'react';
import { useCompras } from '../context/ComprasContext';
import { useCuentas } from '../context/CuentasContext';
import { useContactos } from '../context/ContactosContext';
import { ShoppingBag, CheckCircle, Trash2, PackagePlus, Edit2 } from 'lucide-react';
import ConfirmModal from '../components/ConfirmModal';
import ArticuloFormModal from '../components/ArticuloFormModal';

const Compras = () => {
    const { compras, registrarCompra, eliminarCompra, actualizarCompra } = useCompras();
    const { cuentas } = useCuentas();
    const { contactos } = useContactos();

    const proveedores = contactos.filter(c => c.tipo === 'Proveedor');

    // Estados Formulario de Compras (Modalidad Simplificada: Gasto Directo)
    const [proveedorNombre, setProveedorNombre] = useState('');
    const [proveedorRnc, setProveedorRnc] = useState('');
    const [ncf, setNcf] = useState('');
    const [tipoGasto, setTipoGasto] = useState('02'); // 02: Gastos por Trabajos/Servicios, 09: Compras e Inversiones
    const [condicion, setCondicion] = useState('Contado');
    const [fechaFactura, setFechaFactura] = useState(new Date().toISOString().split('T')[0]);

    const [montoInput, setMontoInput] = useState('');
    const [itbisManual, setItbisManual] = useState('');
    const [esItbisManual, setEsItbisManual] = useState(false);
    const [incluirItbis, setIncluirItbis] = useState(true);
    const [cuentaDestinoId, setCuentaDestinoId] = useState('');
    const [lineasAsiento, setLineasAsiento] = useState([]);
    const [mostrarAsientoDetalle, setMostrarAsientoDetalle] = useState(false);
    const [compraExitosa, setCompraExitosa] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [confirmDelete, setConfirmDelete] = useState({ open: false, id: null });
    const [showArticuloModal, setShowArticuloModal] = useState(false);

    const [cuentaCreditoId, setCuentaCreditoId] = useState('');

    const cuentasCredito = cuentas.filter(c =>
        c.activa &&
        c.subtipo === 'Cuenta Detalle' &&
        (c.codigo.startsWith('1101') || c.codigo.startsWith('2101') || c.codigo.startsWith('2'))
    );

    const cuentasGastoActivo = cuentas.filter(c =>
        c.activa &&
        c.subtipo === 'Cuenta Detalle' &&
        (c.codigo.startsWith('6') || c.codigo.startsWith('1'))
    );

    const formatMoney = (amount) => {
        return new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP' }).format(amount || 0);
    };

    const prevCompras = compras; // snapshot

    // Lógica Inversa: El usuario ingresa el Total. Extraemos el Subtotal y el ITBIS.
    const montoIngresado = Number(montoInput) || 0;
    
    let subtotalNum = 0;
    let itbisAdelantado = 0;

    if (esItbisManual) {
        // Si es manual, el comprobante físico dicta el ITBIS. El subtotal es la diferencia.
        itbisAdelantado = Number(itbisManual) || 0;
        subtotalNum = Math.max(0, montoIngresado - itbisAdelantado);
    } else if (incluirItbis) {
        // Extracción inversa (Total = Subtotal + 18% -> Subtotal = Total / 1.18)
        subtotalNum = montoIngresado / 1.18;
        itbisAdelantado = montoIngresado - subtotalNum;
    } else {
        // Exento
        subtotalNum = montoIngresado;
        itbisAdelantado = 0;
    }

    const totalGeneral = subtotalNum + itbisAdelantado;

    const generarAsientoSugerido = () => {
        if (!cuentaDestinoId) {
            alert("Seleccione primero la cuenta de destino del gasto.");
            return;
        }
        const cuentaPagoId = cuentaCreditoId || (condicion === 'Contado' ? '110101' : '210101');
        const sugerido = [
            { cuentaId: cuentaPagoId, debito: 0, credito: totalGeneral, cuentaCodigo: cuentaPagoId },
            { cuentaId: cuentaDestinoId, debito: subtotalNum, credito: 0, cuentaCodigo: cuentaDestinoId }
        ];
        if (itbisAdelantado > 0) {
            sugerido.push({ cuentaId: '110501', debito: itbisAdelantado, credito: 0, cuentaCodigo: '110501' });
        }
        setLineasAsiento(sugerido);
        setMostrarAsientoDetalle(true);
    };

    const handleRegistrar = (e) => {
        if (e && e.preventDefault) e.preventDefault();
        if (!cuentaDestinoId) {
            alert("Debe seleccionar una cuenta contable de destino para el gasto/compra.");
            return;
        }
        if (subtotalNum <= 0) {
            alert("El monto (subtotal) debe ser mayor a 0.");
            return;
        }

        const dataCompra = {
            proveedorNombre: proveedorNombre || 'Proveedor Genérico',
            proveedorRnc,
            ncf,
            fechaFactura,
            tipoGasto,
            condicion,
            cuentaDestinoId,
            cuentaCreditoId: cuentaCreditoId || (condicion === 'Contado' ? '110101' : '210101'),
            subtotal: subtotalNum,
            itbis: itbisAdelantado,
            total: totalGeneral
        };

        if (editingId) {
            actualizarCompra(editingId, dataCompra);
            setEditingId(null);
            alert("Compra actualizada con éxito.");
        } else {
            const compraRegistrada = registrarCompra(dataCompra, mostrarAsientoDetalle ? lineasAsiento : null);
            setCompraExitosa(compraRegistrada);
        }

        // Reset simple
        setProveedorNombre('');
        setProveedorRnc('');
        setNcf('');
        setMontoInput('');
        setCuentaDestinoId('');
        setCuentaCreditoId('');
    };

    const handleEdit = (compra) => {
        setEditingId(compra.id);
        setProveedorNombre(compra.proveedorNombre);
        setProveedorRnc(compra.proveedorRnc || '');
        setNcf(compra.ncf || '');
        setFechaFactura(compra.fechaFactura || new Date(compra.fechaRegistro).toISOString().split('T')[0]);
        setTipoGasto(compra.tipoGasto || '02');
        setCondicion(compra.condicion || 'Contado');
        setCuentaDestinoId(compra.cuentaDestinoId || '');
        setCuentaCreditoId(compra.cuentaCreditoId || '');
        // Al editar, cargamos el total como input porque esa es la nueva lógica
        setMontoInput(compra.total.toString());
        setIncluirItbis(compra.itbis > 0);

        // Scroll al formulario
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    
    // ... stays same until return

    const cancelEdit = () => {
        setEditingId(null);
        setProveedorNombre('');
        setProveedorRnc('');
        setNcf('');
        setMontoInput('');
        setCuentaDestinoId('');
    };

    const handleDeleteCompra = (id) => {
        setConfirmDelete({ open: true, id });
    };

    const confirmDeleteAction = () => {
        if (confirmDelete.id) {
            eliminarCompra(confirmDelete.id);
            setConfirmDelete({ open: false, id: null });
        }
    };

    const DateHover = ({ fechaRegistro, fechaFactura }) => {
        const [isHovered, setIsHovered] = useState(false);
        return (
            <div 
                style={{ 
                    position: 'relative', 
                    cursor: 'help',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    minHeight: '40px',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <div style={{
                    transform: isHovered ? 'translateY(-5px) scale(0.95)' : 'translateY(0)',
                    opacity: isHovered ? 0 : 1,
                    transition: '0.3s',
                    fontSize: '0.9rem',
                    fontWeight: 500
                }}>
                    {new Date(fechaRegistro).toLocaleDateString()}
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '-2px' }}>Emisión</div>
                </div>
                
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    transform: isHovered ? 'translateY(0)' : 'translateY(5px)',
                    opacity: isHovered ? 1 : 0,
                    transition: '0.3s',
                    color: 'var(--primary)',
                    fontWeight: 700,
                    fontSize: '0.9rem'
                }}>
                    {new Date(fechaFactura).toLocaleDateString()}
                    <div style={{ fontSize: '0.65rem', color: 'var(--primary)', opacity: 0.7, marginTop: '-2px' }}>Comprobante</div>
                </div>
            </div>
        );
    };

    if (compraExitosa) {
        // ... (previous success view)
    }

    return (
        <div>
            {/* Header stays same */}
            {/* Form */}
            <div className="card" style={{ maxWidth: '800px', margin: '0 auto' }}>
                <form onSubmit={handleRegistrar}>
                    {/* ... initial form parts ... */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                        {/* ... RNC, Nombre, NCF, Fecha, Tipo ... */}
                        <div className="input-group">
                            <label className="input-label">RNC o Cédula (Proveedor)</label>
                            <input type="text" className="input-field" value={proveedorRnc} onChange={e => setProveedorRnc(e.target.value)} placeholder="Ej: 130123456" required />
                        </div>
                        <div className="input-group">
                            <label className="input-label">Nombre del Proveedor</label>
                            <input type="text" className="input-field" value={proveedorNombre} onChange={e => setProveedorNombre(e.target.value)} placeholder="Ej: Distribuidora Nacional" required />
                        </div>

                        <div className="input-group">
                            <label className="input-label">NCF Recibido</label>
                            <input type="text" className="input-field" value={ncf} onChange={e => setNcf(e.target.value)} placeholder="B01... (Debe ser un NCF válido)" required maxLength="11" />
                        </div>
                        <div className="input-group">
                            <label className="input-label">Fecha de Comprobante (Física)</label>
                            <input type="date" className="input-field" value={fechaFactura} onChange={e => setFechaFactura(e.target.value)} required />
                        </div>

                        <div className="input-group">
                            <label className="input-label">Tipo de Gasto (DGII)</label>
                            <select className="input-field" value={tipoGasto} onChange={e => setTipoGasto(e.target.value)}>
                                <option value="02">02 - Gastos por Trabajos, Suministros y Servicios</option>
                                <option value="09">09 - Compras e Inversiones que forman parte del Costo</option>
                                <option value="11">11 - Gastos de Representación</option>
                            </select>
                        </div>
                        <div className="input-group">
                            <label className="input-label">Condición de Pago</label>
                            <select className="input-field" value={condicion} onChange={e => setCondicion(e.target.value)}>
                                <option value="Contado">Al Contado (Caja/Bancos)</option>
                                <option value="Credito">A Crédito (Cuentas por Pagar Proveedores)</option>
                            </select>
                        </div>
                    </div>

                    {/* New Field: Cuenta Credito */}
                    <div style={{ background: 'var(--accent-light)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', border: '1px solid var(--accent)' }}>
                        <label className="input-label" style={{ color: 'var(--accent)', fontWeight: 700 }}>CUENTA DE PAGO / ORIGEN (CRÉDITO)</label>
                        <select className="input-field" value={cuentaCreditoId} onChange={e => setCuentaCreditoId(e.target.value)} required>
                            <option value="">-- ¿Desde dónde sale el dinero / deuda? --</option>
                            {cuentasCredito.map(c => <option key={c.id} value={c.id}>{c.codigo} - {c.nombre}</option>)}
                        </select>
                        <p style={{ fontSize: '0.75rem', color: 'var(--accent)', marginTop: '0.4rem' }}>* {condicion === 'Contado' ? 'Se recomienda una cuenta de Caja o Banco (1101...)' : 'Se recomienda una cuenta de Pasivo/CXP (2101...)'}</p>
                    </div>

                    {/* Classification and amounts */}
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
                        <div className="input-group">
                            <label className="input-label">Cuenta Destino (Débito)</label>
                            <select className="input-field" value={cuentaDestinoId} onChange={e => setCuentaDestinoId(e.target.value)} required>
                                <option value="">-- Seleccione a qué cuenta de Gasto/Activo pertenece --</option>
                                {cuentasGastoActivo.map(c => <option key={c.id} value={c.id}>{c.codigo} - {c.nombre}</option>)}
                            </select>
                        </div>

                        <div className="input-group">
                            <label className="input-label">Monto Total Facturado (ITBIS incluido)</label>
                            <div style={{ position: 'relative' }}>
                                <span style={{ position: 'absolute', left: '0.75rem', top: '0.5rem', color: 'var(--text-muted)' }}>$</span>
                                <input required type="number" step="0.01" min="0" className="input-field" value={montoInput} onChange={e => setMontoInput(e.target.value)} style={{ paddingLeft: '1.5rem', width: '100%' }} />
                            </div>
                        </div>
                    </div>

                    {/* Rest of the form stays same */}
                    {/* ... ITBIS toggles, Totals, Asiento Edit, Buttons ... */}

                    <div style={{ background: 'var(--background)', padding: '1rem', borderRadius: 'var(--radius-md)', marginTop: '1.5rem', border: '1px solid var(--border)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <input type="checkbox" id="itbis_auto" checked={incluirItbis} disabled={esItbisManual} onChange={e => setIncluirItbis(e.target.checked)} style={{ width: '18px', height: '18px' }} />
                                <label htmlFor="itbis_auto" style={{ fontWeight: 500, fontSize: '0.9rem' }}>Incluir ITBIS (18%) automático</label>
                            </div>
                            
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderLeft: '1px solid var(--border)', paddingLeft: '2rem' }}>
                                <input type="checkbox" id="itbis_manual_toggle" checked={esItbisManual} onChange={e => setEsItbisManual(e.target.checked)} style={{ width: '18px', height: '18px' }} />
                                <label htmlFor="itbis_manual_toggle" style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '0.9rem' }}>Ingresar ITBIS Manualmente</label>
                            </div>
                        </div>

                        {esItbisManual && (
                            <div className="input-group" style={{ marginTop: '1rem', maxWidth: '300px' }}>
                                <label className="input-label">Monto ITBIS Exacto</label>
                                <div style={{ position: 'relative' }}>
                                    <span style={{ position: 'absolute', left: '0.75rem', top: '0.5rem', color: 'var(--text-muted)' }}>$</span>
                                    <input type="number" step="0.01" className="input-field" value={itbisManual} onChange={e => setItbisManual(e.target.value)} style={{ paddingLeft: '1.5rem' }} placeholder="0.00" />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Resumen Totales */}
                    <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end', gap: '3rem', padding: '1.5rem', borderTop: '2px dashed var(--border)', background: 'var(--primary-light)', borderRadius: 'var(--radius-md)' }}>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Monto Gravado/Exento</div>
                            <div style={{ fontWeight: 600 }}>{formatMoney(subtotalNum)}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>ITBIS Adelantado</div>
                            <div style={{ fontWeight: 600 }}>{formatMoney(itbisAdelantado)}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ color: 'var(--primary)', fontSize: '0.875rem', fontWeight: 700 }}>Total Factura</div>
                            <div style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '1.25rem' }}>{formatMoney(totalGeneral)}</div>
                        </div>
                    </div>

                    {/* Edición de Asiento Previa */}
                    {mostrarAsientoDetalle && (
                        <div style={{ marginTop: '2rem', background: '#fffbeb', padding: '1.5rem', borderRadius: '12px', border: '1px solid #fde68a' }}>
                            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', color: '#92400e', display: 'flex', justifyContent: 'space-between' }}>
                                <span>Previsualización de Asiento Contable (Ajuste Manual)</span>
                                <button type="button" onClick={() => setMostrarAsientoDetalle(false)} style={{ fontSize: '0.75rem', background: 'none', border: 'none', color: '#b45309', cursor: 'pointer' }}>Usar Automático</button>
                            </h3>
                            <table style={{ width: '100%', fontSize: '0.9rem' }}>
                                <thead>
                                    <tr style={{ textAlign: 'left' }}>
                                        <th>Cuenta</th>
                                        <th style={{ textAlign: 'right' }}>Débito</th>
                                        <th style={{ textAlign: 'right' }}>Crédito</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {lineasAsiento.map((linea, idx) => {
                                        const c = cuentas.find(acc => acc.id === linea.cuentaId);
                                        return (
                                            <tr key={idx} style={{ borderTop: '1px solid #fef3c7' }}>
                                                <td style={{ padding: '0.5rem 0' }}>
                                                    <select 
                                                        value={linea.cuentaId} 
                                                        className="input-field-mini" 
                                                        style={{ width: '100%', fontSize: '0.8rem' }}
                                                        onChange={e => {
                                                            const newLines = [...lineasAsiento];
                                                            newLines[idx].cuentaId = e.target.value;
                                                            newLines[idx].cuentaCodigo = e.target.value;
                                                            setLineasAsiento(newLines);
                                                        }}
                                                    >
                                                        {cuentas.filter(acc => acc.subtipo === 'Cuenta Detalle').map(acc => (
                                                            <option key={acc.id} value={acc.id}>{acc.codigo} - {acc.nombre}</option>
                                                        ))}
                                                    </select>
                                                </td>
                                                <td>
                                                    <input 
                                                        type="number" 
                                                        className="input-field-mini" 
                                                        style={{ width: '100%', textAlign: 'right' }} 
                                                        value={linea.debito} 
                                                        onChange={e => {
                                                            const newLines = [...lineasAsiento];
                                                            newLines[idx].debito = Number(e.target.value) || 0;
                                                            setLineasAsiento(newLines);
                                                        }}
                                                    />
                                                </td>
                                                <td>
                                                    <input 
                                                        type="number" 
                                                        className="input-field-mini" 
                                                        style={{ width: '100%', textAlign: 'right' }} 
                                                        value={linea.credito} 
                                                        onChange={e => {
                                                            const newLines = [...lineasAsiento];
                                                            newLines[idx].credito = Number(e.target.value) || 0;
                                                            setLineasAsiento(newLines);
                                                        }}
                                                    />
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                                <tfoot>
                                    <tr style={{ fontWeight: 800 }}>
                                        <td style={{ textAlign: 'right', padding: '0.5rem' }}>TOTALES:</td>
                                        <td style={{ textAlign: 'right' }}>{formatMoney(lineasAsiento.reduce((a,b)=>a+b.debito,0))}</td>
                                        <td style={{ textAlign: 'right' }}>{formatMoney(lineasAsiento.reduce((a,b)=>a+b.credito,0))}</td>
                                    </tr>
                                </tfoot>
                            </table>
                            <p style={{ fontSize: '0.75rem', marginTop: '0.5rem', fontStyle: 'italic', color: '#92400e' }}>* Puede cambiar las cuentas o los montos. Asegúrese de que el asiento esté cuadrado.</p>
                        </div>
                    )}

                    <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
                        {!mostrarAsientoDetalle && (
                            <button type="button" className="btn btn-secondary" onClick={generarAsientoSugerido} style={{ flex: 1, padding: '1rem', border: '1px solid var(--primary)', color: 'var(--primary)' }}>
                                <Edit2 size={18} /> Modificar Asiento Manualmente
                            </button>
                        )}
                        <button type="submit" className="btn btn-primary" style={{ flex: 2, fontSize: '1.125rem', padding: '1rem' }}>
                            {editingId ? 'Guardar Cambios' : 'Registrar Compra / Gasto'}
                        </button>
                    </div>
                </form>
            </div>

            <div className="card" style={{ marginTop: '2rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
                    Historial de Compras (Recientes)
                </h2>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead style={{ backgroundColor: 'var(--background)' }}>
                            <tr>
                                <th style={{ padding: '1rem', borderBottom: '2px solid var(--border)' }}>N° Interno</th>
                                <th style={{ padding: '1rem', borderBottom: '2px solid var(--border)' }}>Fecha</th>
                                <th style={{ padding: '1rem', borderBottom: '2px solid var(--border)' }}>Proveedor</th>
                                <th style={{ padding: '1rem', borderBottom: '2px solid var(--border)' }}>NCF</th>
                                <th style={{ padding: '1rem', borderBottom: '2px solid var(--border)', textAlign: 'right' }}>Total (DOP)</th>
                                <th style={{ padding: '1rem', borderBottom: '2px solid var(--border)', textAlign: 'center' }}>Acción</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[...compras].reverse().slice(0, 10).map((c) => (
                                <tr key={c.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                    <td style={{ padding: '1rem', fontWeight: 500, color: 'var(--primary)' }}>{c.numeroInterno}</td>
                                    <td style={{ padding: '1rem' }}>{new Date(c.fechaRegistro).toLocaleDateString()}</td>
                                    <td style={{ padding: '1rem' }}>{c.proveedorNombre}</td>
                                    <td style={{ padding: '1rem' }}>{c.ncf}</td>
                                    <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 600 }}>{formatMoney(c.total)}</td>
                                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                                            <button
                                                className="btn"
                                                style={{ padding: '0.25rem', color: 'var(--primary)' }}
                                                onClick={() => handleEdit(c)}
                                                title="Editar Compra"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                className="btn"
                                                style={{ padding: '0.25rem', color: 'var(--danger)' }}
                                                onClick={() => handleDeleteCompra(c.id)}
                                                title="Revertir y Eliminar Compra"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {compras.length === 0 && (
                                <tr>
                                    <td colSpan="6" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                        Aún no hay compras registradas en el sistema local.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <ConfirmModal
                isOpen={confirmDelete.open}
                onClose={() => setConfirmDelete({ open: false, id: null })}
                onConfirm={confirmDeleteAction}
                title="❌ Eliminar Compra/Gasto"
                message="¿Está seguro de que desea eliminar permanentemente esta compra? Esto revertirá automáticamente el stock de inventario asignado y anulará el Asiento Contable generado en el Diario."
            />
            <ArticuloFormModal
                isOpen={showArticuloModal}
                onClose={() => setShowArticuloModal(false)}
            />
        </div>
    );
};

export default Compras;
