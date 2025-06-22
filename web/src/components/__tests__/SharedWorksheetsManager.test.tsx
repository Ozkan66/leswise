import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import SharedWorksheetsManager from '../SharedWorksheetsManager';

// Mock the Supabase client module
jest.mock('../../utils/supabaseClient', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          order: jest.fn(() => Promise.resolve({ data: [], error: null })),
        })),
        in: jest.fn(() => ({
          order: jest.fn(() => Promise.resolve({ data: [], error: null })),
        })),
      })),
      delete: jest.fn(() => ({
        eq: jest.fn(() => Promise.resolve({ data: null, error: null })),
      })),
      update: jest.fn(() => ({
        eq: jest.fn(() => Promise.resolve({ data: null, error: null })),
      })),
    })),
    auth: {
      getUser: jest.fn(() => Promise.resolve({ 
        data: { user: { id: 'test-user-id' } }, 
        error: null 
      })),
    },
  },
}));

// Mock window.confirm
global.confirm = jest.fn(() => true);

describe('SharedWorksheetsManager', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.confirm as jest.Mock).mockReturnValue(true);
  });

  it('renders the component with correct title', async () => {
    await act(async () => {
      render(<SharedWorksheetsManager />);
    });
    
    await waitFor(() => {
      expect(screen.getByText('Shared Worksheets Management')).toBeInTheDocument();
    });
  });

  it('displays loading state initially', () => {
    act(() => {
      render(<SharedWorksheetsManager />);
    });
    
    expect(screen.getByText('Loading shared worksheets...')).toBeInTheDocument();
  });

  it('shows tab navigation with correct counts', async () => {
    await act(async () => {
      render(<SharedWorksheetsManager />);
    });
    
    await waitFor(() => {
      expect(screen.getByText('Direct Shares (0)')).toBeInTheDocument();
      expect(screen.getByText('Anonymous Links (0)')).toBeInTheDocument();
    });
  });

  it('switches between tabs correctly', async () => {
    await act(async () => {
      render(<SharedWorksheetsManager />);
    });
    
    await waitFor(() => {
      expect(screen.getByText('Direct Worksheet Shares')).toBeInTheDocument();
    });

    await act(async () => {
      const anonymousTab = screen.getByText('Anonymous Links (0)');
      fireEvent.click(anonymousTab);
    });
    
    await waitFor(() => {
      expect(screen.getByText('Anonymous Links')).toBeInTheDocument();
    });
  });

  it('displays empty state messages', async () => {
    await act(async () => {
      render(<SharedWorksheetsManager />);
    });
    
    await waitFor(() => {
      expect(screen.getByText('No direct shares found. Share worksheets with specific users or groups to see them here.')).toBeInTheDocument();
    });

    await act(async () => {
      const anonymousTab = screen.getByText('Anonymous Links (0)');
      fireEvent.click(anonymousTab);
    });
    
    await waitFor(() => {
      expect(screen.getByText('No anonymous links found. Create anonymous sharing links to see them here.')).toBeInTheDocument();
    });
  });

  it('handles authentication errors', async () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { supabase } = require('../../utils/supabaseClient');
    
    supabase.auth.getUser.mockResolvedValueOnce({ 
      data: { user: null }, 
      error: null 
    });

    await act(async () => {
      render(<SharedWorksheetsManager />);
    });
    
    await waitFor(() => {
      expect(screen.getByText('Please log in to view shared worksheets')).toBeInTheDocument();
    });
  });

  it('displays shares when data is available', async () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { supabase } = require('../../utils/supabaseClient');
    
    const mockShares = [
      {
        id: 'share1',
        worksheet_id: 'worksheet1',
        shared_with_user_id: 'user1',
        permission_level: 'submit',
        attempts_used: 0,
        created_at: '2023-01-01T00:00:00Z',
        worksheets: { title: 'Test Worksheet 1' }
      }
    ];

    supabase.from.mockImplementation((table: string) => {
      if (table === 'worksheet_shares') {
        return {
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              order: jest.fn(() => Promise.resolve({ data: mockShares, error: null })),
            })),
          })),
        };
      }
      if (table === 'anonymous_links') {
        return {
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              order: jest.fn(() => Promise.resolve({ data: [], error: null })),
            })),
          })),
        };
      }
      if (table === 'anonymous_submissions') {
        return {
          select: jest.fn(() => ({
            in: jest.fn(() => ({
              order: jest.fn(() => Promise.resolve({ data: [], error: null })),
            })),
          })),
        };
      }
      return {
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            order: jest.fn(() => Promise.resolve({ data: [], error: null })),
          })),
          in: jest.fn(() => ({
            order: jest.fn(() => Promise.resolve({ data: [], error: null })),
          })),
        })),
      };
    });

    await act(async () => {
      render(<SharedWorksheetsManager />);
    });
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText('Loading shared worksheets...')).not.toBeInTheDocument();
    });
    
    await waitFor(() => {
      expect(screen.getByText('Test Worksheet 1')).toBeInTheDocument();
      expect(screen.getByText('submit')).toBeInTheDocument();
    });
  });

  it('displays anonymous links when data is available', async () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { supabase } = require('../../utils/supabaseClient');
    
    const mockLinks = [
      {
        id: 'link1',
        worksheet_id: 'worksheet1',
        link_code: 'abc123',
        is_active: true,
        attempts_used: 0,
        created_at: '2023-01-01T00:00:00Z',
        worksheets: { title: 'Test Worksheet 1' }
      }
    ];

    supabase.from.mockImplementation((table: string) => {
      if (table === 'worksheet_shares') {
        return {
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              order: jest.fn(() => Promise.resolve({ data: [], error: null })),
            })),
          })),
        };
      }
      if (table === 'anonymous_links') {
        return {
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              order: jest.fn(() => Promise.resolve({ data: mockLinks, error: null })),
            })),
          })),
        };
      }
      if (table === 'anonymous_submissions') {
        return {
          select: jest.fn(() => ({
            in: jest.fn(() => ({
              order: jest.fn(() => Promise.resolve({ data: [], error: null })),
            })),
          })),
        };
      }
      return {
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            order: jest.fn(() => Promise.resolve({ data: [], error: null })),
          })),
          in: jest.fn(() => ({
            order: jest.fn(() => Promise.resolve({ data: [], error: null })),
          })),
        })),
      };
    });

    await act(async () => {
      render(<SharedWorksheetsManager />);
    });
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText('Loading shared worksheets...')).not.toBeInTheDocument();
    });
    
    // Wait for the tab to appear with correct count
    await waitFor(() => {
      expect(screen.getByText('Anonymous Links (1)')).toBeInTheDocument();
    });
    
    // Switch to anonymous tab
    await act(async () => {
      const anonymousTab = screen.getByText('Anonymous Links (1)');
      fireEvent.click(anonymousTab);
    });
    
    await waitFor(() => {
      expect(screen.getByText('Test Worksheet 1')).toBeInTheDocument();
      expect(screen.getByText('Active')).toBeInTheDocument();
    });
  });
});