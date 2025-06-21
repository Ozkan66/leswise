import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ForgotPasswordForm from '../ForgotPasswordForm';
import { supabase } from '../../utils/supabaseClient';

// Custom text matcher that handles HTML-interrupted text
const getTextMatcher = (text: string) => {
  return (content: string, element?: Element | null) => {
    if (!element) return false;
    
    // Get all text content from the element and its children
    const hasText = (el: Element, searchText: string) => {
      const textContent = el.textContent || '';
      const normalizedText = textContent.replace(/\s+/g, ' ').trim().toLowerCase();
      const normalizedSearch = searchText.replace(/\s+/g, ' ').trim().toLowerCase();
      return normalizedText.includes(normalizedSearch);
    };
    
    return hasText(element, text);
  };
};

// Mock Supabase
jest.mock('../../utils/supabaseClient', () => ({
  supabase: {
    auth: {
      resetPasswordForEmail: jest.fn(),
    },
    rpc: jest.fn().mockResolvedValue({ data: null, error: null }),
  },
}));

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

describe('ForgotPasswordForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('toont het wachtwoord vergeten formulier', () => {
    render(<ForgotPasswordForm />);
    
    expect(screen.getByRole('heading', { name: 'Wachtwoord vergeten?' })).toBeInTheDocument();
    expect(screen.getByLabelText(/e-mailadres/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Reset link verzenden' })).toBeInTheDocument();
    expect(screen.getByText(/vul je e-mailadres in/i)).toBeInTheDocument();
  });

  it('verzendt reset e-mail succesvol', async () => {
    const mockResetPasswordForEmail = jest.fn().mockResolvedValue({ error: null });
    (supabase.auth.resetPasswordForEmail as jest.Mock) = mockResetPasswordForEmail;

    render(<ForgotPasswordForm />);
    
    const emailInput = screen.getByLabelText(/e-mailadres/i);
    const submitButton = screen.getByRole('button', { name: 'Reset link verzenden' });
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockResetPasswordForEmail).toHaveBeenCalledWith('test@example.com', {
        redirectTo: expect.stringContaining('/reset-password'),
      });
    });
    
    expect(screen.getByText('E-mail verzonden!')).toBeInTheDocument();
    expect(screen.getByText(/We hebben een e-mail/i)).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
    expect(screen.getByText(/gestuurd/i)).toBeInTheDocument();
  });

  it('toont foutmelding bij mislukte reset', async () => {
    const mockResetPasswordForEmail = jest.fn().mockResolvedValue({ 
      error: { message: 'Email not found' } 
    });
    (supabase.auth.resetPasswordForEmail as jest.Mock) = mockResetPasswordForEmail;

    render(<ForgotPasswordForm />);
    
    const emailInput = screen.getByLabelText(/e-mailadres/i);
    const submitButton = screen.getByRole('button', { name: 'Reset link verzenden' });
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Email not found')).toBeInTheDocument();
    });
  });

  it('toont loading state tijdens verzenden', async () => {
    const mockResetPasswordForEmail = jest.fn().mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({ error: null }), 100))
    );
    (supabase.auth.resetPasswordForEmail as jest.Mock) = mockResetPasswordForEmail;

    render(<ForgotPasswordForm />);
    
    const emailInput = screen.getByLabelText(/e-mailadres/i);
    const submitButton = screen.getByRole('button', { name: 'Reset link verzenden' });
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.click(submitButton);
    
    expect(screen.getByText('Verzenden...')).toBeInTheDocument();
    expect(submitButton).toBeDisabled();
    
    await waitFor(() => {
      expect(screen.getByText('E-mail verzonden!')).toBeInTheDocument();
    });
  });

  it('toont terug naar inloggen link', () => {
    render(<ForgotPasswordForm />);
    
    const loginLink = screen.getByRole('link', { name: 'Terug naar inloggen' });
    expect(loginLink).toBeInTheDocument();
    expect(loginLink).toHaveAttribute('href', '/login');
  });
});