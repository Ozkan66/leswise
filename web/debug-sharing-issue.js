const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function debugSharing() {
  const studentUserId = 'c3926739-1816-4109-b1c2-59f637ff026e';
  
  console.log('=== DEBUGGING SHARING FOR STUDENT ===');
  console.log('Student User ID:', studentUserId);
  
  // 1. Check worksheet_shares table directly
  console.log('\n--- Checking worksheet_shares table ---');
  const { data: shares, error: sharesError } = await supabase
    .from('worksheet_shares')
    .select('*')
    .eq('shared_with_user_id', studentUserId);
  
  console.log('Shares found:', shares?.length || 0);
  console.log('Shares error:', sharesError);
  console.log('Shares data:', shares);
  
  // 2. Check the exact query from student-submissions
  console.log('\n--- Testing exact query from student-submissions ---');
  const { data: sharedWorksheetsData, error: sharedError } = await supabase
    .from("worksheet_shares")
    .select(`
      worksheets!inner (
        id,
        title,
        description,
        owner_id
      )
    `)
    .eq("shared_with_user_id", studentUserId)
    .eq("permission_level", "submit");
  
  console.log('Shared worksheets found:', sharedWorksheetsData?.length || 0);
  console.log('Shared worksheets error:', sharedError);
  console.log('Shared worksheets data:', sharedWorksheetsData);
  
  // 3. Try without permission_level filter
  console.log('\n--- Testing query without permission_level filter ---');
  const { data: allSharedWorksheetsData, error: allSharedError } = await supabase
    .from("worksheet_shares")
    .select(`
      worksheets!inner (
        id,
        title,
        description,
        owner_id
      )
    `)
    .eq("shared_with_user_id", studentUserId);
  
  console.log('All shared worksheets found:', allSharedWorksheetsData?.length || 0);
  console.log('All shared worksheets error:', allSharedError);
  console.log('All shared worksheets data:', allSharedWorksheetsData);
  
  // 4. Check all worksheet_shares to see what's there
  console.log('\n--- Checking all worksheet_shares ---');
  const { data: allShares, error: allSharesError } = await supabase
    .from('worksheet_shares')
    .select('*');
  
  console.log('Total shares in database:', allShares?.length || 0);
  console.log('All shares error:', allSharesError);
  allShares?.forEach((share, i) => {
    console.log(`Share ${i + 1}:`, {
      id: share.id,
      worksheet_id: share.worksheet_id,
      shared_with_user_id: share.shared_with_user_id,
      permission_level: share.permission_level
    });
  });
}

debugSharing().catch(console.error);
