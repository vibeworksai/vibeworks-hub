-- VibeWorks Hub Database Schema
-- Run this in your Supabase SQL editor

-- Projects Table
CREATE TABLE projects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('On Track', 'Caution', 'At Risk')),
  progress INTEGER NOT NULL CHECK (progress >= 0 AND progress <= 100),
  description TEXT,
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Deals Table (Pipeline)
CREATE TABLE deals (
  id TEXT PRIMARY KEY,
  company TEXT NOT NULL,
  contact TEXT NOT NULL,
  value INTEGER,
  stage TEXT NOT NULL CHECK (stage IN ('Lead', 'Qualified', 'Proposal Sent', 'Negotiation', 'Closed Won', 'Closed Lost')),
  last_contact TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Contacts Table
CREATE TABLE contacts (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  company TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  tags TEXT[],
  notes TEXT,
  deal_id TEXT REFERENCES deals(id),
  last_contact TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activity Feed Table
CREATE TABLE activity_feed (
  id SERIAL PRIMARY KEY,
  user_name TEXT NOT NULL,
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Ideas Table
CREATE TABLE ideas (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  created_by TEXT NOT NULL,
  priority INTEGER NOT NULL DEFAULT 999,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_deals_stage ON deals(stage);
CREATE INDEX idx_contacts_company ON contacts(company);
CREATE INDEX idx_activity_timestamp ON activity_feed(timestamp DESC);
CREATE INDEX idx_ideas_priority ON ideas(priority);

-- Row Level Security (RLS) - Optional, enable if needed
-- ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE activity_feed ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE ideas ENABLE ROW LEVEL SECURITY;

-- For now, allow public access (since you're using API keys)
-- In production, add proper RLS policies
