/**
 * Test file to reproduce Issue #133: Worksheet sharing and submission problems
 * 
 * This test file specifically addresses the three reported issues:
 * 1. Failed to share worksheet with users/groups
 * 2. Failed to create anonymous link  
 * 3. Permission denied when submitting answers (even as owner)
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import WorksheetSharingForm from '../WorksheetSharingForm';

// Mock the supabase client
jest.mock('../../utils/supabaseClient', () => ({
  supabase: {
    from: jest.fn(),
    auth: {
      getUser: jest.fn(),
    },
    rpc: jest.fn(),
  },
}));

describe('Issue #133: Worksheet Sharing Problems', () => {
  const mockProps = {
    worksheetId: 'test-worksheet-id',
    worksheetTitle: 'Test Worksheet',
    onClose: jest.fn(),
    onShared: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { supabase } = require('../../utils/supabaseClient');
    
    // Default successful authentication
    supabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'test-user-id', email: 'test@example.com' } },
    });
  });

  describe('Issue 1: Failed to share worksheet with users/groups', () => {
    it('should handle database errors when fetching sharing data', async () => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { supabase } = require('../../utils/supabaseClient');
      
      // Mock database error during initial data fetch
      supabase.from.mockImplementation((table: string) => {
        if (table === 'user_profiles') {
          return {
            select: jest.fn(() => ({
              in: jest.fn(() => Promise.resolve({ data: null, error: { message: 'Database connection failed' } })),
            })),
          };
        }
        return {
          select: jest.fn(() => ({
            eq: jest.fn(() => Promise.resolve({ data: [], error: null })),
            match: jest.fn(() => Promise.resolve({ data: [], error: null })),
          })),
        };
      });

      render(<WorksheetSharingForm {...mockProps} />);
      
      await waitFor(() => {
        expect(screen.getByText('Failed to load sharing data')).toBeInTheDocument();
      });
    });

    it('should handle RLS policy violations when creating shares', async () => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { supabase } = require('../../utils/supabaseClient');
      
      // Mock successful data loading
      supabase.from.mockImplementation((table: string) => {
        if (table === 'user_profiles') {
          return {
            select: jest.fn(() => ({
              in: jest.fn(() => Promise.resolve({ 
                data: [{ user_id: 'user1', email: 'user1@example.com', first_name: 'User', last_name: 'One', role: 'student' }],
                error: null 
              })),
            })),
          };
        }
        if (table === 'groups') {
          return {
            select: jest.fn(() => Promise.resolve({ data: [], error: null })),
          };
        }
        if (table === 'worksheet_shares') {
          return {
            select: jest.fn(() => Promise.resolve({ data: [], error: null })),
            insert: jest.fn(() => Promise.resolve({ 
              data: null, 
              error: { message: 'new row violates row-level security policy' } 
            })),
          };
        }
        if (table === 'anonymous_links') {
          return {
            select: jest.fn(() => ({
              match: jest.fn(() => Promise.resolve({ data: [], error: null })),
            })),
          };
        }
        return {
          select: jest.fn(() => Promise.resolve({ data: [], error: null })),
        };
      });

      render(<WorksheetSharingForm {...mockProps} />);
      
      // Wait for component to load
      await waitFor(() => {
        expect(screen.getByText('Share with Users or Groups')).toBeInTheDocument();
      });

      // Select a user to share with
      const userRadio = screen.getByDisplayValue('user');
      fireEvent.click(userRadio);
      
      const userSelect = screen.getByLabelText(/Select User/i);
      fireEvent.change(userSelect, { target: { value: 'user1' } });

      // Try to submit the share form
      const shareButton = screen.getByText('Share Worksheet');
      fireEvent.click(shareButton);

      await waitFor(() => {
        expect(screen.getByText(/Failed to share worksheet|new row violates row-level security policy/)).toBeInTheDocument();
      });
    });
  });

  describe('Issue 2: Failed to create anonymous link', () => {
    it('should handle database errors when creating anonymous links', async () => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { supabase } = require('../../utils/supabaseClient');
      
      // Mock successful data loading but failed link creation
      supabase.from.mockImplementation((table: string) => {
        if (table === 'user_profiles') {
          return {
            select: jest.fn(() => ({
              in: jest.fn(() => Promise.resolve({ data: [], error: null })),
            })),
          };
        }
        if (table === 'groups') {
          return {
            select: jest.fn(() => Promise.resolve({ data: [], error: null })),
          };
        }
        if (table === 'worksheet_shares') {
          return {
            select: jest.fn(() => Promise.resolve({ data: [], error: null })),
          };
        }
        if (table === 'anonymous_links') {
          return {
            select: jest.fn(() => ({
              match: jest.fn(() => Promise.resolve({ data: [], error: null })),
            })),
            insert: jest.fn(() => Promise.resolve({ 
              data: null, 
              error: { message: 'permission denied for table anonymous_links' } 
            })),
          };
        }
        return {
          select: jest.fn(() => Promise.resolve({ data: [], error: null })),
        };
      });

      // Mock the generate_link_code function
      supabase.rpc.mockImplementation((functionName: string) => {
        if (functionName === 'generate_link_code') {
          return Promise.resolve({ data: 'test-link-code-123', error: null });
        }
        return Promise.resolve({ data: null, error: { message: 'Function not found' } });
      });

      render(<WorksheetSharingForm {...mockProps} />);
      
      // Wait for component to load
      await waitFor(() => {
        expect(screen.getByText('Create Anonymous Link')).toBeInTheDocument();
      });

      // Click to show anonymous form
      const createAnonymousButton = screen.getByText('Create Anonymous Link');
      fireEvent.click(createAnonymousButton);

      // Submit the anonymous link form
      const submitButton = screen.getByText('Create Link');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Failed to create anonymous link|permission denied/)).toBeInTheDocument();
      });
    });

    it('should handle missing generate_link_code function', async () => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { supabase } = require('../../utils/supabaseClient');
      
      // Mock successful data loading
      supabase.from.mockImplementation((table: string) => {
        if (table === 'user_profiles') {
          return {
            select: jest.fn(() => ({
              in: jest.fn(() => Promise.resolve({ data: [], error: null })),
            })),
          };
        }
        if (table === 'groups') {
          return {
            select: jest.fn(() => Promise.resolve({ data: [], error: null })),
          };
        }
        if (table === 'worksheet_shares') {
          return {
            select: jest.fn(() => Promise.resolve({ data: [], error: null })),
          };
        }
        if (table === 'anonymous_links') {
          return {
            select: jest.fn(() => ({
              match: jest.fn(() => Promise.resolve({ data: [], error: null })),
            })),
            insert: jest.fn(() => Promise.resolve({ data: {}, error: null })),
          };
        }
        return {
          select: jest.fn(() => Promise.resolve({ data: [], error: null })),
        };
      });

      // Mock the generate_link_code function to fail
      supabase.rpc.mockImplementation((functionName: string) => {
        if (functionName === 'generate_link_code') {
          return Promise.resolve({ data: null, error: { message: 'function generate_link_code() does not exist' } });
        }
        return Promise.resolve({ data: null, error: { message: 'Function not found' } });
      });

      render(<WorksheetSharingForm {...mockProps} />);
      
      // Wait for component to load
      await waitFor(() => {
        expect(screen.getByText('Create Anonymous Link')).toBeInTheDocument();
      });

      // Click to show anonymous form
      const createAnonymousButton = screen.getByText('Create Anonymous Link');
      fireEvent.click(createAnonymousButton);

      // Submit the anonymous link form
      const submitButton = screen.getByText('Create Link');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Failed to create anonymous link|function.*does not exist/)).toBeInTheDocument();
      });
    });
  });
});