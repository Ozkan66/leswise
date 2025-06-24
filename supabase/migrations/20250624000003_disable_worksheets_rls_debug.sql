-- Temporarily disable RLS on worksheets table for debugging shared worksheets visibility
-- This will help us determine if the issue is with RLS policies or missing data

-- Disable RLS on worksheets table
ALTER TABLE worksheets DISABLE ROW LEVEL SECURITY;

-- Grant explicit SELECT permission for anonymous users on worksheets
GRANT SELECT ON worksheets TO anon;
GRANT SELECT ON worksheets TO authenticated;

-- Also ensure that the worksheets can be accessed via the foreign key relationship
-- Grant usage on the worksheets sequence if it exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.sequences WHERE sequence_name = 'worksheets_id_seq') THEN
        GRANT USAGE ON SEQUENCE worksheets_id_seq TO anon;
        GRANT USAGE ON SEQUENCE worksheets_id_seq TO authenticated;
    END IF;
END $$;

-- Log the current state
DO $$
BEGIN
    RAISE NOTICE 'RLS disabled on worksheets table for debugging purposes';
    RAISE NOTICE 'This should allow anonymous access to all worksheets';
END $$;
