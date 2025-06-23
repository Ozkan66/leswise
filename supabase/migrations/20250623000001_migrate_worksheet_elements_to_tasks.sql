-- Migration: Move existing worksheet_elements to tasks table
-- Date: 2025-06-23
-- Purpose: Migrate existing worksheet content from worksheet_elements to new tasks table

-- Insert existing worksheet_elements into tasks table
INSERT INTO tasks (
    id,
    worksheet_id,
    title,
    task_type,
    order_index,
    content,
    created_at,
    updated_at
)
SELECT 
    id,
    worksheet_id,
    COALESCE(
        content->>'title',
        content->>'question', 
        CASE 
            WHEN type = 'text' THEN 'Information Block'
            WHEN type = 'formula' THEN 'Formula Task'
            WHEN type = 'video' THEN 'Video Content'
            WHEN type = 'pdf' THEN 'PDF Content'
            WHEN type = 'link' THEN 'Link Content'
            ELSE 'Untitled Task'
        END
    ) as title,
    CASE 
        WHEN type = 'text' THEN 'information'
        WHEN type = 'formula' THEN 'open-question'
        WHEN type = 'video' THEN 'information'
        WHEN type = 'pdf' THEN 'information'
        WHEN type = 'link' THEN 'information'
        -- Map specific question types if they exist in content
        WHEN content->>'type' = 'multiple_choice' THEN 'multiple-choice'
        WHEN content->>'type' = 'single_choice' THEN 'single-choice'
        WHEN content->>'type' = 'short_answer' THEN 'open-question'
        WHEN content->>'type' = 'essay' THEN 'open-question'
        WHEN content->>'type' = 'matching' THEN 'matching'
        WHEN content->>'type' = 'ordering' THEN 'ordering'
        WHEN content->>'type' = 'fill_gaps' THEN 'fill_gaps'
        ELSE 'information'
    END as task_type,
    COALESCE(position, 0) as order_index,
    content,
    created_at,
    COALESCE(updated_at, created_at)
FROM worksheet_elements
WHERE NOT EXISTS (
    SELECT 1 FROM tasks WHERE tasks.id = worksheet_elements.id
);

-- Update worksheet_elements table to avoid future conflicts (optional)
-- You can uncomment this if you want to rename the old table as backup
-- ALTER TABLE worksheet_elements RENAME TO worksheet_elements_backup;

-- Log the migration
DO $$
DECLARE 
    migrated_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO migrated_count FROM tasks WHERE created_at::date = CURRENT_DATE;
    RAISE NOTICE 'Migration completed. Migrated % worksheet elements to tasks.', migrated_count;
END $$;
