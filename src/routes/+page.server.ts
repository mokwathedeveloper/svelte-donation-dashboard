import type { PageServerLoad } from './$types';
import { connectDB } from '$lib/db/mongodb';
import { Project } from '$lib/server/models/project';
import type { SerializedProject } from '$lib/server/models/project';
import type { Types } from 'mongoose';
import { error } from '@sveltejs/kit';

interface LeanProject {
  _id: Types.ObjectId;
  title: string;
  description: string;
  goal: number;
  raised: number;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
}

export const load: PageServerLoad = async () => {
  try {
    // Log start of function
    console.log('Starting load function...');

    // Ensure MongoDB is connected
    console.log('Attempting database connection...');
    const db = await connectDB();
    
    // Log connection state
    console.log('MongoDB connection state:', {
      readyState: db.connection.readyState,
      host: db.connection.host,
      name: db.connection.name
    });
    
    if (!db.connection.readyState) {
      console.error('MongoDB connection state:', db.connection.readyState);
      throw error(500, 'Database connection is not ready');
    }
    
    console.log('Database connected, fetching projects...');
    
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

    if (!Array.isArray(rawProjects)) {
      console.error('Projects query result is not an array:', typeof rawProjects);
      throw error(500, 'Invalid database response');
    }

    if (rawProjects.length === 0) {
      console.log('No projects found in database');
      return {
        projects: []
      };
    }
    
    const serializedProjects: SerializedProject[] = rawProjects.map((project, index) => {
      try {
        if (!project || typeof project !== 'object') {
          console.error(`Invalid project data at index ${index}:`, project);
          throw new Error(`Invalid project data at index ${index}`);
        }

        if (!project._id) {
          console.error(`Project at index ${index} has no _id:`, project);
          throw new Error(`Project at index ${index} has no _id`);
        }

        const serialized: SerializedProject = {
          _id: project._id.toString(),
          title: project.title || 'Untitled Project',
          description: project.description || 'No description available',
          goal: typeof project.goal === 'number' ? project.goal : 0,
          raised: typeof project.raised === 'number' ? project.raised : 0,
          image: project.image || '',
          createdAt: project.createdAt ? new Date(project.createdAt).toISOString() : new Date().toISOString(),
          updatedAt: project.updatedAt ? new Date(project.updatedAt).toISOString() : new Date().toISOString()
        };

        // Log serialized project
        console.log(`Serialized project ${index}:`, {
          _id: serialized._id,
          title: serialized.title
        });

        return serialized;
      } catch (err) {
        console.error(`Error serializing project at index ${index}:`, project, err);
        throw error(500, `Failed to process project data at index ${index}`);
      }
    });

    console.log('Successfully serialized all projects');

    return {
      projects: serializedProjects
    };
  } catch (err) {
    // Log the full error details
    console.error('Error in load function:', {
      message: err instanceof Error ? err.message : 'Unknown error',
      stack: err instanceof Error ? err.stack : undefined,
      details: err
    });
    
    if (err instanceof Error) {
      throw error(500, err.message);
    }
    throw error(500, 'Failed to load projects');
  }
}; 