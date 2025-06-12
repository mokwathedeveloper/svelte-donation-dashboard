import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const {
  MPESA_CONSUMER_KEY,
  MPESA_CONSUMER_SECRET,
  MPESA_PASSKEY,
  MPESA_SHORTCODE,
  MPESA_CALLBACK_URL
} = process.env;

const MPESA_BASE_URL = 'https://sandbox.safaricom.co.ke';

// Validate required environment variables
function validateConfig() {
  const required = [
    'MPESA_CONSUMER_KEY',
    'MPESA_CONSUMER_SECRET',
    'MPESA_PASSKEY',
    'MPESA_SHORTCODE',
    'MPESA_CALLBACK_URL'
  ];

  const missing = required.filter(key => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing required M-Pesa configuration: ${missing.join(', ')}`);
  }
}

async function getAccessToken(): Promise<string> {
  try {
    validateConfig();
    
    const auth = Buffer.from(`${MPESA_CONSUMER_KEY}:${MPESA_CONSUMER_SECRET}`).toString('base64');
    const response = await axios.get(
      `${MPESA_BASE_URL}/oauth/v1/generate?grant_type=client_credentials`,
      {
        headers: { 
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.data?.access_token) {
      throw new Error('Invalid response from M-Pesa authentication');
    }

    return response.data.access_token;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('M-Pesa authentication error:', {
        status: error.response?.status,
        data: error.response?.data
      });
      throw new Error(`M-Pesa authentication failed: ${error.response?.data?.errorMessage || error.message}`);
    }
    throw error;
  }
}

export async function initiateStkPush(phone: string, amount: number, transactionId: string) {
  try {
    validateConfig();
    
    // Validate inputs
    if (!phone || !/^254[17]\d{8}$/.test(phone)) {
      throw new Error('Invalid phone number format');
    }
    if (!amount || amount <= 0) {
      throw new Error('Invalid amount');
    }
    if (!transactionId) {
      throw new Error('Transaction ID is required');
    }

    const token = await getAccessToken();
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3);
    const password = Buffer.from(`${MPESA_SHORTCODE}${MPESA_PASSKEY}${timestamp}`).toString('base64');

    const payload = {
      BusinessShortCode: MPESA_SHORTCODE,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: Math.round(amount), // Ensure whole number
      PartyA: phone,
      PartyB: MPESA_SHORTCODE,
      PhoneNumber: phone,
      CallBackURL: MPESA_CALLBACK_URL,
      AccountReference: transactionId,
      TransactionDesc: 'Donation Payment'
    };

    console.log('Initiating M-Pesa STK push with payload:', {
      ...payload,
      Password: '***HIDDEN***' // Don't log sensitive data
    });

    const response = await axios.post(
      `${MPESA_BASE_URL}/mpesa/stkpush/v1/processrequest`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.data?.ResponseCode || response.data.ResponseCode !== '0') {
      throw new Error(response.data?.ResponseDescription || 'Failed to initiate M-Pesa payment');
    }

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('M-Pesa STK push error:', {
        status: error.response?.status,
        data: error.response?.data
      });
      throw new Error(`M-Pesa payment failed: ${error.response?.data?.errorMessage || error.message}`);
    }
    throw error;
  }
}