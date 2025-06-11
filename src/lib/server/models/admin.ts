import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

export interface IAdmin extends mongoose.Document {
    username: string;
    password: string;
    superAdmin: boolean;
    secretKey?: string;
    createdAt: Date;
    updatedAt: Date;
    comparePassword(candidatePassword: string): Promise<boolean>;
}

const adminSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    superAdmin: { type: Boolean, default: false },
    secretKey: { type: String, select: false }, // Only stored for super admin
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

// Static method to verify secret key
adminSchema.statics.verifySecretKey = async function(secretKey: string): Promise<boolean> {
    const superAdmin = await this.findOne({ superAdmin: true }).select('+secretKey');
    if (!superAdmin) return false;
    return secretKey === superAdmin.secretKey;
};

export const Admin = (mongoose.models.Admin as mongoose.Model<IAdmin>) || 
    mongoose.model<IAdmin>('Admin', adminSchema); 