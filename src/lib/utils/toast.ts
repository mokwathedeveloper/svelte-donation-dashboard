import { toastStore } from '$lib/stores/toast';
import type { Toast } from '$lib/stores/toast';

export function showToast(message: string, type: Toast['type'] = 'info', duration = 3000) {
  toastStore.add({
    message,
    type,
    duration
  });
}

export function showSuccessToast(message: string, duration = 3000) {
  showToast(message, 'success', duration);
}

export function showErrorToast(message: string, duration = 3000) {
  showToast(message, 'error', duration);
}

export function showInfoToast(message: string, duration = 3000) {
  showToast(message, 'info', duration);
}

export function hideToast() {
  toastStore.set({
    visible: false,
    message: '',
    type: 'info',
    duration: 3000
  });
} 