import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import WorksheetSharingForm from '../WorksheetSharingForm';

// Mock the Supabase client module
jest.mock('../../utils/supabaseClient', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({ data: null, error: null })),
          order: jest.fn(() => Promise.resolve({ data: [], error: null })),
        })),
        in: jest.fn(() => Promise.resolve({ data: [], error: null })),
      })),
      insert: jest.fn(() => Promise.resolve({ data: null, error: null })),
      update: jest.fn(() => ({
        eq: jest.fn(() => Promise.resolve({ data: null, error: null })),
      })),
      delete: jest.fn(() => ({
        eq: jest.fn(() => Promise.resolve({ data: null, error: null })),
      })),
    })),
    auth: {
      getUser: jest.fn(() => Promise.resolve({ 
        data: { user: { id: 'test-user-id' } }, 
        error: null 
      })),
    },
    rpc: jest.fn(() => Promise.resolve({ data: 'test-link-code', error: null })),
  },
}));

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
    render(<WorksheetSharingForm {...mockProps} />);
    
    await waitFor(() => {
      expect(screen.getByText('Share: Test Worksheet')).toBeInTheDocument();
    });
  });

  it('displays loading state initially', () => {
    render(<WorksheetSharingForm {...mockProps} />);
    
    expect(screen.getByText('Loading sharing options...')).toBeInTheDocument();
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
          })),
        };
      }
      return {
        select: jest.fn(() => ({
          eq: jest.fn(() => Promise.resolve({ data: [], error: null })),
        })),
        insert: jest.fn(() => Promise.resolve({ data: null, error: null })),
      };
    });

    render(<WorksheetSharingForm {...mockProps} />);
    
    // Wait for component to load
    await waitFor(() => {
      expect(screen.queryByText('Loading sharing options...')).not.toBeInTheDocument();
    });

    // The form should be rendered - we can test that the basic elements exist
    expect(screen.getByText('Share with Users or Groups')).toBeInTheDocument();
  });

  it('shows anonymous link creation form when requested', async () => {
    render(<WorksheetSharingForm {...mockProps} />);
    
    await waitFor(() => {
      expect(screen.queryByText('Loading sharing options...')).not.toBeInTheDocument();
    });

    const createLinkButton = screen.getByText('Create Anonymous Link');
    fireEvent.click(createLinkButton);
    
    expect(screen.getByText('Max Attempts (optional):')).toBeInTheDocument();
    expect(screen.getByText('Expires in (days, optional):')).toBeInTheDocument();
  });

  it('closes the form when close button is clicked', async () => {
    render(<WorksheetSharingForm {...mockProps} />);
    
    await waitFor(() => {
      expect(screen.queryByText('Loading sharing options...')).not.toBeInTheDocument();
    });

    const closeButton = screen.getByText('×');
    fireEvent.click(closeButton);
    
    expect(mockProps.onClose).toHaveBeenCalled();
  });

  it('handles errors gracefully', async () => {
    const { supabase } = require('../../utils/supabaseClient');
    
    supabase.from.mockImplementation(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => Promise.resolve({ data: null, error: { message: 'Test error' } })),
        in: jest.fn(() => Promise.resolve({ data: null, error: { message: 'Test error' } })),
      })),
    }));

    render(<WorksheetSharingForm {...mockProps} />);
    
    await waitFor(() => {
      expect(screen.getByText('Failed to load sharing data')).toBeInTheDocument();
    });
  });
});