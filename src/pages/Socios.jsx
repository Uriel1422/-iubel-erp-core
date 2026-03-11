import React, { useState } from 'react';
import { useSocios, getDefaultSocio } from '../context/SociosContext';
import { Search, User, List, Database, Image, Activity, Plus, Save, Trash2, ArrowLeft, Wallet } from 'lucide-react';
import TabBuscar from './socios/TabBuscar';
import TabGenerales from './socios/TabGenerales';
import TabGestion from './socios/TabGestion';
import TabReferencias from './socios/TabReferencias';
import TabFotos from './socios/TabFotos';
import TabSeguimiento from './socios/TabSeguimiento';
import TabHistorial from './socios/TabHistorial';
import TabDashboard360 from './socios/TabDashboard360';
import { useAhorros } from '../context/AhorrosContext';
import { usePrestamos } from '../context/PrestamosContext';

// ── Tab config ──────────────────────────────────────────────────────────────
const TABS = [
    { id: 'dashboard', label: 'Dashboard 360', icon: Activity },
    { id: 'buscar', label: 'Buscar', icon: Search },
    { id: 'generales', label: 'Generales', icon: User },
    { id: 'gestion', label: 'Gestión', icon: List },
    { id: 'referencias', label: 'Referencias', icon: Database },
    { id: 'fotos', label: 'Fotos | Firmas', icon: Image },
    { id: 'seguimiento', label: 'Seguimiento', icon: Activity },
    { id: 'historial', label: 'Historial', icon: Wallet },
];

const Socios = () => {
    const {
        socios, agregarSocio, actualizarSocio, eliminarSocio,
        agregarInmueble, eliminarInmueble,
        agregarVehiculo, eliminarVehiculo,
        agregarReferencia, eliminarReferencia,
        agregarDependiente, eliminarDependiente,
        agregarBeneficiario, eliminarBeneficiario,
        agregarCaso, eliminarCaso
    } = useSocios();

    const [tab, setTab] = useState('buscar');
    const [selectedSocio, setSelectedSocio] = useState(null);
    const [editData, setEditData] = useState(null); // datos editables
    const [isNew, setIsNew] = useState(false);
    const [showConfirmDel, setShowConfirmDel] = useState(false);

    // ── Seleccionar socio desde tabla de buscar ───────────────────────────
    const handleSelectSocio = (socio) => {
        setSelectedSocio(socio);
        setEditData({ ...socio });
        setIsNew(false);
        setTab('dashboard');
    };

    // ── Nuevo socio ────────────────────────────────────────────────────────
    const handleNuevo = () => {
        const blank = getDefaultSocio();
        setSelectedSocio(null);
        setEditData(blank);
        setIsNew(true);
        setTab('generales');
    };

    // ── Cambio de campo en el formulario ──────────────────────────────────
    const handleChange = (field, value) => {
        setEditData(prev => ({ ...prev, [field]: value }));
    };

    // ── Guardar ───────────────────────────────────────────────────────────
    const handleGuardar = () => {
        if (!editData.nombre?.trim()) {
            alert('El nombre del socio es obligatorio.');
            return;
        }
        if (isNew) {
            const nuevo = agregarSocio(editData);
            setSelectedSocio(nuevo);
            setEditData(nuevo);
            setIsNew(false);
        } else {
            actualizarSocio(selectedSocio.id, editData);
            const updated = { ...selectedSocio, ...editData };
            setSelectedSocio(updated);
        }
    };

    // ── Eliminar ──────────────────────────────────────────────────────────
    const handleEliminar = () => {
        eliminarSocio(selectedSocio.id);
        setSelectedSocio(null);
        setEditData(null);
        setIsNew(false);
        setTab('buscar');
        setShowConfirmDel(false);
    };

    const activeSocio = isNew ? null : selectedSocio;
    const fmtMoney = n => new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP' }).format(Number(n) || 0);

    return (
        <div className="animate-up" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* ── Header ── */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div>
                    <h1 className="page-title" style={{ marginBottom: '0.25rem', fontSize: '1.5rem' }}>Gestión de Socios</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        {socios.length} socio(s) registrado(s)
                        {selectedSocio && !isNew && (
                            <span style={{ marginLeft: '1rem', color: 'var(--primary)', fontWeight: 700 }}>
                                ▶ {selectedSocio.nombre}
                            </span>
                        )}
                        {isNew && <span style={{ marginLeft: '1rem', color: 'var(--success)', fontWeight: 700 }}>▶ Nuevo Socio</span>}
                    </p>
                </div>

                {/* Action buttons */}
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <button className="btn btn-secondary" style={{ fontSize: '0.8rem', gap: '0.4rem' }} onClick={() => { setTab('buscar'); }}>
                        <ArrowLeft size={15} /> Volver al Listado
                    </button>
                    <button className="btn btn-primary" style={{ fontSize: '0.8rem', gap: '0.4rem' }} onClick={handleNuevo}>
                        <Plus size={15} /> Nuevo Socio
                    </button>
                    {(isNew || selectedSocio) && (
                        <button className="btn btn-primary" style={{ fontSize: '0.8rem', gap: '0.4rem', background: 'var(--success)', borderColor: 'var(--success)' }} onClick={handleGuardar}>
                            <Save size={15} /> {isNew ? 'Crear Socio' : 'Guardar Cambios'}
                        </button>
                    )}
                    {selectedSocio && !isNew && (
                        <button className="btn btn-secondary" style={{ fontSize: '0.8rem', gap: '0.4rem', color: 'var(--danger)', borderColor: 'rgba(239,68,68,0.2)' }}
                            onClick={() => setShowConfirmDel(true)}>
                            <Trash2 size={15} /> Eliminar
                        </button>
                    )}
                </div>
            </div>

            {/* El Panel de KPIs fue reemplazado por el Dashboard 360 */}

            {/* ── Tabs Navigation ── */}
            <div className="card glass" style={{ padding: 0, overflowY: 'auto', maxHeight: '90vh' }}>
                {/* Tab bar */}
                <div style={{ display: 'flex', background: 'linear-gradient(135deg, var(--primary), #1e40af)', borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0', overflowX: 'auto' }}>
                    {TABS.map(({ id, label, icon: Icon }) => {
                        const active = tab === id;
                        return (
                            <button key={id} onClick={() => setTab(id)}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '0.4rem',
                                    padding: '0.9rem 1.25rem', fontSize: '0.82rem',
                                    fontWeight: active ? 700 : 500,
                                    color: active ? 'var(--primary)' : 'rgba(255,255,255,0.8)',
                                    background: active ? 'white' : 'transparent',
                                    borderRadius: active ? 'var(--radius-md) var(--radius-md) 0 0' : 0,
                                    cursor: 'pointer', transition: 'all 0.2s',
                                    whiteSpace: 'nowrap', flexShrink: 0,
                                    marginTop: active ? '4px' : 0,
                                    boxShadow: active ? '0 -4px 12px rgba(0,0,0,0.08)' : 'none',
                                }}>
                                <Icon size={15} />
                                {label}
                            </button>
                        );
                    })}
                </div>

                {/* Tab Content */}
                <div style={{ padding: '1.5rem', overflowY: 'auto', maxHeight: 'calc(100vh - 360px)' }}>
                    {tab === 'dashboard' && selectedSocio && (
                        <TabDashboard360 socio={selectedSocio} />
                    )}
                    {tab === 'buscar' && (
                        <TabBuscar socios={socios} onSelectSocio={handleSelectSocio} selectedId={selectedSocio?.id} />
                    )}
                    {tab === 'generales' && (
                        <TabGenerales datos={editData || getDefaultSocio()} onChange={handleChange} />
                    )}
                    {tab === 'gestion' && (
                        <TabGestion
                            socio={activeSocio}
                            onAgregarInmueble={agregarInmueble}
                            onEliminarInmueble={eliminarInmueble}
                            onAgregarVehiculo={agregarVehiculo}
                            onEliminarVehiculo={eliminarVehiculo}
                        />
                    )}
                    {tab === 'referencias' && (
                        <TabReferencias
                            socio={activeSocio}
                            onAgregarReferencia={agregarReferencia}
                            onEliminarReferencia={eliminarReferencia}
                            onAgregarDependiente={agregarDependiente}
                            onEliminarDependiente={eliminarDependiente}
                            onAgregarBeneficiario={agregarBeneficiario}
                            onEliminarBeneficiario={eliminarBeneficiario}
                        />
                    )}
                    {tab === 'fotos' && (
                        <TabFotos socio={activeSocio} onActualizar={actualizarSocio} />
                    )}
                    {tab === 'seguimiento' && (
                        <TabSeguimiento
                            socio={activeSocio}
                            onAgregarCaso={agregarCaso}
                            onEliminarCaso={eliminarCaso}
                        />
                    )}
                    {tab === 'historial' && (
                        <TabHistorial socioId={activeSocio?.id} />
                    )}
                </div>
            </div>

            {/* ── Confirm Delete Modal ── */}
            {showConfirmDel && (
                <div className="modal-overlay">
                    <div className="card glass" style={{ maxWidth: '420px', width: '100%', padding: '2rem', textAlign: 'center' }}>
                        <div style={{ width: '56px', height: '56px', background: 'rgba(239,68,68,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                            <Trash2 size={24} color="var(--danger)" />
                        </div>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>Eliminar Socio</h2>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>¿Estás seguro de que deseas eliminar a <strong>{selectedSocio?.nombre}</strong>? Esta acción no se puede deshacer.</p>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowConfirmDel(false)}>Cancelar</button>
                            <button className="btn btn-primary" style={{ flex: 1, background: 'var(--danger)', borderColor: 'var(--danger)' }} onClick={handleEliminar}>Sí, Eliminar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Socios;
