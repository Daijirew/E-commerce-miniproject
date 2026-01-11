import React, { useEffect } from 'react';
import useToastStore from '../store/useToastStore';
import './Toast.css';

function Toast({ toast }) {
    const { removeToast } = useToastStore();

    useEffect(() => {
        // Trigger animation
        const timer = setTimeout(() => {
            const element = document.getElementById(`toast-${toast.id}`);
            if (element) {
                element.classList.add('toast-show');
            }
        }, 10);

        return () => clearTimeout(timer);
    }, [toast.id]);

    const handleClose = () => {
        const element = document.getElementById(`toast-${toast.id}`);
        if (element) {
            element.classList.add('toast-hide');
            setTimeout(() => {
                removeToast(toast.id);
            }, 300);
        }
    };

    const getIcon = () => {
        switch (toast.type) {
            case 'success':
                return '✓';
            case 'error':
                return '✕';
            case 'warning':
                return '⚠';
            case 'info':
            default:
                return 'ℹ';
        }
    };

    return (
        <div
            id={`toast-${toast.id}`}
            className={`toast toast-${toast.type}`}
        >
            <div className="toast-icon">{getIcon()}</div>
            <div className="toast-content">
                {toast.title && <div className="toast-title">{toast.title}</div>}
                <div className="toast-message">{toast.message}</div>
            </div>
            <button className="toast-close" onClick={handleClose}>
                ×
            </button>
        </div>
    );
}

function ToastContainer() {
    const { toasts } = useToastStore();

    return (
        <div className="toast-container">
            {toasts.map((toast) => (
                <Toast key={toast.id} toast={toast} />
            ))}
        </div>
    );
}

export default ToastContainer;
