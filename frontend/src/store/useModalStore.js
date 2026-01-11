import { create } from 'zustand';

const useModalStore = create((set) => ({
    isOpen: false,
    title: '',
    message: '',
    type: 'confirm', // 'confirm', 'alert', 'custom'
    confirmText: 'OK',
    cancelText: 'Cancel',
    onConfirm: null,
    onCancel: null,
    
    openModal: ({ title, message, type = 'confirm', confirmText = 'OK', cancelText = 'ยกเลิก', onConfirm, onCancel }) => {
        set({
            isOpen: true,
            title,
            message,
            type,
            confirmText,
            cancelText,
            onConfirm,
            onCancel,
        });
    },
    
    closeModal: () => {
        set({
            isOpen: false,
            onConfirm: null,
            onCancel: null,
        });
    },
    
    // Helper for confirm dialog
    confirm: (message, title = 'ยืนยันการดำเนินการ') => {
        return new Promise((resolve) => {
            set({
                isOpen: true,
                title,
                message,
                type: 'confirm',
                confirmText: 'OK',
                cancelText: 'ยกเลิก',
                onConfirm: () => {
                    set({ isOpen: false });
                    resolve(true);
                },
                onCancel: () => {
                    set({ isOpen: false });
                    resolve(false);
                },
            });
        });
    },
    
    // Helper for alert dialog
    alert: (message, title = 'แจ้งเตือน') => {
        return new Promise((resolve) => {
            set({
                isOpen: true,
                title,
                message,
                type: 'alert',
                confirmText: 'OK',
                onConfirm: () => {
                    set({ isOpen: false });
                    resolve(true);
                },
                onCancel: null,
            });
        });
    },
}));

export default useModalStore;
