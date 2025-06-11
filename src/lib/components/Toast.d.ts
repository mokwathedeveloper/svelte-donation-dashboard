import type { Writable } from 'svelte/store';

export interface ToastStore {
  visible: boolean;
  message: string;
  type: 'success' | 'error' | 'info';
  duration: number;
}

export const toastStore: Writable<ToastStore>; 