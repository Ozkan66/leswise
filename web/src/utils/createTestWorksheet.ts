// Quick test to create a worksheet and share it
// This will be used to test the sharing functionality

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function createTestWorksheet() {
  // This should be called from the teacher's session
  console.log('Creating test worksheet for sharing...');

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('Not authenticated');
  }

  // Create worksheet
  const { data: worksheet, error: worksheetError } = await supabase
    .from('worksheets')
    .insert({
      title: 'Test Werkblad voor Studenten',
      description: 'Een test werkblad om de sharing functionaliteit te testen',
      owner_id: user.id,
      status: 'published'
    })
    .select()
    .single();

  if (worksheetError) {
    throw new Error(`Error creating worksheet: ${worksheetError.message}`);
  }

  console.log('Created worksheet:', worksheet.id);

  // Create some tasks
  const tasks = [
    {
      worksheet_id: worksheet.id,
      task_type: 'multiple-choice',
      title: 'Wat is 5 + 3?',
      content: {
        question: 'Wat is 5 + 3?',
        options: ['6', '7', '8', '9'],
        correctAnswers: [2], // index of correct answer
        points: 1,
        allowMultiple: false
      },
      order_index: 1
    },
    {
      worksheet_id: worksheet.id,
      task_type: 'open-question',
      title: 'Beschrijf in één zin wat je van wiskunde vindt.',
      content: {
        question: 'Beschrijf in één zin wat je van wiskunde vindt.',
        expected_answer: 'Persoonlijke mening over wiskunde',
        points: 2
      },
      order_index: 2
    }
  ];

  const { data: elements, error: elementsError } = await supabase
    .from('tasks')
    .insert(tasks)
    .select();

  if (elementsError) {
    throw new Error(`Error creating elements: ${elementsError.message}`);
  }

  console.log('Created elements:', elements.length);

  // Get a student to share with
  const { data: students, error: studentsError } = await supabase
    .from('user_profiles')
    .select('user_id, email')
    .eq('role', 'student')
    .limit(1);

  if (studentsError || !students?.length) {
    console.log('No students found to share with');
    return { worksheet, elements };
  }

  const student = students[0];

  // Share with student
  const { data: share, error: shareError } = await supabase
    .from('worksheet_shares')
    .insert({
      worksheet_id: worksheet.id,
      shared_by_user_id: user.id,
      shared_with_user_id: student.user_id,
      permission_level: 'submit'
    })
    .select()
    .single();

  if (shareError) {
    throw new Error(`Error sharing worksheet: ${shareError.message}`);
  }

  console.log(`Shared with student ${student.email}`);

  return { worksheet, elements, share };
}
