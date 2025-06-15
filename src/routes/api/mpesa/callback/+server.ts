import { json } from '@sveltejs/kit';
import { connectDB } from '$lib/db/mongodb';
import { Project } from '$lib/models/Project';
import { Donation } from '$lib/models/Donation';
import type { RequestHandler } from './$types';
import type { CallbackData } from '$lib/utils/mpesa';

export const POST: RequestHandler = async ({ request }) => {
  try {
    const callbackData: { Body: { stkCallback: CallbackData } } = await request.json();
    const callback = callbackData.Body.stkCallback;
    
    console.log('M-Pesa Callback received:', JSON.stringify(callback, null, 2));
    
    await connectDB();
    
    // Find donation by CheckoutRequestID
    const donation = await Donation.findOne({
      checkoutRequestId: callback.CheckoutRequestID
    });
    
    if (!donation) {
      console.error('Donation not found for CheckoutRequestID:', callback.CheckoutRequestID);
      return json({ ResultCode: 0, ResultDesc: 'Success' });
    }
    
    // Update donation with callback data
    donation.resultCode = callback.ResultCode;
    donation.resultDesc = callback.ResultDesc;
    
    if (callback.ResultCode === 0) {
      // Payment successful
      donation.status = 'completed';
      
      // Extract M-Pesa receipt number from callback metadata
      if (callback.CallbackMetadata?.Item) {
        const receiptItem = callback.CallbackMetadata.Item.find(
          item => item.Name === 'MpesaReceiptNumber'
        );
        if (receiptItem) {
          donation.mpesaReceiptNumber = receiptItem.Value.toString();
        }
      }
      
      // Update project raised amount
      const project = await Project.findById(donation.projectId);
      if (project) {
        project.raised += donation.amount;
        await project.save();
      }
      
      console.log(`Donation completed: ${donation.amount} KES for project ${donation.projectId}`);
      
    } else {
      // Payment failed or cancelled
      donation.status = callback.ResultCode === 1032 ? 'cancelled' : 'failed';
      console.log(`Donation ${donation.status}: ${callback.ResultDesc}`);
    }
    
    await donation.save();
    
    // Respond to M-Pesa
    return json({
      ResultCode: 0,
      ResultDesc: 'Success'
    });
    
  } catch (error) {
    console.error('M-Pesa callback error:', error);
    
    // Still respond with success to M-Pesa to avoid retries
    return json({
      ResultCode: 0,
      ResultDesc: 'Success'
    });
  }
};
