import mongoose from 'mongoose';
import type { Document, Model } from 'mongoose';

export interface IMessage extends Document {
    sender: string;
    content: string;
    createdAt: Date;
    updatedAt: Date;
}

const messageSchema = new mongoose.Schema({
    sender: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

export const Message: Model<IMessage> = mongoose.models.Message || mongoose.model<IMessage>('Message', messageSchema); 