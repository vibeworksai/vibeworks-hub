-- Phase 1: Auth & Onboarding Tables
-- Run this in Neon SQL Editor: https://console.neon.tech/app/projects/aged-meadow-42649454

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT,
  birth_date DATE NOT NULL,
  birth_time TIME,
  birth_place TEXT,
  birth_lat DECIMAL(9,6),
  birth_lng DECIMAL(9,6),
  life_path_number INTEGER NOT NULL,
  sun_sign TEXT NOT NULL,
  invite_code TEXT,
  invited_by TEXT,
  onboarding_complete BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_invite ON users(invite_code);

-- 2. Invites Table
CREATE TABLE IF NOT EXISTS invites (
  code TEXT PRIMARY KEY,
  created_by TEXT REFERENCES users(id),
  used_by TEXT REFERENCES users(id),
  used_at TIMESTAMP,
  max_uses INTEGER DEFAULT 1,
  current_uses INTEGER DEFAULT 0,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_invites_code ON invites(code);

-- 3. Personalized Advice Cache Table
CREATE TABLE IF NOT EXISTS personalized_advice (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  advice_date DATE NOT NULL,
  advice_text TEXT NOT NULL,
  universal_day_number INTEGER,
  horoscope_text TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, advice_date)
);

CREATE INDEX IF NOT EXISTS idx_advice_user_date ON personalized_advice(user_id, advice_date);

-- Initial invite codes for Ivan and Natasha
INSERT INTO invites (code, max_uses, expires_at) VALUES
  ('IVAN-VW-2026', 1, '2026-12-31 23:59:59'),
  ('NATASHA-VW-2026', 1, '2026-12-31 23:59:59');
