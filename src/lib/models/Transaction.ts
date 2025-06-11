import mongoose from 'mongoose';

export interface ITransaction {
    phoneNumber: string;
    amount: number;
    reference: string;
    merchantRequestId: string;
    checkoutRequestId: string;
    mpesaReceiptNumber?: string;
    transactionDate?: Date;
    status: 'PENDING' | 'COMPLETED' | 'FAILED';
    resultCode?: number;
    resultDesc?: string;
    metadata?: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
}

const transactionSchema = new mongoose.Schema<ITransaction>({
    phoneNumber: {
        type: String,
        required: true,
        index: true
    },
    amount: {
        type: Number,
        required: true
    },
    reference: {
        type: String,
        required: true,
        index: true
    },
    merchantRequestId: {
        type: String,
        required: true,
        unique: true
    },
    checkoutRequestId: {
        type: String,
        required: true,
        unique: true
    },
    mpesaReceiptNumber: {
        type: String,
        sparse: true,
        unique: true
    },
    transactionDate: {
        type: Date
    },
    status: {
        type: String,
        enum: ['PENDING', 'COMPLETED', 'FAILED'],
        default: 'PENDING',
        required: true,
        index: true
    },
    resultCode: {
        type: Number
    },
    resultDesc: {
        type: String
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed
    }
}, {
    timestamps: true,
    toJSON: {
        transform: (_, ret) => {
            ret.id = ret._id;
            delete ret._id;
            delete ret.__v;
            return ret;
        }
    }
});

// Create indexes
transactionSchema.index({ createdAt: -1 });
transactionSchema.index({ phoneNumber: 1, createdAt: -1 });

export const Transaction = mongoose.models.Transaction || mongoose.model<ITransaction>('Transaction', transactionSchema); 