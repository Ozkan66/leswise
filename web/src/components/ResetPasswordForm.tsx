"use client";
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '../utils/supabaseClient';
import { logPasswordResetCompleted } from '../utils/securityLogger';
import Link from 'next/link';

function ResetPasswordFormContent() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [validSession, setValidSession] = useState<boolean | null>(null);
  
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Check if we have a valid session from the email link
    const checkSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (session && !error) {
        setValidSession(true);
      } else {
        setValidSession(false);
      }
    };

    checkSession();
  }, []);

  const validatePassword = (password: string): string | null => {
    if (password.length < 8) {
      return 'Wachtwoord moet minimaal 8 karakters lang zijn';
    }
    if (!/(?=.*[a-z])/.test(password)) {
      return 'Wachtwoord moet minimaal één kleine letter bevatten';
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      return 'Wachtwoord moet minimaal één hoofdletter bevatten';
    }
    if (!/(?=.*\d)/.test(password)) {
      return 'Wachtwoord moet minimaal één cijfer bevatten';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Validate new password
    const passwordValidation = validatePassword(password);
    if (passwordValidation) {
      setError(passwordValidation);
      setIsLoading(false);
      return;
    }

    // Check if passwords match
    if (password !== confirmPassword) {
      setError('Wachtwoorden komen niet overeen');
      setIsLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) {
        setError(error.message);
      } else {
        setSuccess(true);
        
        // Get current user to log the event
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await logPasswordResetCompleted(user.id);
        }
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      }
    } catch (err: unknown) {
      setError((err as Error).message);
    }

    setIsLoading(false);
  };

  // Loading state while checking session
  if (validSession === null) {
    return (
      <div style={{ maxWidth: '400px', margin: '0 auto', padding: '20px', textAlign: 'center' }}>
        <p>Laden...</p>
      </div>
    );
  }

  // Invalid session - show error
  if (validSession === false) {
    return (
      <div style={{ maxWidth: '400px', margin: '0 auto', padding: '20px' }}>
        <h1>Ongeldige link</h1>
        
        <div style={{ 
          padding: '16px', 
          backgroundColor: '#fee', 
          color: '#c00', 
          borderRadius: '6px', 
          marginBottom: '24px' 
        }}>
          <p>Deze wachtwoord reset link is ongeldig of verlopen.</p>
          <p>Vraag een nieuwe reset link aan om je wachtwoord te wijzigen.</p>
        </div>

        <div style={{ textAlign: 'center' }}>
          <Link href="/forgot-password" style={{ 
            color: '#0070f3', 
            textDecoration: 'underline',
            marginRight: '16px'
          }}>
            Nieuwe reset link aanvragen
          </Link>
          <Link href="/login" style={{ color: '#0070f3', textDecoration: 'underline' }}>
            Terug naar inloggen
          </Link>
        </div>
      </div>
    );
  }

  // Success state
  if (success) {
    return (
      <div style={{ maxWidth: '400px', margin: '0 auto', padding: '20px' }}>
        <h1>Wachtwoord gewijzigd!</h1>
        
        <div style={{ 
          padding: '16px', 
          backgroundColor: '#efe', 
          color: '#060', 
          borderRadius: '6px', 
          marginBottom: '24px' 
        }}>
          <p>Je wachtwoord is succesvol gewijzigd.</p>
          <p>Je wordt automatisch doorgestuurd naar de inlogpagina...</p>
        </div>

        <div style={{ textAlign: 'center' }}>
          <Link href="/login" style={{ color: '#0070f3', textDecoration: 'underline' }}>
            Direct naar inloggen
          </Link>
        </div>
      </div>
    );
  }

  // Reset password form
  return (
    <div style={{ maxWidth: '400px', margin: '0 auto', padding: '20px' }}>
      <h1>Nieuw wachtwoord instellen</h1>
      
      <p style={{ color: '#666', marginBottom: '24px' }}>
        Voer je nieuwe wachtwoord in.
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
          <label htmlFor="password">
            Nieuw wachtwoord:
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
          <small style={{ color: '#666', fontSize: '12px' }}>
            Minimaal 8 tekens, met hoofdletter, kleine letter en cijfer
          </small>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label htmlFor="confirmPassword">
            Bevestig wachtwoord:
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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
          {isLoading ? 'Opslaan...' : 'Wachtwoord opslaan'}
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

export default function ResetPasswordForm() {
  return (
    <Suspense fallback={<div style={{ maxWidth: '400px', margin: '0 auto', padding: '20px', textAlign: 'center' }}>Laden...</div>}>
      <ResetPasswordFormContent />
    </Suspense>
  );
}