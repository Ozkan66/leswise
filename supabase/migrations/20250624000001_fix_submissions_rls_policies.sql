-- Fix submissions table RLS policies to allow students to submit worksheets
-- This ensures students can create submissions for worksheets they have access to

-- Drop existing policies first to avoid conflicts
DROP POLICY IF EXISTS "Users can create submissions" ON public.submissions;
DROP POLICY IF EXISTS "Users can view their own submissions" ON public.submissions;
DROP POLICY IF EXISTS "Worksheet owners can view submissions" ON public.submissions;
DROP POLICY IF EXISTS "Users can update their own submissions" ON public.submissions;

-- Recreate policies with proper permissions
CREATE POLICY "Users can create submissions" ON public.submissions
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own submissions" ON public.submissions
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Worksheet owners can view submissions" ON public.submissions
FOR SELECT USING (
  worksheet_id IN (SELECT id FROM public.worksheets WHERE owner_id = auth.uid())
);

CREATE POLICY "Users can update their own submissions" ON public.submissions
FOR UPDATE USING (auth.uid() = user_id);

-- Also ensure submission_elements policies are correct
DROP POLICY IF EXISTS "Users can create submission elements" ON public.submission_elements;
DROP POLICY IF EXISTS "Users can view their submission elements" ON public.submission_elements;
DROP POLICY IF EXISTS "Worksheet owners can view submission elements" ON public.submission_elements;

CREATE POLICY "Users can create submission elements" ON public.submission_elements
FOR INSERT WITH CHECK (
  submission_id IN (SELECT id FROM public.submissions WHERE user_id = auth.uid())
);

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

-- Grant necessary permissions to authenticated users
GRANT INSERT, SELECT, UPDATE ON public.submissions TO authenticated;
GRANT INSERT, SELECT ON public.submission_elements TO authenticated;
