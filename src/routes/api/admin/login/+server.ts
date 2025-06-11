import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { connectDB } from '$lib/db/mongodb';
import { Admin } from '$lib/server/models/admin';
import { createToken } from '$lib/server/jwt';

export const POST: RequestHandler = async ({ request }) => {
    try {
        const { username, password } = await request.json();
        
        if (!username || !password) {
            return json({ error: 'Username and password are required' }, { status: 400 });
        }

        await connectDB();
        
        const admin = await Admin.findOne({ username });
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
            username: admin.username,
            superAdmin: admin.superAdmin
        });

        return json({
            token,
            user: {
                id: admin._id,
                username: admin.username,
                superAdmin: admin.superAdmin
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        return json({ error: 'Failed to login' }, { status: 500 });
    }
}; 