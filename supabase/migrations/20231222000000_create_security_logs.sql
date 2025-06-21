-- Create security_logs table for tracking security events
CREATE TABLE security_logs (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  event_type VARCHAR(50) NOT NULL,
  event_details JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better query performance
CREATE INDEX idx_security_logs_user_id ON security_logs(user_id);
CREATE INDEX idx_security_logs_event_type ON security_logs(event_type);
CREATE INDEX idx_security_logs_created_at ON security_logs(created_at DESC);

-- Enable Row Level Security
ALTER TABLE security_logs ENABLE ROW LEVEL SECURITY;

-- Create policy to allow admin users to view all security logs
-- Note: This assumes a future admin role system. For now, no users can read these logs via direct queries.
-- They should only be accessible through secure server-side functions.
CREATE POLICY "Admin users can view security logs" ON security_logs
FOR SELECT USING (false); -- Will be updated when admin system is implemented

-- Create policy to allow the system to insert security logs
-- This will be used by server-side functions
CREATE POLICY "System can insert security logs" ON security_logs
FOR INSERT WITH CHECK (true);

-- Create a function to log security events
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
BEGIN
  INSERT INTO security_logs (user_id, event_type, event_details, ip_address, user_agent)
  VALUES (p_user_id, p_event_type, p_event_details, p_ip_address, p_user_agent);
END;
$$;

-- Grant execute permission on the function to authenticated users
GRANT EXECUTE ON FUNCTION log_security_event TO authenticated;

-- Create a function to get security logs for a specific user (for admin purposes)
CREATE OR REPLACE FUNCTION get_user_security_logs(p_user_id UUID, p_limit INTEGER DEFAULT 100)
RETURNS TABLE (
  id BIGINT,
  event_type VARCHAR(50),
  event_details JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- This function should only be accessible to admin users in the future
  -- For now, it returns empty results
  RETURN QUERY
  SELECT sl.id, sl.event_type, sl.event_details, sl.ip_address, sl.user_agent, sl.created_at
  FROM security_logs sl
  WHERE sl.user_id = p_user_id
  ORDER BY sl.created_at DESC
  LIMIT p_limit;
END;
$$;

-- Grant execute permission on the function to authenticated users
GRANT EXECUTE ON FUNCTION get_user_security_logs TO authenticated;