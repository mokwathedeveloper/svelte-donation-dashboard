import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { connectDB } from '$lib/db/mongodb';
import { Message, type IMessage } from '$lib/server/models/message';

export const GET: RequestHandler = async ({ locals }) => {
    try {
        await connectDB();
        
        const messages = await Message.find()
            .sort({ createdAt: -1 })
            .limit(50)
            .lean();

        return json(messages.map((message: IMessage) => ({
            id: message._id.toString(),
            sender: message.sender,
            content: message.content,
            timestamp: message.createdAt.toISOString()
        })));
    } catch (error) {
        console.error('Failed to fetch chat history:', error);
        return json({ error: 'Failed to fetch chat history' }, { status: 500 });
    }
}; 