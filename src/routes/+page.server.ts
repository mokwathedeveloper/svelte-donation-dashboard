import { connectDB } from '$lib/db/mongodb';
import { Project } from '$lib/models/Project';
import type { PageServerLoad } from './$types';

// Sample projects for when database is not available
const sampleProjects = [
  {
    _id: '1',
    title: 'Clean Water Initiative',
    description: 'Providing clean and safe drinking water to rural communities. This project aims to install water purification systems and dig boreholes in areas where access to clean water is limited.',
    goal: 500000,
    raised: 150000,
    image: 'https://images.unsplash.com/photo-1541919329513-35f7af297129?w=800&h=600&fit=crop',
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: '2',
    title: 'Education for All',
    description: 'Supporting underprivileged children with school supplies, uniforms, and educational resources. This initiative focuses on ensuring that every child has access to quality education.',
    goal: 300000,
    raised: 75000,
    image: 'https://images.unsplash.com/photo-1497486751825-1233686d5d80?w=800&h=600&fit=crop',
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const load: PageServerLoad = async () => {
  try {
    await connectDB();

    const projects = await Project.find({ status: 'active' })
      .sort({ createdAt: -1 })
      .lean();

    return {
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
    };
  } catch (error) {
    console.error('Error loading projects:', error);
    console.log('📝 Using sample projects since database is not available');

    // Return sample projects when database is not available
    return {
      projects: sampleProjects
    };
  }
};
