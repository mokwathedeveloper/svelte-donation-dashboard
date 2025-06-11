import { error } from '@sveltejs/kit';
import type { ServerLoad } from '@sveltejs/kit';
import { connectDB } from '$lib/db/mongodb';
import { Project } from '$lib/server/models/project';
import { Donation } from '$lib/models/Donation';
import type { SerializedProject } from '$lib/server/models/project';
import type { Types } from 'mongoose';

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

export const load: ServerLoad = async () => {
    try {
        await connectDB();

        // Fetch projects
        const rawProjects = await Project.find()
            .sort({ createdAt: -1 })
            .lean();

        const projects = rawProjects.map(project => ({
            _id: project._id.toString(),
            title: project.title,
            description: project.description,
            goal: project.goal,
            raised: project.raised,
            image: project.image,
            createdAt: project.createdAt.toISOString(),
            updatedAt: project.updatedAt.toISOString()
        }));

        // Fetch donations with project details
        const rawDonations = await Donation.find()
            .populate('projectId')
            .sort({ createdAt: -1 })
            .lean();

        const donations = (rawDonations as unknown as RawDonation[]).map(donation => ({
            _id: donation._id.toString(),
            projectId: {
                _id: donation.projectId._id.toString(),
                title: donation.projectId.title,
                description: donation.projectId.description,
                goal: donation.projectId.goal,
                raised: donation.projectId.raised,
                image: donation.projectId.image,
                createdAt: donation.projectId.createdAt.toISOString(),
                updatedAt: donation.projectId.updatedAt.toISOString()
            },
            amount: donation.amount,
            phone: donation.phone,
            status: donation.status,
            transactionId: donation.transactionId,
            createdAt: donation.createdAt.toISOString(),
            updatedAt: donation.updatedAt.toISOString()
        }));

        return {
            projects,
            donations
        };
    } catch (error) {
        console.error('Failed to load admin data:', error);
        throw error;
    }
}; 