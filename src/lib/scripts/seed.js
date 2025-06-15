import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Define Project schema directly in seed file to avoid import issues
const ProjectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  goal: {
    type: Number,
    required: true,
    min: 1
  },
  raised: {
    type: Number,
    default: 0,
    min: 0
  },
  image: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'paused'],
    default: 'active'
  }
}, {
  timestamps: true
});

const Project = mongoose.models.Project || mongoose.model('Project', ProjectSchema);

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/donation-platform';

async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
}

const sampleProjects = [
  {
    title: 'Clean Water Initiative',
    description: 'Providing clean and safe drinking water to rural communities. This project aims to install water purification systems and dig boreholes in areas where access to clean water is limited. Your donation will help purchase equipment, hire local workers, and maintain the systems for years to come.',
    goal: 500000,
    image: 'https://images.unsplash.com/photo-1541919329513-35f7af297129?w=800&h=600&fit=crop',
    status: 'active'
  },
  {
    title: 'Education for All',
    description: 'Supporting underprivileged children with school supplies, uniforms, and educational resources. This initiative focuses on ensuring that every child has access to quality education regardless of their economic background. Funds will be used for books, stationery, school fees, and learning materials.',
    goal: 300000,
    image: 'https://images.unsplash.com/photo-1497486751825-1233686d5d80?w=800&h=600&fit=crop',
    status: 'active'
  },
  {
    title: 'Healthcare Support Program',
    description: 'Providing medical assistance and healthcare services to communities in need. This program includes mobile clinics, medical supplies, and support for local healthcare workers. Your contribution will help save lives and improve the health outcomes of vulnerable populations.',
    goal: 750000,
    image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&h=600&fit=crop',
    status: 'active'
  },
  {
    title: 'Food Security Project',
    description: 'Addressing hunger and malnutrition in vulnerable communities through sustainable food programs. This includes setting up community gardens, providing seeds and farming tools, and establishing food distribution networks. Together, we can ensure no one goes to bed hungry.',
    goal: 400000,
    image: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=800&h=600&fit=crop',
    status: 'active'
  },
  {
    title: 'Youth Empowerment Center',
    description: 'Creating opportunities for young people through skills training, mentorship, and entrepreneurship programs. This center will provide vocational training, business development support, and life skills education to help youth build sustainable livelihoods.',
    goal: 600000,
    image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=600&fit=crop',
    status: 'active'
  }
];

async function seedProjects() {
  try {
    // Clear existing projects
    await Project.deleteMany({});
    console.log('Cleared existing projects');
    
    // Insert sample projects
    const projects = await Project.insertMany(sampleProjects);
    console.log(`Inserted ${projects.length} sample projects`);
    
    // Add some raised amounts to make it look realistic
    for (let i = 0; i < projects.length; i++) {
      const project = projects[i];
      const raisedAmount = Math.floor(Math.random() * (project.goal * 0.7)); // 0-70% of goal
      project.raised = raisedAmount;
      await project.save();
    }
    
    console.log('Updated projects with sample raised amounts');
    console.log('Seed data inserted successfully!');
    
  } catch (error) {
    console.error('Error seeding projects:', error);
  }
}

async function main() {
  await connectDB();
  await seedProjects();
  await mongoose.disconnect();
  console.log('Disconnected from MongoDB');
}

main().catch(console.error);
