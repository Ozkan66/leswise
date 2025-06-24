const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Test both anon and authenticated client
const anonClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function debugSharedWorksheets() {
  console.log('=== DEBUG SHARED WORKSHEETS QUERY ===');
  
  // Test manual insert to check if RLS is the problem
  console.log('\n=== TESTING MANUAL INSERT ===');
  
  const testShareData = {
    worksheet_id: '4e9b4263-9f20-4bdb-a719-967c3bbe2411',
    shared_by_user_id: '48b827f9-86f5-472c-a939-37c62a2b567a',
    shared_with_user_id: 'c3926739-1816-4109-b1c2-59f637ff026e',
    permission_level: 'submit',
    max_attempts: 3,
    expires_at: '2025-06-26T11:25:38.420Z'
  };
  
  console.log('Attempting to insert test share data...');
  const { data: insertResult, error: insertError } = await anonClient
    .from('worksheet_shares')
    .insert(testShareData)
    .select();
    
  if (insertError) {
    console.error('INSERT ERROR:', insertError);
    console.error('Error code:', insertError.code);
    console.error('Error message:', insertError.message);
    console.error('Error details:', insertError.details);
  } else {
    console.log('INSERT SUCCESS:', insertResult);
  }
  
  // 0. Check if there are ANY worksheet_shares in the database
  console.log('\n0. Check if worksheet_shares table has any data:');
  const { data: allSharesInDb, error: dbError } = await anonClient
    .from('worksheet_shares')
    .select('*')
    .limit(10);
    
  if (dbError) {
    console.error('Error accessing worksheet_shares:', dbError);
  } else {
    console.log('Total shares in database:', allSharesInDb?.length || 0);
    allSharesInDb?.forEach(share => {
      console.log(`- Share: ${share.id}, Worksheet: ${share.worksheet_id}, With: ${share.shared_with_user_id}, Permission: ${share.permission_level}`);
    });
  }
}

debugSharedWorksheets().catch(console.error);
