import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import UserProfile from '../UserProfile';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../utils/supabaseClient';

// Mock the useAuth hook
jest.mock('../../contexts/AuthContext');
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

// Mock Supabase
jest.mock('../../utils/supabaseClient', () => ({
  supabase: {
    auth: {
      updateUser: jest.fn(),
    },
    storage: {
      from: jest.fn(() => ({
        upload: jest.fn(),
        getPublicUrl: jest.fn(),
      })),
    },
  },
}));

describe('UserProfile', () => {
  const mockUser = {
    id: '123',
    email: 'test@example.com',
    user_metadata: {
      first_name: 'Jan',
      last_name: 'Doe',
      role: 'student',
      birth_year: '2000',
      education_type: 'havo',
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuth.mockReturnValue({
      user: mockUser,
      loading: false,
      signUp: jest.fn(),
      signIn: jest.fn(),
      signInWithProvider: jest.fn(),
      signOut: jest.fn(),
    });
  });

  it('toont profielpagina voor ingelogde gebruiker', () => {
    render(<UserProfile />);
    
    expect(screen.getByRole('heading', { name: 'Mijn Profiel' })).toBeInTheDocument();
    expect(screen.getByDisplayValue('Jan')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Doe')).toBeInTheDocument();
    expect(screen.getByDisplayValue('test@example.com')).toBeInTheDocument();
  });

  it('toont rol selectie met huidige rol geselecteerd', () => {
    render(<UserProfile />);
    
    const studentRadio = screen.getByLabelText('Leerling');
    const teacherRadio = screen.getByLabelText('Docent');
    
    expect(studentRadio).toBeChecked();
    expect(teacherRadio).not.toBeChecked();
  });

  it('toont student-specifieke velden wanneer rol student is', () => {
    render(<UserProfile />);
    
    expect(screen.getByText('Leerling Informatie')).toBeInTheDocument();
    expect(screen.getByLabelText('Geboortejaar:')).toBeInTheDocument();
    expect(screen.getByLabelText('Type opleiding:')).toBeInTheDocument();
    expect(screen.getByDisplayValue('2000')).toBeInTheDocument();
    
    // Check if the select has the correct value selected
    const educationSelect = screen.getByLabelText('Type opleiding:') as HTMLSelectElement;
    expect(educationSelect.value).toBe('havo');
  });

  it('toont docent-specifieke velden wanneer rol docent is', () => {
    const teacherUser = {
      ...mockUser,
      user_metadata: {
        ...mockUser.user_metadata,
        role: 'teacher',
        institution: 'Test School',
        subjects: 'Wiskunde, Natuurkunde',
      },
    };

    mockUseAuth.mockReturnValue({
      user: teacherUser,
      loading: false,
      signUp: jest.fn(),
      signIn: jest.fn(),
      signInWithProvider: jest.fn(),
      signOut: jest.fn(),
    });

    render(<UserProfile />);
    
    expect(screen.getByText('Docent Informatie')).toBeInTheDocument();
    expect(screen.getByLabelText('Instelling:')).toBeInTheDocument();
    expect(screen.getByLabelText('Vakken:')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test School')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Wiskunde, Natuurkunde')).toBeInTheDocument();
  });

  it('werkt profiel bij wanneer formulier wordt ingediend', async () => {
    const mockUpdateUser = jest.fn().mockResolvedValue({ error: null });
    (supabase.auth.updateUser as jest.Mock) = mockUpdateUser;

    render(<UserProfile />);
    
    // Wijzig voornaam
    const firstNameInput = screen.getByLabelText('Voornaam:');
    fireEvent.change(firstNameInput, { target: { value: 'Johan' } });
    
    // Dien formulier in
    const submitButton = screen.getByRole('button', { name: 'Profiel Opslaan' });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockUpdateUser).toHaveBeenCalledWith({
        email: 'test@example.com',
        data: {
          first_name: 'Johan',
          last_name: 'Doe',
          role: 'student',
          birth_year: '2000',
          education_type: 'havo',
        },
      });
    });
  });

  it('toont succesbericht na succesvolle update', async () => {
    const mockUpdateUser = jest.fn().mockResolvedValue({ error: null });
    (supabase.auth.updateUser as jest.Mock) = mockUpdateUser;

    render(<UserProfile />);
    
    const submitButton = screen.getByRole('button', { name: 'Profiel Opslaan' });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Profiel succesvol bijgewerkt!')).toBeInTheDocument();
    });
  });

  it('toont foutbericht bij mislukte update', async () => {
    const mockUpdateUser = jest.fn().mockResolvedValue({ 
      error: { message: 'Update failed' } 
    });
    (supabase.auth.updateUser as jest.Mock) = mockUpdateUser;

    render(<UserProfile />);
    
    const submitButton = screen.getByRole('button', { name: 'Profiel Opslaan' });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Update failed')).toBeInTheDocument();
    });
  });

  it('toont login bericht voor niet-ingelogde gebruiker', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: false,
      signUp: jest.fn(),
      signIn: jest.fn(),
      signInWithProvider: jest.fn(),
      signOut: jest.fn(),
    });

    render(<UserProfile />);
    
    expect(screen.getByText('Je moet ingelogd zijn om je profiel te bekijken.')).toBeInTheDocument();
  });

  it('toont bestandsupload veld voor profielfoto', () => {
    render(<UserProfile />);
    
    expect(screen.getByText('Profielfoto')).toBeInTheDocument();
    expect(screen.getByText('Maximaal 5MB, JPG/PNG/GIF formaten toegestaan')).toBeInTheDocument();
    
    const fileInput = document.querySelector('input[type="file"]');
    expect(fileInput).toBeInTheDocument();
    expect(fileInput).toHaveAttribute('accept', 'image/jpeg,image/jpg,image/png,image/gif');
  });

  it('toont privacy informatie', () => {
    render(<UserProfile />);
    
    expect(screen.getByText('Privacy & Gegevensverwerking')).toBeInTheDocument();
    expect(screen.getByText(/je gegevens worden veilig opgeslagen/i)).toBeInTheDocument();
  });

  it('schakelt tussen student en docent velden', () => {
    render(<UserProfile />);
    
    // Start als student
    expect(screen.getByText('Leerling Informatie')).toBeInTheDocument();
    expect(screen.queryByText('Docent Informatie')).not.toBeInTheDocument();
    
    // Schakel naar docent
    const teacherRadio = screen.getByLabelText('Docent');
    fireEvent.click(teacherRadio);
    
    expect(screen.getByText('Docent Informatie')).toBeInTheDocument();
    expect(screen.queryByText('Leerling Informatie')).not.toBeInTheDocument();
  });
});