import { mpesaConfig, getMpesaBaseUrl } from '$lib/config/mpesa';

export class MpesaService {
    private static instance: MpesaService;
    private accessToken: string | null = null;
    private tokenExpiry: Date | null = null;

    private constructor() {}

    public static getInstance(): MpesaService {
        if (!MpesaService.instance) {
            MpesaService.instance = new MpesaService();
        }
        return MpesaService.instance;
    }

    private async getAccessToken(): Promise<string> {
        // Return existing token if it's still valid
        if (this.accessToken && this.tokenExpiry && this.tokenExpiry > new Date()) {
            return this.accessToken;
        }

        const auth = Buffer.from(`${mpesaConfig.consumerKey}:${mpesaConfig.consumerSecret}`).toString('base64');
        const response = await fetch(`${getMpesaBaseUrl()}/oauth/v1/generate?grant_type=client_credentials`, {
            method: 'GET',
            headers: {
                Authorization: `Basic ${auth}`,
            },
        });

        if (!response.ok) {
            throw new Error('Failed to get access token');
        }

        const data: { access_token: string } = await response.json();
        
        if (!data.access_token) {
            throw new Error('Invalid access token response');
        }

        this.accessToken = data.access_token;
        // Token expires in 1 hour, we'll set it to expire in 55 minutes to be safe
        this.tokenExpiry = new Date(Date.now() + 55 * 60 * 1000);
        return this.accessToken;
    }

    public async initiateSTKPush(phoneNumber: string, amount: number, accountReference: string): Promise<any> {
        const accessToken = await this.getAccessToken();
        const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3);
        const password = Buffer.from(
            `${mpesaConfig.shortcode}${mpesaConfig.passkey}${timestamp}`
        ).toString('base64');

        const response = await fetch(`${getMpesaBaseUrl()}/mpesa/stkpush/v1/processrequest`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                BusinessShortCode: mpesaConfig.shortcode,
                Password: password,
                Timestamp: timestamp,
                TransactionType: 'CustomerPayBillOnline',
                Amount: amount,
                PartyA: phoneNumber,
                PartyB: mpesaConfig.shortcode,
                PhoneNumber: phoneNumber,
                CallBackURL: mpesaConfig.callbackUrl,
                AccountReference: accountReference,
                TransactionDesc: `Payment for ${accountReference}`,
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.errorMessage || 'Failed to initiate STK push');
        }

        return await response.json();
    }

    public async checkTransactionStatus(checkoutRequestId: string): Promise<any> {
        const accessToken = await this.getAccessToken();
        const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3);
        const password = Buffer.from(
            `${mpesaConfig.shortcode}${mpesaConfig.passkey}${timestamp}`
        ).toString('base64');

        const response = await fetch(`${getMpesaBaseUrl()}/mpesa/stkpushquery/v1/query`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                BusinessShortCode: mpesaConfig.shortcode,
                Password: password,
                Timestamp: timestamp,
                CheckoutRequestID: checkoutRequestId,
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.errorMessage || 'Failed to check transaction status');
        }

        return await response.json();
    }
} 