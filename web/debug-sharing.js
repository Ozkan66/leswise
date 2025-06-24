const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function debugSharing() {
  console.log('=== DEBUGGING WORKSHEET SHARING ===');
  
  // Check all worksheet shares
  console.log('\n1. All worksheet shares in database:');
  const { data: allShares, error: sharesError } = await supabase
    .from('worksheet_shares')
    .select('*');
  
  if (sharesError) {
    console.error('Error fetching shares:', sharesError.message);
  } else {
    console.log('Total shares:', allShares?.length || 0);
    allShares?.forEach(share => {
      console.log(`- Worksheet: ${share.worksheet_id}`);
      console.log(`  Shared with user: ${share.shared_with_user_id}`);
      console.log(`  Permission: ${share.permission_level}`);
      console.log(`  Created: ${share.created_at}`);
      console.log('');
    });
  }
  
  // Check all users
  console.log('\n2. All users with role "student":');
  const { data: students, error: studentsError } = await supabase
    .from('user_profiles')
    .select('user_id, email, role')
    .eq('role', 'student');
  
  if (studentsError) {
    console.error('Error fetching students:', studentsError.message);
  } else {
    console.log('Total students:', students?.length || 0);
    students?.forEach(student => {
      console.log(`- ${student.email} (ID: ${student.user_id})`);
    });
  }
  
  // Test the exact query from student-submissions
  const currentStudentId = 'c3926739-1816-4109-b1c2-59f637ff026e';
  console.log(`\n3. Testing query for current student (${currentStudentId}):`);
  
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
    .eq('shared_with_user_id', currentStudentId)
    .eq('permission_level', 'submit');
  
  if (studentError) {
    console.error('Error with student query:', studentError.message);
  } else {
    console.log('Student shares found:', studentShares?.length || 0);
    studentShares?.forEach(share => {
      console.log(`- ${share.worksheets.title} (${share.worksheets.id})`);
    });
  }
}

debugSharing().catch(console.error);
