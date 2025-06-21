import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import RegisterForm from '../RegisterForm';
import { useAuth } from '../../contexts/AuthContext';

// Mock the auth context
jest.mock('../../contexts/AuthContext');
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

describe('RegisterForm OAuth Integration', () => {
  const mockSignUp = jest.fn();
  const mockSignInWithProvider = jest.fn();

  beforeEach(() => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: false,
      signUp: mockSignUp,
      signIn: jest.fn(),
      signInWithProvider: mockSignInWithProvider,
      signOut: jest.fn(),
    });

    jest.clearAllMocks();
  });

  it('should show user-friendly error when Google provider is not enabled', async () => {
    // Simulate the improved error handling from AuthContext
    mockSignInWithProvider.mockResolvedValue({ 
      error: { 
        message: 'Google inloggen is momenteel niet beschikbaar. Probeer het later opnieuw of gebruik je e-mailadres om in te loggen.',
        originalMessage: 'Unsupported provider: provider is not enabled',
        code: 400,
        error_code: 'validation_failed'
      } 
    });

    render(<RegisterForm />);

    // Click the Google registration button
    const googleButton = screen.getByText('Google');
    fireEvent.click(googleButton);

    // Wait for error to appear
    await waitFor(() => {
      expect(screen.getByText(/Google inloggen is momenteel niet beschikbaar/)).toBeInTheDocument();
    });

    // Verify the error message is user-friendly and in Dutch
    expect(screen.getByText(/gebruik je e-mailadres om in te loggen/)).toBeInTheDocument();
    
    // Verify the original technical error is not shown to users
    expect(screen.queryByText(/provider is not enabled/)).not.toBeInTheDocument();
  });

  it('should show user-friendly error when Microsoft provider is not enabled', async () => {
    mockSignInWithProvider.mockResolvedValue({ 
      error: { 
        message: 'Microsoft inloggen is momenteel niet beschikbaar. Probeer het later opnieuw of gebruik je e-mailadres om in te loggen.',
        originalMessage: 'Unsupported provider: provider is not enabled',
        code: 400,
        error_code: 'validation_failed'
      } 
    });

    render(<RegisterForm />);

    // Click the Microsoft registration button
    const microsoftButton = screen.getByText('Microsoft');
    fireEvent.click(microsoftButton);

    // Wait for error to appear
    await waitFor(() => {
      expect(screen.getByText(/Microsoft inloggen is momenteel niet beschikbaar/)).toBeInTheDocument();
    });
  });

  it('should allow fallback to email registration when OAuth fails', async () => {
    mockSignInWithProvider.mockResolvedValue({ 
      error: { 
        message: 'Google inloggen is momenteel niet beschikbaar. Probeer het later opnieuw of gebruik je e-mailadres om in te loggen.',
        originalMessage: 'Unsupported provider: provider is not enabled'
      } 
    });

    mockSignUp.mockResolvedValue({ error: null });

    render(<RegisterForm />);

    // Try Google registration first (will fail)
    const googleButton = screen.getByText('Google');
    fireEvent.click(googleButton);

    await waitFor(() => {
      expect(screen.getByText(/gebruik je e-mailadres om in te loggen/)).toBeInTheDocument();
    });

    // Now use email registration as fallback
    fireEvent.change(screen.getByLabelText(/voornaam/i), {
      target: { value: 'Jan' }
    });
    fireEvent.change(screen.getByLabelText(/achternaam/i), {
      target: { value: 'Doe' }
    });
    fireEvent.change(screen.getByLabelText(/e-mailadres/i), {
      target: { value: 'jan@example.com' }
    });
    fireEvent.change(screen.getByLabelText(/wachtwoord/i), {
      target: { value: 'password123' }
    });

    fireEvent.click(screen.getByRole('button', { name: /registreren/i }));

    await waitFor(() => {
      expect(screen.getByText('Registratie voltooid!')).toBeInTheDocument();
    });

    // Verify both methods were called
    expect(mockSignInWithProvider).toHaveBeenCalledWith('google');
    expect(mockSignUp).toHaveBeenCalledWith('jan@example.com', 'password123', 'Jan', 'Doe');
  });
});