"use client";
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { supabase } from '../utils/supabaseClient';

export default function UserRoleSelection() {
  const [selectedRole, setSelectedRole] = useState<'teacher' | 'student' | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const router = useRouter();

  const handleRoleSelection = async () => {
    if (!selectedRole || !user) return;
    
    setIsLoading(true);
    setError(null);

    try {
      // Update user metadata with role
      const { error } = await supabase.auth.updateUser({
        data: { role: selectedRole }
      });

      if (error) {
        setError(error.message);
      } else {
        // Redirect to profile page after role selection so user can complete their profile
        router.push('/profile');
      }
    } catch (err: unknown) {
      setError((err as Error).message);
    }
    
    setIsLoading(false);
  };

  return (
    <div style={{ maxWidth: '400px', margin: '0 auto', padding: '20px', textAlign: 'center' }}>
      <h1>Welkom bij Leswise!</h1>
      <p>Om je ervaring te personaliseren, willen we graag weten wat je rol is:</p>
      
      {error && (
        <div style={{ 
          padding: '10px', 
          backgroundColor: '#fee', 
          color: '#c00', 
          borderRadius: '4px', 
          marginBottom: '16px' 
        }}>
          {error}
        </div>
      )}

      <div style={{ margin: '20px 0' }}>
        <div
          onClick={() => setSelectedRole('teacher')}
          style={{
            padding: '20px',
            margin: '10px 0',
            border: selectedRole === 'teacher' ? '2px solid #0070f3' : '1px solid #ccc',
            borderRadius: '8px',
            cursor: 'pointer',
            backgroundColor: selectedRole === 'teacher' ? '#f0f8ff' : 'white'
          }}
        >
          <h3>Ik ben een docent</h3>
          <p style={{ color: '#666', margin: '5px 0' }}>
            Ik wil werkbladen maken en delen met leerlingen
          </p>
        </div>

        <div
          onClick={() => setSelectedRole('student')}
          style={{
            padding: '20px',
            margin: '10px 0',
            border: selectedRole === 'student' ? '2px solid #0070f3' : '1px solid #ccc',
            borderRadius: '8px',
            cursor: 'pointer',
            backgroundColor: selectedRole === 'student' ? '#f0f8ff' : 'white'
          }}
        >
          <h3>Ik ben een leerling</h3>
          <p style={{ color: '#666', margin: '5px 0' }}>
            Ik wil werkbladen maken en feedback ontvangen
          </p>
        </div>
      </div>

      <button
        onClick={handleRoleSelection}
        disabled={!selectedRole || isLoading}
        style={{
          width: '100%',
          padding: '12px',
          backgroundColor: selectedRole ? '#0070f3' : '#ccc',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: selectedRole && !isLoading ? 'pointer' : 'not-allowed',
          fontSize: '16px'
        }}
      >
        {isLoading ? 'Opslaan...' : 'Doorgaan'}
      </button>

      <p style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
        Je kunt dit later altijd wijzigen in je profielinstellingen.
      </p>
    </div>
  );
}