import { json } from '@sveltejs/kit';
import { connectDB } from '$lib/db/mongodb';
import { Project } from '$lib/models/Project';
import { verifyToken } from '$lib/utils/auth';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
  try {
    await connectDB();
    
    const projects = await Project.find()
      .sort({ createdAt: -1 })
      .lean();
    
    return json({
      projects: projects.map(project => ({
        _id: project._id.toString(),
        title: project.title,
        description: project.description,
        goal: project.goal,
        raised: project.raised,
        image: project.image || '',
        status: project.status,
        createdAt: project.createdAt.toISOString(),
        updatedAt: project.updatedAt.toISOString()
      }))
    });
  } catch (error) {
    console.error('Error fetching projects:', error);
    return json({ error: 'Failed to fetch projects' }, { status: 500 });
  }
};

export const POST: RequestHandler = async ({ request, cookies }) => {
  try {
    // Verify admin authentication (both admin and super_admin can create projects)
    const token = cookies.get('admin_token');
    const user = verifyToken(token);
    if (!token || !user || !['admin', 'super_admin'].includes(user.role)) {
      return json({ error: 'Admin access required' }, { status: 401 });
    }
    
    const { title, description, goal, image } = await request.json();
    
    // Validate input
    if (!title || !description || !goal) {
      return json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    if (goal < 1) {
      return json({ error: 'Goal must be greater than 0' }, { status: 400 });
    }
    
    await connectDB();
    
    const project = new Project({
      title: title.trim(),
      description: description.trim(),
      goal: parseFloat(goal),
      image: image?.trim() || '',
      status: 'active'
    });
    
    await project.save();
    
    return json({
      success: true,
      project: {
        _id: project._id.toString(),
        title: project.title,
        description: project.description,
        goal: project.goal,
        raised: project.raised,
        image: project.image,
        status: project.status,
        createdAt: project.createdAt.toISOString(),
        updatedAt: project.updatedAt.toISOString()
      }
    });
    
  } catch (error) {
    console.error('Error creating project:', error);
    return json({ error: 'Failed to create project' }, { status: 500 });
  }
};
