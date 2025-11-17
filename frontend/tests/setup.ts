import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import { vi } from 'vitest';
import matchers from '@testing-library/jest-dom/matchers';

// Extend expect with Jest-DOM matchers
expect.extend(matchers);

// Global cleanup after each test to prevent memory leaks
afterEach(() => {
  cleanup();
});

// Mock console.error to suppress warnings in tests
const mockConsoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

// Restore mocks after all tests
afterAll(() => {
  mockConsoleError.mockRestore();
});

// Optional: Mock React Query or Axios if needed globally
// vi.mock('@tanstack/react-query', () => ({
//   useQuery: vi.fn(),
//   useMutation: vi.fn(),
// }));

// Mock intersection observer for lazy loading tests
global.IntersectionObserver = vi.fn(() => ({
  observe: vi.fn(),
  disconnect: vi.fn(),
  unobserve: vi.fn(),
}));

// Mock Framer Motion for animation tests (avoids SSR issues)
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    li: ({ children }: { children: React.ReactNode }) => <li>{children}</li>,
    // Add more as needed
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Set longer timeout for async tests (e.g., API mocks)
vi.setConfig({ testTimeout: 10000 });