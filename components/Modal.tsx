import React from 'react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    message: string;
    type?: 'info' | 'warning' | 'error' | 'success';
    confirmText?: string;
    cancelText?: string;
    onConfirm?: () => void;
    onCancel?: () => void;
    showCancel?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
    isOpen,
    onClose,
    title,
    message,
    type = 'info',
    confirmText = 'OK',
    cancelText = 'Cancel',
    onConfirm,
    onCancel,
    showCancel = true
}) => {
    if (!isOpen) return null;

    const handleConfirm = () => {
        if (onConfirm) {
            onConfirm();
        }
        onClose();
    };

    const handleCancel = () => {
        if (onCancel) {
            onCancel();
        }
        onClose();
    };

    const getIcon = () => {
        const iconStyle = { width: '1.5rem', height: '1.5rem' };
        
        switch (type) {
            case 'warning':
                return (
                    <svg style={{ ...iconStyle, color: '#eab308' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                );
            case 'error':
                return (
                    <svg style={{ ...iconStyle, color: '#ef4444' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                );
            case 'success':
                return (
                    <svg style={{ ...iconStyle, color: '#22c55e' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                );
            default:
                return (
                    <svg style={{ ...iconStyle, color: '#3b82f6' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                );
        }
    };



    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 50,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        }}>
            {/* Backdrop */}
            <div 
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    backdropFilter: 'blur(4px)',
                    animation: 'modalFadeIn 0.2s ease-out'
                }}
                onClick={onClose}
            />
            
            {/* Modal */}
            <div style={{
                position: 'relative',
                backgroundColor: '#1e293b',
                borderRadius: '8px',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                maxWidth: '28rem',
                width: '100%',
                margin: '0 1rem',
                border: '1px solid #334155',
                animation: 'modalSlideIn 0.3s ease-out'
            }}>
                {/* Header */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '1rem',
                    borderBottom: '1px solid #334155'
                }}>
                    <div style={{ flexShrink: 0, marginRight: '0.75rem' }}>
                        {getIcon()}
                    </div>
                    <h3 style={{
                        fontSize: '1.125rem',
                        fontWeight: 600,
                        color: 'white',
                        margin: 0
                    }}>
                        {title}
                    </h3>
                    <button
                        onClick={onClose}
                        style={{
                            marginLeft: 'auto',
                            color: '#94a3b8',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '0.25rem',
                            borderRadius: '4px',
                            transition: 'color 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.color = 'white'}
                        onMouseLeave={(e) => e.currentTarget.style.color = '#94a3b8'}
                    >
                        <svg style={{ width: '1.25rem', height: '1.25rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                
                {/* Content */}
                <div style={{ padding: '1rem' }}>
                    <p style={{
                        color: '#cbd5e1',
                        lineHeight: '1.6',
                        margin: 0
                    }}>
                        {message}
                    </p>
                </div>
                
                {/* Footer */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: '0.75rem',
                    padding: '1rem',
                    borderTop: '1px solid #334155'
                }}>
                    {showCancel && (
                        <button
                            onClick={handleCancel}
                            style={{
                                padding: '0.5rem 1rem',
                                fontSize: '0.875rem',
                                fontWeight: 500,
                                color: '#cbd5e1',
                                backgroundColor: '#475569',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                transition: 'background-color 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#64748b'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#475569'}
                        >
                            {cancelText}
                        </button>
                    )}
                    <button
                        onClick={handleConfirm}
                        style={{
                            padding: '0.5rem 1rem',
                            fontSize: '0.875rem',
                            fontWeight: 500,
                            color: 'white',
                            backgroundColor: type === 'warning' ? '#eab308' : type === 'error' ? '#ef4444' : type === 'success' ? '#22c55e' : '#3b82f6',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            transition: 'background-color 0.2s'
                        }}
                        onMouseEnter={(e) => {
                            const baseColor = type === 'warning' ? '#eab308' : type === 'error' ? '#ef4444' : type === 'success' ? '#22c55e' : '#3b82f6';
                            e.currentTarget.style.backgroundColor = baseColor === '#eab308' ? '#ca8a04' : baseColor === '#ef4444' ? '#dc2626' : baseColor === '#22c55e' ? '#16a34a' : '#2563eb';
                        }}
                        onMouseLeave={(e) => {
                            const baseColor = type === 'warning' ? '#eab308' : type === 'error' ? '#ef4444' : type === 'success' ? '#22c55e' : '#3b82f6';
                            e.currentTarget.style.backgroundColor = baseColor;
                        }}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};
