import { connectDB } from '$lib/db/mongodb';
import { Project } from './models/project';

const sampleProjects = [
  {
    title: 'Clean Water Initiative',
    description: 'Providing clean and safe drinking water to rural communities through well construction and water purification systems.',
    goal: 500000,
    raised: 150000,
    image: 'https://images.unsplash.com/photo-1594398901394-4e34939a4fd0?q=80&w=1000',
  },
  {
    title: 'Education for All',
    description: 'Supporting underprivileged children with school supplies, uniforms, and access to quality education.',
    goal: 300000,
    raised: 75000,
    image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=1000',
  },
  {
    title: 'Community Health Center',
    description: 'Building a medical facility to provide basic healthcare services to underserved communities.',
    goal: 1000000,
    raised: 450000,
    image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=1000',
  },
  {
    title: 'Youth Sports Program',
    description: 'Creating opportunities for youth development through sports training and equipment.',
    goal: 200000,
    raised: 50000,
    image: 'https://images.unsplash.com/photo-1526976668912-1a811878dd37?q=80&w=1000',
  }
];

async function seed() {
  try {
    await connectDB();
    
    // Clear existing projects
    await Project.deleteMany({});
    console.log('Cleared existing projects');

    // Insert sample projects
    const projects = await Project.create(sampleProjects);
    console.log(`Created ${projects.length} sample projects`);

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seed(); 