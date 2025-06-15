import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { JWT_SECRET } from '$env/static/private';
import { connectDB } from '$lib/db/mongodb';
import { Admin } from '$lib/models/Admin';

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'super_admin' | 'admin';
}

export function generateToken(user: AdminUser): string {
  return jwt.sign(user, JWT_SECRET, { expiresIn: '24h' });
}

export function verifyToken(token: string): AdminUser | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AdminUser;
  } catch (error) {
    return null;
  }
}

export async function validateAdminCredentials(email: string, password: string): Promise<AdminUser | null> {
  try {
    await connectDB();

    const admin = await Admin.findOne({
      email: email.toLowerCase(),
      isActive: true
    });

    if (!admin) {
      return null;
    }

    const isValidPassword = await bcrypt.compare(password, admin.password);

    if (!isValidPassword) {
      return null;
    }

    return {
      id: admin._id.toString(),
      email: admin.email,
      name: admin.name,
      role: admin.role
    };
  } catch (error) {
    console.error('Error validating admin credentials:', error);
    return null;
  }
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateTransactionId(): string {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2, 8);
  return `TXN_${timestamp}_${random}`.toUpperCase();
}
