import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { connectDB } from '$lib/db/mongodb';
import { Admin } from '$lib/server/models/admin';
import { SUPER_ADMIN_SECRET } from '$env/static/private';

export const POST: RequestHandler = async ({ request }) => {
    try {
        const { username, password, secretKey, isSuperAdmin } = await request.json();

        await connectDB();

        // Check if any admin exists
        const adminExists = await Admin.findOne({ superAdmin: true });

        // If super admin exists, verify secret key
        if (adminExists && isSuperAdmin) {
            return json({ error: 'Super admin already exists' }, { status: 400 });
        }

        // For super admin signup
        if (isSuperAdmin) {
            if (secretKey !== SUPER_ADMIN_SECRET) {
                return json({ error: 'Invalid secret key' }, { status: 401 });
            }

            const superAdmin = new Admin({
                username,
                password,
                superAdmin: true,
                secretKey // Store secret key for future admin creation
            });

            await superAdmin.save();
            return json({ success: true, message: 'Super admin created successfully' });
        }

        // For regular admin signup (must be created by super admin)
        const superAdmin = await Admin.findOne({ superAdmin: true });
        if (!superAdmin || !await Admin.verifySecretKey(secretKey)) {
            return json({ error: 'Invalid secret key' }, { status: 401 });
        }

        const admin = new Admin({
            username,
            password,
            superAdmin: false
        });

        await admin.save();
        return json({ success: true, message: 'Admin created successfully' });
    } catch (error) {
        console.error('Signup error:', error);
        if (error instanceof Error && error.message.includes('duplicate key')) {
            return json({ error: 'Username already exists' }, { status: 400 });
        }
        return json({ error: 'Failed to create admin account' }, { status: 500 });
    }
}; 