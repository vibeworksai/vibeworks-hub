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
    const deals = await sql`SELECT * FROM deals ORDER BY created_at LIMIT 10`;
    console.log('Deals in database:');
    deals.forEach(d => {
      console.log(`  - ID: ${d.id}`);
      console.log(`    ${JSON.stringify(d, null, 2)}`);
    });
  } catch (err) {
    console.error('Error:', err.message);
  }
})();
