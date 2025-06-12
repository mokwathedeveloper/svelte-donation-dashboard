import { sequence } from '@sveltejs/kit/hooks';
import type { Handle } from '@sveltejs/kit';
import { getTokenFromRequest, verifyToken } from '$lib/server/jwt';

// Handle JWT authentication
const handleAuth: Handle = async ({ event, resolve }) => {
    // Skip auth for public routes
    if (!event.url.pathname.startsWith('/api/admin') && 
        !event.url.pathname.startsWith('/admin')) {
        return resolve(event);
    }

    // Allow access to login and signup endpoints
    if (event.url.pathname === '/api/admin/login' || 
        event.url.pathname === '/api/admin/signup' ||
        event.url.pathname === '/admin/login' ||
        event.url.pathname === '/admin/signup') {
        return resolve(event);
    }

    // Check for JWT token in Authorization header
    const token = getTokenFromRequest(event.request);
    let isAuthenticated = false;

    if (token) {
        try {
            const payload = verifyToken(token);
            event.locals.user = {
                id: payload.id,
                username: payload.username
            };
            isAuthenticated = true;
        } catch (error) {
            console.error('JWT verification failed:', error);
        }
    }

    // If JWT auth failed, check for cookie auth
    if (!isAuthenticated) {
        const adminData = event.cookies.get('admin');
        if (adminData) {
            try {
                const admin = JSON.parse(adminData);
                event.locals.user = admin;
                isAuthenticated = true;
            } catch (error) {
                console.error('Failed to parse admin cookie:', error);
            }
        }
    }

    // If neither auth method worked, return unauthorized
    if (!isAuthenticated) {
        return new Response('Unauthorized', { status: 401 });
    }

    return resolve(event);
};

export const handle = sequence(handleAuth);