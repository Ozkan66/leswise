import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import WorksheetCreateForm from '../WorksheetCreateForm';
import { supabase } from '../../utils/supabaseClient';

// Mock the supabase client
jest.mock('../../utils/supabaseClient');
const mockSupabase = supabase as jest.Mocked<typeof supabase>;

describe('WorksheetCreateForm', () => {
  const mockOnWorksheetCreated = jest.fn();

  beforeEach(() => {
    // Mock successful auth user
    (mockSupabase.auth.getUser as jest.Mock).mockResolvedValue({
      data: {
        user: {
          id: 'user-123',
          email: 'test@example.com',
          aud: 'authenticated',
          role: 'authenticated',
          email_confirmed_at: '2023-01-01T00:00:00.000Z',
          phone: null,
          confirmed_at: '2023-01-01T00:00:00.000Z',
          last_sign_in_at: '2023-01-01T00:00:00.000Z',
          app_metadata: {},
          user_metadata: {},
          identities: [],
          created_at: '2023-01-01T00:00:00.000Z',
          updated_at: '2023-01-01T00:00:00.000Z'
        }
      },
      error: null
    });

    // Mock folders and worksheets queries  
    (mockSupabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({
          data: [
            { id: 'folder-1', name: 'Test Folder' }
          ],
          error: null
        })
      }),
      insert: jest.fn().mockResolvedValue({
        data: null,
        error: null
      })
    } as any);

    jest.clearAllMocks();
  });

  it('renders the worksheet creation form', async () => {
    render(<WorksheetCreateForm onWorksheetCreated={mockOnWorksheetCreated} />);

    expect(screen.getByPlaceholderText('Worksheet title')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Brief description (optional)')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Instructions for students (optional)')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Create Worksheet' })).toBeInTheDocument();
  });

  it('creates a worksheet successfully', async () => {
    // Mock successful worksheet creation
    (mockSupabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({
          data: [{ id: 'folder-1', name: 'Test Folder' }],
          error: null
        })
      }),
      insert: jest.fn().mockResolvedValue({
        data: [{ id: 'worksheet-123', title: 'Test Worksheet' }],
        error: null
      })
    } as any);

    render(<WorksheetCreateForm onWorksheetCreated={mockOnWorksheetCreated} />);

    // Fill in the form
    fireEvent.change(screen.getByPlaceholderText('Worksheet title'), {
      target: { value: 'Test Worksheet' }
    });
    fireEvent.change(screen.getByPlaceholderText('Brief description (optional)'), {
      target: { value: 'Test Description' }
    });

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: 'Create Worksheet' }));

    await waitFor(() => {
      expect(mockOnWorksheetCreated).toHaveBeenCalled();
    });
  });

  it('shows error when title is empty', async () => {
    render(<WorksheetCreateForm onWorksheetCreated={mockOnWorksheetCreated} />);

    // Try to submit without title
    fireEvent.click(screen.getByRole('button', { name: 'Create Worksheet' }));

    // The form should show validation error (title is required)
    const titleInput = screen.getByPlaceholderText('Worksheet title');
    expect(titleInput).toBeInvalid();
  });

  it('shows error when worksheet creation fails', async () => {
    // Mock failed worksheet creation
    (mockSupabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({
          data: [],
          error: null
        })
      }),
      insert: jest.fn().mockResolvedValue({
        data: null,
        error: { message: 'Failed to create worksheet' }
      })
    } as any);

    render(<WorksheetCreateForm onWorksheetCreated={mockOnWorksheetCreated} />);

    // Fill in the form
    fireEvent.change(screen.getByPlaceholderText('Worksheet title'), {
      target: { value: 'Test Worksheet' }
    });

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: 'Create Worksheet' }));

    await waitFor(() => {
      expect(screen.getByText('Failed to create worksheet')).toBeInTheDocument();
    });
  });

  it('shows error when user is not logged in', async () => {
    // Mock no user
    (mockSupabase.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: null },
      error: null
    });

    render(<WorksheetCreateForm onWorksheetCreated={mockOnWorksheetCreated} />);

    // Fill in the form
    fireEvent.change(screen.getByPlaceholderText('Worksheet title'), {
      target: { value: 'Test Worksheet' }
    });

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: 'Create Worksheet' }));

    await waitFor(() => {
      expect(screen.getByText('Not logged in')).toBeInTheDocument();
    });
  });

  it('allows selecting a folder for the worksheet', async () => {
    render(<WorksheetCreateForm onWorksheetCreated={mockOnWorksheetCreated} />);

    await waitFor(() => {
      const selects = screen.getAllByRole('combobox');
      expect(selects).toHaveLength(2); // Folder and Status selects
      expect(screen.getByText('Test Folder')).toBeInTheDocument();
      expect(screen.getByText('Folder:')).toBeInTheDocument();
      expect(screen.getByText('Status:')).toBeInTheDocument();
    });
  });
});