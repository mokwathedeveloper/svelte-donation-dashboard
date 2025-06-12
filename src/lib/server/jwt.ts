import jwt from 'jsonwebtoken';
import { env } from '$env/dynamic/private';

export interface JWTPayload {
    id: string;
    username: string;
}

const getJwtSecret = () => {
    return env.JWT_SECRET || 'default_jwt_secret_for_development';
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