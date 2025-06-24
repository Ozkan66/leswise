const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testSharing() {
  console.log('Testing worksheet sharing functionality...');
  
  // First, let's check if we have any worksheets and users
  console.log('\n--- Checking worksheets ---');
  const { data: worksheets, error: wsError } = await supabase
    .from('worksheets')
    .select('id, title, owner_id')
    .limit(5);
  
  if (wsError) {
    console.error('Error fetching worksheets:', wsError.message);
    return;
  }
  
  console.log('Worksheets found:', worksheets?.length || 0);
  worksheets?.forEach(ws => console.log(`- ${ws.title} (ID: ${ws.id}, Owner: ${ws.owner_id})`));
  
  console.log('\n--- Checking user profiles ---');
  const { data: users, error: usersError } = await supabase
    .from('user_profiles')
    .select('user_id, email, role')
    .limit(5);
  
  if (usersError) {
    console.error('Error fetching users:', usersError.message);
    return;
  }
  
  console.log('Users found:', users?.length || 0);
  users?.forEach(user => console.log(`- ${user.email} (ID: ${user.user_id}, Role: ${user.role})`));
  
  console.log('\n--- Checking worksheet shares ---');
  const { data: shares, error: sharesError } = await supabase
    .from('worksheet_shares')
    .select('*')
    .limit(10);
  
  if (sharesError) {
    console.error('Error fetching shares:', sharesError.message);
    return;
  }
  
  console.log('Worksheet shares found:', shares?.length || 0);
  shares?.forEach(share => console.log(`- Worksheet ${share.worksheet_id} shared with user ${share.shared_with_user_id}`));
  
  // If we have worksheets and users, create a test share
  if (worksheets && worksheets.length > 0 && users && users.length >= 2) {
    const teacherUser = users.find(u => u.role === 'teacher');
    const studentUser = users.find(u => u.role === 'student');
    const worksheet = worksheets[0];
    
    if (teacherUser && studentUser && worksheet) {
      console.log('\n--- Creating test share ---');
      console.log(`Sharing worksheet "${worksheet.title}" with student ${studentUser.email}`);
      
      const { data: shareResult, error: shareError } = await supabase
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
      } else {
        console.log('Share created successfully:', shareResult.id);
        
        // Now test the student view
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
          console.log('Student can see shared worksheets:', studentShares?.length || 0);
          studentShares?.forEach(share => console.log(`- ${share.worksheets.title}`));
        }
      }
    } else {
      console.log('\n--- Need more test data ---');
      console.log('Teacher found:', !!teacherUser);
      console.log('Student found:', !!studentUser);
      console.log('Worksheet found:', !!worksheet);
    }
  }
}

testSharing().catch(console.error);
