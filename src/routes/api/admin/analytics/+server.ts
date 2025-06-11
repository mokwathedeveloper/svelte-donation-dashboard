import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { connectDB } from '$lib/db/mongodb';
import { Project } from '$lib/server/models/project';
import { Donation } from '$lib/models/Donation';

interface MonthlyData {
    totalAmount: number;
    count: number;
}

interface MonthlyTrends {
    [key: string]: MonthlyData;
}

export const GET: RequestHandler = async ({ locals }) => {
    try {
        await connectDB();

        // Get total donations and amount
        const donations = await Donation.find().lean();
        const totalDonations = donations.length;
        const totalAmount = donations.reduce((sum, donation) => sum + donation.amount, 0);

        // Get project performance
        const projects = await Project.find().lean();
        const projectPerformance = projects.map(project => ({
            id: project._id.toString(),
            title: project.title,
            goal: project.goal,
            raised: project.raised,
            progress: (project.raised / project.goal) * 100
        }));

        // Calculate monthly trends
        const monthlyTrends = donations.reduce<MonthlyTrends>((acc, donation) => {
            const date = new Date(donation.createdAt);
            const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            
            if (!acc[monthYear]) {
                acc[monthYear] = {
                    totalAmount: 0,
                    count: 0
                };
            }
            
            acc[monthYear].totalAmount += donation.amount;
            acc[monthYear].count += 1;
            
            return acc;
        }, {});

        return json({
            totalDonations,
            totalAmount,
            projectPerformance,
            monthlyTrends: Object.entries(monthlyTrends).map(([month, data]) => ({
                month,
                totalAmount: data.totalAmount,
                count: data.count
            }))
        });
    } catch (error) {
        console.error('Failed to fetch analytics data:', error);
        return json({ error: 'Failed to fetch analytics data' }, { status: 500 });
    }
}; 