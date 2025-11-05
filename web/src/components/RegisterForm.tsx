"use client";
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Link from 'next/link';
import Card from './Card';
import Button from './Button';
import Input from './Input';
import Alert from './Alert';

export default function RegisterForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);

  const { signUp, signInWithProvider } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const { data, error } = await signUp(email, password, firstName, lastName);
    
    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
      // Check if the user needs email confirmation
      // If user is null or email_confirmed_at is null, then confirmation is needed
      setNeedsConfirmation(!data.user || !data.user.email_confirmed_at);
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
      <Card className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Registratie voltooid!</h2>
        {needsConfirmation ? (
          <div className="space-y-2 mb-6">
            <p className="text-gray-700 dark:text-gray-300">Controleer je e-mail voor een bevestigingslink om je account te activeren.</p>
            <p className="text-gray-700 dark:text-gray-300">Na het activeren van je account kun je inloggen en je rol selecteren.</p>
          </div>
        ) : (
          <div className="space-y-2 mb-6">
            <p className="text-gray-700 dark:text-gray-300">Je account is succesvol aangemaakt en je bent automatisch ingelogd.</p>
            <p className="text-gray-700 dark:text-gray-300">Je kunt nu beginnen met het gebruik van de applicatie.</p>
          </div>
        )}
        <Link href="/login" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
          Ga naar inloggen
        </Link>
      </Card>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <Card>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Registreren</h1>
        
        {error && (
          <Alert variant="error" className="mb-4">
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 mb-6">
          <Input
            id="firstName"
            type="text"
            label="Voornaam"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
            placeholder="Jan"
          />

          <Input
            id="lastName"
            type="text"
            label="Achternaam"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
            placeholder="Jansen"
          />

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
            minLength={6}
            helperText="Minimaal 6 karakters"
            placeholder="••••••••"
          />

          <Button
            type="submit"
            disabled={isLoading}
            fullWidth
            variant="primary"
          >
            {isLoading ? 'Registreren...' : 'Registreren'}
          </Button>
        </form>

        <div className="text-center mb-4">
          <span className="text-gray-600 dark:text-gray-400">Of registreer met:</span>
        </div>

        <div className="flex gap-3 mb-6">
          <Button
            onClick={() => handleOAuthSignUp('google')}
            disabled={isLoading}
            variant="secondary"
            className="flex-1 bg-red-600 hover:bg-red-700"
          >
            Google
          </Button>
          <Button
            onClick={() => handleOAuthSignUp('azure')}
            disabled={isLoading}
            variant="secondary"
            className="flex-1 bg-sky-600 hover:bg-sky-700"
          >
            Microsoft
          </Button>
        </div>

        <div className="text-center text-gray-600 dark:text-gray-400">
          <span>Heb je al een account? </span>
          <Link 
            href="/login" 
            className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
          >
            Inloggen
          </Link>
        </div>
      </Card>
    </div>
  );
}
