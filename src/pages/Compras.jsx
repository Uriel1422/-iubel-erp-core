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

    // 🧠 AUTO-GEN ASIENTO: Regenera automáticamente cuando cambian los campos clave
    // Esto es lo que hace que el asiento aparezca automáticamente como en la imagen 3.
    React.useEffect(() => {
        if (!cuentaDestinoId || !cuentaCreditoId || !montoInput || Number(montoInput) <= 0) {
            setMostrarAsientoDetalle(false);
            return;
        }
        // Re-compute values based on current state
        const mIngresado = Number(montoInput) || 0;
        let sub = 0, itbisAdel = 0;
        if (facturaExenta) { sub = mIngresado; itbisAdel = 0; }
        else if (esItbisManual) { itbisAdel = Number(itbisManual) || 0; sub = Math.max(0, mIngresado - itbisAdel); }
        else if (incluirItbis) { sub = mIngresado / 1.18; itbisAdel = mIngresado - sub; }
        else { sub = mIngresado; itbisAdel = 0; }

        const totalGen = sub + itbisAdel;
        const isrRet = sub * (Number(porcentajeIsr) / 100);
        const itbisRet = Number(itbisRetenido) || 0;
        const netoPagar = totalGen - itbisRet - isrRet;

        const sugerido = [
            { cuentaId: cuentaDestinoId, debito: sub, credito: 0, cuentaCodigo: cuentaDestinoId }
        ];
        if (itbisAdel > 0) {
            sugerido.push({ cuentaId: '110501', debito: itbisAdel, credito: 0, cuentaCodigo: '110501' });
        }
        sugerido.push({ cuentaId: cuentaCreditoId, debito: 0, credito: netoPagar, cuentaCodigo: cuentaCreditoId });
        if (itbisRet > 0) sugerido.push({ cuentaId: '210401', debito: 0, credito: itbisRet, cuentaCodigo: '210401', nombre: 'ITBIS Retenido por Pagar' });
        if (isrRet > 0) sugerido.push({ cuentaId: '210501', debito: 0, credito: isrRet, cuentaCodigo: '210501', nombre: 'ISR Retenido por Pagar' });

        setLineasAsiento(sugerido);
        setMostrarAsientoDetalle(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [cuentaDestinoId, cuentaCreditoId, montoInput, facturaExenta, esItbisManual, itbisManual, incluirItbis, porcentajeIsr, itbisRetenido]);

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
            detalles,
            fechaFactura,
            diasVencimiento: condicion === 'Credito' ? Number(diasVencimiento) || 0 : 0,
            fechaVencimiento: fechaVencimientoCalc ? fechaVencimientoCalc.toISOString().split('T')[0] : null,
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
            if (!mostrarAsientoDetalle) {
                generarAsientoSugerido();
                return;
            }
            const compraRegistrada = registrarCompra(dataCompra, lineasAsiento);
            setCompraExitosa(compraRegistrada);
        }

        // Reset simple
        setProveedorId('');
        setProveedorNombre('');
        setProveedorRnc('');
        setNcf('');
        setDetalles('');
        setMontoInput('');
        setCuentaDestinoId('');
        setCuentaCreditoId('');
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

                    {/* ── CUENTAS CONTABLES: DÉBITO & CRÉDITO (Selectores compactos Elite) ── */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.5rem' }}>
                        <div className="input-group" style={{ marginBottom: 0 }}>
                            <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#2563eb', display: 'inline-block', flexShrink: 0 }}></span>
                                Cuenta Débito (DR) — Gasto/Activo
                            </label>
                            <select className="input-field" value={cuentaDestinoId} onChange={e => { setCuentaDestinoId(e.target.value); setMostrarAsientoDetalle(false); }} required style={{ borderLeft: '3px solid #2563eb' }}>
                                <option value="">-- Gasto · Activo · Costo --</option>
                                {cuentasGastoActivo.map(c => <option key={c.id} value={c.id}>{c.codigo} — {c.nombre}</option>)}
                            </select>
                        </div>
                        <div className="input-group" style={{ marginBottom: 0 }}>
                            <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#16a34a', display: 'inline-block', flexShrink: 0 }}></span>
                                Cuenta Crédito (CR) — {condicion === 'Contado' ? 'Caja/Banco' : 'CxP Prov.'}
                            </label>
                            <select className="input-field" value={cuentaCreditoId} onChange={e => { setCuentaCreditoId(e.target.value); setMostrarAsientoDetalle(false); }} required style={{ borderLeft: '3px solid #16a34a' }}>
                                <option value="">-- Caja · Banco · CxP Proveedor --</option>
                                {cuentasCredito.map(c => <option key={c.id} value={c.id}>{c.codigo} — {c.nombre}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* ── MONTO TOTAL FACTURADO (Elite Display) ── */}
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label className="input-label" style={{ fontWeight: 700, marginBottom: '0.75rem', display: 'block' }}>Monto Total Facturado <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(ITBIS incluido si aplica)</span></label>
                        <div style={{ display: 'flex', alignItems: 'stretch', gap: '1rem', flexWrap: 'wrap' }}>
                            {/* Input */}
                            <div style={{ position: 'relative', flex: '0 0 220px' }}>
                                <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#6366f1', fontWeight: 800, fontSize: '0.9rem', pointerEvents: 'none' }}>DOP</span>
                                <input
                                    required type="number" step="0.01" min="0"
                                    className="input-field"
                                    value={montoInput}
                                    onChange={e => { setMontoInput(e.target.value); setMostrarAsientoDetalle(false); }}
                                    style={{ paddingLeft: '3.5rem', fontWeight: 800, fontSize: '1.2rem', border: '2px solid #6366f1', borderRadius: '12px', height: '54px' }}
                                    placeholder="0.00"
                                />
                            </div>
                            {/* Total pill */}
                            {montoInput > 0 && (
                                <div style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', borderRadius: '14px', padding: '0 1.75rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', minWidth: '200px', boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}>
                                    <div style={{ color: '#94a3b8', fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px' }}>Total a Procesar</div>
                                    <div style={{ color: '#fff', fontWeight: 900, fontSize: '1.5rem', fontFamily: 'monospace', lineHeight: 1.2 }}>{formatMoney(montoIngresado)}</div>
                                    {!facturaExenta && itbisAdelantado > 0 && <div style={{ color: '#6ee7b7', fontSize: '0.7rem', fontWeight: 600 }}>ITBIS: {formatMoney(itbisAdelantado)}</div>}
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
                    {mostrarAsientoDetalle && (() => {
                        const totalDebitos = lineasAsiento.reduce((a,b) => a + b.debito, 0);
                        const totalCreditos = lineasAsiento.reduce((a,b) => a + b.credito, 0);
                        const diferencia = totalDebitos - totalCreditos;
                        const cuadrado = Math.abs(diferencia) < 0.005;
                        const cuentasDetalle = cuentas.filter(acc => acc.subtipo === 'Cuenta Detalle');
                        return (
                            <div style={{ marginTop: '2rem', borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--border)', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
                                {/* Header */}
                                <div style={{ background: 'linear-gradient(135deg, #1e293b, #334155)', padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>📒</div>
                                        <div>
                                            <div style={{ color: '#fff', fontWeight: 800, fontSize: '0.95rem', letterSpacing: '0.5px' }}>ASIENTO CONTABLE</div>
                                            <div style={{ color: '#94a3b8', fontSize: '0.7rem', letterSpacing: '1px', textTransform: 'uppercase' }}>Editable · Doble Partida</div>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <div style={{ padding: '0.3rem 0.9rem', borderRadius: '20px', background: cuadrado ? '#16a34a' : '#ef4444', color: '#fff', fontWeight: 700, fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                            <span>{cuadrado ? '✓' : '!'}</span>
                                            <span>{cuadrado ? 'CUADRADO' : `Diferencia: ${formatMoney(Math.abs(diferencia))}`}</span>
                                        </div>
                                        <button type="button" onClick={() => setMostrarAsientoDetalle(false)} style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: '#94a3b8', borderRadius: '6px', padding: '0.3rem 0.75rem', cursor: 'pointer', fontSize: '0.8rem' }}>✕ Usar Auto</button>
                                    </div>
                                </div>

                                {/* Table */}
                                <div style={{ overflowX: 'auto' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                        <thead>
                                            <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                                                <th style={{ padding: '0.65rem 1rem', textAlign: 'left', fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', width: '3rem' }}>#</th>
                                                <th style={{ padding: '0.65rem 1rem', textAlign: 'left', fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px' }}>Cuenta Contable</th>
                                                <th style={{ padding: '0.65rem 1.5rem', textAlign: 'right', fontSize: '0.72rem', fontWeight: 700, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '1px', width: '170px' }}>DÉBITO (DR)</th>
                                                <th style={{ padding: '0.65rem 1.5rem', textAlign: 'right', fontSize: '0.72rem', fontWeight: 700, color: '#16a34a', textTransform: 'uppercase', letterSpacing: '1px', width: '170px' }}>CRÉDITO (CR)</th>
                                                <th style={{ width: '2rem' }}></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {lineasAsiento.map((linea, idx) => {
                                                const esDebito = linea.debito > 0;
                                                const esCredito = linea.credito > 0;
                                                return (
                                                    <tr key={idx} style={{
                                                        borderBottom: '1px solid #f1f5f9',
                                                        background: idx % 2 === 0 ? '#ffffff' : '#fafafa',
                                                        transition: 'background 0.15s'
                                                    }}>
                                                        <td style={{ padding: '0.6rem 1rem', color: '#94a3b8', fontSize: '0.8rem', fontWeight: 600, fontFamily: 'monospace' }}>{String(idx + 1).padStart(2, '0')}</td>
                                                        <td style={{ padding: '0.6rem 1rem' }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                                <div style={{ width: '5px', height: '28px', borderRadius: '3px', background: esDebito ? '#2563eb' : '#16a34a', flexShrink: 0 }} />
                                                                <select
                                                                    value={linea.cuentaId}
                                                                    className="input-field-mini"
                                                                    style={{ width: '100%', fontSize: '0.82rem', border: '1px solid #e2e8f0', borderRadius: '6px' }}
                                                                    onChange={e => {
                                                                        const newLines = [...lineasAsiento];
                                                                        newLines[idx].cuentaId = e.target.value;
                                                                        newLines[idx].cuentaCodigo = e.target.value;
                                                                        setLineasAsiento(newLines);
                                                                    }}
                                                                >
                                                                    {cuentasDetalle.map(acc => (
                                                                        <option key={acc.id} value={acc.id}>{acc.codigo} — {acc.nombre}</option>
                                                                    ))}
                                                                </select>
                                                            </div>
                                                            {linea.nombre && <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginLeft: '1rem', marginTop: '2px' }}>{linea.nombre}</div>}
                                                        </td>
                                                        <td style={{ padding: '0.6rem 1.5rem', verticalAlign: 'middle' }}>
                                                            <input
                                                                type="number" step="0.01" min="0"
                                                                value={linea.debito || ''}
                                                                placeholder="0.00"
                                                                onChange={e => { const l = [...lineasAsiento]; l[idx].debito = Number(e.target.value)||0; setLineasAsiento(l); }}
                                                                style={{
                                                                    width: '100%', textAlign: 'right', fontFamily: 'monospace', fontWeight: 700,
                                                                    fontSize: '0.95rem', color: '#2563eb',
                                                                    border: linea.debito > 0 ? '1.5px solid #2563eb' : '1px solid #e2e8f0',
                                                                    borderRadius: '6px', padding: '0.4rem 0.6rem',
                                                                    background: linea.debito > 0 ? '#eff6ff' : 'transparent', outline: 'none'
                                                                }}
                                                            />
                                                        </td>
                                                        <td style={{ padding: '0.6rem 1.5rem', verticalAlign: 'middle' }}>
                                                            <input
                                                                type="number" step="0.01" min="0"
                                                                value={linea.credito || ''}
                                                                placeholder="0.00"
                                                                onChange={e => { const l = [...lineasAsiento]; l[idx].credito = Number(e.target.value)||0; setLineasAsiento(l); }}
                                                                style={{
                                                                    width: '100%', textAlign: 'right', fontFamily: 'monospace', fontWeight: 700,
                                                                    fontSize: '0.95rem', color: '#16a34a',
                                                                    border: linea.credito > 0 ? '1.5px solid #16a34a' : '1px solid #e2e8f0',
                                                                    borderRadius: '6px', padding: '0.4rem 0.6rem',
                                                                    background: linea.credito > 0 ? '#f0fdf4' : 'transparent', outline: 'none'
                                                                }}
                                                            />
                                                        </td>
                                                        <td style={{ padding: '0.25rem', textAlign: 'center' }}>
                                                            <button type="button" onClick={() => setLineasAsiento(lineasAsiento.filter((_,i) => i !== idx))} style={{ background: 'none', border: 'none', color: '#cbd5e1', cursor: 'pointer', fontSize: '1rem', lineHeight: 1, padding: '0.2rem' }} title="Eliminar línea">×</button>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                        <tfoot>
                                            <tr style={{ background: '#f8fafc', borderTop: '2px solid #e2e8f0' }}>
                                                <td colSpan="2" style={{ padding: '0.75rem 1rem', fontSize: '0.8rem', color: '#64748b' }}>
                                                    <button type="button" onClick={() => setLineasAsiento([...lineasAsiento, { cuentaId: cuentas[0]?.id || '', debito: 0, credito: 0 }])} style={{ background: 'none', border: '1px dashed #cbd5e1', borderRadius: '6px', padding: '0.3rem 0.75rem', color: '#64748b', cursor: 'pointer', fontSize: '0.8rem' }}>+ Agregar línea</button>
                                                </td>
                                                <td style={{ padding: '0.75rem 1.5rem', textAlign: 'right' }}>
                                                    <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total DR</div>
                                                    <div style={{ fontFamily: 'monospace', fontWeight: 800, fontSize: '1rem', color: '#2563eb' }}>{formatMoney(totalDebitos)}</div>
                                                </td>
                                                <td style={{ padding: '0.75rem 1.5rem', textAlign: 'right' }}>
                                                    <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total CR</div>
                                                    <div style={{ fontFamily: 'monospace', fontWeight: 800, fontSize: '1rem', color: '#16a34a' }}>{formatMoney(totalCreditos)}</div>
                                                </td>
                                                <td />
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>

                                {/* Footer */}
                                <div style={{ background: cuadrado ? '#f0fdf4' : '#fef2f2', padding: '0.65rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', borderTop: `1px solid ${cuadrado ? '#bbf7d0' : '#fecaca'}` }}>
                                    <span style={{ fontSize: '1rem' }}>{cuadrado ? '✅' : '⚠️'}</span>
                                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: cuadrado ? '#15803d' : '#b91c1c' }}>
                                        {cuadrado ? 'El asiento está cuadrado. Puede guardar con conciencia.' : `El asiento tiene una diferencia de ${formatMoney(Math.abs(diferencia))}. Ajuste los montos antes de guardar.`}
                                    </span>
                                </div>
                            </div>
                        );
                    })()}

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
