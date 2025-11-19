"use client";

interface NotificationModalProps {
    show: boolean;
    message: string;
    type?: 'success' | 'error' | 'info';
    onClose: () => void;
}

export const NotificationModal = ({ show, message, type = 'success', onClose }: NotificationModalProps) => {
    if (!show) return null;

    const bgColors = {
        success: '#10b981',
        error: '#ef4444',
        info: '#3b82f6'
    };

    const icons = {
        success: '✓',
        error: '✕',
        info: 'ℹ'
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
        }}>
            <div style={{
                backgroundColor: 'white',
                borderRadius: '8px',
                padding: '2rem',
                maxWidth: '400px',
                width: '90%',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
                textAlign: 'center'
            }}>
                <div style={{
                    width: '3rem',
                    height: '3rem',
                    borderRadius: '50%',
                    backgroundColor: bgColors[type],
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                    margin: '0 auto 1rem'
                }}>
                    {icons[type]}
                </div>
                <p style={{
                    fontSize: '0.875rem',
                    color: '#374151',
                    marginBottom: '1.5rem',
                    lineHeight: '1.5'
                }}>
                    {message}
                </p>
                <button
                    onClick={onClose}
                    style={{
                        padding: '0.5rem 1.5rem',
                        border: 'none',
                        borderRadius: '6px',
                        backgroundColor: bgColors[type],
                        color: 'white',
                        fontSize: '14px',
                        fontWeight: '500',
                        cursor: 'pointer'
                    }}
                >
                    OK
                </button>
            </div>
        </div>
    );
};
