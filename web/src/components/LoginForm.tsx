"use client";
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { supabase } from '../utils/supabaseClient';
import { logLoginSuccess, logLoginFailed } from '../utils/securityLogger';
import Link from 'next/link';
import Card from './Card';
import Button from './Button';
import Input from './Input';
import Alert from './Alert';

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
      } else if (user?.user_metadata?.role === 'student') {
        router.push('/student-dashboard');
      } else {
        router.push('/dashboard');
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
    <div className="max-w-md mx-auto">
      <Card>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Inloggen</h1>

        {error && (
          <Alert variant="error" className="mb-4">
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 mb-6">
          <Input
            id="email"
            type="email"
            label="E-mailadres"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="je@email.com"
          />

          <Input
            id="password"
            type="password"
            label="Wachtwoord"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••••"
          />

          <Button
            type="submit"
            disabled={isLoading}
            fullWidth
            variant="primary"
          >
            {isLoading ? 'Inloggen...' : 'Inloggen'}
          </Button>

          <div className="text-center">
            <Link
              href="/forgot-password"
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              Wachtwoord vergeten?
            </Link>
          </div>
        </form>

        <div className="text-center mb-4">
          <span className="text-gray-600 dark:text-gray-400">Of log in met:</span>
        </div>

        <div className="flex gap-3 mb-6">
          <Button
            onClick={() => handleOAuthSignIn('google')}
            disabled={isLoading}
            variant="secondary"
            className="flex-1 bg-red-600 hover:bg-red-700"
          >
            Google
          </Button>
          <Button
            onClick={() => handleOAuthSignIn('azure')}
            disabled={isLoading}
            variant="secondary"
            className="flex-1 bg-sky-600 hover:bg-sky-700"
          >
            Microsoft
          </Button>
        </div>

        <div className="text-center text-gray-600 dark:text-gray-400">
          <span>Nog geen account? </span>
          <Link
            href="/register"
            className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
          >
            Registreren
          </Link>
        </div>
      </Card>
    </div>
  );
}