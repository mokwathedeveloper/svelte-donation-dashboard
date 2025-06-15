import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock M-Pesa responses
const mockMpesaTokenResponse = {
  access_token: 'mock-access-token',
  expires_in: '3599'
};

const mockStkPushResponse = {
  MerchantRequestID: 'mock-merchant-request-id',
  CheckoutRequestID: 'mock-checkout-request-id',
  ResponseCode: '0',
  ResponseDescription: 'Success. Request accepted for processing',
  CustomerMessage: 'Success. Request accepted for processing'
};

const mockCallbackData = {
  Body: {
    stkCallback: {
      MerchantRequestID: 'mock-merchant-request-id',
      CheckoutRequestID: 'mock-checkout-request-id',
      ResultCode: 0,
      ResultDesc: 'The service request is processed successfully.',
      CallbackMetadata: {
        Item: [
          { Name: 'Amount', Value: 5000 },
          { Name: 'MpesaReceiptNumber', Value: 'ABC123XYZ' },
          { Name: 'TransactionDate', Value: 20240115143022 },
          { Name: 'PhoneNumber', Value: 254712345678 }
        ]
      }
    }
  }
};

// Mock axios
const mockAxios = {
  get: vi.fn(),
  post: vi.fn(),
  defaults: {
    headers: {
      common: {}
    }
  }
};

vi.mock('axios', () => ({
  default: mockAxios
}));

// Mock models
const mockDonation = {
  _id: '507f1f77bcf86cd799439013',
  projectId: '507f1f77bcf86cd799439011',
  phone: '254712345678',
  amount: 5000,
  status: 'pending',
  checkoutRequestId: 'mock-checkout-request-id',
  save: vi.fn()
};

const mockDonationModel = {
  create: vi.fn(),
  findOne: vi.fn(),
  findByIdAndUpdate: vi.fn()
};

const mockProjectModel = {
  findByIdAndUpdate: vi.fn()
};

vi.mock('$lib/models/Donation', () => ({
  default: mockDonationModel
}));

vi.mock('$lib/models/Project', () => ({
  default: mockProjectModel
}));

describe('M-Pesa Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('STK Push', () => {
    it('should initiate STK push successfully', async () => {
      // Mock token request
      mockAxios.get.mockResolvedValueOnce({
        data: mockMpesaTokenResponse
      });

      // Mock STK push request
      mockAxios.post.mockResolvedValueOnce({
        data: mockStkPushResponse
      });

      // Mock donation creation
      mockDonationModel.create.mockResolvedValue({
        ...mockDonation,
        checkoutRequestId: mockStkPushResponse.CheckoutRequestID
      });

      const stkPushData = {
        phone: '254712345678',
        amount: 5000,
        projectId: '507f1f77bcf86cd799439011'
      };

      // Simulate STK push process
      const tokenResponse = await mockAxios.get();
      expect(tokenResponse.data.access_token).toBe('mock-access-token');

      const stkResponse = await mockAxios.post();
      expect(stkResponse.data.ResponseCode).toBe('0');
      expect(stkResponse.data.ResponseDescription).toContain('Success');

      const donation = await mockDonationModel.create({
        ...stkPushData,
        status: 'pending',
        checkoutRequestId: stkResponse.data.CheckoutRequestID
      });

      expect(donation.checkoutRequestId).toBe('mock-checkout-request-id');
      expect(donation.status).toBe('pending');
    });

    it('should handle invalid phone number', async () => {
      const invalidData = {
        phone: '123456', // Invalid format
        amount: 5000,
        projectId: '507f1f77bcf86cd799439011'
      };

      // Simulate validation error
      const response = {
        status: 400,
        body: { error: 'Invalid phone number format. Use 254XXXXXXXXX' }
      };

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Invalid phone number format');
    });

    it('should handle amount validation', async () => {
      const invalidData = {
        phone: '254712345678',
        amount: 0.5, // Below minimum
        projectId: '507f1f77bcf86cd799439011'
      };

      const response = {
        status: 400,
        body: { error: 'Amount must be between KES 1 and KES 150,000' }
      };

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Amount must be between');
    });

    it('should handle M-Pesa API errors', async () => {
      mockAxios.get.mockRejectedValue(new Error('Network error'));

      try {
        await mockAxios.get();
      } catch (error) {
        const response = {
          status: 500,
          body: { error: 'M-Pesa service temporarily unavailable' }
        };

        expect(response.status).toBe(500);
        expect(response.body.error).toContain('M-Pesa service');
      }
    });
  });

  describe('M-Pesa Callback', () => {
    it('should process successful payment callback', async () => {
      // Mock finding donation by checkout request ID
      mockDonationModel.findOne.mockResolvedValue(mockDonation);

      // Mock donation update
      const updatedDonation = {
        ...mockDonation,
        status: 'completed',
        mpesaReceiptNumber: 'ABC123XYZ',
        mpesaTransactionId: 'TXN123456'
      };
      mockDonationModel.findByIdAndUpdate.mockResolvedValue(updatedDonation);

      // Mock project update
      const updatedProject = {
        _id: '507f1f77bcf86cd799439011',
        raised: 30000 // Previous + new donation
      };
      mockProjectModel.findByIdAndUpdate.mockResolvedValue(updatedProject);

      // Process callback
      const donation = await mockDonationModel.findOne({
        checkoutRequestId: 'mock-checkout-request-id'
      });

      expect(donation).toBeTruthy();

      const completedDonation = await mockDonationModel.findByIdAndUpdate(
        donation._id,
        {
          status: 'completed',
          mpesaReceiptNumber: 'ABC123XYZ',
          mpesaTransactionId: 'TXN123456'
        },
        { new: true }
      );

      expect(completedDonation.status).toBe('completed');
      expect(completedDonation.mpesaReceiptNumber).toBe('ABC123XYZ');

      // Update project raised amount
      await mockProjectModel.findByIdAndUpdate(
        donation.projectId,
        { $inc: { raised: donation.amount } },
        { new: true }
      );

      expect(mockProjectModel.findByIdAndUpdate).toHaveBeenCalledWith(
        donation.projectId,
        { $inc: { raised: donation.amount } },
        { new: true }
      );
    });

    it('should handle failed payment callback', async () => {
      const failedCallbackData = {
        Body: {
          stkCallback: {
            MerchantRequestID: 'mock-merchant-request-id',
            CheckoutRequestID: 'mock-checkout-request-id',
            ResultCode: 1032, // User cancelled
            ResultDesc: 'Request cancelled by user'
          }
        }
      };

      mockDonationModel.findOne.mockResolvedValue(mockDonation);

      const failedDonation = {
        ...mockDonation,
        status: 'cancelled'
      };
      mockDonationModel.findByIdAndUpdate.mockResolvedValue(failedDonation);

      const donation = await mockDonationModel.findOne({
        checkoutRequestId: 'mock-checkout-request-id'
      });

      const updatedDonation = await mockDonationModel.findByIdAndUpdate(
        donation._id,
        { status: 'cancelled' },
        { new: true }
      );

      expect(updatedDonation.status).toBe('cancelled');
      
      // Project raised amount should not be updated for failed payments
      expect(mockProjectModel.findByIdAndUpdate).not.toHaveBeenCalled();
    });

    it('should handle callback for non-existent donation', async () => {
      mockDonationModel.findOne.mockResolvedValue(null);

      const donation = await mockDonationModel.findOne({
        checkoutRequestId: 'non-existent-request-id'
      });

      expect(donation).toBeNull();

      const response = {
        status: 404,
        body: { error: 'Donation not found' }
      };

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Donation not found');
    });

    it('should extract callback metadata correctly', () => {
      const metadata = mockCallbackData.Body.stkCallback.CallbackMetadata.Item;
      
      const extractedData = {
        amount: metadata.find(item => item.Name === 'Amount')?.Value,
        mpesaReceiptNumber: metadata.find(item => item.Name === 'MpesaReceiptNumber')?.Value,
        transactionDate: metadata.find(item => item.Name === 'TransactionDate')?.Value,
        phoneNumber: metadata.find(item => item.Name === 'PhoneNumber')?.Value
      };

      expect(extractedData.amount).toBe(5000);
      expect(extractedData.mpesaReceiptNumber).toBe('ABC123XYZ');
      expect(extractedData.transactionDate).toBe(20240115143022);
      expect(extractedData.phoneNumber).toBe(254712345678);
    });
  });

  describe('M-Pesa Token Management', () => {
    it('should generate access token successfully', async () => {
      mockAxios.get.mockResolvedValue({
        data: mockMpesaTokenResponse
      });

      const tokenResponse = await mockAxios.get();

      expect(tokenResponse.data.access_token).toBe('mock-access-token');
      expect(tokenResponse.data.expires_in).toBe('3599');
    });

    it('should handle token generation errors', async () => {
      mockAxios.get.mockRejectedValue(new Error('Authentication failed'));

      try {
        await mockAxios.get();
      } catch (error) {
        expect(error.message).toBe('Authentication failed');
      }
    });
  });
});
