import { connectDB } from '$lib/db/mongodb';
import { Admin } from './models/admin';
import dotenv from 'dotenv';

dotenv.config();

// Admin configuration - you can modify this or load from environment variables
const adminConfig = [
    {
        username: process.env.SUPER_ADMIN_USERNAME || 'superadmin',
        password: process.env.SUPER_ADMIN_PASSWORD || 'admin123',
        superAdmin: true
    },
    {
        username: process.env.ADMIN_USERNAME || 'admin',
        password: process.env.ADMIN_PASSWORD || 'admin456',
        superAdmin: false
    }
];

async function seedAdmins() {
    try {
        await connectDB();
        console.log('Connected to database');

        // Create admins
        for (const adminData of adminConfig) {
            const existingAdmin = await Admin.findOne({ username: adminData.username });
            
            if (existingAdmin) {
                console.log(`Admin ${adminData.username} already exists`);
                continue;
            }

            const admin = await Admin.create(adminData);
            console.log(`Created ${admin.superAdmin ? 'super admin' : 'admin'}: ${admin.username}`);
        }

        console.log('Admin seeding completed successfully');
    } catch (error) {
        console.error('Failed to seed admins:', error);
    } finally {
        process.exit(0);
    }
}

seedAdmins(); 