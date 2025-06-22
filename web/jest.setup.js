require('@testing-library/jest-dom');

// Mock Supabase environment variables
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://mock.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'mock-anon-key';

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
      rpc: jest.fn(),
      functions: {
        invoke: jest.fn()
      }
    }
  };
});
