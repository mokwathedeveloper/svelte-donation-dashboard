import jwt from 'jsonwebtoken';
import { env } from '$env/dynamic/private';

export interface JWTPayload {
    id: string;
    email: string;
    role: string;
}

const getJwtSecret = () => {
    const secret = env.JWT_SECRET;
    if (!secret) {
        throw new Error('JWT_SECRET environment variable is not set');
    }
    return secret;
};

export const createToken = (payload: JWTPayload): string => {
    return jwt.sign(payload, getJwtSecret(), { expiresIn: '7d' });
};

export const verifyToken = (token: string): JWTPayload => {
    try {
        return jwt.verify(token, getJwtSecret()) as JWTPayload;
    } catch (error) {
        throw new Error('Invalid token');
    }
};

export function getTokenFromRequest(request: Request): string | null {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
        return null;
    }
    return authHeader.substring(7); // Remove 'Bearer ' prefix
} 