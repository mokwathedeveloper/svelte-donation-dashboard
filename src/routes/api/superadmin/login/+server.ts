import { json } from '@sveltejs/kit';
import { validateAdminCredentials, generateToken } from '$lib/utils/auth';
import { SUPER_ADMIN_LOGIN_KEY } from '$env/static/private';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, cookies }) => {
  try {
    const { email, password, specialKey } = await request.json();

    console.log('Super Admin login attempt:', { email, hasPassword: !!password, hasSpecialKey: !!specialKey });

    if (!email || !password || !specialKey) {
      console.log('Missing required fields');
      return json({ error: 'Email, password, and special key are required' }, { status: 400 });
    }

    // Verify special key first
    if (specialKey !== SUPER_ADMIN_LOGIN_KEY) {
      console.log('Invalid special key provided:', specialKey);
      return json({ error: 'Invalid special key. Super Admin access denied.' }, { status: 403 });
    }

    console.log('Special key verified, validating credentials...');

    // Validate admin credentials
    const adminUser = await validateAdminCredentials(email, password);

    console.log('Credential validation result:', adminUser ? 'Success' : 'Failed');

    if (!adminUser) {
      console.log('Invalid credentials for email:', email);
      return json({ error: 'Invalid credentials or account is inactive' }, { status: 401 });
    }

    // Check if user is actually a super admin
    if (adminUser.role !== 'super_admin') {
      console.log('User is not super admin, role:', adminUser.role);
      return json({ error: 'Super Admin role required for this login method' }, { status: 403 });
    }

    console.log('Super admin login successful for:', email);

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
      message: 'Super Admin login successful',
      user: {
        id: adminUser.id,
        email: adminUser.email,
        name: adminUser.name,
        role: adminUser.role
      }
    });

  } catch (error) {
    console.error('Super Admin login error:', error);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
};
