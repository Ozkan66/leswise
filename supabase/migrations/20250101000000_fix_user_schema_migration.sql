-- Fix Supabase migration issues: infinite recursion, broken RLS, and missing data after users table removal
-- This migration addresses the core issues identified in the schema migration

-- Step 1: Create user_profiles table to replace the removed users table
CREATE TABLE IF NOT EXISTS public.user_profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  role TEXT DEFAULT 'student' CHECK (role IN ('student', 'teacher', 'admin')),
  birth_year INTEGER,
  education_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 2: Create user_roles table if it doesn't exist (for backward compatibility)
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.user_profiles(user_id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('student', 'teacher', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, role)
);

-- Step 3: Create core tables if they don't exist (ensure proper schema)
CREATE TABLE IF NOT EXISTS public.groups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  owner_id UUID REFERENCES public.user_profiles(user_id) ON DELETE CASCADE NOT NULL,
  jumper_code TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.group_members (
  group_id UUID REFERENCES public.groups(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.user_profiles(user_id) ON DELETE CASCADE NOT NULL,
  role TEXT DEFAULT 'member' CHECK (role IN ('leader', 'member')),
  status TEXT DEFAULT 'active' CHECK (status IN ('pending', 'active', 'inactive')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (group_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.folders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  owner_id UUID REFERENCES public.user_profiles(user_id) ON DELETE CASCADE NOT NULL,
  parent_folder_id UUID REFERENCES public.folders(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.worksheets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  instructions TEXT,
  owner_id UUID REFERENCES public.user_profiles(user_id) ON DELETE CASCADE NOT NULL,
  folder_id UUID REFERENCES public.folders(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  is_shared BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.worksheet_elements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  worksheet_id UUID REFERENCES public.worksheets(id) ON DELETE CASCADE NOT NULL,
  type TEXT DEFAULT 'text',
  content JSONB NOT NULL,
  position INTEGER DEFAULT 0,
  max_score INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  worksheet_id UUID REFERENCES public.worksheets(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.user_profiles(user_id) ON DELETE CASCADE NOT NULL,
  score NUMERIC,
  feedback TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.submission_elements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  submission_id UUID REFERENCES public.submissions(id) ON DELETE CASCADE NOT NULL,
  worksheet_element_id UUID REFERENCES public.worksheet_elements(id) ON DELETE CASCADE NOT NULL,
  content TEXT,
  answer TEXT,
  score NUMERIC,
  feedback TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 4: Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON public.user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON public.user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles(role);
CREATE INDEX IF NOT EXISTS idx_group_members_user_id ON public.group_members(user_id);
CREATE INDEX IF NOT EXISTS idx_group_members_group_id ON public.group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_worksheets_owner_id ON public.worksheets(owner_id);
CREATE INDEX IF NOT EXISTS idx_submissions_user_id ON public.submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_submissions_worksheet_id ON public.submissions(worksheet_id);

-- Step 5: Enable Row Level Security on all tables
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.worksheets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.worksheet_elements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submission_elements ENABLE ROW LEVEL SECURITY;

-- Step 6: Drop existing problematic policies to prevent conflicts
DROP POLICY IF EXISTS "Users can view their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view group memberships" ON public.group_members;
DROP POLICY IF EXISTS "Users can manage their groups" ON public.groups;
DROP POLICY IF EXISTS "Users can manage their folders" ON public.folders;
DROP POLICY IF EXISTS "Users can manage their worksheets" ON public.worksheets;
DROP POLICY IF EXISTS "Users can view worksheet elements" ON public.worksheet_elements;
DROP POLICY IF EXISTS "Users can view their submissions" ON public.submissions;
DROP POLICY IF EXISTS "Users can view their submission elements" ON public.submission_elements;

-- Step 7: Create safe RLS policies without circular references
-- User profiles policies
CREATE POLICY "Users can view their own profile" ON public.user_profiles
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON public.user_profiles
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "System can insert user profiles" ON public.user_profiles
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- User roles policies
CREATE POLICY "Users can view their own roles" ON public.user_roles
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own roles" ON public.user_roles
FOR ALL USING (auth.uid() = user_id);

-- Groups policies
CREATE POLICY "Users can view groups they own or are members of" ON public.groups
FOR SELECT USING (
  auth.uid() = owner_id OR 
  id IN (SELECT group_id FROM public.group_members WHERE user_id = auth.uid())
);

CREATE POLICY "Users can manage their own groups" ON public.groups
FOR ALL USING (auth.uid() = owner_id);

-- Group members policies (fixed to avoid infinite recursion)
CREATE POLICY "Users can view group memberships" ON public.group_members
FOR SELECT USING (
  auth.uid() = user_id OR 
  group_id IN (SELECT id FROM public.groups WHERE owner_id = auth.uid())
);

CREATE POLICY "Group owners can manage memberships" ON public.group_members
FOR ALL USING (
  group_id IN (SELECT id FROM public.groups WHERE owner_id = auth.uid())
);

CREATE POLICY "Users can join/leave groups" ON public.group_members
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave groups" ON public.group_members
FOR DELETE USING (auth.uid() = user_id);

-- Folders policies
CREATE POLICY "Users can manage their own folders" ON public.folders
FOR ALL USING (auth.uid() = owner_id);

-- Worksheets policies
CREATE POLICY "Users can manage their own worksheets" ON public.worksheets
FOR ALL USING (auth.uid() = owner_id);

CREATE POLICY "Users can view shared worksheets" ON public.worksheets
FOR SELECT USING (
  auth.uid() = owner_id OR 
  is_shared = true OR
  id IN (
    SELECT worksheet_id FROM public.worksheet_shares 
    WHERE shared_with_user_id = auth.uid() OR
    shared_with_group_id IN (
      SELECT group_id FROM public.group_members WHERE user_id = auth.uid()
    )
  )
);

-- Worksheet elements policies
CREATE POLICY "Users can view worksheet elements" ON public.worksheet_elements
FOR SELECT USING (
  worksheet_id IN (
    SELECT id FROM public.worksheets 
    WHERE owner_id = auth.uid() OR 
    is_shared = true OR
    id IN (
      SELECT worksheet_id FROM public.worksheet_shares 
      WHERE shared_with_user_id = auth.uid() OR
      shared_with_group_id IN (
        SELECT group_id FROM public.group_members WHERE user_id = auth.uid()
      )
    )
  )
);

CREATE POLICY "Users can manage their worksheet elements" ON public.worksheet_elements
FOR ALL USING (
  worksheet_id IN (SELECT id FROM public.worksheets WHERE owner_id = auth.uid())
);

-- Submissions policies
CREATE POLICY "Users can view their own submissions" ON public.submissions
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Worksheet owners can view submissions" ON public.submissions
FOR SELECT USING (
  worksheet_id IN (SELECT id FROM public.worksheets WHERE owner_id = auth.uid())
);

CREATE POLICY "Users can create submissions" ON public.submissions
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own submissions" ON public.submissions
FOR UPDATE USING (auth.uid() = user_id);

-- Submission elements policies
CREATE POLICY "Users can view their submission elements" ON public.submission_elements
FOR SELECT USING (
  submission_id IN (SELECT id FROM public.submissions WHERE user_id = auth.uid())
);

CREATE POLICY "Worksheet owners can view submission elements" ON public.submission_elements
FOR SELECT USING (
  submission_id IN (
    SELECT s.id FROM public.submissions s
    JOIN public.worksheets w ON s.worksheet_id = w.id
    WHERE w.owner_id = auth.uid()
  )
);

CREATE POLICY "Users can manage their submission elements" ON public.submission_elements
FOR ALL USING (
  submission_id IN (SELECT id FROM public.submissions WHERE user_id = auth.uid())
);

-- Step 8: Create trigger for updating user_profiles updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON public.user_profiles;
CREATE TRIGGER update_user_profiles_updated_at 
    BEFORE UPDATE ON public.user_profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_roles_updated_at ON public.user_roles;
CREATE TRIGGER update_user_roles_updated_at 
    BEFORE UPDATE ON public.user_roles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Step 9: Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Step 10: Create function to automatically create user profile on auth signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id, email, role)
  VALUES (NEW.id, NEW.email, 'student');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger to automatically create user profile
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();