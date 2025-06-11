import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

let cachedConnection: typeof mongoose | null = null;

export async function connectDB(): Promise<typeof mongoose> {
    try {
        if (cachedConnection) {
            // Check if the cached connection is still valid
            if (cachedConnection.connection.readyState === 1) {
                console.log('Using cached database connection');
                return cachedConnection;
            } else {
                console.log('Cached connection is stale, creating new connection...');
                cachedConnection = null;
            }
        }

        if (!MONGODB_URI) {
            console.error('MONGODB_URI is not defined in environment variables');
            throw new Error('MONGODB_URI is not defined in environment variables');
        }

        console.log('Creating new database connection...');
        
        // Configure mongoose
        mongoose.set('strictQuery', true);
        
        // Connect with timeout and options
        const connection = await Promise.race([
            mongoose.connect(MONGODB_URI, {
                maxPoolSize: 10,
                serverSelectionTimeoutMS: 5000,
                socketTimeoutMS: 45000,
                family: 4,
                connectTimeoutMS: 10000
            }),
            new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Database connection timeout after 5000ms')), 5000)
            )
        ]) as typeof mongoose;

        // Verify connection state
        console.log('Connection established, checking state...');
        if (connection.connection.readyState !== 1) {
            console.error('Invalid connection state after connect:', connection.connection.readyState);
            throw new Error(`Invalid connection state: ${connection.connection.readyState}`);
        }

        // Log connection details
        console.log('MongoDB connected successfully:', {
            host: connection.connection.host,
            port: connection.connection.port,
            name: connection.connection.name,
            readyState: connection.connection.readyState
        });

        // Add connection error handler
        connection.connection.on('error', (err: Error) => {
            console.error('MongoDB connection error:', err);
            cachedConnection = null;
        });

        // Add disconnection handler
        connection.connection.on('disconnected', () => {
            console.log('MongoDB disconnected');
            cachedConnection = null;
        });

        // Add reconnect handler
        connection.connection.on('reconnected', () => {
            console.log('MongoDB reconnected');
        });

        // Cache the connection
        cachedConnection = connection;
        return connection;
    } catch (error) {
        console.error('Failed to connect to MongoDB:', {
            error,
            uri: MONGODB_URI?.replace(/\/\/[^:]+:[^@]+@/, '//****:****@'), // Log URI without credentials
            readyState: mongoose.connection.readyState
        });
        cachedConnection = null;
        throw error;
    }
}