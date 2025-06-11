import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { connectDB } from '$lib/db/mongodb';
import { Project } from '$lib/server/models/project';
import type { SerializedProject } from '$lib/server/models/project';
import type { Types } from 'mongoose';

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

export const GET: RequestHandler = async () => {
  try {
    await connectDB();
    const rawProjects = await Project.find()
      .sort({ createdAt: -1 })
      .lean();
      
    if (!Array.isArray(rawProjects)) {
      throw new Error('Expected projects to be an array');
    }
    
    const projects = rawProjects as unknown as LeanProject[];
    
    const serializedProjects: SerializedProject[] = projects.map(project => ({
      _id: project._id.toString(),
      title: project.title,
      description: project.description,
      goal: project.goal,
      raised: project.raised,
      image: project.image,
      createdAt: project.createdAt.toISOString(),
      updatedAt: project.updatedAt.toISOString()
    }));

    return json(serializedProjects);
  } catch (error) {
    console.error('Failed to fetch projects:', error);
    return json({ error: 'Failed to fetch projects' }, { status: 500 });
  }
};

export const POST: RequestHandler = async ({ request }) => {
  try {
    await connectDB();
    const data = await request.json();
    const project = await Project.create(data);
    const leanProject = project.toObject() as LeanProject;
    
    const serializedProject: SerializedProject = {
      _id: leanProject._id.toString(),
      title: leanProject.title,
      description: leanProject.description,
      goal: leanProject.goal,
      raised: leanProject.raised,
      image: leanProject.image,
      createdAt: leanProject.createdAt.toISOString(),
      updatedAt: leanProject.updatedAt.toISOString()
    };

    return json(serializedProject);
  } catch (error) {
    console.error('Failed to create project:', error);
    return json({ error: 'Failed to create project' }, { status: 500 });
  }
}; 