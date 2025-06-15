import mongoose, { Schema, Document } from 'mongoose';

export interface IDonation extends Document {
  projectId: mongoose.Types.ObjectId;
  amount: number;
  phoneNumber: string;
  mpesaReceiptNumber?: string;
  transactionId: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  mpesaRequestId?: string;
  checkoutRequestId?: string;
  resultCode?: number;
  resultDesc?: string;
  createdAt: Date;
  updatedAt: Date;
}

const DonationSchema = new Schema<IDonation>({
  projectId: {
    type: Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 1
  },
  phoneNumber: {
    type: String,
    required: true,
    match: /^254[0-9]{9}$/
  },
  mpesaReceiptNumber: {
    type: String,
    default: ''
  },
  transactionId: {
    type: String,
    required: true,
    unique: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'cancelled'],
    default: 'pending'
  },
  mpesaRequestId: {
    type: String,
    default: ''
  },
  checkoutRequestId: {
    type: String,
    default: ''
  },
  resultCode: {
    type: Number,
    default: null
  },
  resultDesc: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Index for efficient queries
DonationSchema.index({ projectId: 1, status: 1 });
DonationSchema.index({ transactionId: 1 });
DonationSchema.index({ checkoutRequestId: 1 });

export const Donation = mongoose.models.Donation || mongoose.model<IDonation>('Donation', DonationSchema);
