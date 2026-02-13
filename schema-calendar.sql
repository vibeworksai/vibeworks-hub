-- VibeWorks Hub - Calendar Schema
-- Full calendar integration with task/deal/mystical timing

-- Calendar Events Table
CREATE TABLE IF NOT EXISTS calendar_events (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Event Details
  title VARCHAR(255) NOT NULL,
  description TEXT,
  location VARCHAR(500),
  
  -- Timing
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  all_day BOOLEAN DEFAULT FALSE,
  timezone VARCHAR(100) DEFAULT 'America/New_York',
  
  -- Recurrence
  recurrence_rule TEXT, -- RRULE format (e.g., "FREQ=WEEKLY;BYDAY=MO,WE,FR")
  recurrence_exception_dates TEXT[], -- Array of ISO dates to skip
  
  -- Relationships
  task_id TEXT REFERENCES tasks(id) ON DELETE SET NULL,
  deal_id TEXT REFERENCES deals(id) ON DELETE SET NULL,
  project_id TEXT REFERENCES projects(id) ON DELETE SET NULL,
  
  -- Categorization
  event_type VARCHAR(50) DEFAULT 'event', -- event, task, deal_milestone, mystical_timing
  category VARCHAR(100), -- meeting, call, work_block, personal, etc.
  
  -- Participants
  attendees JSONB, -- Array of {name, email, status} objects
  
  -- Reminders
  reminders INTEGER[], -- Minutes before event [15, 60, 1440]
  
  -- External Integration
  google_event_id VARCHAR(255),
  external_calendar_id VARCHAR(255),
  
  -- Mystical Overlay
  mystical_significance TEXT, -- "Good day for decisions", "Avoid major launches", etc.
  moon_phase VARCHAR(50),
  universal_day INTEGER,
  
  -- Status
  status VARCHAR(50) DEFAULT 'confirmed', -- tentative, confirmed, cancelled
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by VARCHAR(100), -- 'user', 'farrah', 'fero', 'system'
  
  -- Constraints
  CONSTRAINT valid_time_range CHECK (end_time > start_time)
);

-- Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_calendar_events_user_id ON calendar_events(user_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_start_time ON calendar_events(start_time);
CREATE INDEX IF NOT EXISTS idx_calendar_events_end_time ON calendar_events(end_time);
CREATE INDEX IF NOT EXISTS idx_calendar_events_task_id ON calendar_events(task_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_deal_id ON calendar_events(deal_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_project_id ON calendar_events(project_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_event_type ON calendar_events(event_type);
CREATE INDEX IF NOT EXISTS idx_calendar_events_status ON calendar_events(status);

-- Composite index for date range queries
CREATE INDEX IF NOT EXISTS idx_calendar_events_user_date_range 
  ON calendar_events(user_id, start_time, end_time);

-- Google Calendar Sync State
CREATE TABLE IF NOT EXISTS calendar_sync_state (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Google OAuth
  google_access_token TEXT,
  google_refresh_token TEXT,
  google_token_expiry TIMESTAMP WITH TIME ZONE,
  
  -- Sync Settings
  enabled BOOLEAN DEFAULT FALSE,
  sync_direction VARCHAR(50) DEFAULT 'both', -- pull, push, both
  default_calendar_id VARCHAR(255),
  
  -- Sync Status
  last_sync_at TIMESTAMP WITH TIME ZONE,
  last_sync_status VARCHAR(50), -- success, error, partial
  last_sync_error TEXT,
  sync_token VARCHAR(500), -- For incremental sync
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id)
);

-- Calendar Views (Custom calendar groupings)
CREATE TABLE IF NOT EXISTS calendar_views (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  name VARCHAR(100) NOT NULL,
  description TEXT,
  
  -- View Configuration
  color VARCHAR(7), -- Hex color
  visible BOOLEAN DEFAULT TRUE,
  
  -- Filters
  event_types VARCHAR(50)[],
  categories VARCHAR(100)[],
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Comments & Notes on Events
CREATE TABLE IF NOT EXISTS calendar_event_notes (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  event_id TEXT NOT NULL REFERENCES calendar_events(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  content TEXT NOT NULL,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_calendar_event_notes_event_id ON calendar_event_notes(event_id);

-- Update trigger for calendar_events
CREATE OR REPLACE FUNCTION update_calendar_events_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER calendar_events_updated_at
BEFORE UPDATE ON calendar_events
FOR EACH ROW
EXECUTE FUNCTION update_calendar_events_updated_at();
