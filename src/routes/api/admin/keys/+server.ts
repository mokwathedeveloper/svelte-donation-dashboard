import { json } from '@sveltejs/kit';
import { SUPER_ADMIN_LOGIN_KEY, SUPER_ADMIN_CREATION_KEY } from '$env/static/private';
import type { RequestHandler } from './$types';

// This endpoint provides the special keys to the frontend
// Note: In production, you might want to add additional security measures
export const GET: RequestHandler = async () => {
  try {
    return json({
      loginKey: SUPER_ADMIN_LOGIN_KEY,
      creationKey: SUPER_ADMIN_CREATION_KEY
    });
  } catch (error) {
    console.error('Error fetching admin keys:', error);
    return json({ error: 'Failed to fetch admin keys' }, { status: 500 });
  }
};
