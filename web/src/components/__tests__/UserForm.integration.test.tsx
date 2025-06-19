import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import UserForm from '../UserForm';

// Mock de Supabase client
jest.mock('../../utils/supabaseClient', () => ({
  supabase: {
    from: jest.fn(() => ({
      insert: jest.fn(() => ({
        select: jest.fn(() => Promise.resolve({ data: [{ id: '123', email: 'integration@example.com' }], error: null }))
      }))
    }))
  }
}));

describe('UserForm integration', () => {
  it('voegt een gebruiker toe en toont succesmelding', async () => {
    const onUserAdded = jest.fn();
    render(<UserForm onUserAdded={onUserAdded} />);

    // Vul het emailveld in
    const input = screen.getByLabelText(/nieuwe gebruiker/i);
    fireEvent.change(input, { target: { value: 'integration@example.com' } });
    fireEvent.click(screen.getByText(/toevoegen/i));

    // Wacht op de succesmelding
    await waitFor(() => {
      expect(screen.getByText(/toegevoegd/i)).toBeInTheDocument();
    });

    // onUserAdded callback moet zijn aangeroepen
    expect(onUserAdded).toHaveBeenCalled();
  });
});
