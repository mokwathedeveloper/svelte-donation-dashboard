import mongoose, { Schema, Document } from 'mongoose';

export interface IProject extends Document {
  title: string;
  description: string;
  goal: number;
  raised: number;
  image?: string;
  status: 'active' | 'completed' | 'paused';
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema = new Schema<IProject>({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  goal: {
    type: Number,
    required: true,
    min: 1
  },
  raised: {
    type: Number,
    default: 0,
    min: 0
  },
  image: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'paused'],
    default: 'active'
  }
}, {
  timestamps: true
});

// Calculate progress percentage
ProjectSchema.virtual('progress').get(function() {
  return Math.min((this.raised / this.goal) * 100, 100);
});

// Ensure virtual fields are serialized
ProjectSchema.set('toJSON', { virtuals: true });

export const Project = mongoose.models.Project || mongoose.model<IProject>('Project', ProjectSchema);
