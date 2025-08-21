import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  if (process.env.NODE_ENV === 'development') {
    console.warn('🔧 Supabase URL is not defined. Please create a .env.local file with NEXT_PUBLIC_SUPABASE_URL');
  }
  throw new Error("Supabase URL is not defined. Please check your .env.local file.");
}

if (!supabaseAnonKey) {
  if (process.env.NODE_ENV === 'development') {
    console.warn('🔧 Supabase anonymous key is not defined. Please create a .env.local file with NEXT_PUBLIC_SUPABASE_ANON_KEY');
  }
  throw new Error("Supabase anonymous key is not defined. Please check your .env.local file.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
