import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { connectDB } from '$lib/db/mongodb';
import { Admin } from '$lib/server/models/admin';

export const POST: RequestHandler = async ({ request, cookies }) => {
    try {
        await connectDB();
        const { username, password } = await request.json();

        // Find admin by username
        const admin = await Admin.findOne({ username });
        if (!admin) {
            return json({ error: 'Invalid credentials' }, { status: 401 });
        }

        // Verify password
        const isValid = await admin.comparePassword(password);
        if (!isValid) {
            return json({ error: 'Invalid credentials' }, { status: 401 });
        }

        // Set session cookie
        const sessionId = crypto.randomUUID();
        cookies.set('session', sessionId, {
            path: '/',
            httpOnly: true,
            sameSite: 'strict',
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24 // 24 hours
        });

        // Store admin info in session
        cookies.set('admin', JSON.stringify({
            id: admin._id.toString(),
            username: admin.username,
            superAdmin: admin.superAdmin
        }), {
            path: '/',
            httpOnly: true,
            sameSite: 'strict',
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24 // 24 hours
        });

        return json({ 
            success: true,
            admin: {
                username: admin.username,
                superAdmin: admin.superAdmin
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        return json({ error: 'Failed to process login' }, { status: 500 });
    }
}; 