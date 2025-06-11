import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '$env/static/private';

export interface JWTPayload {
    id: string;
    username: string;
    superAdmin: boolean;
}

export function createToken(payload: JWTPayload): string {
    return jwt.sign(payload, JWT_SECRET, {
        expiresIn: '24h' // Token expires in 24 hours
    });
}

export function verifyToken(token: string): JWTPayload | null {
    try {
        return jwt.verify(token, JWT_SECRET) as JWTPayload;
    } catch (error) {
        return null;
    }
}

export function getTokenFromRequest(request: Request): string | null {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
        return null;
    }
    return authHeader.substring(7); // Remove 'Bearer ' prefix
} 