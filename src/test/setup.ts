import { vi } from 'vitest';

// Mock environment variables
vi.mock('$env/static/private', () => ({
  MONGODB_URI: 'mongodb://localhost:27017/test-donation-platform',
  JWT_SECRET: 'test-jwt-secret-key',
  MPESA_CONSUMER_KEY: 'test-consumer-key',
  MPESA_CONSUMER_SECRET: 'test-consumer-secret',
  MPESA_SHORTCODE: '174379',
  MPESA_PASSKEY: 'test-passkey',
  MPESA_CALLBACK_URL: 'http://localhost:5173/api/mpesa/callback',
  ADMIN_SECRET_KEY: 'test-admin-key',
  SUPER_ADMIN_MASTER_KEY: 'test-super-admin-key'
}));

// Mock SvelteKit modules
vi.mock('$app/environment', () => ({
  browser: false,
  dev: true,
  building: false,
  version: 'test'
}));

vi.mock('$app/navigation', () => ({
  goto: vi.fn(),
  invalidate: vi.fn(),
  invalidateAll: vi.fn(),
  preloadData: vi.fn(),
  preloadCode: vi.fn(),
  beforeNavigate: vi.fn(),
  afterNavigate: vi.fn()
}));

vi.mock('$app/stores', () => ({
  page: {
    subscribe: vi.fn()
  },
  navigating: {
    subscribe: vi.fn()
  },
  updated: {
    subscribe: vi.fn()
  }
}));

// Global test utilities
global.fetch = vi.fn();

// Setup DOM environment
Object.defineProperty(window, 'location', {
  value: {
    href: 'http://localhost:5173',
    origin: 'http://localhost:5173',
    pathname: '/',
    search: '',
    hash: ''
  },
  writable: true
});

// Mock console methods for cleaner test output
global.console = {
  ...console,
  log: vi.fn(),
  warn: vi.fn(),
  error: vi.fn()
};
