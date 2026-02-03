-- Add scheduled_time column to tasks table
-- This allows users to set a specific time for their tasks

ALTER TABLE tasks 
ADD COLUMN IF NOT EXISTS scheduled_time TIME;

-- Create index for sorting by scheduled time
CREATE INDEX IF NOT EXISTS idx_tasks_scheduled_time 
ON tasks(user_id, date, scheduled_time);

COMMENT ON COLUMN tasks.scheduled_time IS 'Optional time when the task should be done (HH:MM format)';
