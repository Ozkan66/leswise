-- Fix Issue #133: Worksheet sharing and submission permission problems
-- This migration fixes the schema reference issues in the user_has_worksheet_access function

-- Fix the user_has_worksheet_access function to use correct schema references
CREATE OR REPLACE FUNCTION user_has_worksheet_access(
  p_user_id UUID,
  p_worksheet_id UUID,
  p_required_permission VARCHAR(20) DEFAULT 'read'
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  is_owner BOOLEAN := false;
  has_direct_share BOOLEAN := false;
  has_group_share BOOLEAN := false;
BEGIN
  -- Check if user is the worksheet owner (Fix: use public.worksheets)
  SELECT EXISTS(
    SELECT 1 FROM public.worksheets 
    WHERE id = p_worksheet_id AND owner_id = p_user_id
  ) INTO is_owner;
  
  IF is_owner THEN
    RETURN true;
  END IF;
  
  -- Check direct user shares (Fix: use public.worksheet_shares)
  SELECT EXISTS(
    SELECT 1 FROM public.worksheet_shares ws
    WHERE ws.worksheet_id = p_worksheet_id 
    AND ws.shared_with_user_id = p_user_id
    AND (ws.expires_at IS NULL OR ws.expires_at > NOW())
    AND (
      p_required_permission = 'read' OR
      (p_required_permission = 'submit' AND ws.permission_level IN ('submit', 'edit')) OR
      (p_required_permission = 'edit' AND ws.permission_level = 'edit')
    )
  ) INTO has_direct_share;
  
  IF has_direct_share THEN
    RETURN true;
  END IF;
  
  -- Check group shares (Fix: use public.worksheet_shares and public.group_members)
  SELECT EXISTS(
    SELECT 1 FROM public.worksheet_shares ws
    JOIN public.group_members gm ON ws.shared_with_group_id = gm.group_id
    WHERE ws.worksheet_id = p_worksheet_id 
    AND gm.user_id = p_user_id
    AND (ws.expires_at IS NULL OR ws.expires_at > NOW())
    AND (
      p_required_permission = 'read' OR
      (p_required_permission = 'submit' AND ws.permission_level IN ('submit', 'edit')) OR
      (p_required_permission = 'edit' AND ws.permission_level = 'edit')
    )
  ) INTO has_group_share;
  
  RETURN has_group_share;
END;
$$;