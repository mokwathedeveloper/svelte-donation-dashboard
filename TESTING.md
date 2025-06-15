# Testing Guide

This document provides comprehensive information about testing the donation platform.

## Test Framework

The project uses **Vitest** as the primary testing framework, chosen for its:
- Native TypeScript support
- Fast execution with hot module replacement
- Excellent SvelteKit integration
- Built-in coverage reporting
- Modern testing features

## Test Structure

```
src/test/
├── setup.ts                    # Test environment setup
├── components/                 # Component tests
│   └── ProjectCard.test.ts
├── models/                     # Database model tests
│   ├── Project.test.ts
│   └── Donation.test.ts
├── api/                        # API endpoint tests
│   ├── projects.test.ts
│   └── mpesa.test.ts
└── utils/                      # Utility function tests
    └── auth.test.ts
```

## Running Tests

### Basic Commands

```bash
# Run all tests
npm run test

# Run tests once (CI mode)
npm run test:run

# Run tests with coverage report
npm run test:coverage

# Run tests with UI interface
npm run test:ui

# Run tests in watch mode
npm run test:watch
```

### Test Categories

#### 1. Unit Tests
Test individual functions and components in isolation.

```bash
# Run specific test file
npx vitest src/test/utils/auth.test.ts

# Run tests matching pattern
npx vitest --grep "JWT"
```

#### 2. Integration Tests
Test API endpoints and database interactions.

```bash
# Run API tests
npx vitest src/test/api/

# Run model tests
npx vitest src/test/models/
```

#### 3. Component Tests
Test Svelte components and their behavior.

```bash
# Run component tests
npx vitest src/test/components/
```

## Test Coverage

### Coverage Reports

The project generates coverage reports in multiple formats:
- **Text**: Console output during test runs
- **HTML**: Detailed browser-viewable reports
- **JSON**: Machine-readable coverage data

```bash
# Generate coverage report
npm run test:coverage

# View HTML coverage report
open coverage/index.html
```

### Coverage Targets

- **Statements**: > 80%
- **Branches**: > 75%
- **Functions**: > 80%
- **Lines**: > 80%

## Test Categories

### 1. Database Model Tests

**Location**: `src/test/models/`

Tests for MongoDB models including:
- Data validation
- CRUD operations
- Aggregation queries
- Error handling

**Example**:
```typescript
describe('Project Model', () => {
  it('should create a new project with valid data', async () => {
    const projectData = {
      title: 'Clean Water Initiative',
      description: 'Providing clean water',
      goal: 500000
    };
    
    const project = await Project.create(projectData);
    expect(project.title).toBe(projectData.title);
  });
});
```

### 2. API Endpoint Tests

**Location**: `src/test/api/`

Tests for SvelteKit API routes including:
- Request/response handling
- Authentication
- Data validation
- Error responses

**Example**:
```typescript
describe('Projects API', () => {
  it('should return all active projects', async () => {
    const response = await GET();
    expect(response.status).toBe(200);
    expect(response.body.projects).toBeArray();
  });
});
```

### 3. Component Tests

**Location**: `src/test/components/`

Tests for Svelte components including:
- Prop handling
- Event emission
- User interactions
- Accessibility

**Example**:
```typescript
describe('ProjectCard Component', () => {
  it('should display project information correctly', () => {
    const project = { title: 'Test Project', goal: 100000 };
    const component = render(ProjectCard, { project });
    
    expect(component.getByText('Test Project')).toBeInTheDocument();
  });
});
```

### 4. Utility Function Tests

**Location**: `src/test/utils/`

Tests for utility functions including:
- Authentication helpers
- Data formatting
- Validation functions
- M-Pesa integration

**Example**:
```typescript
describe('Authentication Utilities', () => {
  it('should generate valid JWT token', () => {
    const token = generateToken({ userId: '123' });
    expect(token).toBeString();
    expect(verifyToken(token)).toBeTruthy();
  });
});
```

## Mocking Strategy

### Environment Variables
```typescript
vi.mock('$env/static/private', () => ({
  MONGODB_URI: 'mongodb://localhost:27017/test',
  JWT_SECRET: 'test-secret'
}));
```

### External APIs
```typescript
vi.mock('axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn()
  }
}));
```

### Database Models
```typescript
const mockProjectModel = {
  find: vi.fn(),
  create: vi.fn(),
  findByIdAndUpdate: vi.fn()
};

vi.mock('$lib/models/Project', () => ({
  default: mockProjectModel
}));
```

## Best Practices

### 1. Test Organization
- Group related tests using `describe` blocks
- Use descriptive test names
- Follow AAA pattern (Arrange, Act, Assert)

### 2. Mock Management
- Clear mocks between tests using `beforeEach`
- Mock external dependencies consistently
- Use realistic mock data

### 3. Assertions
- Use specific matchers (`toBe`, `toEqual`, `toContain`)
- Test both success and error cases
- Verify function calls with `toHaveBeenCalledWith`

### 4. Test Data
- Use factory functions for test data
- Keep test data minimal but realistic
- Avoid hardcoded values where possible

## Continuous Integration

### GitHub Actions
Tests run automatically on:
- Pull requests
- Pushes to main branch
- Release creation

### Test Pipeline
1. Install dependencies
2. Run linting
3. Run type checking
4. Run test suite
5. Generate coverage report
6. Upload coverage to reporting service

## Debugging Tests

### Common Issues

1. **Mock not working**
   ```typescript
   // Ensure mock is called before import
   vi.mock('module-name');
   import { functionToTest } from './module';
   ```

2. **Async test failures**
   ```typescript
   // Always await async operations
   await expect(asyncFunction()).resolves.toBe(expected);
   ```

3. **Environment setup**
   ```typescript
   // Check test setup file is loaded
   // Verify environment variables are mocked
   ```

### Debug Commands
```bash
# Run single test with debug output
npx vitest --run --reporter=verbose src/test/specific.test.ts

# Run tests with Node.js debugger
node --inspect-brk ./node_modules/.bin/vitest
```

## Performance Testing

### Load Testing
For API endpoints, consider adding performance tests:

```typescript
describe('Performance Tests', () => {
  it('should handle multiple concurrent requests', async () => {
    const requests = Array(100).fill(null).map(() => 
      fetch('/api/projects')
    );
    
    const responses = await Promise.all(requests);
    expect(responses.every(r => r.ok)).toBe(true);
  });
});
```

### Memory Testing
Monitor memory usage during test runs:

```bash
# Run tests with memory monitoring
node --max-old-space-size=4096 ./node_modules/.bin/vitest
```

## Contributing

When adding new features:

1. Write tests first (TDD approach)
2. Ensure all tests pass
3. Maintain or improve coverage
4. Update test documentation
5. Add integration tests for new APIs

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)
- [SvelteKit Testing](https://kit.svelte.dev/docs/testing)
- [MongoDB Memory Server](https://github.com/nodkz/mongodb-memory-server)
