-- Check if the check_and_increment_attempts function exists in the database
-- Run this query in your Supabase SQL editor or pgAdmin

SELECT 
  routine_name,
  routine_type,
  routine_definition
FROM information_schema.routines 
WHERE routine_name = 'check_and_increment_attempts'
  AND routine_schema = 'public';

-- Also check function permissions
SELECT 
  f.proname as function_name,
  r.rolname as role_name,
  p.privilege_type
FROM pg_proc f
JOIN pg_namespace n ON f.pronamespace = n.oid
LEFT JOIN information_schema.routine_privileges p ON f.proname = p.routine_name
LEFT JOIN pg_roles r ON p.grantee = r.rolname
WHERE f.proname = 'check_and_increment_attempts'
  AND n.nspname = 'public';

-- Check if function can be called
SELECT check_and_increment_attempts(
  '00000000-0000-0000-0000-000000000000'::UUID,
  '00000000-0000-0000-0000-000000000000'::UUID,
  NULL::UUID
);
