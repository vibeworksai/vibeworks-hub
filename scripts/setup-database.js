#!/usr/bin/env node
/**
 * Automated database setup for VibeWorks Hub
 * Creates tables and inserts initial invite codes
 */

const { neon } = require('@neondatabase/serverless');
const fs = require('fs');

// Get DATABASE_URL from environment or Vercel
const DATABASE_URL = process.env.DATABASE_URL || 
  'postgresql://neondb_owner:FxVWnCPPnNXN@ep-round-mouse-a52t4p2k-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require';

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL not found');
  process.exit(1);
}

const sql = neon(DATABASE_URL);

async function setupDatabase() {
  console.log('🔧 Setting up VibeWorks Hub database...\n');

  try {
    // Create users table
    console.log('📋 Creating users table...');
    await sql`
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
      )
    `;
    console.log('✅ Users table created\n');

    // Create indexes
    console.log('📋 Creating indexes...');
    await sql`CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_users_invite ON users(invite_code)`;
    console.log('✅ User indexes created\n');

    // Create invites table
    console.log('📋 Creating invites table...');
    await sql`
      CREATE TABLE IF NOT EXISTS invites (
        code TEXT PRIMARY KEY,
        created_by TEXT REFERENCES users(id),
        used_by TEXT REFERENCES users(id),
        used_at TIMESTAMP,
        max_uses INTEGER DEFAULT 1,
        current_uses INTEGER DEFAULT 0,
        expires_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('✅ Invites table created\n');

    await sql`CREATE INDEX IF NOT EXISTS idx_invites_code ON invites(code)`;

    // Create personalized_advice table
    console.log('📋 Creating personalized_advice table...');
    await sql`
      CREATE TABLE IF NOT EXISTS personalized_advice (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
        advice_date DATE NOT NULL,
        advice_text TEXT NOT NULL,
        universal_day_number INTEGER,
        horoscope_text TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, advice_date)
      )
    `;
    console.log('✅ Personalized advice table created\n');

    await sql`CREATE INDEX IF NOT EXISTS idx_advice_user_date ON personalized_advice(user_id, advice_date)`;

    // Insert invite codes
    console.log('🎫 Creating invite codes...');
    const result = await sql`
      INSERT INTO invites (code, max_uses, expires_at) VALUES
        ('IVAN-VW-2026', 1, '2026-12-31 23:59:59'),
        ('NATASHA-VW-2026', 1, '2026-12-31 23:59:59')
      ON CONFLICT (code) DO NOTHING
      RETURNING code
    `;
    
    if (result.length > 0) {
      console.log('✅ Invite codes created:');
      result.forEach(row => console.log(`   - ${row.code}`));
    } else {
      console.log('ℹ️  Invite codes already exist');
    }

    console.log('\n✨ Database setup complete!\n');
    console.log('📊 Tables created:');
    console.log('   • users');
    console.log('   • invites');
    console.log('   • personalized_advice');
    console.log('\n🎫 Invite codes ready:');
    console.log('   • IVAN-VW-2026');
    console.log('   • NATASHA-VW-2026');
    console.log('\n🚀 Ready for authentication!\n');

  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    process.exit(1);
  }
}

setupDatabase();
