import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Use environment variable with a more secure fallback
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/donation-dashboard';

let cachedConnection: typeof mongoose | null = null;

export async function connectDB() {
  if (cachedConnection) {
    console.log('Checking cached connection state:', cachedConnection.connection.readyState);
    if (cachedConnection.connection.readyState === 1) {
      console.log('Using cached database connection');
      return cachedConnection;
    }
    console.log('Cached connection is not ready, creating new connection');
  }

  try {
    const opts = {
      bufferCommands: true,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 30000, // Increased timeout
      socketTimeoutMS: 45000,
      connectTimeoutMS: 30000, // Increased timeout
      retryWrites: true
    };

    console.log('Attempting MongoDB connection...');
    const db = await mongoose.connect(MONGODB_URI, opts);
    console.log('Database connected successfully');
    console.log('Connection state:', db.connection.readyState);
    console.log('MongoDB connection details:', {
      readyState: db.connection.readyState,
      host: db.connection.host,
      name: db.connection.name
    });

    cachedConnection = db;
    return db;
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
});

process.on('SIGINT', async () => {
  await mongoose.connection.close();
  process.exit(0);
});