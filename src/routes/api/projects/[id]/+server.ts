import { json } from '@sveltejs/kit';
import { connectDB } from '$lib/db/mongodb';
import { Project } from '$lib/models/Project';
import { verifyToken } from '$lib/utils/auth';
import type { RequestHandler } from './$types';

// Get single project
export const GET: RequestHandler = async ({ params }) => {
  try {
    await connectDB();
    
    const project = await Project.findById(params.id).lean();
    
    if (!project) {
      return json({ error: 'Project not found' }, { status: 404 });
    }
    
    return json({
      project: {
        _id: project._id.toString(),
        title: project.title,
        description: project.description,
        goal: project.goal,
        raised: project.raised,
        image: project.image || '',
        status: project.status,
        createdAt: project.createdAt.toISOString(),
        updatedAt: project.updatedAt.toISOString()
      }
    });
  } catch (error) {
    console.error('Error fetching project:', error);
    return json({ error: 'Failed to fetch project' }, { status: 500 });
  }
};

// Update project
export const PUT: RequestHandler = async ({ request, cookies, params }) => {
  try {
    // Verify admin authentication (both admin and super_admin can update projects)
    const token = cookies.get('admin_token');
    const user = verifyToken(token);
    if (!token || !user || !['admin', 'super_admin'].includes(user.role)) {
      return json({ error: 'Admin access required' }, { status: 401 });
    }
    
    const { title, description, goal, image, status } = await request.json();
    
    await connectDB();
    
    const updateData: any = {};
    if (title !== undefined) updateData.title = title.trim();
    if (description !== undefined) updateData.description = description.trim();
    if (goal !== undefined) updateData.goal = parseFloat(goal);
    if (image !== undefined) updateData.image = image.trim();
    if (status !== undefined && ['active', 'completed', 'paused'].includes(status)) {
      updateData.status = status;
    }
    
    const updatedProject = await Project.findByIdAndUpdate(
      params.id,
      updateData,
      { new: true }
    );
    
    if (!updatedProject) {
      return json({ error: 'Project not found' }, { status: 404 });
    }
    
    return json({
      success: true,
      message: 'Project updated successfully',
      project: {
        _id: updatedProject._id.toString(),
        title: updatedProject.title,
        description: updatedProject.description,
        goal: updatedProject.goal,
        raised: updatedProject.raised,
        image: updatedProject.image,
        status: updatedProject.status,
        createdAt: updatedProject.createdAt.toISOString(),
        updatedAt: updatedProject.updatedAt.toISOString()
      }
    });
    
  } catch (error) {
    console.error('Error updating project:', error);
    return json({ error: 'Failed to update project' }, { status: 500 });
  }
};

// Delete project (Super Admin only)
export const DELETE: RequestHandler = async ({ cookies, params }) => {
  try {
    // Verify super admin authentication
    const token = cookies.get('admin_token');
    const user = verifyToken(token);
    if (!token || !user || user.role !== 'super_admin') {
      return json({ error: 'Super Admin access required' }, { status: 403 });
    }
    
    await connectDB();
    
    const deletedProject = await Project.findByIdAndDelete(params.id);
    
    if (!deletedProject) {
      return json({ error: 'Project not found' }, { status: 404 });
    }
    
    return json({
      success: true,
      message: 'Project deleted successfully'
    });
    
  } catch (error) {
    console.error('Error deleting project:', error);
    return json({ error: 'Failed to delete project' }, { status: 500 });
  }
};
