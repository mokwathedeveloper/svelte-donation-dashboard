import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
    // Get admin data from cookies
    const adminData = event.cookies.get('admin');
    
    // Check if this is an admin route
    if (event.url.pathname.startsWith('/admin')) {
        // If no admin cookie and not on login page, redirect to login
        if (!adminData && !event.url.pathname.endsWith('/login')) {
            return new Response('Redirect', { status: 303, headers: { Location: '/admin/login' } });
        }
    }

    // Check if this is an API route that requires admin auth
    if (event.url.pathname.startsWith('/api/projects') && 
        (event.request.method === 'DELETE' || event.request.method === 'PUT' || event.request.method === 'POST')) {
        if (!adminData) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }
    }

    const response = await resolve(event);
    return response;
}; 