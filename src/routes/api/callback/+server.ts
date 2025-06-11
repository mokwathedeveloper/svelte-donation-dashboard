import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { connectDB } from '$lib/db/mongodb';
import { Donation } from '$lib/models/Donation';

export const POST: RequestHandler = async ({ request }) => {
  try {
    await connectDB();
    const body = await request.json();
    const result = body.Body?.stkCallback;

    if (!result) {
      return json({ error: 'Invalid callback' }, { status: 400 });
    }

    const transactionId = result.MerchantRequestID;
    const status = result.ResultCode === 0 ? 'completed' : 'failed';
    const mpesaTransactionId = result.CallbackMetadata?.Item?.find(
      (i: any) => i.Name === 'MpesaReceiptNumber'
    )?.Value;

    await Donation.findOneAndUpdate(
      { transactionId },
      { status, transactionId: mpesaTransactionId }
    );

    return json({ message: 'Callback processed' });
  } catch (error) {
    console.error('Callback error:', error);
    return json({ error: 'Failed to process callback' }, { status: 500 });
  }
}; 