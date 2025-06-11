import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { connectDB } from '$lib/db/mongodb';
import { Project } from '$lib/server/models/project';

export const DELETE: RequestHandler = async ({ params, cookies }) => {
    try {
        // Check if user is authenticated as admin
        const adminCookie = cookies.get('admin');
        if (!adminCookie) {
            return json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();
        
        // Delete the project
        const result = await Project.findByIdAndDelete(params.id);
        
        if (!result) {
            return json({ error: 'Project not found' }, { status: 404 });
        }

        return json({ success: true });
    } catch (error) {
        console.error('Delete project error:', error);
        return json({ error: 'Failed to delete project' }, { status: 500 });
    }
}; 