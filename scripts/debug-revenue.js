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

const IVAN_USER_ID = '640401e9-106a-488f-8585-86519c60fc99';

(async () => {
  try {
    console.log('🔍 RAW DATABASE VALUES:');
    console.log('='.repeat(60));
    
    const opps = await sql`
      SELECT 
        recommended_product,
        estimated_value,
        confidence_score,
        pg_typeof(estimated_value) as value_type,
        pg_typeof(confidence_score) as score_type
      FROM upsell_opportunities 
      WHERE user_id = ${IVAN_USER_ID}
      ORDER BY created_at DESC
    `;
    
    opps.forEach((row, idx) => {
      console.log(`\n[${idx + 1}] ${row.recommended_product}`);
      console.log(`    estimated_value: "${row.estimated_value}" (type: ${row.value_type})`);
      console.log(`    JS typeof: ${typeof row.estimated_value}`);
      console.log(`    confidence_score: "${row.confidence_score}" (type: ${row.score_type})`);
      console.log(`    parseFloat(estimated_value): ${parseFloat(row.estimated_value)}`);
    });
    
    console.log('\n' + '='.repeat(60));
    console.log('🧮 TOTAL CALCULATION:');
    console.log('='.repeat(60));
    
    const total = opps.reduce((sum, opp) => {
      const value = typeof opp.estimated_value === 'string' 
        ? parseFloat(opp.estimated_value) || 0
        : opp.estimated_value || 0;
      console.log(`  Adding: ${value} (from "${opp.estimated_value}")`);
      console.log(`  Running total: ${sum} + ${value} = ${sum + value}`);
      return sum + value;
    }, 0);
    
    console.log('\n' + '='.repeat(60));
    console.log(`📊 FINAL TOTAL: $${total.toLocaleString()}`);
    console.log('='.repeat(60));
    
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
})();
