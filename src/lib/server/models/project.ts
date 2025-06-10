import mongoose, { Document, Schema, Types } from 'mongoose';

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

const projectSchema = new Schema<IProject>({
    title: { type: String, required: true },
    description: { type: String, required: true },
    goal: { type: Number, required: true },
    raised: { type: Number, default: 0 },
    image: { type: String },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Update the updatedAt timestamp before saving
projectSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
});

export const Project = mongoose.models.Project || mongoose.model<IProject>('Project', projectSchema); 