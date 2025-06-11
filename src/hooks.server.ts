import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
    const session = event.cookies.get('session');
    const adminData = event.cookies.get('admin');

    // Check if accessing admin routes
    if (event.url.pathname.startsWith('/admin')) {
        // Allow access to login page
        if (event.url.pathname === '/admin/login') {
            // If already logged in, redirect to dashboard
            if (session && adminData) {
                return new Response(null, {
                    status: 302,
                    headers: { Location: '/admin/dashboard' }
                });
            }
            return resolve(event);
        }

        // Protect all other admin routes
        if (!session || !adminData) {
            return new Response(null, {
                status: 302,
                headers: { Location: '/admin/login' }
            });
        }

        // Add admin data to event.locals
        try {
            event.locals.admin = JSON.parse(adminData);
        } catch (error) {
            console.error('Failed to parse admin data:', error);
            return new Response(null, {
                status: 302,
                headers: { Location: '/admin/login' }
            });
        }
    }

    return resolve(event);
}; 