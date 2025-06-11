import { env } from '$env/dynamic/private';

export const mpesaConfig = {
    consumerKey: env.MPESA_CONSUMER_KEY || 'Lv2LBAMlXJHSg23GUGg9eV5ubPunDEzkHAClzfaiMZMeZtM8',
    consumerSecret: env.MPESA_CONSUMER_SECRET || '9E2OZL2d3E8zmawcrRAqRsA8ZED2UW8bZbV8dbClvDivBxmRoP5J8YdEojtAXApD',
    passkey: env.MPESA_PASSKEY || 'bfb279f9aa9bdbcf158e97dd71a4',
    shortcode: env.MPESA_SHORTCODE || '174379',
    initiatorName: env.MPESA_INITIATOR_NAME || 'testapi',
    initiatorPassword: env.MPESA_INITIATOR_PASSWORD || 'Safaricom123!',
    callbackUrl: env.MPESA_CALLBACK_URL || 'https://mydomain.com/path',
    environment: env.NODE_ENV === 'production' ? 'production' : 'sandbox',
    baseUrls: {
        sandbox: 'https://sandbox.safaricom.co.ke',
        production: 'https://api.safaricom.co.ke',
    }
} as const;

export type MpesaConfig = typeof mpesaConfig;

// Helper function to get the base URL based on environment
export const getMpesaBaseUrl = () => {
    return mpesaConfig.environment === 'production' 
        ? mpesaConfig.baseUrls.production 
        : mpesaConfig.baseUrls.sandbox;
}; 