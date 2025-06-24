const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkDatabase() {
  console.log('=== CHECKING DATABASE STATUS ===');
  
  // Check worksheet_shares table
  console.log('\n1. All worksheet_shares in database:');
  const { data: allShares, error: allError } = await supabase
    .from('worksheet_shares')
    .select('*');
    
  if (allError) {
    console.error('Error:', allError);
  } else {
    console.log(`Found ${allShares?.length || 0} total shares`);
    allShares?.forEach(share => {
      console.log(`- Share: ${share.id}`);
      console.log(`  Worksheet: ${share.worksheet_id}`);
      console.log(`  Shared by: ${share.shared_by_user_id}`);
      console.log(`  Shared with: ${share.shared_with_user_id}`);
      console.log(`  Permission: ${share.permission_level}`);
      console.log('');
    });
  }
  
  // Check specific student
  const studentId = 'c3926739-1816-4109-b1c2-59f637ff026e';
  console.log(`\n2. Shares for student ${studentId}:`);
  const { data: studentShares, error: studentError } = await supabase
    .from('worksheet_shares')
    .select('*')
    .eq('shared_with_user_id', studentId);
    
  if (studentError) {
    console.error('Student shares error:', studentError);
  } else {
    console.log(`Found ${studentShares?.length || 0} shares for student`);
    studentShares?.forEach(share => console.log(`- ${share.id}: ${share.worksheet_id}`));
  }
  
  // Check worksheets table
  console.log('\n3. Recent worksheets:');
  const { data: worksheets, error: wsError } = await supabase
    .from('worksheets')
    .select('id, title, owner_id')
    .order('created_at', { ascending: false })
    .limit(5);
    
  if (wsError) {
    console.error('Worksheets error:', wsError);
  } else {
    console.log(`Found ${worksheets?.length || 0} recent worksheets`);
    worksheets?.forEach(ws => {
      console.log(`- ${ws.title} (${ws.id}) by ${ws.owner_id}`);
    });
  }
  
  // Test the exact JOIN query
  console.log('\n4. Testing JOIN query:');
  const { data: joinData, error: joinError } = await supabase
    .from('worksheet_shares')
    .select(`
      id,
      worksheet_id,
      permission_level,
      worksheets!inner (
        id,
        title,
        description,
        owner_id
      )
    `)
    .eq('shared_with_user_id', studentId);
    
  if (joinError) {
    console.error('JOIN error:', joinError);
  } else {
    console.log(`JOIN result: ${joinData?.length || 0} items`);
    joinData?.forEach(item => {
      console.log(`- Share ${item.id} → Worksheet: ${item.worksheets.title}`);
    });
  }
}

checkDatabase().catch(console.error);
