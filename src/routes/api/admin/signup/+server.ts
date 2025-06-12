import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { connectDB } from '$lib/db/mongodb';
import { Admin } from '$lib/server/models/admin';
import bcrypt from 'bcrypt';

export const POST: RequestHandler = async ({ request }) => {
    try {
        const { username, password } = await request.json();

        if (!username || !password) {
            return json({ error: 'Username and password are required' }, { status: 400 });
        }

        await connectDB();

        // Check if username already exists
        const existingAdmin = await Admin.findOne({ username });
        if (existingAdmin) {
            return json({ error: 'Username already exists' }, { status: 400 });
        }

        const admin = new Admin({
            username,
            password
        });

        await admin.save();
        return json({ success: true, message: 'Admin created successfully' });
    } catch (error) {
        console.error('Signup error:', error);
        return json({ error: 'Failed to create admin' }, { status: 500 });
    }
}; 