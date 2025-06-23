// Quick script to check worksheet_elements table
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkData() {
  console.log('Checking worksheet_elements table...');
  
  // Check worksheet_elements
  const { data: elementsData, error: elementsError } = await supabase
    .from('worksheet_elements')
    .select('*')
    .limit(10);
    
  if (elementsError) {
    console.error('Error fetching worksheet_elements:', elementsError);
  } else {
    console.log(`Found ${elementsData?.length || 0} worksheet elements`);
    if (elementsData && elementsData.length > 0) {
      console.log('Sample element:', elementsData[0]);
    }
  }
  
  // Check tasks table
  const { data: tasksData, error: tasksError } = await supabase
    .from('tasks')
    .select('*')
    .limit(10);
    
  if (tasksError) {
    console.error('Error fetching tasks:', tasksError);
  } else {
    console.log(`Found ${tasksData?.length || 0} tasks`);
    if (tasksData && tasksData.length > 0) {
      console.log('Sample task:', tasksData[0]);
    }
  }
  
  // Check worksheets
  const { data: worksheetsData, error: worksheetsError } = await supabase
    .from('worksheets')
    .select('id, title')
    .limit(5);
    
  if (worksheetsError) {
    console.error('Error fetching worksheets:', worksheetsError);
  } else {
    console.log(`Found ${worksheetsData?.length || 0} worksheets`);
    worksheetsData?.forEach(w => console.log(`- ${w.title} (${w.id})`));
  }
}

checkData().catch(console.error);
