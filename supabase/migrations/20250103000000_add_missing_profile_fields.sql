-- Add missing profile fields to user_profiles table
-- This migration adds all fields that the UserProfile component needs

-- Add teacher-specific fields
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS institution TEXT,
ADD COLUMN IF NOT EXISTS subjects TEXT;

-- Add profile photo field
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS profile_photo_url TEXT;

-- Add 2FA field
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS two_factor_enabled BOOLEAN DEFAULT false;

-- Add personal preferences fields (Epic 1.4)
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'nl';

-- Add notification settings (Epic 1.4)
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS notification_email BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS notification_worksheets BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS notification_submissions BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS notification_system BOOLEAN DEFAULT true;

-- Add privacy settings (Epic 1.4)
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS privacy_profile_visibility TEXT DEFAULT 'institutional' CHECK (privacy_profile_visibility IN ('public', 'private', 'institutional')),
ADD COLUMN IF NOT EXISTS privacy_data_processing BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS privacy_marketing BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS privacy_analytics BOOLEAN DEFAULT true;

-- Create indexes for performance on commonly queried fields
CREATE INDEX IF NOT EXISTS idx_user_profiles_institution ON public.user_profiles(institution);
CREATE INDEX IF NOT EXISTS idx_user_profiles_language ON public.user_profiles(language);