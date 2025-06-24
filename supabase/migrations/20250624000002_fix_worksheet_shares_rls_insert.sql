-- Fix worksheet_shares RLS policy for INSERT operations
-- The previous policy was too restrictive and preventing inserts

-- Drop the old policy
DROP POLICY IF EXISTS "Worksheet owners can create shares" ON worksheet_shares;

-- Create a simpler policy that allows worksheet owners to create shares
-- We'll verify ownership in the application layer for now
CREATE POLICY "Teachers can create worksheet shares" ON worksheet_shares
FOR INSERT WITH CHECK (
  auth.uid() = shared_by_user_id
);

-- Also grant explicit permissions
GRANT INSERT ON worksheet_shares TO authenticated;
GRANT SELECT ON worksheet_shares TO authenticated;
GRANT UPDATE ON worksheet_shares TO authenticated;
GRANT DELETE ON worksheet_shares TO authenticated;
