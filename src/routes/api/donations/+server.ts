import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { connectDB } from '$lib/db/mongodb';
import { Project } from '$lib/server/models/project';
import { initiateStkPush } from '$lib/utils/mpesa';
import mongoose from 'mongoose';

// Create Donation model if it doesn't exist
const donationSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending',
  },
  transactionId: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Donation = mongoose.models.Donation || mongoose.model('Donation', donationSchema);

function validatePhoneNumber(phone: string): boolean {
    return /^254[17]\d{8}$/.test(phone);
}

function formatPhoneNumber(input: string): string {
    // Remove all non-digit characters
    const cleaned = input.replace(/\D/g, '');
    
    // Format based on the length and starting digits
    if (cleaned.startsWith('254')) {
        return cleaned;
    } else if (cleaned.startsWith('0')) {
        return `254${cleaned.slice(1)}`;
    } else if (cleaned.startsWith('7') || cleaned.startsWith('1')) {
        return `254${cleaned}`;
    }
    return cleaned;
}

export const GET: RequestHandler = async () => {
  try {
    await connectDB();
    const donations = await Donation.find().populate('projectId').sort({ createdAt: -1 });
    return json(donations);
  } catch (error) {
    console.error('Failed to fetch donations:', error);
    return json({ error: 'Failed to fetch donations' }, { status: 500 });
  }
};

export const POST: RequestHandler = async ({ request }) => {
  try {
    await connectDB();
    const { projectId, amount, phone } = await request.json();

    // Validate amount
    if (!amount || amount <= 0) {
      return json({ error: 'Invalid amount' }, { status: 400 });
    }

    // Format and validate phone number
    const formattedPhone = formatPhoneNumber(phone);
    if (!validatePhoneNumber(formattedPhone)) {
      return json({ error: 'Invalid phone number format. Use format: 254XXXXXXXXX' }, { status: 400 });
    }

    // Verify project exists
    const project = await Project.findById(projectId);
    if (!project) {
      return json({ error: 'Project not found' }, { status: 404 });
    }

    // Create donation record
    const donation = await Donation.create({
      projectId,
      amount,
      phone: formattedPhone,
      status: 'pending'
    });

    try {
      // Initiate M-Pesa payment
      const mpesaResponse = await initiateStkPush(
        formattedPhone,
        amount,
        `DON${donation._id}`
      );

      // Update donation with transaction ID
      donation.transactionId = mpesaResponse.MerchantRequestID;
      await donation.save();

      return json({ 
        message: 'Donation initiated', 
        donation: {
          ...donation.toJSON(),
          mpesaRequestId: mpesaResponse.MerchantRequestID,
          checkoutRequestId: mpesaResponse.CheckoutRequestID
        }
      });
    } catch (mpesaError) {
      // If M-Pesa request fails, update donation status and rethrow
      donation.status = 'failed';
      await donation.save();
      throw mpesaError;
    }
  } catch (error) {
    console.error('Failed to process donation:', error);
    return json({ 
      error: error instanceof Error ? error.message : 'Failed to process donation'
    }, { status: 500 });
  }
}; 