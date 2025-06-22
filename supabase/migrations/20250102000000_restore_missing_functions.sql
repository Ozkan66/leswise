-- Restore missing database functions after users table removal
-- This migration adds back essential functions that may have been lost

-- Function to log security events (referenced in securityLogger.ts)
CREATE OR REPLACE FUNCTION log_security_event(
  p_user_id UUID,
  p_event_type VARCHAR(50),
  p_event_details JSONB DEFAULT NULL,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  profile_exists BOOLEAN;
BEGIN
  -- Check if user profile exists (since we reference user_profiles now)
  SELECT EXISTS(SELECT 1 FROM public.user_profiles WHERE user_id = p_user_id) INTO profile_exists;
  
  -- Insert the security log regardless of whether profile exists
  -- (user might not have completed profile setup yet)
  INSERT INTO security_logs (user_id, event_type, event_details, ip_address, user_agent)
  VALUES (p_user_id, p_event_type, p_event_details, p_ip_address, p_user_agent);
  
EXCEPTION
  WHEN OTHERS THEN
    -- If insert fails, don't crash the application
    -- This ensures security logging doesn't break the user experience
    RAISE WARNING 'Failed to log security event: %', SQLERRM;
END;
$$;

-- Grant execute permission on the function to authenticated users
GRANT EXECUTE ON FUNCTION log_security_event TO authenticated;

-- Function to get user profile with role information
CREATE OR REPLACE FUNCTION get_user_profile(p_user_id UUID)
RETURNS TABLE (
  user_id UUID,
  email TEXT,
  first_name TEXT,
  last_name TEXT,
  role TEXT,
  birth_year INTEGER,
  education_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT up.user_id, up.email, up.first_name, up.last_name, up.role,
         up.birth_year, up.education_type, up.created_at, up.updated_at
  FROM public.user_profiles up
  WHERE up.user_id = p_user_id;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_user_profile TO authenticated;

-- Function to safely create or update user profile
CREATE OR REPLACE FUNCTION upsert_user_profile(
  p_user_id UUID,
  p_email TEXT,
  p_first_name TEXT DEFAULT NULL,
  p_last_name TEXT DEFAULT NULL,
  p_role TEXT DEFAULT 'student',
  p_birth_year INTEGER DEFAULT NULL,
  p_education_type TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Only allow users to update their own profile
  IF auth.uid() != p_user_id THEN
    RAISE EXCEPTION 'Access denied: cannot update another user''s profile';
  END IF;

  INSERT INTO public.user_profiles (
    user_id, email, first_name, last_name, role, birth_year, education_type
  )
  VALUES (
    p_user_id, p_email, p_first_name, p_last_name, p_role, p_birth_year, p_education_type
  )
  ON CONFLICT (user_id) DO UPDATE SET
    email = EXCLUDED.email,
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    role = EXCLUDED.role,
    birth_year = EXCLUDED.birth_year,
    education_type = EXCLUDED.education_type,
    updated_at = NOW();
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION upsert_user_profile TO authenticated;

-- Function to get user's groups (for navigation and access control)
CREATE OR REPLACE FUNCTION get_user_groups(p_user_id UUID)
RETURNS TABLE (
  group_id UUID,
  group_name TEXT,
  group_description TEXT,
  user_role TEXT,
  joined_at TIMESTAMP WITH TIME ZONE,
  is_leader BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Only allow users to get their own groups
  IF auth.uid() != p_user_id THEN
    RAISE EXCEPTION 'Access denied: cannot access another user''s groups';
  END IF;

  RETURN QUERY
  SELECT g.id, g.name, g.description, gm.role, gm.joined_at,
         (gm.role = 'leader') as is_leader
  FROM public.groups g
  JOIN public.group_members gm ON g.id = gm.group_id
  WHERE gm.user_id = p_user_id AND gm.status = 'active';
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_user_groups TO authenticated;

-- Function to check worksheet access permissions
CREATE OR REPLACE FUNCTION check_worksheet_access(
  p_user_id UUID,
  p_worksheet_id UUID,
  p_permission_type TEXT DEFAULT 'read'
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  is_owner BOOLEAN := false;
  has_share_access BOOLEAN := false;
  is_public BOOLEAN := false;
BEGIN
  -- Check if user owns the worksheet
  SELECT EXISTS(
    SELECT 1 FROM public.worksheets 
    WHERE id = p_worksheet_id AND owner_id = p_user_id
  ) INTO is_owner;
  
  IF is_owner THEN
    RETURN true;
  END IF;
  
  -- Check if worksheet is shared/public
  SELECT is_shared INTO is_public
  FROM public.worksheets
  WHERE id = p_worksheet_id;
  
  IF is_public THEN
    RETURN true;
  END IF;
  
  -- Check direct and group shares (if worksheet_shares table exists)
  SELECT EXISTS(
    SELECT 1 FROM public.worksheet_shares ws
    WHERE ws.worksheet_id = p_worksheet_id
    AND (
      ws.shared_with_user_id = p_user_id OR
      ws.shared_with_group_id IN (
        SELECT group_id FROM public.group_members 
        WHERE user_id = p_user_id AND status = 'active'
      )
    )
    AND (ws.expires_at IS NULL OR ws.expires_at > NOW())
    AND (
      p_permission_type = 'read' OR
      (p_permission_type = 'submit' AND ws.permission_level IN ('submit', 'edit')) OR
      (p_permission_type = 'edit' AND ws.permission_level = 'edit')
    )
  ) INTO has_share_access;
  
  RETURN has_share_access;
  
EXCEPTION
  WHEN OTHERS THEN
    -- If worksheet_shares doesn't exist yet, just return false
    RETURN false;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION check_worksheet_access TO authenticated;