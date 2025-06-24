const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function debugJoinQuery() {
  console.log('=== DEBUG JOIN QUERY ===');
  
  const studentUserId = 'c3926739-1816-4109-b1c2-59f637ff026e';
  console.log('Looking for student:', studentUserId);
  
  // 0. Check ALL worksheet_shares (what RLS allows us to see)
  console.log('\n0. All worksheet_shares visible to anon user:');
  const { data: allShares, error: allError } = await supabase
    .from('worksheet_shares')
    .select('*')
    .limit(10);
    
  if (allError) {
    console.error('All shares error:', allError);
  } else {
    console.log('All shares visible:', allShares?.length || 0);
    allShares?.forEach(share => {
      console.log(`- Share ID: ${share.id}`);
      console.log(`- Worksheet: ${share.worksheet_id}`);
      console.log(`- With User: ${share.shared_with_user_id}`);
      console.log(`- By User: ${share.shared_by_user_id}`);
      console.log(`- Permission: ${share.permission_level}`);
      console.log(`- Match: ${share.shared_with_user_id === studentUserId ? 'YES' : 'NO'}`);
      console.log('---');
    });
  }
  
  // 2. Check if worksheets exist
  if (rawShares && rawShares.length > 0) {
    console.log('\n2. Check if worksheets exist:');
    for (const share of rawShares) {
      const { data: worksheet, error: wsError } = await supabase
        .from('worksheets')
        .select('id, title, description, owner_id')
        .eq('id', share.worksheet_id);
        
      if (wsError) {
        console.error(`Worksheet ${share.worksheet_id} error:`, wsError);
      } else if (!worksheet || worksheet.length === 0) {
        console.log(`Worksheet ${share.worksheet_id} NOT FOUND`);
      } else {
        console.log(`Worksheet found: ${worksheet[0].title} (${worksheet[0].id})`);
      }
    }
  }
  
  // 3. Test the problematic JOIN query
  console.log('\n3. Test the current JOIN query:');
  const { data: joinResult, error: joinError } = await supabase
    .from('worksheet_shares')
    .select(`
      worksheets!inner (
        id,
        title,
        description,
        owner_id
      )
    `)
    .eq('shared_with_user_id', studentUserId)
    .eq('permission_level', 'submit');
    
  if (joinError) {
    console.error('JOIN error:', joinError);
  } else {
    console.log('JOIN result count:', joinResult?.length || 0);
    joinResult?.forEach((item, index) => {
      console.log(`JOIN ${index + 1}:`, item);
    });
  }
  
  // 4. Test JOIN without permission filter
  console.log('\n4. Test JOIN without permission filter:');
  const { data: joinNoPermResult, error: joinNoPermError } = await supabase
    .from('worksheet_shares')
    .select(`
      worksheets!inner (
        id,
        title,
        description,
        owner_id
      )
    `)
    .eq('shared_with_user_id', studentUserId);
    
  if (joinNoPermError) {
    console.error('JOIN no perm error:', joinNoPermError);
  } else {
    console.log('JOIN no perm result count:', joinNoPermResult?.length || 0);
    joinNoPermResult?.forEach((item, index) => {
      console.log(`JOIN no perm ${index + 1}:`, item);
    });
  }
}

debugJoinQuery().catch(console.error);
