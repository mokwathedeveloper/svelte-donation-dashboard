import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import projectsData from '$lib/data/projects.json';

export const GET: RequestHandler = async () => {
    return json(projectsData.projects);
};

export const POST: RequestHandler = async ({ request }) => {
    const data = await request.json();
    // In a real app, we would save this to a database
    return json({ ...data, id: String(projectsData.projects.length + 1) });
}; 