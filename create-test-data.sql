-- Test data for worksheet sharing functionality
-- This SQL script creates test data to verify the sharing functionality

-- Insert a test worksheet owned by the teacher
INSERT INTO public.worksheets (id, title, description, owner_id, status, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'Test Werkblad - Rekenen',
  'Een test werkblad om de sharing functionaliteit te testen met eenvoudige rekensommen',
  '48b827f9-86f5-472c-a939-37c62a2b567a', -- teacher user ID
  'published',
  NOW(),
  NOW()
) 
RETURNING id;

-- Let's use a specific ID for easier testing
DELETE FROM public.worksheets WHERE title = 'Test Werkblad - Rekenen';

INSERT INTO public.worksheets (id, title, description, owner_id, status, created_at, updated_at)
VALUES (
  '550e8400-e29b-41d4-a716-446655440000', -- fixed UUID for testing
  'Test Werkblad - Rekenen',
  'Een test werkblad om de sharing functionaliteit te testen met eenvoudige rekensommen',
  '48b827f9-86f5-472c-a939-37c62a2b567a', -- teacher user ID
  'published',
  NOW(),
  NOW()
);

-- Insert worksheet elements (tasks)
INSERT INTO public.worksheet_elements (id, worksheet_id, type, content, position, max_score, created_at, updated_at)
VALUES 
(
  gen_random_uuid(),
  '550e8400-e29b-41d4-a716-446655440000',
  'multiple_choice',
  '{"question": "Wat is 2 + 3?", "options": ["4", "5", "6", "7"], "correct_answer": 1}',
  1,
  1,
  NOW(),
  NOW()
),
(
  gen_random_uuid(),
  '550e8400-e29b-41d4-a716-446655440000',
  'open_question',
  '{"question": "Leg uit hoe je 10 - 4 uitrekent.", "expected_answer": "10 - 4 = 6"}',
  2,
  2,
  NOW(),
  NOW()
);

-- Share the worksheet with the first student
INSERT INTO public.worksheet_shares (id, worksheet_id, shared_by_user_id, shared_with_user_id, permission_level, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  '550e8400-e29b-41d4-a716-446655440000',
  '48b827f9-86f5-472c-a939-37c62a2b567a', -- teacher user ID
  '2b009547-a392-49cc-a856-0636c0b0adce', -- student user ID (ozkanyilmaz66@gmail.com)
  'submit',
  NOW(),
  NOW()
);

-- Verify the data was inserted correctly
SELECT 
  w.id as worksheet_id,
  w.title,
  w.owner_id,
  ws.shared_with_user_id,
  up.email as student_email
FROM public.worksheets w
LEFT JOIN public.worksheet_shares ws ON w.id = ws.worksheet_id
LEFT JOIN public.user_profiles up ON ws.shared_with_user_id = up.user_id
WHERE w.title = 'Test Werkblad - Rekenen';
