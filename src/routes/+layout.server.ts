import type { LayoutServerLoad } from './$types';
import type { Cookies } from '@sveltejs/kit';

export const load: LayoutServerLoad = async ({ cookies }: { cookies: Cookies }) => {
    const adminData = cookies.get('admin');
    let admin = null;

    if (adminData) {
        try {
            admin = JSON.parse(adminData);
        } catch (error) {
            console.error('Failed to parse admin data:', error);
        }
    }

    return {
        admin
    };
}; 