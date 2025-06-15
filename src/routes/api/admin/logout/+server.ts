import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ cookies }) => {
  try {
    console.log('Logout request received');

    // Clear the admin token cookie with all possible options
    cookies.delete('admin_token', {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });

    // Also try to set an expired cookie to ensure it's cleared
    cookies.set('admin_token', '', {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0 // Expire immediately
    });

    console.log('Admin token cookie cleared');

    return json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    console.error('Logout error:', error);
    return json({
      success: false,
      message: 'Logout failed'
    }, { status: 500 });
  }
};
