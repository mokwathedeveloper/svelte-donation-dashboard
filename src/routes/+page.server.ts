import type { PageServerLoad } from './$types';
import { connectDB } from '$lib/db/mongodb';
import { Project } from '$lib/server/models/project';
import type { SerializedProject } from '$lib/server/models/project';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async () => {
  try {
    // Ensure MongoDB is connected
    await connectDB();
    
    // Fetch projects
    const rawProjects = await Project.find()
      .sort({ createdAt: -1 })
      .lean()
      .exec();
      
    console.log('Raw projects fetched:', 
      rawProjects.map(p => ({ 
        _id: p._id?.toString(), 
        title: p.title,
        goal: p.goal,
        raised: p.raised 
      }))
    );

    const serializedProjects: SerializedProject[] = rawProjects.map((project: any) => ({
      _id: project._id.toString(),
      title: project.title,
      description: project.description,
      goal: project.goal,
      raised: project.raised,
      image: project.image,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt
    }));

    console.log('Successfully serialized all projects');
    
    return {
      projects: serializedProjects
    };
  } catch (err) {
    console.error('Error in load function:', err);
    const errorMessage = err instanceof Error ? err.message : 'Internal server error';
    throw error(500, errorMessage);
  }
}; 