-- Grant necessary permissions for anonymous worksheet submission view
-- This allows the anon role to read specific columns required to display a worksheet
-- from an anonymous link.

-- The RLS policy "Allow anon read access to worksheet_elements via anonymous_links"
-- should already be in place to restrict row-level access. This migration
-- adds the necessary column-level permissions which RLS does not handle.

GRANT SELECT (id, worksheet_id, content, position, max_score)
ON public.worksheet_elements
TO anon;

-- The RLS policy on `worksheets` should prevent unauthorized listing, but we need
-- to grant column-level access so the join from `anonymous_links` can succeed
-- to fetch the worksheet title.
GRANT SELECT (id, title)
ON public.worksheets
TO anon;
