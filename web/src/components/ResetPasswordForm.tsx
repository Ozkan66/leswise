"use client";
import { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../utils/supabaseClient';
import { logPasswordResetCompleted } from '../utils/securityLogger';
import Link from 'next/link';
import Card from './Card';
import Button from './Button';
import Input from './Input';
import Alert from './Alert';

function ResetPasswordFormContent() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [validSession, setValidSession] = useState<boolean | null>(null);
  
  const router = useRouter();

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
      <div className="max-w-md mx-auto">
        <Card className="text-center">
          <p className="text-gray-600 dark:text-gray-400">Laden...</p>
        </Card>
      </div>
    );
  }

  // Invalid session - show error
  if (validSession === false) {
    return (
      <div className="max-w-md mx-auto">
        <Card>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Ongeldige link</h1>
          
          <Alert variant="error" className="mb-6">
            <p className="mb-2">Deze wachtwoord reset link is ongeldig of verlopen.</p>
            <p>Vraag een nieuwe reset link aan om je wachtwoord te wijzigen.</p>
          </Alert>

          <div className="text-center space-x-4">
            <Link href="/forgot-password" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
              Nieuwe reset link aanvragen
            </Link>
            <Link href="/login" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
              Terug naar inloggen
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  // Success state
  if (success) {
    return (
      <div className="max-w-md mx-auto">
        <Card>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Wachtwoord gewijzigd!</h1>
          
          <Alert variant="success" className="mb-6">
            <p className="mb-2">Je wachtwoord is succesvol gewijzigd.</p>
            <p>Je wordt automatisch doorgestuurd naar de inlogpagina...</p>
          </Alert>

          <div className="text-center">
            <Link href="/login" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
              Direct naar inloggen
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  // Reset password form
  return (
    <div className="max-w-md mx-auto">
      <Card>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Nieuw wachtwoord instellen</h1>
        
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Voer je nieuwe wachtwoord in.
        </p>

        {error && (
          <Alert variant="error" className="mb-4">
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            id="password"
            type="password"
            label="Nieuw wachtwoord"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            helperText="Minimaal 8 tekens, met hoofdletter, kleine letter en cijfer"
            placeholder="••••••••"
          />

          <Input
            id="confirmPassword"
            type="password"
            label="Bevestig wachtwoord"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            placeholder="••••••••"
          />

          <Button
            type="submit"
            disabled={isLoading}
            fullWidth
            variant="primary"
            className="mb-4"
          >
            {isLoading ? 'Opslaan...' : 'Wachtwoord opslaan'}
          </Button>
        </form>

        <div className="text-center mt-4">
          <Link href="/login" className="text-blue-600 dark:text-blue-400 hover:underline">
            Terug naar inloggen
          </Link>
        </div>
      </Card>
    </div>
  );
}

export default function ResetPasswordForm() {
  return (
    <Suspense fallback={
      <div className="max-w-md mx-auto">
        <Card className="text-center">
          <p className="text-gray-600 dark:text-gray-400">Laden...</p>
        </Card>
      </div>
    }>
      <ResetPasswordFormContent />
    </Suspense>
  );
}
