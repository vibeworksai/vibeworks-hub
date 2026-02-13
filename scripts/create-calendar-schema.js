#!/usr/bin/env node

/**
 * Create Calendar Schema in Neon Postgres
 * Run: node scripts/create-calendar-schema.js
 */

const { Pool, neonConfig } = require('@neondatabase/serverless');
const ws = require('ws');
const fs = require('fs');
const path = require('path');

neonConfig.webSocketConstructor = ws;

// Load DATABASE_URL from .env.production
function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env.production');
  if (fs.existsSync(envPath)) {
    const envFile = fs.readFileSync(envPath, 'utf-8');
    envFile.split('\n').forEach(line => {
      const match = line.match(/^([^=]+)=(.*)$/);
      if (match) {
        const [, key, value] = match;
        process.env[key] = value.replace(/^["']|["']$/g, '');
      }
    });
  }
}

loadEnv();

async function createCalendarSchema() {
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.error('❌ DATABASE_URL environment variable not set');
    process.exit(1);
  }

  console.log('🗄️  Creating calendar schema in Neon Postgres...\n');

  const pool = new Pool({ connectionString: databaseUrl });

  try {
    // Read the schema file
    const schemaPath = path.join(__dirname, '..', 'schema-calendar.sql');
    const schemaSQL = fs.readFileSync(schemaPath, 'utf-8');

    // Execute the schema
    console.log('📝 Executing calendar schema SQL...');
    await pool.query(schemaSQL);

    console.log('✅ Calendar schema created successfully!\n');

    // Verify tables created
    console.log('🔍 Verifying calendar tables...');
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND table_name IN ('calendar_events', 'calendar_sync_state', 'calendar_views', 'calendar_event_notes')
      ORDER BY table_name
    `);

    console.log('\n📊 Calendar Tables Created:');
    tablesResult.rows.forEach(t => console.log(`  ✅ ${t.table_name}`));

    // Count indexes
    const indexesResult = await pool.query(`
      SELECT indexname 
      FROM pg_indexes 
      WHERE schemaname = 'public' 
        AND tablename IN ('calendar_events', 'calendar_sync_state', 'calendar_views', 'calendar_event_notes')
    `);

    console.log(`\n📌 Indexes Created: ${indexesResult.rows.length}`);
    
    console.log('\n🎉 Calendar schema setup complete!');

    await pool.end();

  } catch (error) {
    console.error('❌ Error creating calendar schema:', error);
    await pool.end();
    process.exit(1);
  }
}

createCalendarSchema();
