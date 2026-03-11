import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, info) {
        console.error('ErrorBoundary caught an error:', error, info);
        // Si es un error de DOM, enviamos telemetría silenciosa (simulada)
    }

    render() {
        const isDOMError = this.state.error?.message?.includes('removeChild') || 
                          this.state.error?.message?.includes('appendChild') ||
                          this.state.error?.name === 'NotFoundError';

        if (this.state.hasError) {
            return (
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '60vh',
                    padding: '3rem',
                    textAlign: 'center',
                    gap: '1.5rem',
                    background: 'rgba(255,255,255,0.8)',
                    borderRadius: '24px',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(0,0,0,0.05)'
                }} className="notranslate">
                    <div style={{
                        width: 72,
                        height: 72,
                        borderRadius: '20px',
                        background: isDOMError ? 'rgba(99,102,241,0.1)' : 'rgba(239,68,68,0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '2rem'
                    }}>{isDOMError ? '🛡️' : '⚠️'}</div>
                    <div style={{ maxWidth: '480px' }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '0.75rem', color: '#0f172a' }}>
                            {isDOMError ? 'Protección de Integridad Activada' : 'Algo salió mal en esta sección'}
                        </h2>
                        <p style={{ color: '#64748b', lineHeight: 1.7, marginBottom: '1.5rem', fontSize: '0.95rem' }}>
                            {isDOMError 
                                ? 'Hemos detectado una interferencia externa (probablemente un traductor) intentando modificar el sistema. Para proteger tus datos, hemos pausado esta sección.'
                                : 'Se produjo un error inesperado al procesar esta sección.'}
                        </p>
                        <div style={{
                            background: '#f8fafc',
                            padding: '1rem',
                            borderRadius: '12px',
                            border: '1px solid #e2e8f0',
                            textAlign: 'left',
                            marginBottom: '1.5rem'
                        }}>
                            <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>Detalle Técnico</p>
                            <code style={{
                                display: 'block',
                                fontSize: '0.75rem',
                                color: '#ef4444',
                                whiteSpace: 'pre-wrap',
                                wordBreak: 'break-all',
                                fontFamily: 'monospace'
                            }}>
                                {this.state.error?.message || 'Unknown error'}
                            </code>
                        </div>
                    </div>
                    <button
                        style={{
                            padding: '0.875rem 2rem',
                            borderRadius: '12px',
                            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                            color: 'white',
                            border: 'none',
                            fontWeight: 700,
                            cursor: 'pointer',
                            boxShadow: '0 10px 20px rgba(99,102,241,0.2)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            fontSize: '0.95rem'
                        }}
                        onClick={() => {
                            this.setState({ hasError: false, error: null });
                            window.location.reload();
                        }}
                    >
                        🚀 Restaurar sección ahora
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
