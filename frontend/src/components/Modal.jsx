import React, { useEffect } from 'react';
import useModalStore from '../store/useModalStore';
import './Modal.css';

function Modal() {
    const { isOpen, title, message, type, confirmText, cancelText, onConfirm, onCancel, closeModal } = useModalStore();

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape' && isOpen) {
                handleCancel();
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen]);

    const handleConfirm = () => {
        if (onConfirm) {
            onConfirm();
        }
        closeModal();
    };

    const handleCancel = () => {
        if (onCancel) {
            onCancel();
        }
        closeModal();
    };

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            handleCancel();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={handleBackdropClick}>
            <div className="modal-container">
                <div className="modal-content">
                    {title && <h3 className="modal-title">{title}</h3>}
                    <p className="modal-message">{message}</p>
                </div>
                <div className="modal-actions">
                    {type === 'confirm' && onCancel && (
                        <button
                            className="modal-btn modal-btn-cancel"
                            onClick={handleCancel}
                        >
                            {cancelText}
                        </button>
                    )}
                    <button
                        className="modal-btn modal-btn-confirm"
                        onClick={handleConfirm}
                        autoFocus
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Modal;
