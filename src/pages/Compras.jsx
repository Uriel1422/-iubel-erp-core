import React, { useState } from 'react';
import { useCompras } from '../context/ComprasContext';
import { useCuentas } from '../context/CuentasContext';
import { useContactos } from '../context/ContactosContext';
import { ShoppingBag, CheckCircle, Trash2, PackagePlus, Edit2, Plus, PenSquare } from 'lucide-react';
import ConfirmModal from '../components/ConfirmModal';
import ArticuloFormModal from '../components/ArticuloFormModal';
import ProveedorModal from '../components/ProveedorModal';

const Compras = () => {
    const { compras, registrarCompra, eliminarCompra, actualizarCompra } = useCompras();
    const { cuentas } = useCuentas();
    const { contactos, agregarContacto, editarContacto } = useContactos();

    const proveedores = contactos.filter(c => c.tipo === 'Proveedor');

    // Estados Formulario de Compras (Modalidad Simplificada: Gasto Directo)
    const [proveedorId, setProveedorId] = useState('');
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
    const [facturaExenta, setFacturaExenta] = useState(false);
    const [itbisRetenido, setItbisRetenido] = useState(0);
    const [porcentajeIsr, setPorcentajeIsr] = useState(0);

    const [cuentaDestinoId, setCuentaDestinoId] = useState('');
    const [lineasAsiento, setLineasAsiento] = useState([]);
    const [mostrarAsientoDetalle, setMostrarAsientoDetalle] = useState(false);
    const [compraExitosa, setCompraExitosa] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [confirmDelete, setConfirmDelete] = useState({ open: false, id: null });
    const [showArticuloModal, setShowArticuloModal] = useState(false);
    const [showProveedorModal, setShowProveedorModal] = useState(false);
    const [proveedorEditData, setProveedorEditData] = useState(null);

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

    if (facturaExenta) {
        subtotalNum = montoIngresado;
        itbisAdelantado = 0;
    } else if (esItbisManual) {
        itbisAdelantado = Number(itbisManual) || 0;
        subtotalNum = Math.max(0, montoIngresado - itbisAdelantado);
    } else if (incluirItbis) {
        subtotalNum = montoIngresado / 1.18;
        itbisAdelantado = montoIngresado - subtotalNum;
    } else {
        subtotalNum = montoIngresado;
        itbisAdelantado = 0;
    }

    const totalGeneral = subtotalNum + itbisAdelantado;
    const isrRetenidoNum = subtotalNum * (Number(porcentajeIsr) / 100);
    const itbisRetenidoNum = Number(itbisRetenido) || 0;
    const netoAPagar = totalGeneral - itbisRetenidoNum - isrRetenidoNum;

    const generarAsientoSugerido = () => {
        if (!cuentaDestinoId) {
            alert("Seleccione primero la cuenta de destino del gasto.");
            return;
        }
        const cuentaPagoId = cuentaCreditoId || (condicion === 'Contado' ? '110101' : '210101');
        const sugerido = [
            { cuentaId: cuentaDestinoId, debito: subtotalNum, credito: 0, cuentaCodigo: cuentaDestinoId }
        ];
        
        if (itbisAdelantado > 0) {
            sugerido.push({ cuentaId: '110501', debito: itbisAdelantado, credito: 0, cuentaCodigo: '110501' });
        }
        
        sugerido.push({ cuentaId: cuentaPagoId, debito: 0, credito: netoAPagar, cuentaCodigo: cuentaPagoId });

        if (itbisRetenidoNum > 0) {
            sugerido.push({ cuentaId: '210401', debito: 0, credito: itbisRetenidoNum, cuentaCodigo: '210401', nombre: 'ITBIS Retenido por Pagar' });
        }
        if (isrRetenidoNum > 0) {
            sugerido.push({ cuentaId: '210501', debito: 0, credito: isrRetenidoNum, cuentaCodigo: '210501', nombre: 'ISR Retenido por Pagar' });
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
            proveedorId,
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
            itbisRetenido: itbisRetenidoNum,
            isrRetenido: isrRetenidoNum,
            total: totalGeneral,
            netoAPagar,
            facturaExenta
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
        setProveedorId('');
        setProveedorNombre('');
        setProveedorRnc('');
        setNcf('');
        setMontoInput('');
        setCuentaDestinoId('');
        setCuentaCreditoId('');
        setItbisRetenido(0);
        setPorcentajeIsr(0);
        setFacturaExenta(false);
    };

    const handleEdit = (compra) => {
        setEditingId(compra.id);
        setProveedorId(compra.proveedorId || '');
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
        setFacturaExenta(compra.facturaExenta || false);
        setItbisRetenido(compra.itbisRetenido || 0);
        
        let foundIsrPercent = 0;
        if (compra.subtotal > 0 && compra.isrRetenido > 0) {
            foundIsrPercent = Math.round((compra.isrRetenido / compra.subtotal) * 100);
        }
        setPorcentajeIsr(foundIsrPercent);

        // Scroll al formulario
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const cancelEdit = () => {
        setEditingId(null);
        setProveedorId('');
        setProveedorNombre('');
        setProveedorRnc('');
        setNcf('');
        setMontoInput('');
        setCuentaDestinoId('');
        setItbisRetenido(0);
        setPorcentajeIsr(0);
        setFacturaExenta(false);
    };

    const handleDeleteCompra = (id) => {
        setConfirmDelete({ open: true, id });
    };

    const handleSaveProveedor = (data) => {
        let savedContact = null;
        if (proveedorEditData) {
            editarContacto(proveedorEditData.id, data);
            savedContact = { ...proveedorEditData, ...data };
            alert("Proveedor actualizado con éxito.");
        } else {
            savedContact = agregarContacto({ ...data, tipo: 'Proveedor' });
            alert("Proveedor registrado con éxito.");
        }
        
        setProveedorId(savedContact.id);
        setProveedorNombre(savedContact.nombre);
        setProveedorRnc(savedContact.rnc || savedContact.cedula || '');
        if (savedContact.cuentaDefectoId) {
            setCuentaDestinoId(savedContact.cuentaDefectoId);
        }
        if (savedContact.tipoProveedor === 'Proveedor Informal') {
            setPorcentajeIsr(10);
        } else {
            setPorcentajeIsr(0);
        }
        
        setShowProveedorModal(false);
        setProveedorEditData(null);
    };

    const handleSelectProveedor = (e) => {
        const pId = e.target.value;
        setProveedorId(pId);
        if (pId) {
            const p = proveedores.find(x => x.id === pId);
            if (p) {
                setProveedorNombre(p.nombre);
                setProveedorRnc(p.rnc || p.cedula || '');
                if (p.cuentaDefectoId) {
                    setCuentaDestinoId(p.cuentaDefectoId);
                }
                // Si es proveedor informal (física), pre-configurar 10% ISR y 100% ITBIS retenido
                if (p.tipoProveedor === 'Proveedor Informal') {
                    setPorcentajeIsr(10);
                    // ITBIS se hará en UI si es que facturan ITBIS
                } else {
                    setPorcentajeIsr(0);
                }
            }
        } else {
            setProveedorNombre('');
            setProveedorRnc('');
            setPorcentajeIsr(0);
        }
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
                    cursor: 'crosshair',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    minHeight: '40px',
                    width: '120px',
                    perspective: '1000px'
                }}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <div style={{
                    position: 'absolute',
                    top: 0, left: 0, right: 0, bottom: 0,
                    display: 'flex', flexDirection: 'column', justifyContent: 'center',
                    transform: isHovered ? 'rotateX(90deg)' : 'rotateX(0)',
                    transformOrigin: 'bottom',
                    opacity: isHovered ? 0 : 1,
                    transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                    fontSize: '0.9rem',
                    fontWeight: 500,
                    backfaceVisibility: 'hidden'
                }}>
                    {new Date(fechaRegistro).toLocaleDateString()}
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '-2px' }}>Emisión Creada</div>
                </div>
                
                <div style={{
                    position: 'absolute',
                    top: 0, left: 0, right: 0, bottom: 0,
                    display: 'flex', flexDirection: 'column', justifyContent: 'center',
                    transform: isHovered ? 'rotateX(0)' : 'rotateX(-90deg)',
                    transformOrigin: 'top',
                    opacity: isHovered ? 1 : 0,
                    transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                    color: '#0ea5e9',
                    fontFamily: 'monospace',
                    textShadow: '0 0 8px rgba(14, 165, 233, 0.4)',
                    fontWeight: 800,
                    fontSize: '0.95rem',
                    backfaceVisibility: 'hidden'
                }}>
                    {fechaFactura ? new Date(fechaFactura).toLocaleDateString() : 'N/A'}
                    <div style={{ fontSize: '0.65rem', color: '#0ea5e9', letterSpacing: '1px', textTransform: 'uppercase', marginTop: '-2px' }}>F. Comprobante</div>
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
                {editingId && (
                    <div style={{ background: 'var(--accent-light)', color: 'var(--accent)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <strong>Modificando Factura de Compra</strong>
                        <button type="button" onClick={cancelEdit} className="btn" style={{ background: 'transparent', border: '1px solid var(--accent)', color: 'var(--accent)' }}>Cancelar y Limpiar</button>
                    </div>
                )}
                <form onSubmit={handleRegistrar}>
                    
                    {/* SELECTOR DE PROVEEDORES INTELIGENTE */}
                    <div style={{ background: 'var(--background)', padding: '1.25rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', border: '1px solid var(--border)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '1rem', marginBottom: '1rem' }}>
                            <div className="input-group" style={{ flex: 1, marginBottom: 0 }}>
                                <label className="input-label" style={{ fontWeight: 700, color: 'var(--primary)' }}>Buscar Proveedor Existente (Opcional)</label>
                                <select className="input-field" value={proveedorId} onChange={handleSelectProveedor}>
                                    <option value="">-- Seleccione un proveedor o ingrese datos manualmente debajo --</option>
                                    {proveedores.map(p => (
                                        <option key={p.id} value={p.id}>{p.nombre} (RNC: {p.rnc || p.cedula || 'N/A'})</option>
                                    ))}
                                </select>
                            </div>
                            <button type="button" className="btn btn-secondary" onClick={() => { setProveedorEditData(proveedorId ? proveedores.find(x=>x.id===proveedorId) : null); setShowProveedorModal(true); }} style={{ height: '42px', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                {proveedorId ? <><PenSquare size={16}/> Editar</> : <><Plus size={16}/> Nuevo Proveedor</>}
                            </button>
                        </div>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div className="input-group" style={{ marginBottom: 0 }}>
                                <label className="input-label">RNC o Cédula <span style={{color:'red'}}>*</span></label>
                                <input type="text" className="input-field" value={proveedorRnc} onChange={e => setProveedorRnc(e.target.value)} placeholder="Ej: 130123456" required />
                            </div>
                            <div className="input-group" style={{ marginBottom: 0 }}>
                                <label className="input-label">Nombre del Proveedor <span style={{color:'red'}}>*</span></label>
                                <input type="text" className="input-field" value={proveedorNombre} onChange={e => setProveedorNombre(e.target.value)} placeholder="Ej: Distribuidora Nacional" required />
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>

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
                        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(200px, 1fr) minmax(200px, 1fr) minmax(200px, 1fr)', gap: '1.5rem', alignItems: 'flex-start' }}>
                            {/* ITBIS Config */}
                            <div>
                                <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.75rem', textTransform: 'uppercase' }}>Configuración de ITBIS</h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <input type="checkbox" id="itbis_exento" checked={facturaExenta} onChange={e => { setFacturaExenta(e.target.checked); if (e.target.checked) { setIncluirItbis(false); setEsItbisManual(false); setItbisManual(''); setItbisRetenido(0); } }} style={{ width: '16px', height: '16px' }} />
                                        <label htmlFor="itbis_exento" style={{ fontWeight: 700, fontSize: '0.9rem', color: facturaExenta ? 'var(--danger)' : 'var(--text)' }}>Factura Exenta o No Transparente</label>
                                    </div>
                                    {!facturaExenta && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <input type="checkbox" id="itbis_auto" checked={incluirItbis} disabled={esItbisManual} onChange={e => setIncluirItbis(e.target.checked)} style={{ width: '16px', height: '16px' }} />
                                            <label htmlFor="itbis_auto" style={{ fontWeight: 500, fontSize: '0.9rem' }}>Incluir 18% automático</label>
                                        </div>
                                    )}
                                    {!facturaExenta && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <input type="checkbox" id="itbis_manual_toggle" checked={esItbisManual} onChange={e => { setEsItbisManual(e.target.checked); if(e.target.checked) setIncluirItbis(false); }} style={{ width: '16px', height: '16px' }} />
                                            <label htmlFor="itbis_manual_toggle" style={{ fontWeight: 500, fontSize: '0.9rem' }}>ITBIS Manual (Monto exacto)</label>
                                        </div>
                                    )}
                                    {esItbisManual && !facturaExenta && (
                                        <div className="input-group" style={{ marginTop: '0.5rem', marginBottom: 0 }}>
                                            <div style={{ position: 'relative' }}>
                                                <span style={{ position: 'absolute', left: '0.5rem', top: '0.4rem', color: 'var(--text-muted)' }}>$</span>
                                                <input type="number" step="0.01" className="input-field-mini" value={itbisManual} onChange={e => setItbisManual(e.target.value)} style={{ paddingLeft: '1.5rem', width: '100%' }} placeholder="0.00" />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Retenciones ISR */}
                            <div style={{ borderLeft: '1px solid var(--border)', paddingLeft: '1.5rem' }}>
                                <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.75rem', textTransform: 'uppercase' }}>Retención Autom. (ISR)</h4>
                                <div className="input-group" style={{ marginBottom: 0 }}>
                                    <select className="input-field-mini" value={porcentajeIsr} onChange={e => setPorcentajeIsr(e.target.value)} style={{ width: '100%', fontSize: '0.85rem' }}>
                                        <option value="0">Sin retención de ISR (0%)</option>
                                        <option value="2">2% - Honorarios Profesionales</option>
                                        <option value="10">10% - Físicas / Alquileres</option>
                                        <option value="1">1% - Otros (Intereses)</option>
                                    </select>
                                    {isrRetenidoNum > 0 && (
                                        <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', fontWeight: 700, color: 'var(--danger)' }}>
                                            Retenido: -{formatMoney(isrRetenidoNum)}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Retenciones ITBIS */}
                            <div style={{ borderLeft: '1px solid var(--border)', paddingLeft: '1.5rem' }}>
                                 <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.75rem', textTransform: 'uppercase' }}>Retención de ITBIS</h4>
                                 <div className="input-group" style={{ marginBottom: 0 }}>
                                    <label className="input-label" style={{ fontSize: '0.75rem' }}>Monto Retenido Exacto</label>
                                    <div style={{ position: 'relative' }}>
                                        <span style={{ position: 'absolute', left: '0.5rem', top: '0.4rem', color: 'var(--text-muted)' }}>$</span>
                                        <input type="number" step="0.01" className="input-field-mini" disabled={facturaExenta} value={itbisRetenido} onChange={e => setItbisRetenido(e.target.value)} style={{ paddingLeft: '1.5rem', width: '100%' }} placeholder="0.00" />
                                    </div>
                                </div>
                                {!facturaExenta && itbisAdelantado > 0 && (
                                    <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem' }}>
                                        <button type="button" onClick={() => setItbisRetenido((itbisAdelantado * 0.30).toFixed(2))} className="btn btn-secondary" style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem' }}>Sugerir 30%</button>
                                        <button type="button" onClick={() => setItbisRetenido((itbisAdelantado * 1).toFixed(2))} className="btn btn-secondary" style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem' }}>Sugerir 100%</button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Resumen Totales */}
                    <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-end', gap: '2rem', padding: '1.5rem', borderTop: '2px dashed var(--border)', background: 'var(--primary-light)', borderRadius: 'var(--radius-md)' }}>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Monto Gravado/Exento</div>
                            <div style={{ fontWeight: 600 }}>{formatMoney(subtotalNum)}</div>
                        </div>
                        {!facturaExenta && (
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>ITBIS Adelantado</div>
                                <div style={{ fontWeight: 600 }}>{formatMoney(itbisAdelantado)}</div>
                            </div>
                        )}
                        {(isrRetenidoNum > 0 || itbisRetenidoNum > 0) && (
                             <div style={{ textAlign: 'right', paddingLeft: '1rem', borderLeft: '1px solid var(--border)' }}>
                                 <div style={{ color: 'var(--danger)', fontSize: '0.875rem' }}>Retenciones (ISR/ITBIS)</div>
                                 <div style={{ fontWeight: 700, color: 'var(--danger)' }}>-{formatMoney(isrRetenidoNum + itbisRetenidoNum)}</div>
                             </div>
                        )}
                        <div style={{ textAlign: 'right', paddingLeft: '1rem', borderLeft: '2px solid var(--border)' }}>
                            <div style={{ color: 'var(--primary)', fontSize: '0.875rem', fontWeight: 700 }}>NETO A PAGAR/CXC</div>
                            <div style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '1.25rem' }}>{formatMoney(netoAPagar)}</div>
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
                                    <td style={{ padding: '1rem' }}><DateHover fechaRegistro={c.fechaRegistro} fechaFactura={c.fechaFactura} /></td>
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
            <ProveedorModal 
                isOpen={showProveedorModal} 
                onClose={() => setShowProveedorModal(false)}
                onSave={handleSaveProveedor}
                proveedorEdit={proveedorEditData}
            />
        </div>
    );
};

export default Compras;
