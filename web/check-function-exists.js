require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkFunctionExists() {
  try {
    console.log('Checking if check_and_increment_attempts function exists...');
    
    // Try to call the function with test parameters
    const { data, error } = await supabase.rpc('check_and_increment_attempts', {
      p_user_id: 'test-user-id',
      p_worksheet_id: 'test-worksheet-id',
      p_anonymous_link_id: null
    });
    
    if (error) {
      console.log('Function error:', error);
      if (error.message?.includes('function') && error.message?.includes('does not exist')) {
        console.log('❌ Function check_and_increment_attempts does NOT exist');
      } else {
        console.log('✅ Function exists but test call failed (expected for test data)');
      }
    } else {
      console.log('✅ Function exists and returned:', data);
    }
    
    // Also check the submissions table structure
    console.log('\nChecking submissions table structure...');
    const { data: tableInfo, error: tableError } = await supabase
      .from('submissions')
      .select('*')
      .limit(1);
      
    if (tableError) {
      console.log('Table error:', tableError);
    } else {
      console.log('✅ Submissions table accessible');
      if (tableInfo && tableInfo.length > 0) {
        console.log('Sample submission record keys:', Object.keys(tableInfo[0]));
      }
    }
    
    // Check if we can see any submissions
    console.log('\nChecking existing submissions...');
    const { data: allSubmissions, error: subError } = await supabase
      .from('submissions')
      .select('id, worksheet_id, user_id, created_at')
      .limit(5);
      
    if (subError) {
      console.log('Error fetching submissions:', subError);
    } else {
      console.log(`Found ${allSubmissions?.length || 0} submissions in database`);
      if (allSubmissions && allSubmissions.length > 0) {
        console.log('Sample submissions:', allSubmissions);
      }
    }
    
  } catch (err) {
    console.error('Error:', err);
  }
}

checkFunctionExists();
