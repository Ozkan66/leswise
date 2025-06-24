-- RLS Policy for worksheets to allow access based on ownership or shares.

-- 1. Drop existing select policies on worksheets to avoid conflicts or outdated rules.
-- It's safer to drop and recreate than to alter.
DROP POLICY IF EXISTS "Enable read access for owner" ON public.worksheets;
DROP POLICY IF EXISTS "Enable read access for shared users" ON public.worksheets;
DROP POLICY IF EXISTS "Allow select for users with a valid share" ON public.worksheets;
DROP POLICY IF EXISTS "Allow select for owners and shared users" ON public.worksheets;

-- 2. Create a comprehensive policy for SELECT access.
-- This policy allows a user to see a worksheet if:
-- a) They are the owner of the worksheet.
-- b) The worksheet has been directly shared with them.
-- c) The worksheet has been shared with a group they are an active member of.
CREATE POLICY "Allow select for owners and shared users" 
ON public.worksheets
FOR SELECT
USING (
  (auth.uid() = owner_id) 
  OR 
  (EXISTS (
    SELECT 1
    FROM public.worksheet_shares ws
    WHERE ws.worksheet_id = worksheets.id AND ws.shared_with_user_id = auth.uid()
  ))
  OR
  (EXISTS (
    SELECT 1
    FROM public.worksheet_shares ws
    JOIN public.group_members gm ON ws.shared_with_group_id = gm.group_id
    WHERE ws.worksheet_id = worksheets.id AND gm.user_id = auth.uid() AND gm.status = 'active'
  ))
);

-- 3. Ensure RLS is enabled on the table. 
-- This command is idempotent, so it's safe to run even if it's already enabled.
ALTER TABLE public.worksheets ENABLE ROW LEVEL SECURITY;

-- 4. Grant SELECT permission to the 'authenticated' role.
-- RLS policies are an additional filter on top of table-level grants.
-- Without this, no authenticated user could select from the table, regardless of RLS.
GRANT SELECT ON public.worksheets TO authenticated;
