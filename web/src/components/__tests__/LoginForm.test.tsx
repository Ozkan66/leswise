import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import LoginForm from '../LoginForm';
import { useAuth } from '../../contexts/AuthContext';

// Mock the auth context
jest.mock('../../contexts/AuthContext');
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

describe('LoginForm', () => {
  const mockSignIn = jest.fn();
  const mockSignInWithProvider = jest.fn();

  beforeEach(() => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: false,
      signUp: jest.fn(),
      signIn: mockSignIn,
      signInWithProvider: mockSignInWithProvider,
      signOut: jest.fn(),
    });

    jest.clearAllMocks();
  });

  it('toont het login formulier', () => {
    render(<LoginForm />);
    
    expect(screen.getByRole('heading', { name: 'Inloggen' })).toBeInTheDocument();
    expect(screen.getByLabelText(/e-mailadres/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/wachtwoord/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /inloggen/i })).toBeInTheDocument();
  });

  it('toont foutmelding bij ongeldige inloggegevens', async () => {
    mockSignIn.mockResolvedValue({ error: { message: 'Invalid credentials' } });
    
    render(<LoginForm />);
    
    fireEvent.change(screen.getByLabelText(/e-mailadres/i), {
      target: { value: 'test@example.com' }
    });
    fireEvent.change(screen.getByLabelText(/wachtwoord/i), {
      target: { value: 'wrongpassword' }
    });
    
    fireEvent.click(screen.getByRole('button', { name: /inloggen/i }));
    
    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });
  });

  it('toont OAuth knoppen', () => {
    render(<LoginForm />);
    
    expect(screen.getByText('Google')).toBeInTheDocument();
    expect(screen.getByText('Microsoft')).toBeInTheDocument();
  });

  it('toont wachtwoord vergeten link', () => {
    render(<LoginForm />);
    
    const forgotPasswordLink = screen.getByRole('link', { name: 'Wachtwoord vergeten?' });
    expect(forgotPasswordLink).toBeInTheDocument();
    expect(forgotPasswordLink).toHaveAttribute('href', '/forgot-password');
  });
});