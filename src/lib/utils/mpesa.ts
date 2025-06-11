import axios from 'axios';
import type { MpesaResponse } from '$lib/types';

// M-Pesa API configuration
const MPESA_CONFIG = {
  consumerKey: 'YOUR_CONSUMER_KEY',
  consumerSecret: 'YOUR_CONSUMER_SECRET',
  shortcode: 'YOUR_SHORTCODE',
  passkey: 'YOUR_PASSKEY',
  callbackUrl: 'YOUR_CALLBACK_URL',
  environment: 'sandbox' // or 'production'
};

const BASE_URL = MPESA_CONFIG.environment === 'production'
  ? 'https://api.safaricom.co.ke'
  : 'https://sandbox.safaricom.co.ke';

async function getAccessToken(): Promise<string> {
  try {
    const auth = Buffer.from(`${MPESA_CONFIG.consumerKey}:${MPESA_CONFIG.consumerSecret}`).toString('base64');
    const { data } = await axios.get(
      `${BASE_URL}/oauth/v1/generate?grant_type=client_credentials`,
      {
        headers: { Authorization: `Basic ${auth}` },
      }
    );
    return data.access_token;
  } catch (error) {
    console.error('Failed to get M-Pesa access token:', error);
    throw new Error('Failed to get M-Pesa access token');
  }
}

export async function initiateStkPush(
  phone: string,
  amount: number,
  transactionId: string
): Promise<MpesaResponse> {
  try {
    const token = await getAccessToken();
    const timestamp = new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 14);
    const password = Buffer.from(
      `${MPESA_CONFIG.shortcode}${MPESA_CONFIG.passkey}${timestamp}`
    ).toString('base64');

    const { data } = await axios.post<MpesaResponse>(
      `${BASE_URL}/mpesa/stkpush/v1/processrequest`,
      {
        BusinessShortCode: MPESA_CONFIG.shortcode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: Math.round(amount), // M-Pesa requires whole numbers
        PartyA: phone.replace(/^0/, '254'), // Convert format from 07... to 254...
        PartyB: MPESA_CONFIG.shortcode,
        PhoneNumber: phone.replace(/^0/, '254'),
        CallBackURL: MPESA_CONFIG.callbackUrl,
        AccountReference: transactionId,
        TransactionDesc: 'Donation Payment',
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    return data;
  } catch (error) {
    console.error('Failed to initiate STK push:', error);
    throw new Error('Failed to initiate payment');
  }
}