import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import UserForm from '../UserForm';

// Mock de Supabase client met een fout
jest.mock('../../utils/supabaseClient', () => ({
  supabase: {
    from: jest.fn(() => ({
      insert: jest.fn(() => ({
        select: jest.fn(() => Promise.resolve({ data: null, error: { message: 'Database insert error!' } }))
      }))
    }))
  }
}));

describe('UserForm error handling', () => {
  it('toont een foutmelding als het uitnodigen van een gebruiker faalt', async () => {
    const onUserAdded = jest.fn();
    render(<UserForm onUserAdded={onUserAdded} />);

    // Vul het emailveld in
    const input = screen.getByLabelText(/nieuwe gebruiker/i);
    fireEvent.change(input, { target: { value: 'fail@example.com' } });
    fireEvent.click(screen.getByText(/uitnodigen/i));

    // Wacht op de foutmelding
    await waitFor(() => {
      expect(screen.getByText(/fout bij uitnodigen/i)).toBeInTheDocument();
      expect(screen.getByText(/database insert error/i)).toBeInTheDocument();
    });

    // onUserAdded mag NIET zijn aangeroepen
    expect(onUserAdded).not.toHaveBeenCalled();
  });
});
