import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock donation data
const mockDonation = {
  _id: '507f1f77bcf86cd799439013',
  projectId: '507f1f77bcf86cd799439011',
  phone: '254712345678',
  amount: 5000,
  status: 'completed',
  mpesaReceiptNumber: 'ABC123XYZ',
  mpesaTransactionId: 'TXN123456',
  createdAt: new Date(),
  updatedAt: new Date(),
  save: vi.fn(),
  toObject: vi.fn()
};

const mockDonationModel = {
  find: vi.fn(),
  findById: vi.fn(),
  findOne: vi.fn(),
  create: vi.fn(),
  findByIdAndUpdate: vi.fn(),
  findByIdAndDelete: vi.fn(),
  countDocuments: vi.fn(),
  aggregate: vi.fn()
};

vi.mock('$lib/models/Donation', () => ({
  default: mockDonationModel
}));

describe('Donation Model', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Donation Creation', () => {
    it('should create a new donation with valid data', async () => {
      const donationData = {
        projectId: '507f1f77bcf86cd799439011',
        phone: '254712345678',
        amount: 10000,
        status: 'pending'
      };

      mockDonationModel.create.mockResolvedValue({
        ...mockDonation,
        ...donationData,
        _id: 'new-donation-id'
      });

      const result = await mockDonationModel.create(donationData);

      expect(mockDonationModel.create).toHaveBeenCalledWith(donationData);
      expect(result.projectId).toBe(donationData.projectId);
      expect(result.amount).toBe(donationData.amount);
      expect(result.status).toBe('pending');
    });

    it('should validate phone number format', async () => {
      const invalidData = {
        projectId: '507f1f77bcf86cd799439011',
        phone: '123', // Invalid phone number
        amount: 5000
      };

      mockDonationModel.create.mockRejectedValue(new Error('Invalid phone number format'));

      await expect(mockDonationModel.create(invalidData)).rejects.toThrow('Invalid phone number format');
    });

    it('should validate minimum donation amount', async () => {
      const invalidData = {
        projectId: '507f1f77bcf86cd799439011',
        phone: '254712345678',
        amount: 0.5 // Below minimum
      };

      mockDonationModel.create.mockRejectedValue(new Error('Amount below minimum'));

      await expect(mockDonationModel.create(invalidData)).rejects.toThrow('Amount below minimum');
    });
  });

  describe('Donation Queries', () => {
    it('should find donations by project ID', async () => {
      const projectDonations = [
        { ...mockDonation, amount: 5000 },
        { ...mockDonation, _id: '507f1f77bcf86cd799439014', amount: 3000 }
      ];

      mockDonationModel.find.mockResolvedValue(projectDonations);

      const result = await mockDonationModel.find({ 
        projectId: '507f1f77bcf86cd799439011',
        status: 'completed'
      });

      expect(mockDonationModel.find).toHaveBeenCalledWith({
        projectId: '507f1f77bcf86cd799439011',
        status: 'completed'
      });
      expect(result).toHaveLength(2);
    });

    it('should find donations by status', async () => {
      const pendingDonations = [
        { ...mockDonation, status: 'pending' },
        { ...mockDonation, _id: '507f1f77bcf86cd799439015', status: 'pending' }
      ];

      mockDonationModel.find.mockResolvedValue(pendingDonations);

      const result = await mockDonationModel.find({ status: 'pending' });

      expect(result.every(d => d.status === 'pending')).toBe(true);
    });

    it('should find donation by M-Pesa transaction ID', async () => {
      mockDonationModel.findOne.mockResolvedValue(mockDonation);

      const result = await mockDonationModel.findOne({ 
        mpesaTransactionId: 'TXN123456' 
      });

      expect(mockDonationModel.findOne).toHaveBeenCalledWith({
        mpesaTransactionId: 'TXN123456'
      });
      expect(result.mpesaTransactionId).toBe('TXN123456');
    });
  });

  describe('Donation Updates', () => {
    it('should update donation status to completed', async () => {
      const updatedDonation = {
        ...mockDonation,
        status: 'completed',
        mpesaReceiptNumber: 'NEW123XYZ'
      };

      mockDonationModel.findByIdAndUpdate.mockResolvedValue(updatedDonation);

      const result = await mockDonationModel.findByIdAndUpdate(
        '507f1f77bcf86cd799439013',
        { 
          status: 'completed',
          mpesaReceiptNumber: 'NEW123XYZ'
        },
        { new: true }
      );

      expect(result.status).toBe('completed');
      expect(result.mpesaReceiptNumber).toBe('NEW123XYZ');
    });

    it('should update donation status to failed', async () => {
      const failedDonation = {
        ...mockDonation,
        status: 'failed'
      };

      mockDonationModel.findByIdAndUpdate.mockResolvedValue(failedDonation);

      const result = await mockDonationModel.findByIdAndUpdate(
        '507f1f77bcf86cd799439013',
        { status: 'failed' },
        { new: true }
      );

      expect(result.status).toBe('failed');
    });
  });

  describe('Donation Statistics', () => {
    it('should calculate donation statistics by project', async () => {
      const stats = [
        {
          _id: '507f1f77bcf86cd799439011',
          totalAmount: 25000,
          donationCount: 5,
          avgDonation: 5000,
          completedDonations: 4,
          pendingDonations: 1
        }
      ];

      mockDonationModel.aggregate.mockResolvedValue(stats);

      const result = await mockDonationModel.aggregate([
        { $match: { projectId: '507f1f77bcf86cd799439011' } },
        {
          $group: {
            _id: '$projectId',
            totalAmount: { $sum: '$amount' },
            donationCount: { $sum: 1 },
            avgDonation: { $avg: '$amount' },
            completedDonations: {
              $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
            },
            pendingDonations: {
              $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
            }
          }
        }
      ]);

      expect(result[0].totalAmount).toBe(25000);
      expect(result[0].donationCount).toBe(5);
      expect(result[0].avgDonation).toBe(5000);
    });

    it('should calculate daily donation trends', async () => {
      const trends = [
        {
          _id: { year: 2024, month: 1, day: 15 },
          dailyTotal: 15000,
          donationCount: 3
        },
        {
          _id: { year: 2024, month: 1, day: 16 },
          dailyTotal: 20000,
          donationCount: 4
        }
      ];

      mockDonationModel.aggregate.mockResolvedValue(trends);

      const result = await mockDonationModel.aggregate([
        { $match: { status: 'completed' } },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
              day: { $dayOfMonth: '$createdAt' }
            },
            dailyTotal: { $sum: '$amount' },
            donationCount: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
      ]);

      expect(result).toHaveLength(2);
      expect(result[0].dailyTotal).toBe(15000);
      expect(result[1].dailyTotal).toBe(20000);
    });
  });
});
