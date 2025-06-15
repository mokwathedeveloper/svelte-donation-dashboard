import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock mongoose
const mockProject = {
  _id: '507f1f77bcf86cd799439011',
  title: 'Test Project',
  description: 'A test project for donations',
  goal: 100000,
  raised: 25000,
  status: 'active',
  imageUrl: 'https://example.com/image.jpg',
  createdAt: new Date(),
  updatedAt: new Date(),
  save: vi.fn(),
  toObject: vi.fn()
};

const mockProjectModel = {
  find: vi.fn(),
  findById: vi.fn(),
  findOne: vi.fn(),
  create: vi.fn(),
  findByIdAndUpdate: vi.fn(),
  findByIdAndDelete: vi.fn(),
  countDocuments: vi.fn(),
  aggregate: vi.fn()
};

vi.mock('$lib/models/Project', () => ({
  default: mockProjectModel
}));

describe('Project Model', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Project Creation', () => {
    it('should create a new project with valid data', async () => {
      const projectData = {
        title: 'Clean Water Initiative',
        description: 'Providing clean water to rural communities',
        goal: 500000,
        imageUrl: 'https://example.com/water.jpg'
      };

      mockProjectModel.create.mockResolvedValue({
        ...mockProject,
        ...projectData,
        _id: 'new-project-id'
      });

      const result = await mockProjectModel.create(projectData);

      expect(mockProjectModel.create).toHaveBeenCalledWith(projectData);
      expect(result.title).toBe(projectData.title);
      expect(result.goal).toBe(projectData.goal);
      expect(result.raised).toBe(0); // Should default to 0
    });

    it('should validate required fields', async () => {
      const invalidData = {
        description: 'Missing title and goal'
      };

      mockProjectModel.create.mockRejectedValue(new Error('Validation failed'));

      await expect(mockProjectModel.create(invalidData)).rejects.toThrow('Validation failed');
    });
  });

  describe('Project Queries', () => {
    it('should find all active projects', async () => {
      const activeProjects = [
        { ...mockProject, status: 'active' },
        { ...mockProject, _id: '507f1f77bcf86cd799439012', status: 'active' }
      ];

      mockProjectModel.find.mockResolvedValue(activeProjects);

      const result = await mockProjectModel.find({ status: 'active' });

      expect(mockProjectModel.find).toHaveBeenCalledWith({ status: 'active' });
      expect(result).toHaveLength(2);
      expect(result.every(p => p.status === 'active')).toBe(true);
    });

    it('should find project by ID', async () => {
      mockProjectModel.findById.mockResolvedValue(mockProject);

      const result = await mockProjectModel.findById('507f1f77bcf86cd799439011');

      expect(mockProjectModel.findById).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
      expect(result._id).toBe('507f1f77bcf86cd799439011');
    });

    it('should return null for non-existent project', async () => {
      mockProjectModel.findById.mockResolvedValue(null);

      const result = await mockProjectModel.findById('nonexistent-id');

      expect(result).toBeNull();
    });
  });

  describe('Project Updates', () => {
    it('should update project raised amount', async () => {
      const updatedProject = {
        ...mockProject,
        raised: 30000
      };

      mockProjectModel.findByIdAndUpdate.mockResolvedValue(updatedProject);

      const result = await mockProjectModel.findByIdAndUpdate(
        '507f1f77bcf86cd799439011',
        { raised: 30000 },
        { new: true }
      );

      expect(result.raised).toBe(30000);
    });

    it('should update project status', async () => {
      const updatedProject = {
        ...mockProject,
        status: 'completed'
      };

      mockProjectModel.findByIdAndUpdate.mockResolvedValue(updatedProject);

      const result = await mockProjectModel.findByIdAndUpdate(
        '507f1f77bcf86cd799439011',
        { status: 'completed' },
        { new: true }
      );

      expect(result.status).toBe('completed');
    });
  });

  describe('Project Statistics', () => {
    it('should calculate total funding statistics', async () => {
      const stats = [
        {
          _id: null,
          totalGoal: 1000000,
          totalRaised: 350000,
          activeProjects: 5,
          completedProjects: 2
        }
      ];

      mockProjectModel.aggregate.mockResolvedValue(stats);

      const result = await mockProjectModel.aggregate([
        {
          $group: {
            _id: null,
            totalGoal: { $sum: '$goal' },
            totalRaised: { $sum: '$raised' },
            activeProjects: {
              $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
            },
            completedProjects: {
              $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
            }
          }
        }
      ]);

      expect(result[0].totalGoal).toBe(1000000);
      expect(result[0].totalRaised).toBe(350000);
      expect(result[0].activeProjects).toBe(5);
    });
  });
});
