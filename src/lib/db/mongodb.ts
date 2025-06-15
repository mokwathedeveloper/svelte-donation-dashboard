import mongoose from 'mongoose';
import { MONGODB_URI } from '$env/static/private';

if (!MONGODB_URI) {
  console.error('MONGODB_URI environment variable is not defined');
  console.log('Please create a .env file with MONGODB_URI=your_mongodb_connection_string');
}

let isConnected = false;

export async function connectDB() {
  if (isConnected && mongoose.connection.readyState === 1) {
    return;
  }

  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI environment variable is not defined. Please check your .env file.');
  }

  try {
    // Set mongoose options for better connection handling
    mongoose.set('strictQuery', false);

    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
    });

    isConnected = true;
    console.log('✅ Connected to MongoDB successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    isConnected = false;
    throw new Error(`Failed to connect to MongoDB: ${error.message}`);
  }
}

export async function disconnectDB() {
  if (!isConnected) {
    return;
  }

  try {
    await mongoose.disconnect();
    isConnected = false;
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('MongoDB disconnection error:', error);
    throw error;
  }
}
