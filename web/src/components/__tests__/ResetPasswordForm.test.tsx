import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import ResetPasswordForm from '../ResetPasswordForm';
import { supabase } from '../../utils/supabaseClient';

// Mock Supabase
jest.mock('../../utils/supabaseClient', () => ({
  supabase: {
    auth: {
      getSession: jest.fn(),
      updateUser: jest.fn(),
      getUser: jest.fn(),
    },
    rpc: jest.fn().mockResolvedValue({ data: null, error: null }),
  },
}));

// Mock Next.js navigation
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useSearchParams: () => ({
    get: jest.fn(),
  }),
}));

describe('ResetPasswordForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('toont loading state tijdens sessie controle', () => {
    const mockGetSession = jest.fn().mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({ data: { session: null }, error: null }), 100))
    );
    (supabase.auth.getSession as jest.Mock) = mockGetSession;

    render(<ResetPasswordForm />);
    
    expect(screen.getByText('Laden...')).toBeInTheDocument();
  });

  it('toont ongeldige link bericht voor invalid session', async () => {
    const mockGetSession = jest.fn().mockResolvedValue({ 
      data: { session: null }, 
      error: null 
    });
    (supabase.auth.getSession as jest.Mock) = mockGetSession;

    render(<ResetPasswordForm />);
    
    await waitFor(() => {
      expect(screen.getByText('Ongeldige link')).toBeInTheDocument();
      expect(screen.getByText(/deze wachtwoord reset link is ongeldig/i)).toBeInTheDocument();
    });
  });

  it('toont wachtwoord reset formulier voor geldige sessie', async () => {
    const mockGetSession = jest.fn().mockResolvedValue({ 
      data: { session: { user: { id: '123' } } }, 
      error: null 
    });
    (supabase.auth.getSession as jest.Mock) = mockGetSession;

    render(<ResetPasswordForm />);
    
    await waitFor(() => {
      expect(screen.getByText('Nieuw wachtwoord instellen')).toBeInTheDocument();
      expect(screen.getByLabelText('Nieuw wachtwoord:')).toBeInTheDocument();
      expect(screen.getByLabelText('Bevestig wachtwoord:')).toBeInTheDocument();
    });
  });

  it('valideert wachtwoord sterkte', async () => {
    const mockGetSession = jest.fn().mockResolvedValue({ 
      data: { session: { user: { id: '123' } } }, 
      error: null 
    });
    (supabase.auth.getSession as jest.Mock) = mockGetSession;

    render(<ResetPasswordForm />);
    
    await waitFor(() => {
      expect(screen.getByText('Nieuw wachtwoord instellen')).toBeInTheDocument();
    });
    
    const passwordInput = screen.getByLabelText('Nieuw wachtwoord:');
    const confirmPasswordInput = screen.getByLabelText('Bevestig wachtwoord:');
    const submitButton = screen.getByRole('button', { name: 'Wachtwoord opslaan' });
    
    // Test zwak wachtwoord
    fireEvent.change(passwordInput, { target: { value: 'weak' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'weak' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Wachtwoord moet minimaal 8 karakters lang zijn')).toBeInTheDocument();
    });
  });

  it('valideert wachtwoord bevestiging', async () => {
    const mockGetSession = jest.fn().mockResolvedValue({ 
      data: { session: { user: { id: '123' } } }, 
      error: null 
    });
    (supabase.auth.getSession as jest.Mock) = mockGetSession;

    render(<ResetPasswordForm />);
    
    await waitFor(() => {
      expect(screen.getByText('Nieuw wachtwoord instellen')).toBeInTheDocument();
    });
    
    const passwordInput = screen.getByLabelText('Nieuw wachtwoord:');
    const confirmPasswordInput = screen.getByLabelText('Bevestig wachtwoord:');
    const submitButton = screen.getByRole('button', { name: 'Wachtwoord opslaan' });
    
    fireEvent.change(passwordInput, { target: { value: 'NewPass123!' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'DifferentPass123!' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Wachtwoorden komen niet overeen')).toBeInTheDocument();
    });
  });

  it('wijzigt wachtwoord succesvol', async () => {
    const mockGetSession = jest.fn().mockResolvedValue({ 
      data: { session: { user: { id: '123' } } }, 
      error: null 
    });
    const mockUpdateUser = jest.fn().mockResolvedValue({ error: null });
    const mockGetUser = jest.fn().mockResolvedValue({ 
      data: { user: { id: '123' } }, 
      error: null 
    });
    
    (supabase.auth.getSession as jest.Mock) = mockGetSession;
    (supabase.auth.updateUser as jest.Mock) = mockUpdateUser;
    (supabase.auth.getUser as jest.Mock) = mockGetUser;

    render(<ResetPasswordForm />);
    
    await waitFor(() => {
      expect(screen.getByText('Nieuw wachtwoord instellen')).toBeInTheDocument();
    });
    
    const passwordInput = screen.getByLabelText('Nieuw wachtwoord:');
    const confirmPasswordInput = screen.getByLabelText('Bevestig wachtwoord:');
    const submitButton = screen.getByRole('button', { name: 'Wachtwoord opslaan' });
    
    fireEvent.change(passwordInput, { target: { value: 'NewPass123!' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'NewPass123!' } });
    
    await act(async () => {
      fireEvent.click(submitButton);
    });
    
    await waitFor(() => {
      expect(mockUpdateUser).toHaveBeenCalledWith({
        password: 'NewPass123!'
      });
      expect(screen.getByText('Wachtwoord gewijzigd!')).toBeInTheDocument();
    });
    
    // Check if redirect is scheduled
    act(() => {
      jest.advanceTimersByTime(3000);
    });
    expect(mockPush).toHaveBeenCalledWith('/login');
  });

  it('toont foutmelding bij mislukte wachtwoord update', async () => {
    const mockGetSession = jest.fn().mockResolvedValue({ 
      data: { session: { user: { id: '123' } } }, 
      error: null 
    });
    const mockUpdateUser = jest.fn().mockResolvedValue({ 
      error: { message: 'Update failed' } 
    });
    
    (supabase.auth.getSession as jest.Mock) = mockGetSession;
    (supabase.auth.updateUser as jest.Mock) = mockUpdateUser;

    render(<ResetPasswordForm />);
    
    await waitFor(() => {
      expect(screen.getByText('Nieuw wachtwoord instellen')).toBeInTheDocument();
    });
    
    const passwordInput = screen.getByLabelText('Nieuw wachtwoord:');
    const confirmPasswordInput = screen.getByLabelText('Bevestig wachtwoord:');
    const submitButton = screen.getByRole('button', { name: 'Wachtwoord opslaan' });
    
    fireEvent.change(passwordInput, { target: { value: 'NewPass123!' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'NewPass123!' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Update failed')).toBeInTheDocument();
    });
  });
});