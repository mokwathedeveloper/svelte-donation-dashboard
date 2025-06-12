import { connectDB } from '$lib/db/mongodb';
import { Project } from './models/project';

export async function initializeDatabase() {
    try {
        await connectDB();
        console.log('Database initialized successfully');
    } catch (error) {
        console.error('Error initializing database:', error);
        throw error;
    }
} 