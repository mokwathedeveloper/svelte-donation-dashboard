import type { PageLoad } from './$types';
import type { IProject } from '$lib/server/models/project';

export const load: PageLoad = async ({ fetch }) => {
    const response = await fetch('/api/projects');
    const projects: IProject[] = await response.json();
    return { projects };
}; 