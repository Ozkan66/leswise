"use client";
import { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../utils/supabaseClient';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, firstName: string, lastName: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signInWithProvider: (provider: 'google' | 'azure') => Promise<{ error: any }>;
  signOut: () => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper function to check if OAuth providers are properly configured
const logOAuthConfigurationHint = (provider: string, error: any) => {
  if (process.env.NODE_ENV === 'development' && error?.message?.includes('provider is not enabled')) {
    console.warn(
      `🔧 OAuth Configuration Hint: ${provider} provider appears to be disabled.\n` +
      `To enable ${provider} authentication:\n` +
      `1. Go to your Supabase Dashboard (https://supabase.com/dashboard)\n` +
      `2. Navigate to Authentication > Providers\n` +
      `3. Enable the ${provider} provider\n` +
      `4. Configure the OAuth settings with your ${provider} app credentials\n` +
      `5. Add your domain to the redirect URLs\n\n` +
      `Error details:`, error
    );
  }
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, firstName: string, lastName: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
        },
      },
    });
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signInWithProvider = async (provider: 'google' | 'azure') => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/`,
      },
    });
    
    // Provide more user-friendly error messages for common OAuth issues
    if (error) {
      // Log configuration hints for developers
      logOAuthConfigurationHint(provider === 'google' ? 'Google' : 'Microsoft', error);
      
      if (error.message?.includes('provider is not enabled')) {
        return {
          error: {
            ...error,
            message: `${provider === 'google' ? 'Google' : 'Microsoft'} inloggen is momenteel niet beschikbaar. Probeer het later opnieuw of gebruik je e-mailadres om in te loggen.`,
            originalMessage: error.message
          }
        };
      }
    }
    
    return { error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  const value = {
    user,
    loading,
    signUp,
    signIn,
    signInWithProvider,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}