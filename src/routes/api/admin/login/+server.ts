import { json } from '@sveltejs/kit';
import { validateAdminCredentials, generateToken } from '$lib/utils/auth';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, cookies }) => {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return json({ error: 'Email and password are required' }, { status: 400 });
    }

    const adminUser = await validateAdminCredentials(email, password);

    if (!adminUser) {
      return json({ error: 'Invalid credentials or account is inactive' }, { status: 401 });
    }

    // Generate JWT token
    const token = generateToken(adminUser);

    // Set HTTP-only cookie
    cookies.set('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/'
    });

    return json({
      success: true,
      message: 'Login successful',
      user: {
        id: adminUser.id,
        email: adminUser.email,
        name: adminUser.name,
        role: adminUser.role
      }
    });

  } catch (error) {
    console.error('Admin login error:', error);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
};
