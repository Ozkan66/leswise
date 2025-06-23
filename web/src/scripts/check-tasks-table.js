import { supabase } from '../utils/supabaseClient';

async function checkAndCreateTasksTable() {
  console.log('Checking if tasks table exists...');
  
  // Try to query the tasks table
  const { data, error } = await supabase
    .from('tasks')
    .select('id')
    .limit(1);
    
  if (error) {
    console.error('Tasks table does not exist or there\'s an error:', error.message);
    
    // If table doesn't exist, we'll need to create it manually in Supabase dashboard
    console.log('Please create the tasks table manually in your Supabase dashboard using this SQL:');
    console.log(`
-- Create tasks table for worksheet tasks
CREATE TABLE IF NOT EXISTS tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    worksheet_id UUID NOT NULL REFERENCES worksheets(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    task_type TEXT NOT NULL CHECK (task_type IN (
        'open-question', 
        'multiple-choice', 
        'information', 
        'text', 
        'single_choice', 
        'short_answer', 
        'essay', 
        'matching', 
        'ordering', 
        'fill_gaps'
    )),
    order_index INTEGER NOT NULL DEFAULT 0,
    content JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_tasks_worksheet_id ON tasks(worksheet_id);
CREATE INDEX IF NOT EXISTS idx_tasks_order ON tasks(worksheet_id, order_index);

-- Add RLS policies
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Users can only access tasks for worksheets they own
CREATE POLICY "Users can view their own worksheet tasks" ON tasks
    FOR SELECT USING (
        worksheet_id IN (
            SELECT id FROM worksheets WHERE owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert tasks to their own worksheets" ON tasks
    FOR INSERT WITH CHECK (
        worksheet_id IN (
            SELECT id FROM worksheets WHERE owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can update their own worksheet tasks" ON tasks
    FOR UPDATE USING (
        worksheet_id IN (
            SELECT id FROM worksheets WHERE owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete their own worksheet tasks" ON tasks
    FOR DELETE USING (
        worksheet_id IN (
            SELECT id FROM worksheets WHERE owner_id = auth.uid()
        )
    );
    `);
  } else {
    console.log('Tasks table exists! Found', data?.length || 0, 'tasks in the first query.');
  }
}

// Self-executing function
checkAndCreateTasksTable().catch(console.error);
