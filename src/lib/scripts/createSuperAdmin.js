import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Define Admin schema directly
const AdminSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['super_admin', 'admin'],
    default: 'admin'
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    default: null
  }
}, {
  timestamps: true
});

const Admin = mongoose.models.Admin || mongoose.model('Admin', AdminSchema);

const MONGODB_URI = process.env.MONGODB_URI;

async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
}

async function createSuperAdmin() {
  try {
    // Check if super admin already exists
    const existingSuperAdmin = await Admin.findOne({ role: 'super_admin' });
    
    if (existingSuperAdmin) {
      console.log('Super Admin already exists:');
      console.log('Email:', existingSuperAdmin.email);
      console.log('Name:', existingSuperAdmin.name);
      return;
    }
    
    // Create super admin
    const superAdminData = {
      email: 'superadmin@donationhub.com',
      password: await bcrypt.hash('SuperAdmin2024!', 12),
      role: 'super_admin',
      name: 'Super Administrator',
      isActive: true
    };
    
    const superAdmin = new Admin(superAdminData);
    await superAdmin.save();
    
    console.log('✅ Super Admin created successfully!');
    console.log('📧 Email: superadmin@donationhub.com');
    console.log('🔑 Password: SuperAdmin2024!');
    console.log('👤 Name: Super Administrator');
    console.log('🔐 Role: super_admin');
    console.log('');
    console.log('🚀 You can now login at: http://localhost:5173/admin/login');
    
  } catch (error) {
    if (error.code === 11000) {
      console.log('Super Admin with this email already exists');
    } else {
      console.error('Error creating super admin:', error);
    }
  }
}

async function main() {
  await connectDB();
  await createSuperAdmin();
  await mongoose.disconnect();
  console.log('Disconnected from MongoDB');
}

main().catch(console.error);
