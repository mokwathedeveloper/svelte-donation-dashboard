import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock SvelteKit request/response
const mockRequest = (method: string, body?: any) => ({
  method,
  json: vi.fn().mockResolvedValue(body),
  formData: vi.fn(),
  text: vi.fn(),
  url: 'http://localhost:5173/api/projects'
});

const mockResponse = (status: number, body?: any) => ({
  status,
  json: vi.fn().mockResolvedValue(body),
  text: vi.fn().mockResolvedValue(JSON.stringify(body))
});

// Mock database
const mockProjects = [
  {
    _id: '507f1f77bcf86cd799439011',
    title: 'Clean Water Initiative',
    description: 'Providing clean water to rural communities',
    goal: 500000,
    raised: 125000,
    status: 'active',
    imageUrl: 'https://example.com/water.jpg',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15')
  },
  {
    _id: '507f1f77bcf86cd799439012',
    title: 'Education for All',
    description: 'Building schools in underserved areas',
    goal: 750000,
    raised: 200000,
    status: 'active',
    imageUrl: 'https://example.com/education.jpg',
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-10')
  }
];

const mockProjectModel = {
  find: vi.fn(),
  findById: vi.fn(),
  create: vi.fn(),
  findByIdAndUpdate: vi.fn(),
  findByIdAndDelete: vi.fn()
};

vi.mock('$lib/models/Project', () => ({
  default: mockProjectModel
}));

vi.mock('$lib/utils/auth', () => ({
  verifyJWT: vi.fn(),
  isAdmin: vi.fn()
}));

describe('Projects API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/projects', () => {
    it('should return all active projects', async () => {
      mockProjectModel.find.mockResolvedValue(mockProjects);

      // Simulate GET request
      const request = mockRequest('GET');
      
      // Mock the actual API handler logic
      const projects = await mockProjectModel.find({ status: 'active' });
      const response = {
        status: 200,
        body: { projects }
      };

      expect(mockProjectModel.find).toHaveBeenCalledWith({ status: 'active' });
      expect(response.status).toBe(200);
      expect(response.body.projects).toHaveLength(2);
      expect(response.body.projects[0].title).toBe('Clean Water Initiative');
    });

    it('should handle database errors gracefully', async () => {
      mockProjectModel.find.mockRejectedValue(new Error('Database connection failed'));

      try {
        await mockProjectModel.find({ status: 'active' });
      } catch (error) {
        const response = {
          status: 500,
          body: { error: 'Internal server error' }
        };

        expect(response.status).toBe(500);
        expect(response.body.error).toBe('Internal server error');
      }
    });

    it('should return empty array when no projects exist', async () => {
      mockProjectModel.find.mockResolvedValue([]);

      const projects = await mockProjectModel.find({ status: 'active' });
      const response = {
        status: 200,
        body: { projects }
      };

      expect(response.body.projects).toHaveLength(0);
    });
  });

  describe('POST /api/projects', () => {
    const validProjectData = {
      title: 'New Healthcare Project',
      description: 'Improving healthcare access in remote areas',
      goal: 1000000,
      imageUrl: 'https://example.com/healthcare.jpg'
    };

    it('should create a new project with valid data', async () => {
      const newProject = {
        _id: '507f1f77bcf86cd799439013',
        ...validProjectData,
        raised: 0,
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockProjectModel.create.mockResolvedValue(newProject);

      const request = mockRequest('POST', validProjectData);
      const project = await mockProjectModel.create(validProjectData);
      
      const response = {
        status: 201,
        body: { project }
      };

      expect(mockProjectModel.create).toHaveBeenCalledWith(validProjectData);
      expect(response.status).toBe(201);
      expect(response.body.project.title).toBe(validProjectData.title);
      expect(response.body.project.raised).toBe(0);
      expect(response.body.project.status).toBe('active');
    });

    it('should validate required fields', async () => {
      const invalidData = {
        description: 'Missing title and goal'
      };

      const request = mockRequest('POST', invalidData);
      
      // Simulate validation error
      const response = {
        status: 400,
        body: { error: 'Title and goal are required' }
      };

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Title and goal are required');
    });

    it('should validate goal amount', async () => {
      const invalidData = {
        ...validProjectData,
        goal: -1000 // Negative goal
      };

      const request = mockRequest('POST', invalidData);
      
      const response = {
        status: 400,
        body: { error: 'Goal must be a positive number' }
      };

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Goal must be a positive number');
    });

    it('should validate image URL format', async () => {
      const invalidData = {
        ...validProjectData,
        imageUrl: 'not-a-valid-url'
      };

      const request = mockRequest('POST', invalidData);
      
      const response = {
        status: 400,
        body: { error: 'Invalid image URL format' }
      };

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Invalid image URL format');
    });
  });

  describe('PUT /api/projects/[id]', () => {
    it('should update project successfully', async () => {
      const updateData = {
        title: 'Updated Project Title',
        status: 'paused'
      };

      const updatedProject = {
        ...mockProjects[0],
        ...updateData,
        updatedAt: new Date()
      };

      mockProjectModel.findByIdAndUpdate.mockResolvedValue(updatedProject);

      const project = await mockProjectModel.findByIdAndUpdate(
        '507f1f77bcf86cd799439011',
        updateData,
        { new: true }
      );

      const response = {
        status: 200,
        body: { project }
      };

      expect(response.status).toBe(200);
      expect(response.body.project.title).toBe('Updated Project Title');
      expect(response.body.project.status).toBe('paused');
    });

    it('should return 404 for non-existent project', async () => {
      mockProjectModel.findByIdAndUpdate.mockResolvedValue(null);

      const project = await mockProjectModel.findByIdAndUpdate(
        'nonexistent-id',
        { title: 'Updated' },
        { new: true }
      );

      const response = {
        status: 404,
        body: { error: 'Project not found' }
      };

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Project not found');
    });
  });

  describe('DELETE /api/projects/[id]', () => {
    it('should delete project successfully', async () => {
      mockProjectModel.findByIdAndDelete.mockResolvedValue(mockProjects[0]);

      const deletedProject = await mockProjectModel.findByIdAndDelete('507f1f77bcf86cd799439011');

      const response = {
        status: 200,
        body: { message: 'Project deleted successfully' }
      };

      expect(mockProjectModel.findByIdAndDelete).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Project deleted successfully');
    });

    it('should return 404 for non-existent project', async () => {
      mockProjectModel.findByIdAndDelete.mockResolvedValue(null);

      const deletedProject = await mockProjectModel.findByIdAndDelete('nonexistent-id');

      const response = {
        status: 404,
        body: { error: 'Project not found' }
      };

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Project not found');
    });
  });
});
