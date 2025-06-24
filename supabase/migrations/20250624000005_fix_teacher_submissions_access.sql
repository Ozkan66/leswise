-- Fix teacher access to submissions for shared worksheets
-- This allows teachers to view submissions for worksheets that are shared with them

-- Drop existing policy that only allows worksheet owners
DROP POLICY IF EXISTS "Worksheet owners can view submissions" ON public.submissions;

-- Create new policy that includes both owners and users with access
CREATE POLICY "Worksheet owners and shared users can view submissions" ON public.submissions
FOR SELECT USING (
  -- Original owner check
  worksheet_id IN (SELECT id FROM public.worksheets WHERE owner_id = auth.uid())
  OR
  -- Users with worksheet access check  
  user_has_worksheet_access(auth.uid(), worksheet_id, 'read'::permission_type)
);

-- Also update submission_elements policy
DROP POLICY IF EXISTS "Worksheet owners can view submission elements" ON public.submission_elements;

CREATE POLICY "Worksheet owners and shared users can view submission elements" ON public.submission_elements
FOR SELECT USING (
  submission_id IN (
    SELECT s.id FROM public.submissions s
    WHERE (
      -- Original owner check
      s.worksheet_id IN (SELECT id FROM public.worksheets WHERE owner_id = auth.uid())
      OR
      -- Users with worksheet access check
      user_has_worksheet_access(auth.uid(), s.worksheet_id, 'read'::permission_type)
    )
  )
);

-- Ensure authenticated users can read submissions they have access to
GRANT SELECT ON public.submissions TO authenticated;
GRANT SELECT ON public.submission_elements TO authenticated;
