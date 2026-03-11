import React, { useState } from 'react';
import { useSocios } from '../context/SociosContext';
import { useBoveda } from '../context/BovedaContext';
import { usePrestamos } from '../context/PrestamosContext';
import {
    Activity,
    PiggyBank,
    Percent,
    TrendingUp,
    ShieldAlert,
    Zap,
    CheckCircle2,
    BarChart
} from 'lucide-react';

const BankingHub = () => {
    const { socios, capitalizarIntereses } = useSocios();
    const { balanceTotal } = useBoveda();
    const { prestamos } = usePrestamos();

    const [isProcessing, setIsProcessing] = useState(false);
    const [lastClose, setLastClose] = useState(null);

    const handleCapitalization = () => {
        setIsProcessing(true);
        setTimeout(() => {
            capitalizarIntereses(0.5); // 0.5% mensual
            setIsProcessing(false);
            setLastClose(new Date().toLocaleString());
        }, 2000);
    };

    const formatMoney = (amount) =>
        new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP' }).format(amount || 0);

    // Cálculos de Salud Institucional
    const carteraTotal = prestamos.reduce((acc, p) => acc + p.balance, 0);
    const ahorrosTotales = socios.reduce((acc, s) => acc + s.ahorros, 0);
    const liquidez = (balanceTotal / ahorrosTotales) * 100;
    const par = (prestamos.filter(p => p.estado === 'Vencido').reduce((acc, p) => acc + p.balance, 0) / carteraTotal) * 100;

    return (
        <div className="animate-up">
            <header style={{ marginBottom: '2rem' }}>
                <h1 className="page-title">Iubel Banking Hub</h1>
                <p style={{ color: 'var(--text-muted)' }}>Operaciones institucionales e indicadores de riesgo core.</p>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2.5rem' }}>
                <div className="card glass" style={{ padding: '1.5rem' }}>
                    <div className="kpi-label">Cartera de Créditos</div>
                    <div className="kpi-value" style={{ fontSize: '1.5rem' }}>{formatMoney(carteraTotal)}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>{prestamos.length} préstamos activos</div>
                </div>
                <div className="card glass" style={{ padding: '1.5rem' }}>
                    <div className="kpi-label">Captaciones (Ahorros)</div>
                    <div className="kpi-value" style={{ fontSize: '1.5rem', color: 'var(--success)' }}>{formatMoney(ahorrosTotales)}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Promedio por socio: {formatMoney(ahorrosTotales / socios.length)}</div>
                </div>
                <div className="card glass" style={{ padding: '1.5rem' }}>
                    <div className="kpi-label">Índice de Liquidez</div>
                    <div className="kpi-value" style={{ fontSize: '1.5rem', color: 'var(--primary)' }}>{liquidez.toFixed(2)}%</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--success)', marginTop: '0.5rem' }}>Saludable (+15%)</div>
                </div>
                <div className="card glass" style={{ padding: '1.5rem' }}>
                    <div className="kpi-label">Cartera en Riesgo (PAR)</div>
                    <div className="kpi-value" style={{ fontSize: '1.5rem', color: 'var(--danger)' }}>{par || 0}%</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Meta institucional: 3%</div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                <div className="card" style={{ padding: '2rem' }}>
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                        <Zap size={20} color="var(--warning)" /> Procesos de Cierre
                    </h3>
                    <div style={{ background: 'var(--background-alt)', padding: '1.5rem', borderRadius: '12px', marginBottom: '2rem' }}>
                        <div style={{ fontWeight: 700, marginBottom: '0.5rem' }}>Capitalización de Intereses</div>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                            Este proceso calcula y aplica los intereses ganados por los socios en sus cuentas de ahorro según la tasa configurada (Actual: 6% Anual / 0.5% Mensual).
                        </p>
                        <button
                            className={`btn ${isProcessing ? 'btn-secondary' : 'btn-primary'}`}
                            style={{ width: '100%' }}
                            onClick={handleCapitalization}
                            disabled={isProcessing}
                        >
                            {isProcessing ? 'Procesando...' : 'Ejecutar Capitalización Mensual'}
                        </button>
                    </div>
                    {lastClose && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--success)', fontSize: '0.85rem' }}>
                            <CheckCircle2 size={16} /> Último cierre ejecutado: {lastClose}
                        </div>
                    )}
                </div>

                <div className="card" style={{ padding: '2rem' }}>
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                        <ShieldAlert size={20} color="var(--danger)" /> Alertas de Cumplimiento
                    </h3>
                    <div className="list-group">
                        <div style={{ padding: '1rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                <PiggyBank size={18} color="var(--primary)" />
                                <span style={{ fontSize: '0.9rem' }}>Encaje Legal (BCRD)</span>
                            </div>
                            <span style={{ color: 'var(--success)', fontWeight: 700, fontSize: '0.8rem' }}>Cumplido</span>
                        </div>
                        <div style={{ padding: '1rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                <Percent size={18} color="var(--warning)" />
                                <span style={{ fontSize: '0.9rem' }}>Tasa Activa vs Pasiva</span>
                            </div>
                            <span style={{ fontWeight: 700, fontSize: '0.8rem' }}>Spread: 12%</span>
                        </div>
                        <div style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                <Activity size={18} color="var(--danger)" />
                                <span style={{ fontSize: '0.9rem' }}>Provisiones de Cartera</span>
                            </div>
                            <span style={{ fontWeight: 700, fontSize: '0.8rem' }}>Requerido: {formatMoney(carteraTotal * 0.01)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BankingHub;
