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
    password: { 
        type: String, 
        required: true,
        validate: [{
            validator: async function(this: IAdmin, password: string) {
                if (this.isModified('password')) {
                    // Check if password is already in use
                    const count = await mongoose.models.Admin.countDocuments({
                        password: await bcrypt.hash(password, 10),
                        _id: { $ne: this._id }
                    });
                    return count === 0;
                }
                return true;
            },
            message: 'Password is already in use by another admin'
        }]
    },
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

// Static method to check if password is unique
adminSchema.statics.isPasswordUnique = async function(password: string, excludeId?: string): Promise<boolean> {
    const hashedPassword = await bcrypt.hash(password, 10);
    const query = { password: hashedPassword };
    if (excludeId) {
        Object.assign(query, { _id: { $ne: excludeId } });
    }
    const count = await this.countDocuments(query);
    return count === 0;
};

export const Admin = (mongoose.models.Admin as mongoose.Model<IAdmin>) || 
    mongoose.model<IAdmin>('Admin', adminSchema); 