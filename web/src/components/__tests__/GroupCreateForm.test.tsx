import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import GroupCreateForm from '../GroupCreateForm';
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

describe('GroupCreateForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should use owner_id instead of created_by when creating a group', async () => {
    // Mock user authentication
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'test-user-id' } },
      error: null
    });

    // Mock the complete Supabase chain
    const mockInsert = jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        single: jest.fn().mockResolvedValue({
          data: { id: 'test-group-id', name: 'Test Group' },
          error: null
        })
      })
    });

    // Also mock the second call for group members
    mockSupabase.from.mockImplementation((table) => {
      if (table === 'groups') {
        return {
          insert: mockInsert
        };
      } else if (table === 'group_members') {
        return {
          insert: jest.fn().mockResolvedValue({ data: [], error: null })
        };
      }
      return {};
    });

    const onGroupCreated = jest.fn();
    render(<GroupCreateForm onGroupCreated={onGroupCreated} />);

    // Fill in the form
    const nameInput = screen.getByPlaceholderText('Group name');
    fireEvent.change(nameInput, { target: { value: 'Test Group' } });

    // Submit the form
    const submitButton = screen.getByText('Create Group');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockInsert).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            name: 'Test Group',
            owner_id: 'test-user-id', // Should use owner_id, not created_by
            jumper_code: expect.any(String)
          })
        ])
      );
    });

    expect(onGroupCreated).toHaveBeenCalled();
  });

  test('should handle authentication failure', async () => {
    // Mock no user
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: null
    });

    render(<GroupCreateForm />);

    const nameInput = screen.getByPlaceholderText('Group name');
    fireEvent.change(nameInput, { target: { value: 'Test Group' } });

    const submitButton = screen.getByText('Create Group');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Not logged in')).toBeInTheDocument();
    });
  });
});