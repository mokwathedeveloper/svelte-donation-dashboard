import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { Transaction } from '$lib/models/Transaction';

// Define the M-Pesa callback response type
interface MpesaCallback {
    Body: {
        stkCallback: {
            MerchantRequestID: string;
            CheckoutRequestID: string;
            ResultCode: number;
            ResultDesc: string;
            CallbackMetadata?: {
                Item: Array<{
                    Name: string;
                    Value?: number | string;
                }>;
            };
        };
    };
}

export const POST: RequestHandler = async ({ request }) => {
    try {
        const callback: MpesaCallback = await request.json();
        const { stkCallback } = callback.Body;
        
        // Log the callback for debugging
        console.log('M-Pesa Callback received:', JSON.stringify(callback, null, 2));

        // Find the pending transaction
        const transaction = await Transaction.findOne({
            merchantRequestId: stkCallback.MerchantRequestID,
            checkoutRequestId: stkCallback.CheckoutRequestID
        });

        if (!transaction) {
            console.error('Transaction not found:', stkCallback.MerchantRequestID);
            return json({
                success: false,
                message: 'Transaction not found'
            }, { status: 404 });
        }

        // Extract payment details if successful
        if (stkCallback.ResultCode === 0 && stkCallback.CallbackMetadata) {
            const metadata = stkCallback.CallbackMetadata.Item.reduce((acc, item) => {
                if (item.Value !== undefined) {
                    acc[item.Name] = item.Value;
                }
                return acc;
            }, {} as Record<string, number | string>);

            // Update transaction with success details
            transaction.status = 'COMPLETED';
            transaction.resultCode = stkCallback.ResultCode;
            transaction.resultDesc = stkCallback.ResultDesc;
            transaction.mpesaReceiptNumber = metadata['TransactionId'] as string;
            transaction.transactionDate = new Date(metadata['TransactionDate'] as string);
            transaction.metadata = metadata;

            await transaction.save();

            return json({
                success: true,
                message: 'Payment processed successfully',
                data: {
                    transactionId: metadata['TransactionId'],
                    amount: metadata['Amount'],
                    phoneNumber: metadata['PhoneNumber'],
                    transactionDate: metadata['TransactionDate']
                }
            });
        } else {
            // Update transaction with failure details
            transaction.status = 'FAILED';
            transaction.resultCode = stkCallback.ResultCode;
            transaction.resultDesc = stkCallback.ResultDesc;
            await transaction.save();

            console.error('Payment failed:', stkCallback.ResultDesc);
            return json({
                success: false,
                message: stkCallback.ResultDesc
            });
        }
    } catch (error) {
        console.error('Error processing M-Pesa callback:', error);
        return json({
            success: false,
            message: 'Error processing payment callback'
        }, { status: 500 });
    }
}; 