-- VibeWorks Hub - Task Management System (GTD)
-- Created: 2026-02-12
-- Purpose: APEX-level task management with Getting Things Done methodology

-- Tasks table (main task management)
CREATE TABLE IF NOT EXISTS tasks (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  
  -- GTD Fields
  context VARCHAR(50), -- @home, @office, @calls, @errands, @waiting, @someday, @quick, @deep
  project_id VARCHAR(255), -- Links to projects table (optional FK)
  deal_id VARCHAR(255), -- Links to deals table (optional)
  next_action BOOLEAN DEFAULT FALSE, -- Is this the immediate next action?
  
  -- Status & Priority
  status VARCHAR(50) DEFAULT 'inbox', -- inbox, next_actions, waiting, someday, completed
  priority VARCHAR(20), -- critical, high, medium, low
  energy_level VARCHAR(20), -- high, medium, low (energy required to do this)
  time_estimate INTEGER, -- estimated minutes
  
  -- Dates
  due_date TIMESTAMP,
  scheduled_date TIMESTAMP, -- when to start (different from due)
  completed_at TIMESTAMP,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by VARCHAR(255), -- 'ivan', 'farrah', 'fero', 'natasha', etc.
  
  -- Search & Organization
  tags TEXT[] -- flexible tagging system
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_tasks_user_status ON tasks(user_id, status);
CREATE INDEX IF NOT EXISTS idx_tasks_user_next ON tasks(user_id, next_action) WHERE next_action = TRUE;
CREATE INDEX IF NOT EXISTS idx_tasks_context ON tasks(context) WHERE context IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_tasks_due ON tasks(due_date) WHERE due_date IS NOT NULL AND status != 'completed';
CREATE INDEX IF NOT EXISTS idx_tasks_project ON tasks(project_id) WHERE project_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_tasks_deal ON tasks(deal_id) WHERE deal_id IS NOT NULL;

-- Task subtasks (breaking down complex tasks)
CREATE TABLE IF NOT EXISTS task_subtasks (
  id VARCHAR(255) PRIMARY KEY,
  task_id VARCHAR(255) NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  position INTEGER, -- order (0, 1, 2, ...)
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_task_subtasks_task ON task_subtasks(task_id);

-- Task notes/comments (agent updates, user notes)
CREATE TABLE IF NOT EXISTS task_notes (
  id VARCHAR(255) PRIMARY KEY,
  task_id VARCHAR(255) NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  user_id VARCHAR(255) NOT NULL REFERENCES users(id),
  note TEXT NOT NULL,
  created_by VARCHAR(255), -- 'ivan', 'farrah', 'fero'
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_task_notes_task ON task_notes(task_id);

-- Sample data for Ivan
INSERT INTO tasks (id, user_id, title, description, context, deal_id, status, priority, energy_level, time_estimate, due_date, created_by, created_at)
VALUES 
  ('task-' || FLOOR(EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT, 
   '640401e9-106a-488f-8585-86519c60fc99', 
   'Follow up with Supreme Financial on proposal',
   'Check if they received the $36K copy trading platform proposal. Be friendly, not pushy.',
   '@calls',
   'deal-1770931453990',
   'next_actions',
   'high',
   'low',
   10,
   NOW() + INTERVAL '1 day',
   'farrah',
   NOW()),
   
  ('task-' || (FLOOR(EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT + 1), 
   '640401e9-106a-488f-8585-86519c60fc99', 
   'Review and enhance VibeWorks Hub mystical recommendations',
   'Make the daily advice more actionable and less generic. Integrate with tasks.',
   '@office',
   NULL,
   'next_actions',
   'medium',
   'high',
   60,
   NOW() + INTERVAL '2 days',
   'ivan',
   NOW()),
   
  ('task-' || (FLOOR(EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT + 2), 
   '640401e9-106a-488f-8585-86519c60fc99', 
   'Send ALife Hospitality proposal details',
   'They asked for more information on AI solutions',
   '@computer',
   'deal-1770931837899',
   'inbox',
   'medium',
   'medium',
   30,
   NULL,
   'farrah',
   NOW());
