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

const projectSchema = new Schema<IProject>({
    title: { type: String, required: true },
    description: { type: String, required: true },
    goal: { type: Number, required: true },
    raised: { type: Number, default: 0 },
    image: { type: String },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
}, {
    // Enable timestamps
    timestamps: true,
    // Add toJSON transform
    toJSON: {
        transform: function(doc, ret) {
            ret._id = ret._id.toString();
            ret.createdAt = ret.createdAt.toISOString();
            ret.updatedAt = ret.updatedAt.toISOString();
            delete ret.__v;
            return ret;
        }
    }
});

// Update the updatedAt timestamp before saving
projectSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
});

// Add a method to serialize the document
projectSchema.methods.serialize = function(): SerializedProject {
    return {
        _id: this._id.toString(),
        title: this.title,
        description: this.description,
        goal: this.goal,
        raised: this.raised,
        image: this.image,
        createdAt: this.createdAt.toISOString(),
        updatedAt: this.updatedAt.toISOString()
    };
};

// Ensure the model is properly typed
export const Project = (mongoose.models.Project as mongoose.Model<IProject>) || 
    mongoose.model<IProject>('Project', projectSchema); 