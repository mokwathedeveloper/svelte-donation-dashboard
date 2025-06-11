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

    const token = getTokenFromRequest(event.request);
    if (!token) {
        return new Response('Unauthorized', { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
        return new Response('Invalid token', { status: 401 });
    }

    // Add user info to event.locals
    event.locals.user = {
        id: payload.id,
        username: payload.username,
        superAdmin: payload.superAdmin
    };

    // For routes requiring super admin
    if (event.url.pathname.startsWith('/admin/manage') && !payload.superAdmin) {
        return new Response('Forbidden', { status: 403 });
    }

    // For routes requiring any admin (regular or super)
    if (event.url.pathname.startsWith('/admin/analysis') || 
        event.url.pathname.startsWith('/admin/chat') ||
        event.url.pathname.startsWith('/api/admin/analytics') ||
        event.url.pathname.startsWith('/api/admin/chat')) {
        return resolve(event);
    }

    return resolve(event);
};

export const handle = sequence(handleAuth); 