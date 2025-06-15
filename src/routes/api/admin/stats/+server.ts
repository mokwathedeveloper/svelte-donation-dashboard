import { json } from '@sveltejs/kit';
import { connectDB } from '$lib/db/mongodb';
import { Project } from '$lib/models/Project';
import { Donation } from '$lib/models/Donation';
import { verifyToken } from '$lib/utils/auth';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ cookies }) => {
  try {
    // Verify admin authentication (both admin and super_admin can view stats)
    const token = cookies.get('admin_token');
    const user = verifyToken(token);
    if (!token || !user || !['admin', 'super_admin'].includes(user.role)) {
      return json({ error: 'Admin access required' }, { status: 401 });
    }
    
    await connectDB();
    
    // Get project statistics
    const projectStats = await Project.aggregate([
      {
        $group: {
          _id: null,
          totalProjects: { $sum: 1 },
          activeProjects: {
            $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
          },
          completedProjects: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          totalGoal: { $sum: '$goal' },
          totalRaised: { $sum: '$raised' }
        }
      }
    ]);
    
    // Get donation statistics
    const donationStats = await Donation.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      }
    ]);
    
    // Get recent donations
    const recentDonations = await Donation.find({ status: 'completed' })
      .populate('projectId', 'title')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();
    
    // Get top projects by donations
    const topProjects = await Donation.aggregate([
      { $match: { status: 'completed' } },
      {
        $group: {
          _id: '$projectId',
          totalDonations: { $sum: '$amount' },
          donationCount: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'projects',
          localField: '_id',
          foreignField: '_id',
          as: 'project'
        }
      },
      { $unwind: '$project' },
      { $sort: { totalDonations: -1 } },
      { $limit: 5 }
    ]);
    
    // Get daily donation trends (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const dailyTrends = await Donation.aggregate([
      {
        $match: {
          status: 'completed',
          createdAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    // Format donation statistics
    const formattedDonationStats = {
      completed: 0,
      pending: 0,
      failed: 0,
      cancelled: 0,
      totalAmount: 0
    };
    
    donationStats.forEach(stat => {
      formattedDonationStats[stat._id] = stat.count;
      if (stat._id === 'completed') {
        formattedDonationStats.totalAmount = stat.totalAmount;
      }
    });
    
    return json({
      projectStats: projectStats[0] || {
        totalProjects: 0,
        activeProjects: 0,
        completedProjects: 0,
        totalGoal: 0,
        totalRaised: 0
      },
      donationStats: formattedDonationStats,
      recentDonations: recentDonations.map(donation => ({
        _id: donation._id.toString(),
        projectTitle: donation.projectId?.title || 'Unknown Project',
        amount: donation.amount,
        phoneNumber: donation.phoneNumber.replace(/(\d{3})(\d{3})(\d{3})(\d{3})/, '$1***$4'),
        mpesaReceiptNumber: donation.mpesaReceiptNumber,
        createdAt: donation.createdAt.toISOString()
      })),
      topProjects: topProjects.map(item => ({
        _id: item._id.toString(),
        title: item.project.title,
        totalDonations: item.totalDonations,
        donationCount: item.donationCount
      })),
      dailyTrends
    });
    
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return json({ error: 'Failed to fetch statistics' }, { status: 500 });
  }
};
