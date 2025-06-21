"use client";
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { supabase } from '../utils/supabaseClient';
import { logLoginSuccess, logLoginFailed } from '../utils/securityLogger';
import Link from 'next/link';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { signIn, signInWithProvider } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const { error } = await signIn(email, password);
    
    if (error) {
      setError(error.message);
      await logLoginFailed(email, 'email', undefined, error.message);
    } else {
      // Check if user needs to select role
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await logLoginSuccess(user.id, 'email');
      }
      
      if (user && !user.user_metadata?.role) {
        router.push('/role-selection');
      } else {
        router.push('/');
      }
    }
    
    setIsLoading(false);
  };

  const handleOAuthSignIn = async (provider: 'google' | 'azure') => {
    setIsLoading(true);
    setError(null);
    
    const { error } = await signInWithProvider(provider);
    
    if (error) {
      setError(error.message);
      await logLoginFailed(undefined, 'oauth', provider, error.message);
    } else {
      // OAuth success will be handled by the auth state change
      // We'll log it in the AuthContext when the session is established
    }
    
    setIsLoading(false);
  };

  return (
    <div style={{ maxWidth: '400px', margin: '0 auto', padding: '20px' }}>
      <h1>Inloggen</h1>
      
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
          {isLoading ? 'Inloggen...' : 'Inloggen'}
        </button>

        <div style={{ textAlign: 'center', marginTop: '12px' }}>
          <Link href="/forgot-password" style={{ color: '#0070f3', textDecoration: 'underline', fontSize: '14px' }}>
            Wachtwoord vergeten?
          </Link>
        </div>
      </form>

      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <span style={{ color: '#666' }}>Of log in met:</span>
      </div>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button
          onClick={() => handleOAuthSignIn('google')}
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
          onClick={() => handleOAuthSignIn('azure')}
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
        <span>Nog geen account? </span>
        <Link href="/register" style={{ color: '#0070f3', textDecoration: 'underline' }}>
          Registreren
        </Link>
      </div>
    </div>
  );
}