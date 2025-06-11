import type { Document } from 'mongoose';

export interface IDonation extends Document {
  projectId: string;
  amount: number;
  phone: string;
  status: 'pending' | 'completed' | 'failed';
  transactionId?: string;
  createdAt: Date;
}

export interface MpesaResponse {
  ResponseCode: string;
  CustomerMessage: string;
  ResponseDescription: string;
  MerchantRequestID: string;
  CheckoutRequestID: string;
  ResultCode?: number;
  ResultDesc?: string;
  CallbackMetadata?: {
    Item: Array<{
      Name: string;
      Value: string | number;
    }>;
  };
}