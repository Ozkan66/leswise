import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import JoinGroupForm from '../JoinGroupForm';
import { supabase } from '../../utils/supabaseClient';

// Mock Supabase
jest.mock('../../utils/supabaseClient', () => ({
  supabase: {
    auth: {
      getUser: jest.fn()
    },
    from: jest.fn()
  }
}));

const mockSupabase = supabase as jest.Mocked<typeof supabase>;

describe('JoinGroupForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should join a community group immediately', async () => {
    // Mock user authentication
    (mockSupabase.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: { id: 'test-user-id' } },
      error: null
    });

    // Mock group lookup
    const mockGroupSelect = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        single: jest.fn().mockResolvedValue({
          data: { id: 'group-id', name: 'Test Community', type: 'community' },
          error: null
        })
      })
    });

    // Mock existing member check
    const mockMemberSelect = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: null,
            error: { code: 'PGRST116' } // Not found
          })
        })
      })
    });

    // Mock member insert
    const mockMemberInsert = jest.fn().mockResolvedValue({
      data: [],
      error: null
    });

    (mockSupabase.from as jest.Mock).mockImplementation((table) => {
      if (table === 'groups') {
        return { select: mockGroupSelect };
      } else if (table === 'group_members') {
        return {
          select: mockMemberSelect,
          insert: mockMemberInsert
        };
      }
      return {};
    });

    const onGroupJoined = jest.fn();
    render(<JoinGroupForm onGroupJoined={onGroupJoined} />);

    // Enter jumper code
    const codeInput = screen.getByPlaceholderText('Enter 6-character code');
    fireEvent.change(codeInput, { target: { value: 'ABC123' } });

    // Submit form
    const submitButton = screen.getByRole('button', { name: 'Join Group' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockMemberInsert).toHaveBeenCalledWith([{
        group_id: 'group-id',
        user_id: 'test-user-id',
        role: 'member',
        status: 'active'
      }]);
    });

    expect(screen.getByText('Success! You have joined "Test Community".')).toBeInTheDocument();
    expect(onGroupJoined).toHaveBeenCalled();
  });

  test('should create pending request for klas group', async () => {
    // Mock user authentication
    (mockSupabase.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: { id: 'test-user-id' } },
      error: null
    });

    // Mock group lookup for klas
    const mockGroupSelect = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        single: jest.fn().mockResolvedValue({
          data: { id: 'group-id', name: 'Test Klas', type: 'klas' },
          error: null
        })
      })
    });

    // Mock existing member check
    const mockMemberSelect = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: null,
            error: { code: 'PGRST116' } // Not found
          })
        })
      })
    });

    // Mock member insert
    const mockMemberInsert = jest.fn().mockResolvedValue({
      data: [],
      error: null
    });

    (mockSupabase.from as jest.Mock).mockImplementation((table) => {
      if (table === 'groups') {
        return { select: mockGroupSelect };
      } else if (table === 'group_members') {
        return {
          select: mockMemberSelect,
          insert: mockMemberInsert
        };
      }
      return {};
    });

    const onGroupJoined = jest.fn();
    render(<JoinGroupForm onGroupJoined={onGroupJoined} />);

    // Enter jumper code
    const codeInput = screen.getByPlaceholderText('Enter 6-character code');
    fireEvent.change(codeInput, { target: { value: 'DEF456' } });

    // Submit form
    const submitButton = screen.getByRole('button', { name: 'Join Group' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockMemberInsert).toHaveBeenCalledWith([{
        group_id: 'group-id',
        user_id: 'test-user-id',
        role: 'member',
        status: 'pending'
      }]);
    });

    expect(screen.getByText('Request sent! Your request to join "Test Klas" is pending approval from a group leader.')).toBeInTheDocument();
    expect(onGroupJoined).toHaveBeenCalled();
  });

  test('should handle invalid jumper code', async () => {
    // Mock user authentication
    (mockSupabase.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: { id: 'test-user-id' } },
      error: null
    });

    // Mock group not found
    const mockGroupSelect = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { code: 'PGRST116' } // Not found
        })
      })
    });

    (mockSupabase.from as jest.Mock).mockImplementation((table) => {
      if (table === 'groups') {
        return { select: mockGroupSelect };
      }
      return {};
    });

    render(<JoinGroupForm />);

    // Enter invalid jumper code (6 characters but not found)
    const codeInput = screen.getByPlaceholderText('Enter 6-character code');
    fireEvent.change(codeInput, { target: { value: 'NOTFND' } });

    // Submit form
    const submitButton = screen.getByRole('button', { name: 'Join Group' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Invalid jumper code. Please check and try again.')).toBeInTheDocument();
    });
  });

  test('should handle already member scenario', async () => {
    // Mock user authentication
    (mockSupabase.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: { id: 'test-user-id' } },
      error: null
    });

    // Mock group lookup
    const mockGroupSelect = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        single: jest.fn().mockResolvedValue({
          data: { id: 'group-id', name: 'Test Group', type: 'community' },
          error: null
        })
      })
    });

    // Mock existing member check - user is already active member
    const mockMemberSelect = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: { status: 'active' },
            error: null
          })
        })
      })
    });

    (mockSupabase.from as jest.Mock).mockImplementation((table) => {
      if (table === 'groups') {
        return { select: mockGroupSelect };
      } else if (table === 'group_members') {
        return { select: mockMemberSelect };
      }
      return {};
    });

    render(<JoinGroupForm />);

    // Enter jumper code
    const codeInput = screen.getByPlaceholderText('Enter 6-character code');
    fireEvent.change(codeInput, { target: { value: 'ABC123' } });

    // Submit form
    const submitButton = screen.getByRole('button', { name: 'Join Group' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('You are already a member of this group.')).toBeInTheDocument();
    });
  });

  test('should handle not logged in scenario', async () => {
    // Mock no user
    (mockSupabase.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: null },
      error: null
    });

    render(<JoinGroupForm />);

    // Enter jumper code
    const codeInput = screen.getByPlaceholderText('Enter 6-character code');
    fireEvent.change(codeInput, { target: { value: 'ABC123' } });

    // Submit form
    const submitButton = screen.getByRole('button', { name: 'Join Group' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Not logged in')).toBeInTheDocument();
    });
  });

  test('should auto-format jumper code to uppercase', () => {
    render(<JoinGroupForm />);

    const codeInput = screen.getByPlaceholderText('Enter 6-character code');
    fireEvent.change(codeInput, { target: { value: 'abc123' } });

    expect(codeInput).toHaveValue('ABC123');
  });

  test('should disable submit button for invalid code length', () => {
    render(<JoinGroupForm />);

    const submitButton = screen.getByRole('button', { name: 'Join Group' });
    expect(submitButton).toBeDisabled();

    const codeInput = screen.getByPlaceholderText('Enter 6-character code');
    fireEvent.change(codeInput, { target: { value: 'ABC' } });

    expect(submitButton).toBeDisabled();

    fireEvent.change(codeInput, { target: { value: 'ABC123' } });
    expect(submitButton).not.toBeDisabled();
  });
});