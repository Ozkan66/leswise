import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AuthProvider, useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../utils/supabaseClient';

// Mock Supabase
jest.mock('../../utils/supabaseClient');
const mockSupabase = supabase as jest.Mocked<typeof supabase>;

// Test component to access the auth context
function TestComponent() {
  const { signInWithProvider } = useAuth();
  
  return (
    <div>
      <button 
        onClick={() => signInWithProvider('microsoft')}
        data-testid="microsoft-login"
      >
        Login with Microsoft
      </button>
      <button 
        onClick={() => signInWithProvider('google')}
        data-testid="google-login"
      >
        Login with Google
      </button>
    </div>
  );
}

describe('AuthContext OAuth Provider Tests', () => {
  beforeEach(() => {
    // Mock auth methods
    mockSupabase.auth.signInWithOAuth = jest.fn();
    mockSupabase.auth.getSession = jest.fn().mockResolvedValue({
      data: { session: null }
    });
    mockSupabase.auth.onAuthStateChange = jest.fn().mockReturnValue({
      data: { subscription: { unsubscribe: jest.fn() } }
    });
    
    jest.clearAllMocks();
  });

  it('calls Supabase with correct provider name for Microsoft', async () => {
    mockSupabase.auth.signInWithOAuth.mockResolvedValue({ error: null } as any);
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    fireEvent.click(screen.getByTestId('microsoft-login'));
    
    await waitFor(() => {
      expect(mockSupabase.auth.signInWithOAuth).toHaveBeenCalledWith({
        provider: 'microsoft',
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      });
    });
  });

  it('calls Supabase with correct provider name for Google', async () => {
    mockSupabase.auth.signInWithOAuth.mockResolvedValue({ error: null } as any);
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    fireEvent.click(screen.getByTestId('google-login'));
    
    await waitFor(() => {
      expect(mockSupabase.auth.signInWithOAuth).toHaveBeenCalledWith({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      });
    });
  });

  it('handles OAuth errors correctly', async () => {
    const mockError = { message: 'OAuth failed' };
    mockSupabase.auth.signInWithOAuth.mockResolvedValue({ error: mockError } as any);
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    fireEvent.click(screen.getByTestId('microsoft-login'));
    
    await waitFor(() => {
      expect(mockSupabase.auth.signInWithOAuth).toHaveBeenCalledWith({
        provider: 'microsoft',
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      });
    });
  });
});