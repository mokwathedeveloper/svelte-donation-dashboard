import { json } from '@sveltejs/kit';
import { connectDB } from '$lib/db/mongodb';
import { Admin } from '$lib/models/Admin';
import { verifyToken, hashPassword } from '$lib/utils/auth';
import bcrypt from 'bcryptjs';
import type { RequestHandler } from './$types';

// Get all admins (Super Admin only)
export const GET: RequestHandler = async ({ cookies }) => {
  try {
    const token = cookies.get('admin_token');
    if (!token) {
      return json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = verifyToken(token);
    if (!user || user.role !== 'super_admin') {
      return json({ error: 'Super Admin access required' }, { status: 403 });
    }
    
    await connectDB();

    const admins = await Admin.find()
      .select('-password')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .lean();
    
    return json({
      admins: admins.map(admin => ({
        _id: admin._id.toString(),
        email: admin.email,
        name: admin.name,
        role: admin.role,
        isActive: admin.isActive,
        createdBy: admin.createdBy ? {
          name: admin.createdBy.name,
          email: admin.createdBy.email
        } : null,
        createdAt: admin.createdAt.toISOString(),
        updatedAt: admin.updatedAt.toISOString()
      }))
    });
    
  } catch (error) {
    console.error('Error fetching admins:', error);
    return json({ error: 'Failed to fetch admins' }, { status: 500 });
  }
};

// Create new admin (Super Admin only)
export const POST: RequestHandler = async ({ request, cookies }) => {
  try {
    const token = cookies.get('admin_token');
    if (!token) {
      return json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = verifyToken(token);
    if (!user || user.role !== 'super_admin') {
      return json({ error: 'Super Admin access required' }, { status: 403 });
    }

    const { email, password, name, role } = await request.json();
    
    if (!email || !password || !name) {
      return json({ error: 'Email, password, and name are required' }, { status: 400 });
    }
    
    if (password.length < 6) {
      return json({ error: 'Password must be at least 6 characters long' }, { status: 400 });
    }
    
    if (role && !['admin', 'super_admin'].includes(role)) {
      return json({ error: 'Invalid role' }, { status: 400 });
    }
    
    await connectDB();
    
    // Check if admin with email already exists
    const existingAdmin = await Admin.findOne({ email: email.toLowerCase() });
    if (existingAdmin) {
      return json({ error: 'Admin with this email already exists' }, { status: 400 });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Create new admin
    const newAdmin = new Admin({
      email: email.toLowerCase(),
      password: hashedPassword,
      name: name.trim(),
      role: role || 'admin',
      isActive: true,
      createdBy: user.id
    });
    
    await newAdmin.save();
    
    return json({
      success: true,
      message: 'Admin created successfully',
      admin: {
        _id: newAdmin._id.toString(),
        email: newAdmin.email,
        name: newAdmin.name,
        role: newAdmin.role,
        isActive: newAdmin.isActive,
        createdAt: newAdmin.createdAt.toISOString()
      }
    });
    
  } catch (error) {
    console.error('Error creating admin:', error);
    return json({ error: 'Failed to create admin' }, { status: 500 });
  }
};

// Update admin (Super Admin only)
export const PUT: RequestHandler = async ({ request, cookies }) => {
  try {
    const token = cookies.get('admin_token');
    if (!token) {
      return json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const user = verifyToken(token);
    if (!user || user.role !== 'super_admin') {
      return json({ error: 'Super Admin access required' }, { status: 403 });
    }
    
    const { adminId, name, isActive, role } = await request.json();
    
    if (!adminId) {
      return json({ error: 'Admin ID is required' }, { status: 400 });
    }
    
    await connectDB();
    
    const updateData: any = {};
    if (name !== undefined) updateData.name = name.trim();
    if (isActive !== undefined) updateData.isActive = isActive;
    if (role !== undefined && ['admin', 'super_admin'].includes(role)) {
      updateData.role = role;
    }
    
    const updatedAdmin = await Admin.findByIdAndUpdate(
      adminId,
      updateData,
      { new: true, select: '-password' }
    );
    
    if (!updatedAdmin) {
      return json({ error: 'Admin not found' }, { status: 404 });
    }
    
    return json({
      success: true,
      message: 'Admin updated successfully',
      admin: {
        _id: updatedAdmin._id.toString(),
        email: updatedAdmin.email,
        name: updatedAdmin.name,
        role: updatedAdmin.role,
        isActive: updatedAdmin.isActive,
        updatedAt: updatedAdmin.updatedAt.toISOString()
      }
    });
    
  } catch (error) {
    console.error('Error updating admin:', error);
    return json({ error: 'Failed to update admin' }, { status: 500 });
  }
};

// Delete admin (Super Admin only)
export const DELETE: RequestHandler = async ({ request, cookies }) => {
  try {
    const token = cookies.get('admin_token');
    if (!token) {
      return json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const user = verifyToken(token);
    if (!user || user.role !== 'super_admin') {
      return json({ error: 'Super Admin access required' }, { status: 403 });
    }
    
    const { adminId } = await request.json();
    
    if (!adminId) {
      return json({ error: 'Admin ID is required' }, { status: 400 });
    }
    
    // Prevent super admin from deleting themselves
    if (adminId === user.id) {
      return json({ error: 'Cannot delete your own account' }, { status: 400 });
    }
    
    await connectDB();
    
    const deletedAdmin = await Admin.findByIdAndDelete(adminId);
    
    if (!deletedAdmin) {
      return json({ error: 'Admin not found' }, { status: 404 });
    }
    
    return json({
      success: true,
      message: 'Admin deleted successfully'
    });
    
  } catch (error) {
    console.error('Error deleting admin:', error);
    return json({ error: 'Failed to delete admin' }, { status: 500 });
  }
};
