import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AIWorksheetGenerator from '../AIWorksheetGenerator';

// Mock fetch
global.fetch = jest.fn();

// Mock Supabase auth session
jest.mock('../../utils/supabaseClient', () => ({
  supabase: {
    auth: {
      getSession: jest.fn(() => Promise.resolve({
        data: {
          session: {
            access_token: 'mock-access-token',
            user: { id: 'mock-user-id' }
          }
        },
        error: null
      }))
    }
  }
}));

describe('AIWorksheetGenerator', () => {
  const mockOnQuestionsGenerated = jest.fn();
  const mockWorksheetId = 'test-worksheet-id';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the AI generator form', () => {
    render(
      <AIWorksheetGenerator 
        worksheetId={mockWorksheetId}
        onQuestionsGenerated={mockOnQuestionsGenerated}
      />
    );
    
    expect(screen.getByText('🤖 AI Werkblad Generator')).toBeInTheDocument();
    expect(screen.getByText('Leerjaar *')).toBeInTheDocument();
    expect(screen.getByText('Vak *')).toBeInTheDocument();
    expect(screen.getByText('Onderwerp/Topic *')).toBeInTheDocument();
    expect(screen.getByText('Vraagtypes en Aantallen')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '🚀 Genereer Vragen' })).toBeInTheDocument();
  });

  it('shows validation error when required fields are missing', async () => {
    render(
      <AIWorksheetGenerator 
        worksheetId={mockWorksheetId}
        onQuestionsGenerated={mockOnQuestionsGenerated}
      />
    );
    
    // Try to generate without filling required fields
    fireEvent.click(screen.getByRole('button', { name: '🚀 Genereer Vragen' }));
    
    await waitFor(() => {
      expect(screen.getByText('Vul alle verplichte velden in')).toBeInTheDocument();
    });
  });

  it('shows validation error when no question types are selected', async () => {
    render(
      <AIWorksheetGenerator 
        worksheetId={mockWorksheetId}
        onQuestionsGenerated={mockOnQuestionsGenerated}
      />
    );
    
    // Fill required fields but no question types
    const gradeSelect = screen.getByRole('combobox');
    fireEvent.change(gradeSelect, { target: { value: '3e leerjaar basisonderwijs' } });
    
    fireEvent.change(screen.getByPlaceholderText('Bijv. Wiskunde, Nederlands, Geschiedenis...'), { 
      target: { value: 'Wiskunde' } 
    });
    fireEvent.change(screen.getByPlaceholderText('Bijv. Breuken, Werkwoorden, Tweede Wereldoorlog...'), { 
      target: { value: 'Breuken' } 
    });
    
    fireEvent.click(screen.getByRole('button', { name: '🚀 Genereer Vragen' }));
    
    await waitFor(() => {
      expect(screen.getByText('Selecteer minimaal één vraagtype met aantal vragen')).toBeInTheDocument();
    });
  });

  it('calls API when form is properly filled', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, questionsGenerated: 3 })
    });

    render(
      <AIWorksheetGenerator 
        worksheetId={mockWorksheetId}
        onQuestionsGenerated={mockOnQuestionsGenerated}
      />
    );
    
    // Fill form
    const gradeSelect = screen.getByRole('combobox');
    fireEvent.change(gradeSelect, { target: { value: '3e leerjaar basisonderwijs' } });
    
    fireEvent.change(screen.getByPlaceholderText('Bijv. Wiskunde, Nederlands, Geschiedenis...'), { 
      target: { value: 'Wiskunde' } 
    });
    fireEvent.change(screen.getByPlaceholderText('Bijv. Breuken, Werkwoorden, Tweede Wereldoorlog...'), { 
      target: { value: 'Breuken' } 
    });
    
    // Select question types - look for the first number input
    const numberInputs = screen.getAllByRole('spinbutton');
    fireEvent.change(numberInputs[0], { target: { value: '2' } });
    
    // Submit
    fireEvent.click(screen.getByRole('button', { name: '🚀 Genereer Vragen' }));
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/ai/generate-questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer mock-access-token'
        },
        body: JSON.stringify({
          worksheetId: mockWorksheetId,
          gradeLevel: '3e leerjaar basisonderwijs',
          subject: 'Wiskunde',
          topic: 'Breuken',
          questionTypes: { multiple_choice: 2 }
        }),
      });
    });
    
    await waitFor(() => {
      expect(mockOnQuestionsGenerated).toHaveBeenCalled();
    });
  });

  it('shows error when API call fails', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: jest.fn().mockResolvedValue({ message: 'Server error' })
    });

    render(
      <AIWorksheetGenerator 
        worksheetId={mockWorksheetId}
        onQuestionsGenerated={mockOnQuestionsGenerated}
      />
    );
    
    // Fill form
    const gradeSelect = screen.getByRole('combobox');
    fireEvent.change(gradeSelect, { target: { value: '3e leerjaar basisonderwijs' } });
    
    fireEvent.change(screen.getByPlaceholderText('Bijv. Wiskunde, Nederlands, Geschiedenis...'), { 
      target: { value: 'Wiskunde' } 
    });
    fireEvent.change(screen.getByPlaceholderText('Bijv. Breuken, Werkwoorden, Tweede Wereldoorlog...'), { 
      target: { value: 'Breuken' } 
    });
    
    // Select question types
    const numberInputs = screen.getAllByRole('spinbutton');
    fireEvent.change(numberInputs[0], { target: { value: '2' } });
    
    // Submit
    fireEvent.click(screen.getByRole('button', { name: '🚀 Genereer Vragen' }));
    
    await waitFor(() => {
      expect(screen.getByText('Server error')).toBeInTheDocument();
    });
  });
});