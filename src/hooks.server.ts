import type { Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { getTokenFromRequest, verifyToken } from '$lib/server/jwt';
import { initializeDatabase } from '$lib/server/seed';

// Handle JWT authentication
const handleAuth: Handle = async ({ event, resolve }) => {
    // Skip auth for public routes
    if (!event.url.pathname.startsWith('/api/admin') && 
        !event.url.pathname.startsWith('/admin')) {
        return resolve(event);
    }

    // Allow access to login, signup, and logout endpoints
    if (event.url.pathname === '/api/admin/login' || 
        event.url.pathname === '/api/admin/signup' ||
        event.url.pathname === '/api/admin/logout' ||
        event.url.pathname === '/admin/login' ||
        event.url.pathname === '/admin/signup') {
        return resolve(event);
    }

    const token = getTokenFromRequest(event.request);
    if (token) {
        try {
            const decoded = await verifyToken(token);
            event.locals.user = decoded;
        } catch (err) {
            console.error('JWT verification failed:', err);
        }
    }

    // If JWT auth failed, check for cookie auth
    if (!event.locals.user) {
        const adminData = event.cookies.get('admin');
        if (adminData) {
            try {
                const admin = JSON.parse(adminData);
                event.locals.user = admin;
            } catch (error) {
                console.error('Failed to parse admin cookie:', error);
            }
        }
    }

    // If neither auth method worked, return unauthorized
    if (!event.locals.user) {
        return new Response('Unauthorized', { status: 401 });
    }

    return resolve(event);
};

// Initialize database connection
initializeDatabase().catch(error => {
    console.error('Failed to initialize database:', error);
});

export const handle = sequence(handleAuth);