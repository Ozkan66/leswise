import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import GroupSettings from '../GroupSettings';
import { supabase } from '../../utils/supabaseClient';

// Mock Supabase
jest.mock('../../utils/supabaseClient', () => ({
  supabase: {
    from: jest.fn()
  }
}));

const mockSupabase = supabase as jest.Mocked<typeof supabase>;

describe('GroupSettings', () => {
  const mockOnClose = jest.fn();
  const mockOnSave = jest.fn();
  const testGroupId = 'test-group-id';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should load and display group settings', async () => {
    // Mock group fetch
    const mockSelect = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        single: jest.fn().mockResolvedValue({
          data: {
            id: testGroupId,
            name: 'Test Group',
            description: 'Test Description',
            type: 'community',
            jumper_code: 'ABC123'
          },
          error: null
        })
      })
    });

    (mockSupabase.from as jest.Mock).mockReturnValue({
      select: mockSelect
    });

    render(
      <GroupSettings
        groupId={testGroupId}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );

    // Should show loading initially
    expect(screen.getByText('Loading group settings...')).toBeInTheDocument();

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByDisplayValue('Test Group')).toBeInTheDocument();
    });

    expect(screen.getByDisplayValue('Test Description')).toBeInTheDocument();

    // Check that the community option is selected in the dropdown
    const typeSelect = screen.getByLabelText('Group Type *');
    expect(typeSelect).toHaveValue('community');

    expect(screen.getByText('ABC123')).toBeInTheDocument();
  });

  test('should save group settings', async () => {
    // Mock group fetch
    const mockSelect = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        single: jest.fn().mockResolvedValue({
          data: {
            id: testGroupId,
            name: 'Test Group',
            description: 'Test Description',
            type: 'community',
            jumper_code: 'ABC123'
          },
          error: null
        })
      })
    });

    // Mock update
    const mockUpdate = jest.fn().mockReturnValue({
      eq: jest.fn().mockResolvedValue({
        data: [],
        error: null
      })
    });

    (mockSupabase.from as jest.Mock).mockImplementation((table) => {
      if (table === 'groups') {
        return {
          select: mockSelect,
          update: mockUpdate
        };
      }
      return {};
    });

    render(
      <GroupSettings
        groupId={testGroupId}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByDisplayValue('Test Group')).toBeInTheDocument();
    });

    // Change group name
    const nameInput = screen.getByDisplayValue('Test Group');
    fireEvent.change(nameInput, { target: { value: 'Updated Group' } });

    // Submit form
    const saveButton = screen.getByText('Save Changes');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockUpdate).toHaveBeenCalledWith({
        name: 'Updated Group',
        description: 'Test Description',
        type: 'community'
      });
    });

    expect(screen.getByText('Group settings saved successfully!')).toBeInTheDocument();
    expect(mockOnSave).toHaveBeenCalled();
  });

  test('should generate new jumper code', async () => {
    // Mock group fetch
    const mockSelect = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        single: jest.fn().mockResolvedValue({
          data: {
            id: testGroupId,
            name: 'Test Group',
            description: 'Test Description',
            type: 'community',
            jumper_code: 'ABC123'
          },
          error: null
        })
      })
    });

    // Mock update for jumper code
    const mockUpdate = jest.fn().mockReturnValue({
      eq: jest.fn().mockResolvedValue({
        data: [],
        error: null
      })
    });

    (mockSupabase.from as jest.Mock).mockImplementation((table) => {
      if (table === 'groups') {
        return {
          select: mockSelect,
          update: mockUpdate
        };
      }
      return {};
    });

    // Mock window.confirm
    window.confirm = jest.fn(() => true);

    render(
      <GroupSettings
        groupId={testGroupId}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('ABC123')).toBeInTheDocument();
    });

    // Click generate new code button
    const generateButton = screen.getByText('Generate New Code');
    fireEvent.click(generateButton);

    await waitFor(() => {
      expect(mockUpdate).toHaveBeenCalledWith({
        jumper_code: expect.any(String)
      });
    });

    expect(screen.getByText('New jumper code generated successfully!')).toBeInTheDocument();
  });

  test('should close modal when close button is clicked', async () => {
    // Mock group fetch
    const mockSelect = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        single: jest.fn().mockResolvedValue({
          data: {
            id: testGroupId,
            name: 'Test Group',
            description: 'Test Description',
            type: 'community',
            jumper_code: 'ABC123'
          },
          error: null
        })
      })
    });

    (mockSupabase.from as jest.Mock).mockReturnValue({
      select: mockSelect
    });

    render(
      <GroupSettings
        groupId={testGroupId}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Group Settings')).toBeInTheDocument();
    });

    // Click close button (×)
    const closeButton = screen.getByText('×');
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  test('should handle fetch error', async () => {
    // Mock group fetch error
    const mockSelect = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Not found' }
        })
      })
    });

    (mockSupabase.from as jest.Mock).mockReturnValue({
      select: mockSelect
    });

    render(
      <GroupSettings
        groupId={testGroupId}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Failed to load group settings')).toBeInTheDocument();
    });
  });
});