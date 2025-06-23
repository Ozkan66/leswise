-- Create tasks table for worksheet tasks
-- This replaces the worksheet_elements table for task management

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

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
