import { json } from '@sveltejs/kit';
import { connectDB } from '$lib/db/mongodb';
import { Project } from '$lib/models/Project';
import { Donation } from '$lib/models/Donation';
import { mpesaService } from '$lib/utils/mpesa';
import { generateTransactionId } from '$lib/utils/auth';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
  try {
    const { projectId, amount, phoneNumber } = await request.json();
    
    // Validate input
    if (!projectId || !amount || !phoneNumber) {
      return json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    if (amount < 1 || amount > 150000) {
      return json({ error: 'Amount must be between KES 1 and KES 150,000' }, { status: 400 });
    }
    
    if (!mpesaService.validatePhoneNumber(phoneNumber)) {
      return json({ error: 'Invalid phone number format' }, { status: 400 });
    }
    
    await connectDB();
    
    // Verify project exists and is active
    const project = await Project.findById(projectId);
    if (!project) {
      return json({ error: 'Project not found' }, { status: 404 });
    }
    
    if (project.status !== 'active') {
      return json({ error: 'Project is not accepting donations' }, { status: 400 });
    }
    
    // Format phone number
    const formattedPhone = mpesaService.formatPhoneNumber(phoneNumber);
    
    // Generate transaction ID
    const transactionId = generateTransactionId();
    
    // Create donation record
    const donation = new Donation({
      projectId,
      amount,
      phoneNumber: formattedPhone,
      transactionId,
      status: 'pending'
    });
    
    await donation.save();
    
    try {
      // Initiate STK Push
      const stkResponse = await mpesaService.initiateSTKPush({
        phoneNumber: formattedPhone,
        amount,
        accountReference: transactionId,
        transactionDesc: `Donation to ${project.title}`
      });
      
      // Update donation with M-Pesa details
      donation.mpesaRequestId = stkResponse.MerchantRequestID;
      donation.checkoutRequestId = stkResponse.CheckoutRequestID;
      await donation.save();
      
      return json({
        success: true,
        message: 'Payment request sent successfully',
        transactionId,
        checkoutRequestId: stkResponse.CheckoutRequestID
      });
      
    } catch (mpesaError) {
      // Update donation status to failed
      donation.status = 'failed';
      donation.resultDesc = 'Failed to initiate M-Pesa payment';
      await donation.save();
      
      console.error('M-Pesa STK Push error:', mpesaError);
      return json({ error: 'Failed to initiate payment. Please try again.' }, { status: 500 });
    }
    
  } catch (error) {
    console.error('STK Push endpoint error:', error);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
};
