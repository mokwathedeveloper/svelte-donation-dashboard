import mongoose from 'mongoose';
import type { Document, Model } from 'mongoose';
import type { Types } from 'mongoose';

export interface IProject extends Document {
    _id: Types.ObjectId;
    title: string;
    description: string;
    goal: number;
    raised: number;
    image?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface SerializedProject {
    _id: string;
    title: string;
    description: string;
    goal: number;
    raised: number;
    image?: string;
    createdAt: string;
    updatedAt: string;
}

const projectSchema = new mongoose.Schema<IProject>({
    title: {
        type: String,
        required: [true, 'Project title is required'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Project description is required'],
        trim: true
    },
    goal: {
        type: Number,
        required: [true, 'Project goal amount is required'],
        min: [1, 'Goal must be at least 1']
    },
    raised: {
        type: Number,
        default: 0,
        min: [0, 'Raised amount cannot be negative']
    },
    image: {
        type: String,
        trim: true
    }
}, {
    timestamps: true,
    toJSON: {
        transform: function(doc, ret) {
            ret._id = ret._id.toString();
            ret.createdAt = ret.createdAt.toISOString();
            ret.updatedAt = ret.updatedAt.toISOString();
            return ret;
        }
    }
});

// Create or get the model
export const Project: Model<IProject> = mongoose.models.Project || mongoose.model<IProject>('Project', projectSchema); 