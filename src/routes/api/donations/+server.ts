import { json } from '@sveltejs/kit';
import { connectDB } from '$lib/db/mongodb';
import { Donation } from '$lib/models/Donation';
import { verifyToken } from '$lib/utils/auth';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url, cookies }) => {
  try {
    // Verify admin authentication (both admin and super_admin can view donations)
    const token = cookies.get('admin_token');
    const user = verifyToken(token);
    if (!token || !user || !['admin', 'super_admin'].includes(user.role)) {
      return json({ error: 'Admin access required' }, { status: 401 });
    }
    
    await connectDB();
    
    const projectId = url.searchParams.get('projectId');
    const status = url.searchParams.get('status');
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const page = parseInt(url.searchParams.get('page') || '1');
    
    // Build query
    const query: any = {};
    if (projectId) query.projectId = projectId;
    if (status) query.status = status;
    
    // Get donations with pagination
    const donations = await Donation.find(query)
      .populate('projectId', 'title')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit)
      .lean();
    
    // Get total count for pagination
    const total = await Donation.countDocuments(query);
    
    return json({
      donations: donations.map(donation => ({
        _id: donation._id.toString(),
        projectId: donation.projectId._id.toString(),
        projectTitle: donation.projectId.title,
        amount: donation.amount,
        phoneNumber: donation.phoneNumber.replace(/(\d{3})(\d{3})(\d{3})(\d{3})/, '$1***$4'), // Mask phone number
        mpesaReceiptNumber: donation.mpesaReceiptNumber,
        transactionId: donation.transactionId,
        status: donation.status,
        resultDesc: donation.resultDesc,
        createdAt: donation.createdAt.toISOString(),
        updatedAt: donation.updatedAt.toISOString()
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
    
  } catch (error) {
    console.error('Error fetching donations:', error);
    return json({ error: 'Failed to fetch donations' }, { status: 500 });
  }
};
