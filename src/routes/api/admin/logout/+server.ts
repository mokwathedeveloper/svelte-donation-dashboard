import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ cookies }) => {
    try {
        // Clear session cookies
        cookies.delete('session', { path: '/' });
        cookies.delete('admin', { path: '/' });
        
        return json({ success: true });
    } catch (error) {
        console.error('Logout error:', error);
        return json({ error: 'Failed to logout' }, { status: 500 });
    }
}; 