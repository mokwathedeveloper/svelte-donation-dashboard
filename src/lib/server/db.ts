import mongoose from 'mongoose';
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://mokwa:mokwa123@donation.ulqppbq.mongodb.net/donation-platform?retryWrites=true&w=majority&appName=donation';

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env');
}

export async function connectDB() {
  try {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };

    console.log('Creating database connection');
    const connection = await mongoose.connect(MONGODB_URI, opts);
    console.log('Database connected successfully');
    mongoose.set('debug', true);
    return connection;
  } catch (e) {
    console.error('MongoDB connection error:', e);
    throw e;
  }
} 