const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function createTestData() {
  console.log('Creating test data for sharing functionality...');
  
  // Get teacher and student users
  const { data: users, error: usersError } = await supabase
    .from('user_profiles')
    .select('user_id, email, role');
  
  if (usersError) {
    console.error('Error fetching users:', usersError.message);
    return;
  }
  
  const teacherUser = users.find(u => u.role === 'teacher');
  const studentUser = users.find(u => u.role === 'student');
  
  if (!teacherUser || !studentUser) {
    console.error('Need both teacher and student users');
    return;
  }
  
  console.log(`Teacher: ${teacherUser.email}`);
  console.log(`Student: ${studentUser.email}`);
  
  // Create a test worksheet
  console.log('\n--- Creating test worksheet ---');
  const { data: worksheet, error: worksheetError } = await supabase
    .from('worksheets')
    .insert({
      title: 'Test Werkblad voor Delen',
      description: 'Dit is een test werkblad om de sharing functionaliteit te testen',
      owner_id: teacherUser.user_id,
      status: 'published'
    })
    .select()
    .single();
  
  if (worksheetError) {
    console.error('Error creating worksheet:', worksheetError.message);
    return;
  }
  
  console.log(`Created worksheet: "${worksheet.title}" (ID: ${worksheet.id})`);
  
  // Create some worksheet elements (tasks)
  console.log('\n--- Creating worksheet elements ---');
  const elements = [
    {
      worksheet_id: worksheet.id,
      type: 'question',
      content: {
        question: 'Wat is 2 + 2?',
        correct_answer: '4'
      },
      position: 1
    },
    {
      worksheet_id: worksheet.id,
      type: 'question',
      content: {
        question: 'Wat is de hoofdstad van Nederland?',
        correct_answer: 'Amsterdam'
      },
      position: 2
    }
  ];
  
  const { data: elementsResult, error: elementsError } = await supabase
    .from('worksheet_elements')
    .insert(elements)
    .select();
  
  if (elementsError) {
    console.error('Error creating elements:', elementsError.message);
    return;
  }
  
  console.log(`Created ${elementsResult.length} worksheet elements`);
  
  // Share the worksheet with the student
  console.log('\n--- Sharing worksheet with student ---');
  const { data: share, error: shareError } = await supabase
    .from('worksheet_shares')
    .insert({
      worksheet_id: worksheet.id,
      shared_by_user_id: teacherUser.user_id,
      shared_with_user_id: studentUser.user_id,
      permission_level: 'submit'
    })
    .select()
    .single();
  
  if (shareError) {
    console.error('Error creating share:', shareError.message);
    return;
  }
  
  console.log(`Shared worksheet with student (Share ID: ${share.id})`);
  
  // Test the student view
  console.log('\n--- Testing student view ---');
  const { data: studentShares, error: studentError } = await supabase
    .from('worksheet_shares')
    .select(`
      worksheets!inner (
        id,
        title,
        description,
        owner_id
      )
    `)
    .eq('shared_with_user_id', studentUser.user_id)
    .eq('permission_level', 'submit');
  
  if (studentError) {
    console.error('Error fetching student shares:', studentError.message);
  } else {
    console.log(`Student can see ${studentShares?.length || 0} shared worksheets:`);
    studentShares?.forEach(share => console.log(`- ${share.worksheets.title}`));
  }
  
  console.log('\n✅ Test data created successfully!');
  console.log('Now the student should be able to see the shared worksheet in the app.');
}

createTestData().catch(console.error);
