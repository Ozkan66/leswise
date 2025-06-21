import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { renderHook } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AuthProvider, useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../utils/supabaseClient';

// Mock the Supabase client
jest.mock('../../utils/supabaseClient');
const mockSupabase = supabase as jest.Mocked<typeof supabase>;

// Test component to use the auth context
function TestComponent() {
  const { signInWithProvider } = useAuth();
  
  const handleGoogleSignIn = async () => {
    const result = await signInWithProvider('google');
    if (result.error) {
      console.error('OAuth Error:', result.error);
    }
  };
  
  return (
    <div>
      <button onClick={handleGoogleSignIn}>Sign in with Google</button>
    </div>
  );
}

describe('AuthContext OAuth', () => {
  beforeEach(() => {
    // Mock auth state
    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: null },
      error: null
    });
    
    mockSupabase.auth.onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: jest.fn() } }
    });
    
    jest.clearAllMocks();
  });

  it('should handle Google OAuth provider correctly', async () => {
    mockSupabase.auth.signInWithOAuth.mockResolvedValue({
      data: { provider: 'google', url: 'https://accounts.google.com/oauth' },
      error: null
    });

    await act(async () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );
    });

    // Wait for the AuthProvider to finish loading
    await waitFor(() => {
      expect(screen.getByText('Sign in with Google')).toBeInTheDocument();
    });

    const googleButton = screen.getByText('Sign in with Google');
    fireEvent.click(googleButton);

    await waitFor(() => {
      expect(mockSupabase.auth.signInWithOAuth).toHaveBeenCalledWith({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      });
    });
  });

  it('should provide user-friendly error message for disabled provider', async () => {
    const providerError = {
      message: 'Unsupported provider: provider is not enabled',
      code: 400,
      error_code: 'validation_failed'
    };

    mockSupabase.auth.signInWithOAuth.mockResolvedValue({
      data: { provider: null, url: null },
      error: providerError
    });

    const { signInWithProvider } = renderHook(() => useAuth(), {
      wrapper: AuthProvider
    }).result.current;

    const result = await signInWithProvider('google');

    expect(result.error.message).toBe('Google inloggen is momenteel niet beschikbaar. Probeer het later opnieuw of gebruik je e-mailadres om in te loggen.');
    expect(result.error.originalMessage).toBe('Unsupported provider: provider is not enabled');
  });

  it('should validate provider parameter', async () => {
    await act(async () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );
    });

    // Wait for the AuthProvider to finish loading
    await waitFor(() => {
      expect(screen.getByText('Sign in with Google')).toBeInTheDocument();
    });

    const googleButton = screen.getByText('Sign in with Google');
    fireEvent.click(googleButton);

    await waitFor(() => {
      const call = mockSupabase.auth.signInWithOAuth.mock.calls[0];
      expect(call[0].provider).toBe('google');
      expect(typeof call[0].provider).toBe('string');
    });
  });
});