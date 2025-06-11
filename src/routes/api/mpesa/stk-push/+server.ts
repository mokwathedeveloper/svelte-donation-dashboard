import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { MpesaService } from '$lib/services/mpesa';
import { Transaction } from '$lib/models/Transaction';

export const POST: RequestHandler = async ({ request }) => {
    try {
        const { phoneNumber, amount, reference } = await request.json();

        // Validate phone number format (should be 254XXXXXXXXX)
        if (!phoneNumber.match(/^254\d{9}$/)) {
            return json({
                success: false,
                message: 'Invalid phone number format. Use format: 254XXXXXXXXX'
            }, { status: 400 });
        }

        // Validate amount (should be positive number)
        if (!amount || amount <= 0) {
            return json({
                success: false,
                message: 'Invalid amount'
            }, { status: 400 });
        }

        const mpesa = MpesaService.getInstance();
        const result = await mpesa.initiateSTKPush(
            phoneNumber,
            amount,
            reference || 'Donation'
        );

        // Create transaction record
        const transaction = new Transaction({
            phoneNumber,
            amount,
            reference,
            merchantRequestId: result.MerchantRequestID,
            checkoutRequestId: result.CheckoutRequestID,
            status: 'PENDING'
        });

        await transaction.save();

        return json({
            success: true,
            message: 'STK push initiated successfully',
            data: {
                ...result,
                transactionId: transaction.id
            }
        });
    } catch (error) {
        console.error('Error initiating STK push:', error);
        return json({
            success: false,
            message: error instanceof Error ? error.message : 'Failed to initiate payment'
        }, { status: 500 });
    }
}; 