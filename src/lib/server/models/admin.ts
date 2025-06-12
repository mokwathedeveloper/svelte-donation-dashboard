import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

export interface IAdmin extends mongoose.Document {
    _id: mongoose.Types.ObjectId;
    username: string;
    password: string;
    createdAt: Date;
    updatedAt: Date;
    isModified(path: string): boolean;
    comparePassword(candidatePassword: string): Promise<boolean>;
}

const adminSchema = new mongoose.Schema<IAdmin>({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Hash password before saving
adminSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error as Error);
    }
});

// Compare password method
adminSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
    try {
        return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
        throw error;
    }
};

export const Admin = (mongoose.models.Admin as mongoose.Model<IAdmin>) || 
    mongoose.model<IAdmin>('Admin', adminSchema); 