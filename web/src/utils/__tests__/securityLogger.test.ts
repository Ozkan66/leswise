import { logPasswordChanged, logPasswordResetRequested, logLoginSuccess, logLoginFailed } from '../securityLogger';
import { supabase } from '../supabaseClient';

// Mock Supabase
jest.mock('../supabaseClient', () => ({
  supabase: {
    rpc: jest.fn(),
  },
}));

// Mock window navigator
Object.defineProperty(window, 'navigator', {
  value: {
    userAgent: 'Test User Agent'
  },
  writable: true
});

describe('SecurityLogger', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('logs password changed event', async () => {
    const mockRpc = jest.fn().mockResolvedValue({ error: null });
    (supabase.rpc as jest.Mock) = mockRpc;

    await logPasswordChanged('user123');

    expect(mockRpc).toHaveBeenCalledWith('log_security_event', {
      p_user_id: 'user123',
      p_event_type: 'password_changed',
      p_event_details: {
        method: 'profile_settings'
      },
      p_ip_address: null,
      p_user_agent: 'Test User Agent'
    });
  });

  it('logs password reset requested event', async () => {
    const mockRpc = jest.fn().mockResolvedValue({ error: null });
    (supabase.rpc as jest.Mock) = mockRpc;

    await logPasswordResetRequested('test@example.com');

    expect(mockRpc).toHaveBeenCalledWith('log_security_event', {
      p_user_id: null,
      p_event_type: 'password_reset_requested',
      p_event_details: {
        email: 'test@example.com',
        method: 'forgot_password_form'
      },
      p_ip_address: null,
      p_user_agent: 'Test User Agent'
    });
  });

  it('logs successful email login', async () => {
    const mockRpc = jest.fn().mockResolvedValue({ error: null });
    (supabase.rpc as jest.Mock) = mockRpc;

    await logLoginSuccess('user123', 'email');

    expect(mockRpc).toHaveBeenCalledWith('log_security_event', {
      p_user_id: 'user123',
      p_event_type: 'login_success',
      p_event_details: {
        method: 'email'
      },
      p_ip_address: null,
      p_user_agent: 'Test User Agent'
    });
  });

  it('logs successful OAuth login', async () => {
    const mockRpc = jest.fn().mockResolvedValue({ error: null });
    (supabase.rpc as jest.Mock) = mockRpc;

    await logLoginSuccess('user123', 'oauth', 'google');

    expect(mockRpc).toHaveBeenCalledWith('log_security_event', {
      p_user_id: 'user123',
      p_event_type: 'oauth_login_success',
      p_event_details: {
        method: 'oauth',
        provider: 'google'
      },
      p_ip_address: null,
      p_user_agent: 'Test User Agent'
    });
  });

  it('logs failed login attempt', async () => {
    const mockRpc = jest.fn().mockResolvedValue({ error: null });
    (supabase.rpc as jest.Mock) = mockRpc;

    await logLoginFailed('test@example.com', 'email', undefined, 'Invalid credentials');

    expect(mockRpc).toHaveBeenCalledWith('log_security_event', {
      p_user_id: null,
      p_event_type: 'login_failed',
      p_event_details: {
        method: 'email',
        email: 'test@example.com',
        error_message: 'Invalid credentials'
      },
      p_ip_address: null,
      p_user_agent: 'Test User Agent'
    });
  });

  it('handles logging errors gracefully', async () => {
    const mockRpc = jest.fn().mockResolvedValue({ error: { message: 'Database error' } });
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    (supabase.rpc as jest.Mock) = mockRpc;

    await logPasswordChanged('user123');

    expect(consoleSpy).toHaveBeenCalledWith('Failed to log security event:', { message: 'Database error' });

    consoleSpy.mockRestore();
  });

  it('handles network errors gracefully', async () => {
    const mockRpc = jest.fn().mockRejectedValue(new Error('Network error'));
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    (supabase.rpc as jest.Mock) = mockRpc;

    await logPasswordChanged('user123');

    expect(consoleSpy).toHaveBeenCalledWith('Error logging security event:', new Error('Network error'));

    consoleSpy.mockRestore();
  });
});