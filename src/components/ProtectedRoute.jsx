import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, requiredRole }) => {
    const { isAuthenticated, isLoading, user } = useAuth();

    if (isLoading) {
        return (
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100vh',
                width: '100vw',
                background: '#0f172a',
                flexDirection: 'column',
                gap: '1.25rem',
                fontFamily: "'Inter', -apple-system, sans-serif"
            }}>
                {/* Logo */}
                <div style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: '14px',
                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem',
                    fontWeight: 900,
                    color: 'white',
                    boxShadow: '0 10px 30px rgba(99,102,241,0.4)'
                }}>
                    I
                </div>

                {/* Spinner */}
                <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    border: '3px solid rgba(99,102,241,0.2)',
                    borderTopColor: '#6366f1',
                    animation: 'spin 0.7s linear infinite'
                }} />

                <p style={{
                    color: 'rgba(255,255,255,0.5)',
                    fontSize: '0.875rem',
                    margin: 0,
                    letterSpacing: '0.025em'
                }}>
                    Verificando sesión...
                </p>

                <style>{`
                    @keyframes spin { to { transform: rotate(360deg); } }
                    body { margin: 0; padding: 0; background: #0f172a; }
                `}</style>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (requiredRole && user?.role !== 'admin' && user?.role !== requiredRole) {
        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedRoute;
