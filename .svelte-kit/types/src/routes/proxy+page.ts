// @ts-nocheck
import type { PageLoad } from './$types';
import type { SerializedProject } from '$lib/server/models/project';

export const load = async ({ fetch }: Parameters<PageLoad>[0]) => {
    const response = await fetch('/api/projects');
    const projects: SerializedProject[] = await response.json();
    return { projects };
}; 