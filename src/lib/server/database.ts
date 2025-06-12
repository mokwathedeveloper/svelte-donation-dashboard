import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env');
}

let cachedConnection: typeof mongoose | null = null;

export async function connectDB() {
  if (cachedConnection) {
    if (cachedConnection.connection.readyState === 1) {
      console.log('Using cached database connection');
      return cachedConnection;
    }
    console.log('Cached connection is not ready, creating new connection');
  }

  try {
    const opts = {
      bufferCommands: true, // Enable buffer commands
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      family: 4, // Use IPv4, skip trying IPv6
      connectTimeoutMS: 10000,
    };

    console.log('Creating new database connection');
    const connection = await mongoose.connect(MONGODB_URI, opts);
    
    // Wait for the connection to be ready
    await new Promise((resolve) => {
      if (connection.connection.readyState === 1) {
        resolve(true);
      } else {
        connection.connection.once('connected', resolve);
      }
    });

    console.log('Database connected successfully');
    console.log('Connection state:', connection.connection.readyState);
    
    // Cache the connection
    cachedConnection = connection;
    return connection;
  } catch (e) {
    console.error('MongoDB connection error:', e);
    throw e;
  }
}

// Handle connection events
mongoose.connection.on('connected', () => {
  console.log('MongoDB connected');
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