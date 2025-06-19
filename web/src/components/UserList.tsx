"use client";

export default function UserList({ users }: { users: any[] }) {
  return (
    <div style={{margin: '16px 0', padding: '12px', background: '#f8f8ff', borderRadius: '8px'}}>
      <strong>Alle gebruikers:</strong>
      <ul>
        {users.length === 0 && <li><em>Geen gebruikers gevonden</em></li>}
        {users.map((user) => (
          <li key={user.id}>{user.email}</li>
        ))}
      </ul>
    </div>
  );
}
