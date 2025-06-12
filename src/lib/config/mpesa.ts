import { env } from '$env/dynamic/private';

// M-Pesa Configuration
export const MPESA_CONFIG = {
    consumerKey: env.MPESA_CONSUMER_KEY,
    consumerSecret: env.MPESA_CONSUMER_SECRET,
    passkey: env.MPESA_PASSKEY,
    shortcode: env.MPESA_SHORTCODE,
    callbackUrl: env.MPESA_CALLBACK_URL,
    baseUrl: 'https://sandbox.safaricom.co.ke'
} as const;

// Validate required environment variables
export function validateMpesaConfig() {
    const required = [
        'MPESA_CONSUMER_KEY',
        'MPESA_CONSUMER_SECRET',
        'MPESA_PASSKEY',
        'MPESA_SHORTCODE',
        'MPESA_CALLBACK_URL'
    ];

    const missing = required.filter(key => !env[key]);
    if (missing.length > 0) {
        throw new Error(`Missing required M-Pesa configuration: ${missing.join(', ')}`);
    }
}

export type MpesaConfig = typeof MPESA_CONFIG;

// Helper function to get the base URL based on environment
export function getMpesaBaseUrl(): string {
    return 'https://sandbox.safaricom.co.ke';
} 