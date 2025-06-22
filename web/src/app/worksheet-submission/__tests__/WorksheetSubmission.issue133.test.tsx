/**
 * Test file to reproduce Issue #133: Worksheet submission permission problems
 * 
 * This test specifically addresses issue 3:
 * Permission denied when submitting answers (even as worksheet owner)
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useSearchParams } from 'next/navigation';

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useSearchParams: jest.fn(),
}));

// Mock the supabase createClient function
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(),
    auth: {
      getUser: jest.fn(),
    },
    rpc: jest.fn(),
  })),
}));

// Import the component after mocking
import WorksheetSubmissionPage from '../page';

describe('Issue #133: Worksheet Submission Permission Problems', () => {
  const mockSearchParams = {
    get: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams);
    
    // Mock search params for worksheet submission
    mockSearchParams.get.mockImplementation((param: string) => {
      if (param === 'worksheetId') return 'test-worksheet-id';
      if (param === 'anonymous') return null;
      return null;
    });
  });

  describe('Issue 3: Permission denied when submitting answers (even as owner)', () => {
    it('should handle user_has_worksheet_access function returning false for worksheet owner', async () => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { createClient } = require('@supabase/supabase-js');
      const mockSupabase = createClient();
      
      // Mock successful authentication (user is the worksheet owner)
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'owner-user-id', email: 'owner@example.com' } },
      });

      // Mock the user_has_worksheet_access function to return false (incorrect behavior)
      mockSupabase.rpc.mockImplementation((functionName: string, params: Record<string, any>) => {
        if (functionName === 'user_has_worksheet_access') {
          return Promise.resolve({ data: false, error: null });
        }
        return Promise.resolve({ data: null, error: { message: 'Function not found' } });
      });

      // Mock worksheet elements fetch
      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'worksheet_elements') {
          return {
            select: jest.fn(() => ({
              eq: jest.fn(() => ({
                order: jest.fn(() => Promise.resolve({ 
                  data: [
                    { id: 'element1', content: { question: 'Test Question 1' }, max_score: 10 },
                    { id: 'element2', content: { question: 'Test Question 2' }, max_score: 10 }
                  ], 
                  error: null 
                })),
              })),
            })),
          };
        }
        return {
          select: jest.fn(() => Promise.resolve({ data: [], error: null })),
        };
      });

      render(<WorksheetSubmissionPage />);

      await waitFor(() => {
        expect(screen.getByText("You don't have permission to access this worksheet")).toBeInTheDocument();
      });

      // Verify that the user_has_worksheet_access function was called with correct parameters
      expect(mockSupabase.rpc).toHaveBeenCalledWith('user_has_worksheet_access', {
        p_user_id: 'owner-user-id',
        p_worksheet_id: 'test-worksheet-id',
        p_required_permission: 'submit'
      });
    });

    it('should handle database function not existing', async () => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { supabase } = require('../../../utils/supabaseClient');
      
      // Mock successful authentication
      supabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'owner-user-id', email: 'owner@example.com' } },
      });

      // Mock the user_has_worksheet_access function to return an error
      supabase.rpc.mockImplementation((functionName: string) => {
        if (functionName === 'user_has_worksheet_access') {
          return Promise.resolve({ 
            data: null, 
            error: { message: 'function user_has_worksheet_access() does not exist' } 
          });
        }
        return Promise.resolve({ data: null, error: { message: 'Function not found' } });
      });

      render(<WorksheetSubmissionContent />);

      await waitFor(() => {
        expect(screen.getByText("You don't have permission to access this worksheet")).toBeInTheDocument();
      });
    });

    it('should handle check_and_increment_attempts function failures during submission', async () => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { supabase } = require('../../../utils/supabaseClient');
      
      // Mock successful authentication
      supabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'owner-user-id', email: 'owner@example.com' } },
      });

      // Mock the user_has_worksheet_access function to return true initially
      supabase.rpc.mockImplementation((functionName: string, params: Record<string, any>) => {
        if (functionName === 'user_has_worksheet_access') {
          return Promise.resolve({ data: true, error: null });
        }
        if (functionName === 'check_and_increment_attempts') {
          return Promise.resolve({ data: false, error: null }); // Simulate attempt limit reached
        }
        return Promise.resolve({ data: null, error: { message: 'Function not found' } });
      });

      // Mock worksheet elements fetch
      supabase.from.mockImplementation((table: string) => {
        if (table === 'worksheet_elements') {
          return {
            select: jest.fn(() => ({
              eq: jest.fn(() => ({
                order: jest.fn(() => Promise.resolve({ 
                  data: [
                    { id: 'element1', content: { question: 'Test Question 1' }, max_score: 10 },
                    { id: 'element2', content: { question: 'Test Question 2' }, max_score: 10 }
                  ], 
                  error: null 
                })),
              })),
            })),
          };
        }
        if (table === 'submissions') {
          return {
            select: jest.fn(() => ({
              eq: jest.fn(() => Promise.resolve({ data: [], error: null })),
            })),
            insert: jest.fn(() => ({
              select: jest.fn(() => ({
                single: jest.fn(() => Promise.resolve({ data: { id: 'submission-id' }, error: null })),
              })),
            })),
          };
        }
        if (table === 'submission_elements') {
          return {
            select: jest.fn(() => ({
              eq: jest.fn(() => Promise.resolve({ data: [], error: null })),
            })),
            insert: jest.fn(() => Promise.resolve({ data: [], error: null })),
          };
        }
        return {
          select: jest.fn(() => Promise.resolve({ data: [], error: null })),
        };
      });

      render(<WorksheetSubmissionContent />);

      // Wait for the form to load
      await waitFor(() => {
        expect(screen.getByText('Test Question 1')).toBeInTheDocument();
      });

      // Fill in the form
      const input1 = screen.getByLabelText('Test Question 1');
      const input2 = screen.getByLabelText('Test Question 2');
      
      fireEvent.change(input1, { target: { value: 'Answer 1' } });
      fireEvent.change(input2, { target: { value: 'Answer 2' } });

      // Submit the form
      const submitButton = screen.getByText('Submit Answers');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Maximum attempts reached for this worksheet.')).toBeInTheDocument();
      });
    });
  });
});