import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { connectDB } from '$lib/db/mongodb';
import { Donation } from '$lib/models/Donation';
import { Project } from '$lib/server/models/project';
import { initiateStkPush } from '$lib/utils/mpesa';

export const GET: RequestHandler = async () => {
  try {
    await connectDB();
    const donations = await Donation.find().populate('projectId').sort({ createdAt: -1 });
    return json(donations);
  } catch (error) {
    return json({ error: 'Failed to fetch donations' }, { status: 500 });
  }
};

export const POST: RequestHandler = async ({ request }) => {
  try {
    await connectDB();
    const { projectId, amount, phone } = await request.json();

    // Verify project exists
    const project = await Project.findById(projectId);
    if (!project) {
      return json({ error: 'Project not found' }, { status: 404 });
    }

    // Create donation record
    const donation = await Donation.create({
      projectId,
      amount,
      phone,
      status: 'pending'
    });

    // Initiate M-Pesa payment
    const mpesaResponse = await initiateStkPush(
      phone.replace(/^0/, '254'), // Convert format from 07... to 254...
      amount,
      `DON${donation._id}`
    );

    // Update donation with transaction ID
    donation.transactionId = mpesaResponse.MerchantRequestID;
    await donation.save();

    return json({ message: 'Donation initiated', donation });
  } catch (error) {
    return json({ error: 'Failed to process donation' }, { status: 500 });
  }
}; 