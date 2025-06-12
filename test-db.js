import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

async function testConnection() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI, {
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 30000,
            socketTimeoutMS: 45000,
            family: 4,
            connectTimeoutMS: 30000
        });
        console.log('Connected successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Connection error:', error);
        process.exit(1);
    }
}

testConnection(); 