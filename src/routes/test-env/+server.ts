import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { env } from '$env/dynamic/private';

export const GET: RequestHandler = async () => {
    return json({
        jwt_secret_exists: !!env.JWT_SECRET,
        super_admin_secret_exists: !!env.SUPER_ADMIN_SECRET,
        mongodb_uri_exists: !!env.MONGODB_URI
    });
}; 