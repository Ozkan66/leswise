-- RLS Policy for worksheet_elements to allow access based on worksheet access.

-- 1. Drop existing select policies on worksheet_elements to avoid conflicts.
DROP POLICY IF EXISTS "Enable read access for users with worksheet access" ON public.worksheet_elements;
DROP POLICY IF EXISTS "Allow select for users with worksheet access" ON public.worksheet_elements;

-- 2. Create a policy for SELECT access on worksheet_elements.
-- This policy allows a user to see worksheet elements if they have access to the parent worksheet.
-- It leverages the existing RLS on the `worksheets` table.
-- A user can select an element if they can select the worksheet it belongs to.
CREATE POLICY "Allow select for users with worksheet access"
ON public.worksheet_elements
FOR SELECT
USING (
  (EXISTS (
    SELECT 1
    FROM public.worksheets w
    WHERE w.id = worksheet_elements.worksheet_id
  ))
);

-- 3. Ensure RLS is enabled on the table.
ALTER TABLE public.worksheet_elements ENABLE ROW LEVEL SECURITY;

-- 4. Grant SELECT permission to the 'authenticated' role.
-- This is crucial. Without this, authenticated users cannot even attempt to read,
-- and the RLS policy will never be evaluated for them.
GRANT SELECT ON public.worksheet_elements TO authenticated;
