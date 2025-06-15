import { json } from '@sveltejs/kit';
import bcrypt from 'bcryptjs';
import { connectDB } from '$lib/db/mongodb';
import { Admin } from '$lib/models/Admin';
import { SUPER_ADMIN_CREATION_KEY } from '$env/static/private';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
  try {
    const { name, email, password, specialKey } = await request.json();

    console.log('Super Admin creation attempt:', { name, email, hasPassword: !!password, hasSpecialKey: !!specialKey });

    if (!name || !email || !password || !specialKey) {
      console.log('Missing required fields');
      return json({ error: 'All fields are required' }, { status: 400 });
    }

    // Verify special creation key
    if (specialKey !== SUPER_ADMIN_CREATION_KEY) {
      console.log('Invalid creation key provided');
      return json({ error: 'Invalid creation key. Super Admin creation denied.' }, { status: 403 });
    }

    if (password.length < 8) {
      console.log('Password too short');
      return json({ error: 'Password must be at least 8 characters long' }, { status: 400 });
    }

    console.log('All validations passed, proceeding with creation...');

    await connectDB();

    // Check if admin with email already exists
    const existingAdmin = await Admin.findOne({ email: email.toLowerCase() });
    if (existingAdmin) {
      return json({ error: 'Admin with this email already exists' }, { status: 400 });
    }

    // Check how many super admins exist
    const superAdminCount = await Admin.countDocuments({ role: 'super_admin' });
    console.log(`Current super admin count: ${superAdminCount}`);

    // Hash password
    console.log('Hashing password...');
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create super admin
    console.log('Creating super admin in database...');
    const superAdmin = new Admin({
      email: email.toLowerCase(),
      password: hashedPassword,
      name: name.trim(),
      role: 'super_admin',
      isActive: true,
      createdBy: null // Super admin has no creator
    });

    await superAdmin.save();
    console.log('✅ Super Admin created successfully:', superAdmin.email);

    return json({
      success: true,
      message: 'Super Admin created successfully',
      admin: {
        _id: superAdmin._id.toString(),
        email: superAdmin.email,
        name: superAdmin.name,
        role: superAdmin.role,
        isActive: superAdmin.isActive,
        createdAt: superAdmin.createdAt.toISOString()
      }
    });

  } catch (error) {
    console.error('Error creating super admin:', error);
    return json({ error: 'Failed to create super admin' }, { status: 500 });
  }
};
