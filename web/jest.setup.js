require('@testing-library/jest-dom');

// Mock Supabase environment variables
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://mock.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'mock-anon-key';

// Suppress specific act() warnings for async operations in tests
const originalError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('An update to') &&
      args[0].includes('inside a test was not wrapped in act')
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    prefetch: jest.fn(),
  }),
}));

// Mock Supabase client
jest.mock('./src/utils/supabaseClient', () => {
  const createChainableMock = () => ({
    select: jest.fn(() => createChainableMock()),
    insert: jest.fn(() => createChainableMock()),
    update: jest.fn(() => createChainableMock()),
    delete: jest.fn(() => createChainableMock()),
    eq: jest.fn(() => createChainableMock()),
    order: jest.fn(() => createChainableMock()),
    limit: jest.fn(() => createChainableMock()),
    match: jest.fn(() => createChainableMock()),
    in: jest.fn(() => createChainableMock()),
    single: jest.fn(() => createChainableMock()),
    then: jest.fn(() => Promise.resolve({ data: null, error: null }))
  });

  return {
    supabase: {
      auth: {
        getSession: jest.fn(),
        getUser: jest.fn(),
        onAuthStateChange: jest.fn(() => ({
          data: { subscription: { unsubscribe: jest.fn() } }
        })),
        signUp: jest.fn(),
        signInWithPassword: jest.fn(),
        signInWithOAuth: jest.fn(),
        signOut: jest.fn(),
        updateUser: jest.fn(),
      },
      from: jest.fn(() => createChainableMock()),
      rpc: jest.fn(() => Promise.resolve({ data: null, error: null })),
      functions: {
        invoke: jest.fn()
      }
    }
  };
});
