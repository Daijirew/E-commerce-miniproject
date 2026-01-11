import { create } from 'zustand';

const useToastStore = create((set) => ({
    toasts: [],
    
    addToast: (toast) => {
        const id = Date.now() + Math.random();
        const newToast = {
            id,
            type: 'info', // success, error, warning, info
            title: '',
            message: '',
            duration: 3000,
            ...toast,
        };
        
        set((state) => ({
            toasts: [...state.toasts, newToast],
        }));
        
        // Auto remove after duration
        if (newToast.duration > 0) {
            setTimeout(() => {
                set((state) => ({
                    toasts: state.toasts.filter((t) => t.id !== id),
                }));
            }, newToast.duration);
        }
        
        return id;
    },
    
    removeToast: (id) => {
        set((state) => ({
            toasts: state.toasts.filter((t) => t.id !== id),
        }));
    },
    
    // Helper methods for different types
    success: (message, title = 'สำเร็จ!') => {
        return set((state) => {
            state.addToast({ type: 'success', title, message });
            return state;
        });
    },
    
    error: (message, title = 'เกิดข้อผิดพลาด!') => {
        return set((state) => {
            state.addToast({ type: 'error', title, message, duration: 4000 });
            return state;
        });
    },
    
    warning: (message, title = 'คำเตือน!') => {
        return set((state) => {
            state.addToast({ type: 'warning', title, message });
            return state;
        });
    },
    
    info: (message, title = 'ข้อมูล') => {
        return set((state) => {
            state.addToast({ type: 'info', title, message });
            return state;
        });
    },
}));

export default useToastStore;
