#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

// Read .env.local
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.+)$/);
  if (match) {
    process.env[match[1]] = match[2];
  }
});

const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

(async () => {
  try {
    const opps = await sql`
      SELECT id, estimated_value, recommended_product, confidence_score 
      FROM upsell_opportunities 
      ORDER BY created_at DESC 
      LIMIT 5
    `;
    
    console.log('Opportunities in database:');
    console.log('---');
    opps.forEach(o => {
      console.log(`${o.recommended_product}`);
      console.log(`  Value: ${o.estimated_value} (type: ${typeof o.estimated_value})`);
      console.log(`  Confidence: ${o.confidence_score} (type: ${typeof o.confidence_score})`);
      console.log('');
    });
    
    // Calculate total
    const total = opps.reduce((sum, opp) => {
      const value = typeof opp.estimated_value === 'string' 
        ? parseFloat(opp.estimated_value) || 0
        : opp.estimated_value || 0;
      console.log(`Adding: ${value} (parsed from ${opp.estimated_value})`);
      return sum + value;
    }, 0);
    
    console.log('---');
    console.log(`Total calculated: ${total}`);
  } catch (err) {
    console.error('Error:', err.message);
  }
})();
