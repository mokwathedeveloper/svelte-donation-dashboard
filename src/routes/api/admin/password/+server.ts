import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { connectDB } from '$lib/db/mongodb';
import { Admin } from '$lib/server/models/admin';

export const PUT: RequestHandler = async ({ request, locals }) => {
    try {
        if (!locals.admin?.id) {
            return json({ error: 'Not authenticated' }, { status: 401 });
        }

        const { currentPassword, newPassword } = await request.json();

        await connectDB();
        const admin = await Admin.findById(locals.admin.id);
        if (!admin) {
            return json({ error: 'Admin not found' }, { status: 404 });
        }

        // Verify current password
        const isValid = await admin.comparePassword(currentPassword);
        if (!isValid) {
            return json({ error: 'Current password is incorrect' }, { status: 400 });
        }

        // Update password
        admin.password = newPassword;
        await admin.save();

        return json({ success: true });
    } catch (error) {
        console.error('Password change error:', error);
        return json({ error: 'Failed to change password' }, { status: 500 });
    }
}; 