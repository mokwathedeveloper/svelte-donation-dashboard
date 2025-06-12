import { connectDB } from '$lib/db/mongodb';
import { Project, type SerializedProject } from '$lib/server/models/project';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
    try {
        await connectDB();
        const projects = await Project.find().lean();
        
        // Properly serialize MongoDB documents
        const serializedProjects = projects.map(project => ({
            _id: project._id.toString(),
            title: project.title,
            description: project.description,
            goal: project.goal,
            raised: project.raised,
            image: project.image,
            createdAt: project.createdAt.toISOString(),
            updatedAt: project.updatedAt.toISOString()
        }));

        return {
            projects: serializedProjects
        };
    } catch (error) {
        console.error('Error loading projects:', error);
        return {
            projects: []
        };
    }
}; 