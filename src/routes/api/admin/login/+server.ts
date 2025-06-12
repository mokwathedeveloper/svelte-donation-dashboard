import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { connectDB } from '$lib/db/mongodb';
import { Admin, type IAdmin } from '$lib/server/models/admin';
import { createToken } from '$lib/server/jwt';

export const POST: RequestHandler = async ({ request, cookies }) => {
    try {
        const { username, password } = await request.json();
        
        if (!username || !password) {
            return json({ error: 'Username and password are required' }, { status: 400 });
        }

        await connectDB();
        
        const admin = await Admin.findOne({ username }).exec() as IAdmin | null;
        if (!admin) {
            return json({ error: 'Invalid credentials' }, { status: 401 });
        }

        const isValidPassword = await admin.comparePassword(password);
        if (!isValidPassword) {
            return json({ error: 'Invalid credentials' }, { status: 401 });
        }

        // Create JWT token
        const token = createToken({
            id: admin._id.toString(),
            username: admin.username
        });

        // Set admin cookie
        const adminData = {
            id: admin._id.toString(),
            username: admin.username
        };
        cookies.set('admin', JSON.stringify(adminData), {
            path: '/',
            httpOnly: true,
            sameSite: 'strict',
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24 * 7 // 7 days
        });

        return json({
            token,
            user: adminData
        });
    } catch (error) {
        console.error('Login error:', error);
        return json({ error: 'Failed to login' }, { status: 500 });
    }
}; 