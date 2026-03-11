import React, { useState } from 'react';
import {
    Building2, Wallet, CreditCard, Crosshair, MapPin, AlertCircle,
    Percent, ArrowRightLeft, PiggyBank, Shield, Car, Construction, Server
} from 'lucide-react';
import ConstructorProductos from './parametros/ConstructorProductos';

const TABS = [
    { id: 'entidades', label: 'Entidades', icon: Building2 },
    { id: 'ahorros', label: 'Ahorros', icon: Wallet },
    { id: 'prestamos', label: 'Préstamos', icon: CreditCard },
    { id: 'finalidad', label: 'Finalidad Préstamos', icon: Crosshair },
    { id: 'destino', label: 'Destino Préstamos', icon: MapPin },
    { id: 'mora', label: 'Mora', icon: AlertCircle },
    { id: 'interes', label: 'Interés Pasivo', icon: Percent },
    { id: 'transacciones', label: 'Transacciones', icon: ArrowRightLeft },
    { id: 'dpf', label: 'Depósitos (DPF)', icon: PiggyBank },
    { id: 'seguros', label: 'Seguros', icon: Shield },
    { id: 'marcas', label: 'Marcas Vehículos', icon: Car },
    { id: 'modelos', label: 'Modelos Vehículos', icon: Construction },
    { id: 'sistemas', label: 'Sistemas Financ.', icon: Server },
];

const ParametrosCore = () => {
    const [activeTab, setActiveTab] = useState('entidades');

    const renderEmptyCatalog = (title, description) => {
        const Icon = TABS.find(t => t.id === activeTab)?.icon;
        return (
            <div className="animate-fade-in" style={{ padding: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: 0 }}>
                        {Icon && <Icon size={24} className="text-primary" />}
                        Mantenimiento de {title}
                    </h3>
                    <button className="btn btn-primary">Añadir Nuevo</button>
                </div>
                <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>{description}</p>

                <div style={{ border: '1px dashed var(--border)', borderRadius: '12px', padding: '4rem', textAlign: 'center', background: '#f8fafc' }}>
                    <p style={{ color: 'var(--text-muted)', margin: 0 }}>Catálogo de <strong>{title}</strong> actualmente funcionando con los parámetros por defecto del Core.</p>
                </div>
            </div>
        );
    };

    return (
        <div className="animate-up" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                <div>
                    <h1 className="page-title" style={{ marginBottom: '0.25rem' }}>Parámetros del Sistema</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Configuración central de catálogos y reglas de negocio del Núcleo Bancario</p>
                </div>
            </div>

            {/* Ribbon-like Tabs con Scroll Horizontal estético */}
            <div className="card scrollable-tabs" style={{ padding: '0.5rem', marginBottom: '1.5rem', display: 'flex', gap: '0.5rem', overflowX: 'auto', whiteSpace: 'nowrap' }}>
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
                                gap: '0.6rem',
                                padding: '0.75rem 1rem',
                                border: 'none',
                                background: isActive ? 'var(--primary-light)' : 'transparent',
                                color: isActive ? 'var(--primary)' : 'var(--text-muted)',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                minWidth: '100px',
                                flexShrink: 0
                            }}
                        >
                            <Icon size={22} strokeWidth={isActive ? 2.5 : 1.5} />
                            <span style={{ fontSize: '0.7rem', fontWeight: isActive ? 700 : 500 }}>
                                {tab.label}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* Tab Contents */}
            <div className="card" style={{ flex: 1, overflowY: 'auto', padding: 0 }}>
                {activeTab === 'entidades' && renderEmptyCatalog('Entidades', 'Gestión de sucursales, oficinas y puntos de servicio de la cooperativa.')}
                {activeTab === 'ahorros' && <ConstructorProductos type="ahorros" />}
                {activeTab === 'prestamos' && <ConstructorProductos type="prestamos" />}
                {activeTab === 'finalidad' && renderEmptyCatalog('Finalidad de Préstamos', 'Clasificación de uso de fondos para reportería normativa (DGII, IDECOOP).')}
                {activeTab === 'destino' && renderEmptyCatalog('Destino de Préstamos', 'Categorización técnica del área donde se invertirá el crédito.')}
                {activeTab === 'mora' && renderEmptyCatalog('Políticas de Mora', 'Configuración de recargos por atrasos, días de gracia y penalidades.')}
                {activeTab === 'interes' && renderEmptyCatalog('Tasas de Interés Pasivo', 'Tarifario de rendimiento pagado sobre ahorros y aportaciones.')}
                {activeTab === 'transacciones' && renderEmptyCatalog('Tipos de Transacciones', 'Codificación contable de movimientos (ND, NC, DP, RT).')}
                {activeTab === 'dpf' && renderEmptyCatalog('Depósitos a Plazo Fijo (DPF)', 'Configuración de plazos, escalas y penalidad por cancelación anticipada.')}
                {activeTab === 'seguros' && renderEmptyCatalog('Seguros y Polizas', 'Seguros vinculados a los préstamos (Vida, Desempleo, Incendio/Líneas).')}
                {activeTab === 'marcas' && renderEmptyCatalog('Marcas de Vehículos', 'Catálogo para garantías prendarias automotrices.')}
                {activeTab === 'modelos' && renderEmptyCatalog('Modelos de Vehículos', 'Especificación de modelos, años y tasación referencial para garantías.')}
                {activeTab === 'sistemas' && renderEmptyCatalog('Sistemas Financieros', 'Interfaces y conexiones con redes de cajeros u otros bancos de encaje.')}
            </div>
        </div>
    );
};

export default ParametrosCore;
