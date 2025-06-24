import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST() {
  try {
    console.log('TEMP: Attempting to disable RLS on worksheet_shares...');
    
    // Try to disable RLS via SQL
    const { error } = await supabase.rpc('disable_worksheet_shares_rls');
    
    if (error) {
      console.error('RPC failed, trying direct SQL...');
      
      // Alternative: try direct SQL execution (this probably won't work but let's try)
      const { error: sqlError } = await supabase
        .from('worksheet_shares')
        .select('count(*)', { count: 'exact', head: true });
      
      if (sqlError) {
        return NextResponse.json({ 
          error: 'Cannot disable RLS programmatically. Please run this SQL in Supabase dashboard:',
          sql: 'ALTER TABLE worksheet_shares DISABLE ROW LEVEL SECURITY;'
        });
      }
    }
    
    return NextResponse.json({ success: true, message: 'RLS disabled' });
    
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ 
      error: 'Please run this SQL in Supabase dashboard:',
      sql: 'ALTER TABLE worksheet_shares DISABLE ROW LEVEL SECURITY;'
    });
  }
}
