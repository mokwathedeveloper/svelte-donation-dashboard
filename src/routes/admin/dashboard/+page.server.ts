import { error } from '@sveltejs/kit';
import type { ServerLoad } from '@sveltejs/kit';
import { connectDB } from '$lib/db/mongodb';
import { Project } from '$lib/server/models/project';
import { Donation } from '$lib/models/Donation';
import type { SerializedProject } from '$lib/server/models/project';
import type { Types } from 'mongoose';
import type { PageServerLoad } from './$types';
import type { RequestEvent } from '@sveltejs/kit';

interface RawDonation {
    _id: Types.ObjectId;
    projectId: {
        _id: Types.ObjectId;
        title: string;
        description: string;
        goal: number;
        raised: number;
        image?: string;
        createdAt: Date;
        updatedAt: Date;
    };
    amount: number;
    phone: string;
    status: string;
    transactionId?: string;
    createdAt: Date;
    updatedAt: Date;
}

interface SerializedDonation {
    _id: string;
    projectId: SerializedProject;
    amount: number;
    phone: string;
    status: string;
    transactionId?: string;
    createdAt: string;
    updatedAt: string;
}

export const load = async ({ cookies }: RequestEvent) => {
    const adminData = cookies.get('admin');
    if (!adminData) {
        throw error(401, 'Unauthorized');
    }

    try {
        await connectDB();
        const projects = await Project.find().sort({ createdAt: -1 }).lean();
        const donations = []; // TODO: Implement donations

        return {
            projects: projects.map(p => ({
                ...p,
                _id: p._id.toString(),
                createdAt: p.createdAt.toISOString(),
                updatedAt: p.updatedAt.toISOString()
            })),
            donations,
            admin: JSON.parse(adminData)
        };
    } catch (err) {
        console.error('Failed to load dashboard data:', err);
        throw error(500, 'Failed to load dashboard data');
    }
}; 