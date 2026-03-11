import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Eliminar', type = 'danger' }) => {
    if (!isOpen) return null;

    const accentColor = type === 'danger' ? 'var(--danger)' : 'var(--primary)';

    return (
        <div className="modal-overlay">
            <div className="card glass animate-up" style={{
                width: '100%',
                maxWidth: '550px',
                padding: '3rem',
                position: 'relative',
                overflow: 'hidden',
                borderTop: `6px solid ${accentColor}`,
                boxShadow: '0 40px 80px -20px rgba(0, 0, 0, 0.3)',
                border: '1px solid var(--glass-border)',
                background: 'var(--white)', /* Solid theme white */
                zIndex: 10
            }}>
                <button
                    onClick={onClose}
                    style={{ position: 'absolute', top: '1rem', right: '1rem', color: 'var(--text-muted)' }}
                >
                    <X size={20} />
                </button>

                <div style={{ display: 'flex', gap: '2rem', marginBottom: '2.5rem' }}>
                    <div style={{
                        width: '64px',
                        height: '64px',
                        borderRadius: '16px',
                        backgroundColor: type === 'danger' ? 'rgba(239, 68, 68, 0.12)' : 'rgba(37, 99, 235, 0.12)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                    }}>
                        <AlertTriangle size={32} color={accentColor} />
                    </div>
                    <div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.75rem', color: 'var(--text-main)', letterSpacing: '-0.02em' }}>{title}</h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '1rem', lineHeight: 1.7 }}>{message}</p>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '1.25rem', marginTop: '1rem' }}>
                    <button
                        className="btn btn-secondary"
                        style={{ flex: 1, height: '3.5rem', fontSize: '1rem' }}
                        onClick={onClose}
                    >
                        Cancelar
                    </button>
                    <button
                        className="btn"
                        style={{
                            flex: 1,
                            height: '3.5rem',
                            fontSize: '1rem',
                            fontWeight: 700,
                            backgroundColor: accentColor,
                            color: 'white',
                            boxShadow: `0 8px 16px ${type === 'danger' ? 'rgba(239, 68, 68, 0.25)' : 'rgba(37, 99, 235, 0.25)'}`
                        }}
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;
