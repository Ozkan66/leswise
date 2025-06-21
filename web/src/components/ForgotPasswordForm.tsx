"use client";
import { useState } from 'react';
import { supabase } from '../utils/supabaseClient';
import { logPasswordResetRequested } from '../utils/securityLogger';
import Link from 'next/link';

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        setError(error.message);
      } else {
        setSuccess(true);
        // Log security event
        await logPasswordResetRequested(email);
      }
    } catch (err: unknown) {
      setError((err as Error).message);
    }

    setIsLoading(false);
  };

  if (success) {
    return (
      <div style={{ maxWidth: '400px', margin: '0 auto', padding: '20px' }}>
        <h1>E-mail verzonden!</h1>
        
        <div style={{ 
          padding: '16px', 
          backgroundColor: '#efe', 
          color: '#060', 
          borderRadius: '6px', 
          marginBottom: '24px' 
        }}>
          <p>We hebben een e-mail met een wachtwoord reset link naar <strong>{email}</strong> gestuurd.</p>
          <p>Controleer je inbox en klik op de link om je wachtwoord te wijzigen.</p>
        </div>

        <div style={{ textAlign: 'center' }}>
          <Link href="/login" style={{ color: '#0070f3', textDecoration: 'underline' }}>
            Terug naar inloggen
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '400px', margin: '0 auto', padding: '20px' }}>
      <h1>Wachtwoord vergeten?</h1>
      
      <p style={{ color: '#666', marginBottom: '24px' }}>
        Vul je e-mailadres in en we sturen je een link om je wachtwoord te wijzigen.
      </p>

      {error && (
        <div style={{ 
          padding: '12px', 
          backgroundColor: '#fee', 
          color: '#c00', 
          borderRadius: '6px', 
          marginBottom: '16px' 
        }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '16px' }}>
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

        <button
          type="submit"
          disabled={isLoading}
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: '#0070f3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            opacity: isLoading ? 0.6 : 1,
            marginBottom: '16px'
          }}
        >
          {isLoading ? 'Verzenden...' : 'Reset link verzenden'}
        </button>
      </form>

      <div style={{ textAlign: 'center' }}>
        <Link href="/login" style={{ color: '#0070f3', textDecoration: 'underline' }}>
          Terug naar inloggen
        </Link>
      </div>
    </div>
  );
}