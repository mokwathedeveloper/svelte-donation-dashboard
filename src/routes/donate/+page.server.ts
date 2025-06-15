import { connectDB } from '$lib/db/mongodb';
import { Project } from '$lib/models/Project';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
  const projectId = url.searchParams.get('project');
  
  if (!projectId) {
    throw error(400, 'Project ID is required');
  }
  
  try {
    await connectDB();
    
    const project = await Project.findById(projectId).lean();
    
    if (!project) {
      throw error(404, 'Project not found');
    }
    
    if (project.status !== 'active') {
      throw error(400, 'This project is not accepting donations');
    }
    
    return {
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
    };
  } catch (err) {
    if (err.status) {
      throw err;
    }
    console.error('Error loading project:', err);
    throw error(500, 'Failed to load project');
  }
};
