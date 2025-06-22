import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import WorksheetSharingForm from '../WorksheetSharingForm';

// Mock the Supabase client module
jest.mock('../../utils/supabaseClient', () => {
  type ChainableMock = {
    select: jest.Mock<ChainableMock, any>;
    insert: jest.Mock<ChainableMock, any>;
    update: jest.Mock<ChainableMock, any>;
    delete: jest.Mock<ChainableMock, any>;
    eq: jest.Mock<ChainableMock, any>;
    order: jest.Mock<ChainableMock, any>;
    limit: jest.Mock<ChainableMock, any>;
    match: jest.Mock<ChainableMock, any>;
    in: jest.Mock<ChainableMock, any>;
    single: jest.Mock<ChainableMock, any>;
    then: jest.Mock<Promise<{ data: any, error: any }>, any>;
  };
  const createChainableMock = (): ChainableMock => ({
    select: jest.fn(() => createChainableMock()),
    insert: jest.fn(() => createChainableMock()),
    update: jest.fn(() => createChainableMock()),
    delete: jest.fn(() => createChainableMock()),
    eq: jest.fn(() => createChainableMock()),
    order: jest.fn(() => createChainableMock()),
    limit: jest.fn(() => createChainableMock()),
    match: jest.fn(() => createChainableMock()),
    in: jest.fn(() => createChainableMock()),
    single: jest.fn(() => createChainableMock()),
    then: jest.fn(() => Promise.resolve({ data: null, error: null })),
  });

  return {
    supabase: {
      auth: {
        getUser: jest.fn(() => Promise.resolve({ 
          data: { user: { id: 'test-user-id' } }, 
          error: null 
        })),
      },
      from: jest.fn(() => createChainableMock()),
      rpc: jest.fn(() => Promise.resolve({ data: 'test-link-code', error: null })),
    },
  };
});

describe('WorksheetSharingForm', () => {
  const mockProps = {
    worksheetId: 'test-worksheet-id',
    worksheetTitle: 'Test Worksheet',
    onClose: jest.fn(),
    onShared: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the sharing form with correct title', async () => {
    const { supabase } = require('../../utils/supabaseClient');
    // Provide mock data for all tables queried in fetchData
    supabase.from.mockImplementation((table: string) => {
      if (table === 'user_roles') {
        return {
          select: jest.fn(() => ({
            in: jest.fn(() => Promise.resolve({ data: [], error: null })),
            match: jest.fn(() => Promise.resolve({ data: [], error: null })),
          })),
        };
      }
      if (table === 'groups') {
        return {
          select: jest.fn(() => ({
            eq: jest.fn(() => Promise.resolve({ data: [], error: null })),
            match: jest.fn(() => Promise.resolve({ data: [], error: null })),
          })),
        };
      }
      if (table === 'worksheet_shares') {
        return {
          select: jest.fn(() => ({
            eq: jest.fn(() => Promise.resolve({ data: [], error: null })),
            match: jest.fn(() => Promise.resolve({ data: [], error: null })),
          })),
        };
      }
      if (table === 'anonymous_links') {
        return {
          select: jest.fn(() => ({
            match: jest.fn(() => Promise.resolve({ data: [], error: null })),
            eq: jest.fn(() => Promise.resolve({ data: [], error: null })),
          })),
        };
      }
      return {
        select: jest.fn(() => ({
          eq: jest.fn(() => Promise.resolve({ data: [], error: null })),
          match: jest.fn(() => Promise.resolve({ data: [], error: null })),
          in: jest.fn(() => Promise.resolve({ data: [], error: null })),
        })),
      };
    });
    render(<WorksheetSharingForm {...mockProps} />);
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /share:\s*test worksheet/i })).toBeInTheDocument();
    });
  });

  it('displays loading state initially', async () => {
    render(<WorksheetSharingForm {...mockProps} />);
    await waitFor(() => {
      expect(screen.getByText('Loading sharing options...')).toBeInTheDocument();
    });
  });

  it('handles form submission for user sharing', async () => {
    const { supabase } = require('../../utils/supabaseClient');
    const mockUsers = [
      { id: 'user1', email: 'user1@test.com', first_name: 'John', last_name: 'Doe' }
    ];
    supabase.from.mockImplementation((table: string) => {
      if (table === 'user_roles') {
        return {
          select: jest.fn(() => ({
            in: jest.fn(() => Promise.resolve({ data: mockUsers, error: null })),
            match: jest.fn(() => Promise.resolve({ data: mockUsers, error: null })),
          })),
        };
      }
      return {
        select: jest.fn(() => ({
          eq: jest.fn(() => Promise.resolve({ data: [], error: null })),
          match: jest.fn(() => Promise.resolve({ data: [], error: null })),
          in: jest.fn(() => Promise.resolve({ data: [], error: null })),
        })),
        insert: jest.fn(() => Promise.resolve({ data: null, error: null })),
      };
    });
    render(<WorksheetSharingForm {...mockProps} />);
    await waitFor(() => {
      expect(screen.queryByText('Loading sharing options...')).not.toBeInTheDocument();
    });
    expect(screen.getByText('Share with Users or Groups')).toBeInTheDocument();
  });

  it('shows anonymous link creation form when requested', async () => {
    render(<WorksheetSharingForm {...mockProps} />);
    await waitFor(() => {
      expect(screen.queryByText('Loading sharing options...')).not.toBeInTheDocument();
    });
    const createLinkButton = screen.getByText('Create Anonymous Link');
    fireEvent.click(createLinkButton);
    await waitFor(() => {
      expect(screen.getAllByText('Max Attempts (optional):').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Expires in (days, optional):').length).toBeGreaterThan(0);
    });
  });

  it('closes the form when close button is clicked', async () => {
    render(<WorksheetSharingForm {...mockProps} />);
    await waitFor(() => {
      expect(screen.queryByText('Loading sharing options...')).not.toBeInTheDocument();
    });
    const closeButton = screen.getByText('×');
    fireEvent.click(closeButton);
    await waitFor(() => {
      expect(mockProps.onClose).toHaveBeenCalled();
    });
  });

  it('handles errors gracefully', async () => {
    const { supabase } = require('../../utils/supabaseClient');
    // Mock the first query to return an error, which should trigger the catch block
    supabase.from.mockImplementation((table: string) => {
      if (table === 'user_roles') {
        return {
          select: jest.fn(() => {
            throw new Error('Database connection failed');
          }),
        };
      }
      return {
        select: jest.fn(() => ({
          eq: jest.fn(() => Promise.resolve({ data: [], error: null })),
          match: jest.fn(() => Promise.resolve({ data: [], error: null })),
          in: jest.fn(() => Promise.resolve({ data: [], error: null })),
        })),
      };
    });
    
    render(<WorksheetSharingForm {...mockProps} />);
    
    await waitFor(() => {
      expect(screen.getByText('Failed to load sharing data')).toBeInTheDocument();
    });
  });
});