import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { connectDB } from '$lib/db/mongodb';
import { Message, type IMessage } from '$lib/server/models/message';
import type { Types } from 'mongoose';

interface SavedMessage extends IMessage {
    _id: Types.ObjectId;
}

export const POST: RequestHandler = async ({ request, locals }) => {
    try {
        const { content } = await request.json();
        
        if (!content || typeof content !== 'string') {
            return json({ error: 'Message content is required' }, { status: 400 });
        }

        if (!locals.user?.username) {
            return json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();
        
        const message = new Message({
            sender: locals.user.username,
            content
        });

        const savedMessage = await message.save() as SavedMessage;

        return json({
            id: savedMessage._id.toString(),
            sender: savedMessage.sender,
            content: savedMessage.content,
            timestamp: savedMessage.createdAt.toISOString()
        });
    } catch (error) {
        console.error('Failed to send message:', error);
        return json({ error: 'Failed to send message' }, { status: 500 });
    }
}; 