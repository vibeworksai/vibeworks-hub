#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

// Read DATABASE_URL from .env.vercel
const envVercelPath = path.join(__dirname, '..', '.env.vercel');
if (fs.existsSync(envVercelPath)) {
  const envContent = fs.readFileSync(envVercelPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.+)$/);
    if (match) {
      const key = match[1].trim();
      let value = match[2].trim();
      if ((value.startsWith('"') && value.endsWith('"')) || 
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  });
}

const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.DATABASE_URL);

(async () => {
  try {
    const users = await sql`SELECT id, username, email FROM users ORDER BY created_at`;
    console.log('Users in database:');
    users.forEach(u => console.log(`  - ID: ${u.id}, Username: ${u.username}, Email: ${u.email}`));
  } catch (err) {
    console.error('Error:', err.message);
  }
})();
