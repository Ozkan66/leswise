import { render, screen } from '@testing-library/react';
import UserList from '../UserList';

describe('UserList', () => {
  it('toont "Geen gebruikers gevonden" als de lijst leeg is', () => {
    render(<UserList users={[]} />);
    expect(screen.getByText(/geen gebruikers gevonden/i)).toBeInTheDocument();
  });

  it('toont een lijst van gebruikers als deze aanwezig zijn', () => {
    const users = [
      { id: '1', email: 'test1@example.com' },
      { id: '2', email: 'test2@example.com' },
    ];
    render(<UserList users={users} />);
    expect(screen.getByText('test1@example.com')).toBeInTheDocument();
    expect(screen.getByText('test2@example.com')).toBeInTheDocument();
  });
});
