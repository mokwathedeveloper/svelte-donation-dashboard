import { writable } from 'svelte/store';

export interface Toast {
    id: string;
    message: string;
    type: 'success' | 'error' | 'info';
    duration?: number;
}

function createToastStore() {
    const { subscribe, update } = writable<Toast[]>([]);

    return {
        subscribe,
        add: (toast: Omit<Toast, 'id'>) => {
            const id = Math.random().toString(36).substring(2);
            update(toasts => [...toasts, { ...toast, id }]);
            if (toast.duration !== Infinity) {
                setTimeout(() => {
                    toastStore.remove(id);
                }, toast.duration || 3000);
            }
        },
        remove: (id: string) => {
            update(toasts => toasts.filter(t => t.id !== id));
        }
    };
}

export const toastStore = createToastStore(); 