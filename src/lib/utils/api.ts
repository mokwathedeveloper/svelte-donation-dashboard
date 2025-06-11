import { auth } from '$lib/stores/auth';
import { get } from 'svelte/store';

interface FetchOptions extends RequestInit {
    body?: any;
}

export async function apiFetch(endpoint: string, options: FetchOptions = {}) {
    const authState = get(auth);
    
    // Add authorization header if token exists
    if (authState.token) {
        options.headers = {
            ...options.headers,
            'Authorization': `Bearer ${authState.token}`
        };
    }

    // Convert body to JSON string if it's an object
    if (options.body && typeof options.body === 'object') {
        options.body = JSON.stringify(options.body);
        options.headers = {
            ...options.headers,
            'Content-Type': 'application/json'
        };
    }

    const response = await fetch(endpoint, options);

    // Handle unauthorized responses
    if (response.status === 401) {
        auth.logout();
        throw new Error('Unauthorized');
    }

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || 'API request failed');
    }

    return data;
} 