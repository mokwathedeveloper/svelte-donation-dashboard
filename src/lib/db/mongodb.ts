import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Use environment variable with a more secure fallback
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/donation-dashboard';

let cachedConnection: typeof mongoose | null = null;

export async function connectDB() {
  if (cachedConnection) {
    if (cachedConnection.connection.readyState === 1) {
      return cachedConnection;
    }
  }

  try {
    const opts = {
      bufferCommands: true,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 30000,
      retryWrites: true,
      family: 4, // Force IPv4
      directConnection: true // Use direct connection to avoid DNS issues
    };

    // Try local connection first
    try {
      const db = await mongoose.connect('mongodb://localhost:27017/donation-dashboard', opts);
      cachedConnection = db;
      return db;
    } catch (localError) {
      console.error('Local connection failed:', localError);
      
      // If local fails and we have a different URI, try that
      if (MONGODB_URI !== 'mongodb://localhost:27017/donation-dashboard') {
        console.log('Trying alternative MongoDB connection...');
        const altDb = await mongoose.connect(MONGODB_URI, {
          ...opts,
          directConnection: false
        });
        
        cachedConnection = altDb;
        return altDb;
      } else {
        throw localError;
      }
    }
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

// Handle connection events
mongoose.connection.on('connected', () => {
  console.log('MongoDB connected successfully');
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
  cachedConnection = null;
});

process.on('SIGINT', async () => {
  await mongoose.connection.close();
  process.exit(0);
});