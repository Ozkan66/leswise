"use client";
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Link from 'next/link';

export default function RegisterForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const { signUp, signInWithProvider } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const { error } = await signUp(email, password, firstName, lastName);
    
    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
    }
    
    setIsLoading(false);
  };

  const handleOAuthSignUp = async (provider: 'google' | 'azure') => {
    setIsLoading(true);
    setError(null);
    
    const { error } = await signInWithProvider(provider);
    
    if (error) {
      setError(error.message);
    }
    
    setIsLoading(false);
  };

  if (success) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>Registratie voltooid!</h2>
        <p>Controleer je e-mail voor een bevestigingslink om je account te activeren.</p>
        <p>Na het activeren van je account kun je inloggen en je rol selecteren.</p>
        <Link href="/login" style={{ color: '#0070f3', textDecoration: 'underline' }}>
          Ga naar inloggen
        </Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '400px', margin: '0 auto', padding: '20px' }}>
      <h1>Registreren</h1>
      
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

      <form onSubmit={handleSubmit} style={{ marginBottom: '20px' }}>
        <div style={{ marginBottom: '12px' }}>
          <label htmlFor="firstName">
            Voornaam:
            <input
              id="firstName"
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              style={{ 
                width: '100%', 
                padding: '8px', 
                marginTop: '4px',
                border: '1px solid #ccc',
                borderRadius: '4px'
              }}
            />
          </label>
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label htmlFor="lastName">
            Achternaam:
            <input
              id="lastName"
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
              style={{ 
                width: '100%', 
                padding: '8px', 
                marginTop: '4px',
                border: '1px solid #ccc',
                borderRadius: '4px'
              }}
            />
          </label>
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label htmlFor="email">
            E-mailadres:
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ 
                width: '100%', 
                padding: '8px', 
                marginTop: '4px',
                border: '1px solid #ccc',
                borderRadius: '4px'
              }}
            />
          </label>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label htmlFor="password">
            Wachtwoord:
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              style={{ 
                width: '100%', 
                padding: '8px', 
                marginTop: '4px',
                border: '1px solid #ccc',
                borderRadius: '4px'
              }}
            />
          </label>
          <small style={{ color: '#666' }}>Minimaal 6 karakters</small>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          style={{
            width: '100%',
            padding: '10px',
            backgroundColor: '#0070f3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            opacity: isLoading ? 0.6 : 1
          }}
        >
          {isLoading ? 'Registreren...' : 'Registreren'}
        </button>
      </form>

      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <span style={{ color: '#666' }}>Of registreer met:</span>
      </div>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button
          onClick={() => handleOAuthSignUp('google')}
          disabled={isLoading}
          style={{
            flex: 1,
            padding: '10px',
            backgroundColor: '#db4437',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            opacity: isLoading ? 0.6 : 1
          }}
        >
          Google
        </button>
        <button
          onClick={() => handleOAuthSignUp('azure')}
          disabled={isLoading}
          style={{
            flex: 1,
            padding: '10px',
            backgroundColor: '#0078d4',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            opacity: isLoading ? 0.6 : 1
          }}
        >
          Microsoft
        </button>
      </div>

      <div style={{ textAlign: 'center' }}>
        <span>Heb je al een account? </span>
        <Link href="/login" style={{ color: '#0070f3', textDecoration: 'underline' }}>
          Inloggen
        </Link>
      </div>
    </div>
  );
}