import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import RegisterForm from '../RegisterForm';
import { useAuth } from '../../contexts/AuthContext';

// Mock the auth context
jest.mock('../../contexts/AuthContext');
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

describe('RegisterForm', () => {
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

  it('toont het registratie formulier', () => {
    render(<RegisterForm />);
    
    expect(screen.getByRole('heading', { name: 'Registreren' })).toBeInTheDocument();
    expect(screen.getByLabelText(/voornaam/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/achternaam/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/e-mailadres/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/wachtwoord/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /registreren/i })).toBeInTheDocument();
  });

  it('toont succesmelding na succesvolle registratie', async () => {
    mockSignUp.mockResolvedValue({ 
      data: { user: { id: '123', email_confirmed_at: null } }, 
      error: null 
    });
    
    render(<RegisterForm />);
    
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
  });

  it('toont foutmelding bij registratiefout', async () => {
    mockSignUp.mockResolvedValue({ data: null, error: { message: 'Email already exists' } });
    
    render(<RegisterForm />);
    
    fireEvent.change(screen.getByLabelText(/voornaam/i), {
      target: { value: 'Jan' }
    });
    fireEvent.change(screen.getByLabelText(/achternaam/i), {
      target: { value: 'Doe' }
    });
    fireEvent.change(screen.getByLabelText(/e-mailadres/i), {
      target: { value: 'existing@example.com' }
    });
    fireEvent.change(screen.getByLabelText(/wachtwoord/i), {
      target: { value: 'password123' }
    });
    
    fireEvent.click(screen.getByRole('button', { name: /registreren/i }));
    
    await waitFor(() => {
      expect(screen.getByText('Email already exists')).toBeInTheDocument();
    });
  });

  it('toont email bevestiging bericht wanneer email confirmatie nodig is', async () => {
    mockSignUp.mockResolvedValue({ 
      data: { user: { id: '123', email_confirmed_at: null } }, 
      error: null 
    });
    
    render(<RegisterForm />);
    
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
      expect(screen.getByText(/controleer je e-mail voor een bevestigingslink/i)).toBeInTheDocument();
    });
  });

  it('toont directe login bericht wanneer email confirmatie niet nodig is', async () => {
    mockSignUp.mockResolvedValue({ 
      data: { user: { id: '123', email_confirmed_at: '2023-01-01T00:00:00Z' } }, 
      error: null 
    });
    
    render(<RegisterForm />);
    
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
      expect(screen.getByText(/je account is succesvol aangemaakt en je bent automatisch ingelogd/i)).toBeInTheDocument();
    });
  });
});