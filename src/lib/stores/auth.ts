import { writable } from 'svelte/store';
import { browser } from '$app/environment';

interface User {
    id: string;
    username: string;
}

interface AuthState {
    token: string | null;
    user: User | null;
}

function createAuthStore() {
    // Initialize from localStorage if in browser
    const initialState: AuthState = browser ? {
        token: localStorage.getItem('token'),
        user: JSON.parse(localStorage.getItem('user') || 'null')
    } : {
        token: null,
        user: null
    };

    const { subscribe, set, update } = writable<AuthState>(initialState);

    return {
        subscribe,
        login: (token: string, user: User) => {
            if (browser) {
                localStorage.setItem('token', token);
                localStorage.setItem('user', JSON.stringify(user));
            }
            set({ token, user });
        },
        logout: () => {
            if (browser) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            }
            set({ token: null, user: null });
        }
    };
}

export const auth = createAuthStore(); 