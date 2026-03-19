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
    const [diasVencimiento, setDiasVencimiento] = useState('');

    // Calcula la fecha de vencimiento automáticamente según los días ingresados
    const fechaVencimientoCalc = (() => {
        if (!diasVencimiento || condicion === 'Contado') return null;
        const base = new Date(fechaFactura + 'T00:00:00');
        base.setDate(base.getDate() + parseInt(diasVencimiento, 10));
        return base;
    })();
    const diasRestantes = fechaVencimientoCalc ? Math.ceil((fechaVencimientoCalc - new Date()) / 86400000) : null;

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
    const [detalles, setDetalles] = useState('');
    const [confirmDelete, setConfirmDelete] = useState({ open: false, id: null });
    const [showArticuloModal, setShowArticuloModal] = useState(false);
    const [showProveedorModal, setShowProveedorModal] = useState(false);
    const [proveedorEditData, setProveedorEditData] = useState(null);

    const [cuentaCreditoId, setCuentaCreditoId] = useState('');

    // Auto-generación de asiento en tiempo real (Elite Experience)
    React.useEffect(() => {
        if (montoInput > 0 && !editingId) {
            // Auto-generar si el usuario cambia el monto, pero solo si aún no está modificado intensamente por el usuario
            // O simplemente auto-inicializarlo
            const timeout = setTimeout(() => {
                generarAsientoSugerido();
            }, 500);
            return () => clearTimeout(timeout);
        }
    }, [montoInput, incluirItbis, facturaExenta, esItbisManual, itbisManual, porcentajeIsr, itbisRetenido, condicion, cuentaDestinoId, cuentaCreditoId]); // Added cuentaDestinoId, cuentaCreditoId to dependencies for completeness

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
        // En el modo Elite, si no hay cuenta seleccionada, usamos la primera de gasto disponible
        const defaultDestino = cuentaDestinoId || (cuentasGastoActivo[0]?.id || '');
        const cuentaPagoId = cuentaCreditoId || (condicion === 'Contado' ? '110101' : '210101');
        
        const sugerido = [
            { cuentaId: defaultDestino, debito: subtotalNum, credito: 0, cuentaCodigo: defaultDestino }
        ];
        
        if (itbisAdelantado > 0) {
            sugerido.push({ cuentaId: '110501', debito: itbisAdelantado, credito: 0, cuentaCodigo: '110501', nombre: 'ITBIS por Adelantar' });
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
        
        if (lineasAsiento.length === 0) {
            alert("Debe definir el asiento contable.");
            return;
        }

        const totalDR = lineasAsiento.reduce((a,b) => a + Number(b.debito || 0), 0);
        const totalCR = lineasAsiento.reduce((a,b) => a + Number(b.credito || 0), 0);
        
        if (Math.abs(totalDR - totalCR) > 0.005) {
            alert("El asiento contable no está cuadrado. Por favor revise los montos.");
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
            detalles,
            fechaFactura,
            diasVencimiento: condicion === 'Credito' ? Number(diasVencimiento) || 0 : 0,
            fechaVencimiento: fechaVencimientoCalc ? fechaVencimientoCalc.toISOString().split('T')[0] : null,
            tipoGasto,
            condicion,
            cuentaDestinoId: lineasAsiento[0]?.cuentaId, // Tomamos la principal del asiento
            cuentaCreditoId: lineasAsiento.find(l => l.credito > 0)?.cuentaId || (condicion === 'Contado' ? '110101' : '210101'),
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
            const compraRegistrada = registrarCompra(dataCompra, lineasAsiento);
            setCompraExitosa(compraRegistrada);
        }

        // Reset
        setProveedorId('');
        setProveedorNombre('');
        setProveedorRnc('');
        setNcf('');
        setDetalles('');
        setMontoInput('');
        setItbisRetenido(0);
        setPorcentajeIsr(0);
        setFacturaExenta(false);
        setDiasVencimiento('');
    };

    const handleEdit = (compra) => {
        setEditingId(compra.id);
        setProveedorId(compra.proveedorId || '');
        setProveedorNombre(compra.proveedorNombre);
        setProveedorRnc(compra.proveedorRnc || '');
        setNcf(compra.ncf || '');
        setDetalles(compra.detalles || '');
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
                            <input type="text" className="input-field" value={ncf} onChange={e => setNcf(e.target.value)} placeholder="B01... (Hasta 13 dígitos)" required maxLength="13" />
                        </div>
                        <div className="input-group">
                            <label className="input-label">Fecha de Comprobante (Física)</label>
                            <input type="date" className="input-field" value={fechaFactura} onChange={e => setFechaFactura(e.target.value)} required />
                        </div>

                        <div className="input-group">
                            <label className="input-label">Tipo de Gasto (DGII)</label>
                            <select className="input-field" value={tipoGasto} onChange={e => setTipoGasto(e.target.value)}>
                                <option value="01">01 - Gastos de Personal</option>
                                <option value="02">02 - Gastos por Trabajos, Suministros y Servicios</option>
                                <option value="03">03 - Arrendamientos</option>
                                <option value="04">04 - Gastos de Activos Fijo</option>
                                <option value="05">05 - Gastos de Representación</option>
                                <option value="06">06 - Otras Deducciones Admitidas</option>
                                <option value="07">07 - Gastos Financieros</option>
                                <option value="08">08 - Gastos Extraordinarios</option>
                                <option value="09">09 - Compras y Gastos que Formarán Parte del Costo de Venta</option>
                            </select>
                        </div>
                        <div className="input-group">
                            <label className="input-label">Condición de Pago</label>
                            <select className="input-field" value={condicion} onChange={e => { setCondicion(e.target.value); if (e.target.value === 'Contado') setDiasVencimiento(''); }}>
                                <option value="Contado">Al Contado (Caja/Bancos)</option>
                                <option value="Credito">A Crédito (Cuentas por Pagar Proveedores)</option>
                            </select>
                        </div>

                        {condicion === 'Credito' && (
                            <div className="input-group" style={{ gridColumn: '1 / -1' }}>
                                <label className="input-label" style={{ color: 'var(--primary)', fontWeight: 700 }}>
                                    ⏱ Plazo de Vencimiento
                                </label>
                                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: '0 0 auto' }}>
                                        <input
                                            type="number" min="1" max="365" className="input-field"
                                            value={diasVencimiento}
                                            onChange={e => setDiasVencimiento(e.target.value)}
                                            placeholder="Ej: 30"
                                            style={{ width: '90px' }}
                                        />
                                        <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>días</span>
                                    </div>
                                    {[15, 30, 45, 60, 90].map(d => (
                                        <button key={d} type="button"
                                            onClick={() => setDiasVencimiento(String(d))}
                                            className="btn btn-secondary"
                                            style={{ padding: '0.3rem 0.65rem', fontSize: '0.8rem', fontWeight: 700, background: diasVencimiento === String(d) ? 'var(--primary)' : undefined, color: diasVencimiento === String(d) ? '#fff' : undefined, border: '1px solid var(--border)' }}
                                        >{d}d</button>
                                    ))}
                                    {fechaVencimientoCalc && (
                                        <div style={{
                                            marginLeft: 'auto', padding: '0.4rem 1rem',
                                            borderRadius: 'var(--radius-sm)',
                                            background: diasRestantes < 0 ? '#fee2e2' : diasRestantes < 10 ? '#fef3c7' : 'var(--primary-light)',
                                            color: diasRestantes < 0 ? 'var(--danger)' : diasRestantes < 10 ? '#b45309' : 'var(--primary)',
                                            fontWeight: 800, fontSize: '0.85rem',
                                            display: 'flex', alignItems: 'center', gap: '0.4rem'
                                        }}>
                                            <span>📅</span>
                                            <span>Vence: {fechaVencimientoCalc.toLocaleDateString('es-DO', { day:'2-digit', month:'short', year:'numeric' })}</span>
                                            <span style={{ opacity: 0.75, fontWeight: 600 }}>({diasRestantes >= 0 ? `en ${diasRestantes} días` : `hace ${Math.abs(diasRestantes)} días`})</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ── CUENTAS CONTABLES ELITE (Reemplazado por Tabla de Asiento Abajo) ── */}
                    <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ fontSize: '1.25rem' }}>📋</div>
                        <div>
                            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569' }}>Configuración Contable Avanzada</div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Defina el asiento detallado en la sección inferior. El sistema pre-calcula ITBIS y retenciones automáticamente.</div>
                        </div>
                    </div>

                    {/* ── MONTO TOTAL FACTURADO (Elite Display) ── */}
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label className="input-label" style={{ fontWeight: 800, marginBottom: '0.75rem', display: 'block', color: '#1e293b' }}>Monto Total Facturado <span style={{ color: '#64748b', fontWeight: 400 }}>(ITBIS incluido si aplica)</span></label>
                        <div style={{ display: 'flex', alignItems: 'stretch', gap: '1rem', flexWrap: 'wrap' }}>
                            {/* Input */}
                            <div style={{ position: 'relative', flex: '0 0 220px' }}>
                                <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#6366f1', fontWeight: 800, fontSize: '0.9rem', pointerEvents: 'none' }}>DOP</span>
                                <input
                                    required type="number" step="0.01" min="0"
                                    className="input-field"
                                    value={montoInput}
                                    onChange={e => { setMontoInput(e.target.value); }}
                                    style={{ paddingLeft: '3.5rem', fontWeight: 800, fontSize: '1.2rem', border: '2px solid #6366f1', borderRadius: '12px', height: '54px', background: '#f5f3ff' }}
                                    placeholder="0.00"
                                />
                            </div>
                            {/* Total pill */}
                            {montoInput > 0 && (
                                <div style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', borderRadius: '14px', padding: '0 1.75rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', minWidth: '220px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.2)' }}>
                                    <div style={{ color: '#94a3b8', fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px' }}>Total a Procesar</div>
                                    <div style={{ color: '#fff', fontWeight: 900, fontSize: '1.6rem', fontFamily: 'monospace', lineHeight: 1.2 }}>{formatMoney(montoIngresado)}</div>
                                    {!facturaExenta && itbisAdelantado > 0 && <div style={{ color: '#10b981', fontSize: '0.7rem', fontWeight: 700, marginTop: '2px' }}>Incluye {formatMoney(itbisAdelantado)} de ITBIS</div>}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* DETALLES DE LA COMPRA (ELITE ADDITION) */}
                    <div className="input-group" style={{ marginBottom: '1.5rem' }}>
                        <label className="input-label" style={{ fontWeight: 600 }}>Detalles de la Compra / Glosa</label>
                        <textarea
                            className="input-field"
                            value={detalles}
                            onChange={e => setDetalles(e.target.value)}
                            placeholder="Describa el propósito de esta compra o gasto..."
                            style={{ minHeight: '80px', paddingTop: '0.75rem', resize: 'vertical' }}
                        />
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

                    {/* ===== PANEL DE ASIENTO CONTABLE (ERP PROFESIONAL) ===== */}
                    {/* ── PANEL DE ASIENTO CONTABLE (ESTILO IMAGEN 2 - ELITE) ── */}
                    {true && (() => { // Siempre visible si hay datos
                        const totalDebitos = lineasAsiento.reduce((a,b) => a + Number(b.debito||0), 0);
                        const totalCreditos = lineasAsiento.reduce((a,b) => a + Number(b.credito||0), 0);
                        const diferencia = totalDebitos - totalCreditos;
                        const cuadrado = Math.abs(diferencia) < 0.005;
                        const cuentasDetalle = cuentas.filter(acc => acc.subtipo === 'Cuenta Detalle');

                        if (lineasAsiento.length === 0 && !montoInput) return null;

                        return (
                            <div style={{ marginTop: '2rem', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)', background: '#fff' }}>
                                {/* Header (Estilo Imagen 2) */}
                                <div style={{ background: '#262d3d', padding: '0.85rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem' }}>📒</div>
                                        <div>
                                            <div style={{ color: '#fff', fontWeight: 800, fontSize: '0.85rem', letterSpacing: '0.5px' }}>ASIENTO CONTABLE</div>
                                            <div style={{ color: '#94a3b8', fontSize: '0.65rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Editable · Doble Partida</div>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <div style={{ padding: '0.35rem 1rem', borderRadius: '8px', background: cuadrado ? '#16a34a' : '#dc2626', color: '#fff', fontWeight: 700, fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                            <span>{cuadrado ? '✓' : '⚠️'}</span>
                                            <span>{cuadrado ? 'CUADRADO' : `Incompleto`}</span>
                                        </div>
                                        <button type="button" onClick={() => setMostrarAsientoDetalle(false)} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', borderRadius: '6px', padding: '0.35rem 0.75rem', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }}>✕ Usar Auto</button>
                                    </div>
                                </div>

                                {/* Table Body */}
                                <div style={{ overflowX: 'auto' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                        <thead>
                                            <tr style={{ background: '#f8fafc', borderBottom: '1.5px solid #e2e8f0' }}>
                                                <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.7rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', width: '3.5rem' }}>#</th>
                                                <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.7rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Cuenta Contable</th>
                                                <th style={{ padding: '0.75rem 1.5rem', textAlign: 'right', fontSize: '0.7rem', fontWeight: 800, color: '#2563eb', textTransform: 'uppercase', width: '180px' }}>DÉBITO (DR)</th>
                                                <th style={{ padding: '0.75rem 1.5rem', textAlign: 'right', fontSize: '0.7rem', fontWeight: 800, color: '#16a34a', textTransform: 'uppercase', width: '180px' }}>CRÉDITO (CR)</th>
                                                <th style={{ width: '3rem' }}></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {lineasAsiento.map((linea, idx) => {
                                                const hasDebito = Number(linea.debito) > 0;
                                                const hasCredito = Number(linea.credito) > 0;
                                                return (
                                                    <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                                        <td style={{ padding: '0.75rem 1rem', color: '#94a3b8', fontSize: '0.75rem', fontWeight: 700 }}>{String(idx + 1).padStart(2, '0')}</td>
                                                        <td style={{ padding: '0.75rem 1rem' }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                                                <div style={{ width: '4px', height: '32px', borderRadius: '4px', background: hasDebito ? '#2563eb' : (hasCredito ? '#16a34a' : '#cbd5e1') }} />
                                                                <select
                                                                    value={linea.cuentaId}
                                                                    className="input-field-mini"
                                                                    style={{ flex: 1, fontSize: '0.85rem', border: '1.5px solid #e2e8f0', height: '40px', fontWeight: 600, color: '#1e293b' }}
                                                                    onChange={e => {
                                                                        const l = [...lineasAsiento];
                                                                        l[idx].cuentaId = e.target.value;
                                                                        setLineasAsiento(l);
                                                                    }}
                                                                >
                                                                    <option value="">-- Seleccione Cuenta --</option>
                                                                    {cuentasDetalle.map(acc => (
                                                                        <option key={acc.id} value={acc.id}>{acc.codigo} — {acc.nombre}</option>
                                                                    ))}
                                                                </select>
                                                            </div>
                                                            {linea.nombre && idx > 2 && <div style={{ fontSize: '0.65rem', color: '#64748b', marginLeft: '1rem', marginTop: '2px', fontWeight: 600 }}>{linea.nombre}</div>}
                                                        </td>
                                                        <td style={{ padding: '0.75rem 1.5rem' }}>
                                                            <input
                                                                type="number" step="0.01"
                                                                value={linea.debito || ''}
                                                                onChange={e => { const l = [...lineasAsiento]; l[idx].debito = e.target.value; setLineasAsiento(l); }}
                                                                style={{
                                                                    width: '100%', textAlign: 'right', fontWeight: 800, fontSize: '0.95rem',
                                                                    padding: '0.5rem 0.75rem', borderRadius: '8px', border: hasDebito ? '2px solid #2563eb' : '1px solid #e2e8f0',
                                                                    background: hasDebito ? '#eff6ff' : '#fff', color: hasDebito ? '#2563eb' : '#64748b'
                                                                }}
                                                                placeholder="0.00"
                                                            />
                                                        </td>
                                                        <td style={{ padding: '0.75rem 1.5rem' }}>
                                                            <input
                                                                type="number" step="0.01"
                                                                value={linea.credito || ''}
                                                                onChange={e => { const l = [...lineasAsiento]; l[idx].credito = e.target.value; setLineasAsiento(l); }}
                                                                style={{
                                                                    width: '100%', textAlign: 'right', fontWeight: 800, fontSize: '0.95rem',
                                                                    padding: '0.5rem 0.75rem', borderRadius: '8px', border: hasCredito ? '2px solid #16a34a' : '1px solid #e2e8f0',
                                                                    background: hasCredito ? '#f0fdf4' : '#fff', color: hasCredito ? '#16a34a' : '#64748b'
                                                                }}
                                                                placeholder="0.00"
                                                            />
                                                        </td>
                                                        <td style={{ textAlign: 'center' }}>
                                                            <button type="button" onClick={() => setLineasAsiento(lineasAsiento.filter((_,i) => i !== idx))} style={{ color: '#cbd5e1', fontSize: '1.25rem', padding: '0.25rem' }}>×</button>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                        <tfoot>
                                            <tr style={{ background: '#f8fafc', borderTop: '2px solid #e2e8f0' }}>
                                                <td colSpan="2" style={{ padding: '1rem' }}>
                                                    <button type="button" onClick={() => setLineasAsiento([...lineasAsiento, { cuentaId: '', debito: 0, credito: 0 }])} style={{ background: '#fff', border: '1.5px dashed #cbd5e1', borderRadius: '8px', padding: '0.5rem 1rem', color: '#64748b', fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer' }}>+ Agregar línea</button>
                                                </td>
                                                <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                                                    <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>Total DR</div>
                                                    <div style={{ color: '#2563eb', fontWeight: 900, fontSize: '1.1rem', fontFamily: 'monospace' }}>RD$ {formatMoney(totalDebitos)}</div>
                                                </td>
                                                <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                                                    <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>Total CR</div>
                                                    <div style={{ color: '#16a34a', fontWeight: 900, fontSize: '1.1rem', fontFamily: 'monospace' }}>RD$ {formatMoney(totalCreditos)}</div>
                                                </td>
                                                <td></td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            </div>
                        );
                    })()}

                    <div style={{ marginTop: '2.5rem', display: 'flex', gap: '1.25rem' }}>
                        <button type="submit" className="btn btn-primary" style={{ flex: 1, height: '64px', fontSize: '1.2rem', fontWeight: 800, borderRadius: '14px', boxShadow: '0 15px 30px -5px rgba(99, 102, 241, 0.3)' }}>
                            {editingId ? '💾 Finalizar Edición' : '💎 Registrar Gasto / Compra Elite'}
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
