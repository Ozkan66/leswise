"use client";
import { useState } from 'react';
import { supabase } from '../utils/supabaseClient';
import { logPasswordResetRequested } from '../utils/securityLogger';
import Link from 'next/link';
import Card from './Card';
import Button from './Button';
import Input from './Input';
import Alert from './Alert';

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
      <div className="max-w-md mx-auto">
        <Card>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">E-mail verzonden!</h1>
          
          <Alert variant="success" className="mb-6">
            <p className="mb-2">We hebben een e-mail met een wachtwoord reset link naar <strong>{email}</strong> gestuurd.</p>
            <p>Controleer je inbox en klik op de link om je wachtwoord te wijzigen.</p>
          </Alert>

          <div className="text-center">
            <Link href="/login" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
              Terug naar inloggen
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <Card>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Wachtwoord vergeten?</h1>
        
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Vul je e-mailadres in en we sturen je een link om je wachtwoord te wijzigen.
        </p>

        {error && (
          <Alert variant="error" className="mb-4">
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            id="email"
            type="email"
            label="E-mailadres"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="je@email.com"
          />

          <Button
            type="submit"
            disabled={isLoading}
            fullWidth
            variant="primary"
            className="mb-4"
          >
            {isLoading ? 'Verzenden...' : 'Reset link verzenden'}
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
