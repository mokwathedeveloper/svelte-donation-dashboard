import mongoose from 'mongoose';
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

export interface ProjectDocument {
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

const projectSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    goal: {
        type: Number,
        required: true,
        min: 0
    },
    raised: {
        type: Number,
        default: 0,
        min: 0
    },
    image: {
        type: String,
        trim: true
    }
}, {
    timestamps: true
});

// Create the model if it hasn't been created yet
export const Project = mongoose.models.Project || mongoose.model('Project', projectSchema); 