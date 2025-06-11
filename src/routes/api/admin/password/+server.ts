import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { connectDB } from '$lib/db/mongodb';
import { Admin } from '$lib/server/models/admin';

export const PUT: RequestHandler = async ({ request, locals }) => {
    try {
        if (!locals.user?.id) {
            return json({ error: 'Not authenticated' }, { status: 401 });
        }

        const { currentPassword, newPassword } = await request.json();

        if (!currentPassword || !newPassword) {
            return json({ error: 'Current password and new password are required' }, { status: 400 });
        }

        await connectDB();
        const admin = await Admin.findById(locals.user.id);
        if (!admin) {
            return json({ error: 'Admin not found' }, { status: 404 });
        }

        // Verify current password
        const isValid = await admin.comparePassword(currentPassword);
        if (!isValid) {
            return json({ error: 'Current password is incorrect' }, { status: 400 });
        }

        // Check if new password is unique
        const isPasswordUnique = await Admin.isPasswordUnique(newPassword, admin._id.toString());
        if (!isPasswordUnique) {
            return json({ error: 'Password is already in use by another admin' }, { status: 400 });
        }

        // Update password
        admin.password = newPassword;
        await admin.save();

        return json({ success: true, message: 'Password changed successfully' });
    } catch (error) {
        console.error('Password change error:', error);
        if (error.name === 'ValidationError') {
            return json({ error: error.message }, { status: 400 });
        }
        return json({ error: 'Failed to change password' }, { status: 500 });
    }
}; 