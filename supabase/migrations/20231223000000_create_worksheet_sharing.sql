-- Epic 2.2: Worksheet Sharing & Access Control
-- Migration for worksheet sharing functionality

-- Create worksheet_shares table for tracking shared worksheets (US 2.2.1)
CREATE TABLE worksheet_shares (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  worksheet_id UUID REFERENCES worksheets(id) ON DELETE CASCADE NOT NULL,
  shared_by_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  shared_with_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  shared_with_group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  permission_level VARCHAR(20) DEFAULT 'read' CHECK (permission_level IN ('read', 'submit', 'edit')),
  max_attempts INTEGER DEFAULT NULL, -- NULL means unlimited attempts
  attempts_used INTEGER DEFAULT 0,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  -- Ensure either user or group is specified, not both
  CONSTRAINT worksheet_shares_target_check CHECK (
    (shared_with_user_id IS NOT NULL AND shared_with_group_id IS NULL) OR
    (shared_with_user_id IS NULL AND shared_with_group_id IS NOT NULL)
  )
);

-- Create anonymous_links table for anonymous sharing (US 2.2.2)
CREATE TABLE anonymous_links (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  worksheet_id UUID REFERENCES worksheets(id) ON DELETE CASCADE NOT NULL,
  created_by_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  link_code VARCHAR(32) UNIQUE NOT NULL, -- Unique code for the link
  max_attempts INTEGER DEFAULT NULL, -- NULL means unlimited
  attempts_used INTEGER DEFAULT 0,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create anonymous_submissions table to track anonymous submissions
CREATE TABLE anonymous_submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  anonymous_link_id UUID REFERENCES anonymous_links(id) ON DELETE CASCADE NOT NULL,
  worksheet_id UUID REFERENCES worksheets(id) ON DELETE CASCADE NOT NULL,
  participant_name VARCHAR(255), -- Optional name provided by anonymous user
  session_id VARCHAR(255), -- Browser session identifier
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX idx_worksheet_shares_worksheet_id ON worksheet_shares(worksheet_id);
CREATE INDEX idx_worksheet_shares_shared_with_user ON worksheet_shares(shared_with_user_id);
CREATE INDEX idx_worksheet_shares_shared_with_group ON worksheet_shares(shared_with_group_id);
CREATE INDEX idx_worksheet_shares_shared_by ON worksheet_shares(shared_by_user_id);

CREATE INDEX idx_anonymous_links_worksheet_id ON anonymous_links(worksheet_id);
CREATE INDEX idx_anonymous_links_link_code ON anonymous_links(link_code);
CREATE INDEX idx_anonymous_links_created_by ON anonymous_links(created_by_user_id);

CREATE INDEX idx_anonymous_submissions_link_id ON anonymous_submissions(anonymous_link_id);
CREATE INDEX idx_anonymous_submissions_worksheet_id ON anonymous_submissions(worksheet_id);

-- Enable Row Level Security
ALTER TABLE worksheet_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE anonymous_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE anonymous_submissions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for worksheet_shares
-- Users can see shares they created or shares directed to them
CREATE POLICY "Users can view relevant worksheet shares" ON worksheet_shares
FOR SELECT USING (
  auth.uid() = shared_by_user_id OR 
  auth.uid() = shared_with_user_id OR
  shared_with_group_id IN (
    SELECT group_id FROM group_members WHERE user_id = auth.uid()
  )
);

-- Only the worksheet owner can create shares
CREATE POLICY "Worksheet owners can create shares" ON worksheet_shares
FOR INSERT WITH CHECK (
  auth.uid() = shared_by_user_id AND
  worksheet_id IN (SELECT id FROM worksheets WHERE owner_id = auth.uid())
);

-- Only the creator can update/delete shares
CREATE POLICY "Share creators can modify shares" ON worksheet_shares
FOR UPDATE USING (auth.uid() = shared_by_user_id);

CREATE POLICY "Share creators can delete shares" ON worksheet_shares
FOR DELETE USING (auth.uid() = shared_by_user_id);

-- RLS Policies for anonymous_links
-- Users can see anonymous links they created
CREATE POLICY "Users can view their anonymous links" ON anonymous_links
FOR SELECT USING (auth.uid() = created_by_user_id);

-- Only worksheet owners can create anonymous links
CREATE POLICY "Worksheet owners can create anonymous links" ON anonymous_links
FOR INSERT WITH CHECK (
  auth.uid() = created_by_user_id AND
  worksheet_id IN (SELECT id FROM worksheets WHERE owner_id = auth.uid())
);

-- Only the creator can update/delete anonymous links
CREATE POLICY "Link creators can modify links" ON anonymous_links
FOR UPDATE USING (auth.uid() = created_by_user_id);

CREATE POLICY "Link creators can delete links" ON anonymous_links
FOR DELETE USING (auth.uid() = created_by_user_id);

-- RLS Policies for anonymous_submissions
-- Only worksheet owners can see anonymous submissions for their worksheets
CREATE POLICY "Worksheet owners can view anonymous submissions" ON anonymous_submissions
FOR SELECT USING (
  worksheet_id IN (SELECT id FROM worksheets WHERE owner_id = auth.uid())
);

-- Anonymous submissions can be inserted without authentication (handled by application logic)
CREATE POLICY "Allow anonymous submission inserts" ON anonymous_submissions
FOR INSERT WITH CHECK (true);

-- Helper functions for sharing functionality

-- Function to check if user has access to a worksheet
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
  -- Check if user is the worksheet owner
  SELECT EXISTS(
    SELECT 1 FROM worksheets 
    WHERE id = p_worksheet_id AND owner_id = p_user_id
  ) INTO is_owner;
  
  IF is_owner THEN
    RETURN true;
  END IF;
  
  -- Check direct user shares
  SELECT EXISTS(
    SELECT 1 FROM worksheet_shares ws
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
  
  -- Check group shares
  SELECT EXISTS(
    SELECT 1 FROM worksheet_shares ws
    JOIN group_members gm ON ws.shared_with_group_id = gm.group_id
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

-- Function to check and increment attempt count
CREATE OR REPLACE FUNCTION check_and_increment_attempts(
  p_user_id UUID,
  p_worksheet_id UUID,
  p_anonymous_link_id UUID DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  max_attempts_allowed INTEGER;
  current_attempts INTEGER;
BEGIN
  IF p_anonymous_link_id IS NOT NULL THEN
    -- Handle anonymous link attempts
    SELECT max_attempts, attempts_used INTO max_attempts_allowed, current_attempts
    FROM anonymous_links
    WHERE id = p_anonymous_link_id AND is_active = true;
    
    IF NOT FOUND THEN
      RETURN false;
    END IF;
    
    IF max_attempts_allowed IS NOT NULL AND current_attempts >= max_attempts_allowed THEN
      RETURN false;
    END IF;
    
    -- Increment attempt count
    UPDATE anonymous_links 
    SET attempts_used = attempts_used + 1, updated_at = NOW()
    WHERE id = p_anonymous_link_id;
    
  ELSE
    -- Handle user share attempts
    SELECT max_attempts, attempts_used INTO max_attempts_allowed, current_attempts
    FROM worksheet_shares
    WHERE worksheet_id = p_worksheet_id 
    AND (shared_with_user_id = p_user_id OR shared_with_group_id IN (
      SELECT group_id FROM group_members WHERE user_id = p_user_id
    ))
    ORDER BY max_attempts DESC NULLS LAST -- Prioritize higher limits
    LIMIT 1;
    
    IF max_attempts_allowed IS NOT NULL AND current_attempts >= max_attempts_allowed THEN
      RETURN false;
    END IF;
    
    -- Increment attempt count for user shares
    UPDATE worksheet_shares 
    SET attempts_used = attempts_used + 1, updated_at = NOW()
    WHERE worksheet_id = p_worksheet_id 
    AND (shared_with_user_id = p_user_id OR shared_with_group_id IN (
      SELECT group_id FROM group_members WHERE user_id = p_user_id
    ));
  END IF;
  
  RETURN true;
END;
$$;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION user_has_worksheet_access TO authenticated;
GRANT EXECUTE ON FUNCTION check_and_increment_attempts TO authenticated;
GRANT EXECUTE ON FUNCTION user_has_worksheet_access TO anon;
GRANT EXECUTE ON FUNCTION check_and_increment_attempts TO anon;

-- Create function to generate unique link codes
CREATE OR REPLACE FUNCTION generate_link_code()
RETURNS VARCHAR(32)
LANGUAGE plpgsql
AS $$
DECLARE
  code VARCHAR(32);
  exists_check BOOLEAN;
BEGIN
  LOOP
    -- Generate a random 32-character code
    code := encode(gen_random_bytes(16), 'hex');
    
    -- Check if it already exists
    SELECT EXISTS(SELECT 1 FROM anonymous_links WHERE link_code = code) INTO exists_check;
    
    -- If it doesn't exist, we can use it
    IF NOT exists_check THEN
      EXIT;
    END IF;
  END LOOP;
  
  RETURN code;
END;
$$;

GRANT EXECUTE ON FUNCTION generate_link_code TO authenticated;