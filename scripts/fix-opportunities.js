#!/usr/bin/env node
/**
 * Fix corrupted opportunity values in database
 * This script:
 * 1. Deletes all existing opportunities
 * 2. Seeds fresh mock data with proper numeric values
 */

const fs = require('fs');
const path = require('path');

// Read DATABASE_URL from .env.vercel (pulled from Vercel)
const envVercelPath = path.join(__dirname, '..', '.env.vercel');
if (fs.existsSync(envVercelPath)) {
  const envContent = fs.readFileSync(envVercelPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.+)$/);
    if (match) {
      const key = match[1].trim();
      let value = match[2].trim();
      // Remove quotes if present
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

if (!process.env.DATABASE_URL) {
  console.error('ERROR: DATABASE_URL not found in environment');
  console.error('Please set it in .env.production or as an environment variable');
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);

// Ivan Lee's user ID from database
const IVAN_USER_ID = '640401e9-106a-488f-8585-86519c60fc99';

// Clean mock data with proper numeric values
const opportunities = [
  {
    id: 'opp-' + Date.now() + '-1',
    user_id: IVAN_USER_ID,
    deal_id: 'deal-1770931837545', // Millionaire Essentials - Closed Won
    contact_id: null,
    opportunity_type: 'cross-sell',
    recommended_product: 'Advanced Trading Analytics Dashboard',
    estimated_value: 20000,
    confidence_score: 85,
    reasoning: 'AiCryptoTraders is actively negotiating a deal for a crypto trading signals app. Offering an advanced trading analytics dashboard would complement their signals perfectly and increase deal value.',
    similar_customers: ['FinTech Pro Inc', 'Wealth Solutions Ltd'],
    optimal_timing: 'after current project completion',
    status: 'pending'
  },
  {
    id: 'opp-' + Date.now() + '-2',
    user_id: IVAN_USER_ID,
    deal_id: 'deal-1770931453990', // Supreme Financial - Proposal Sent
    contact_id: null,
    opportunity_type: 'upsell',
    recommended_product: 'Premium Copy Trading Platform + White Label',
    estimated_value: 72000,
    confidence_score: 90,
    reasoning: 'Supreme Financial has shown strong interest in copy trading. A white-label solution would allow them to offer this to their clients under their own brand, significantly increasing the deal value.',
    similar_customers: ['CryptoVest Partners', 'Digital Asset Management'],
    optimal_timing: 'within 30 days of initial deal close',
    status: 'pending'
  },
  {
    id: 'opp-' + Date.now() + '-3',
    user_id: IVAN_USER_ID,
    deal_id: 'deal-1770931838044', // Archendra AI - Qualified
    contact_id: null,
    opportunity_type: 'renewal',
    recommended_product: 'Annual Support & Maintenance Package',
    estimated_value: 15000,
    confidence_score: 75,
    reasoning: 'DataViz Pro\'s current project is nearing completion. They will likely need ongoing support and updates. Offering an annual package now ensures continuity and recurring revenue.',
    similar_customers: ['Analytics Corp', 'Dashboard Solutions'],
    optimal_timing: '2 weeks before project delivery',
    status: 'pending'
  }
];

(async () => {
  try {
    console.log('🗑️  Deleting existing opportunities...');
    const deleted = await sql`DELETE FROM upsell_opportunities WHERE user_id = ${IVAN_USER_ID}`;
    console.log(`   Deleted ${deleted.length} records`);
    
    console.log('\n💾 Inserting fresh opportunities...');
    for (const opp of opportunities) {
      await sql`
        INSERT INTO upsell_opportunities (
          id, user_id, deal_id, contact_id, opportunity_type,
          recommended_product, estimated_value, confidence_score,
          reasoning, similar_customers, optimal_timing, status,
          created_at, updated_at
        ) VALUES (
          ${opp.id},
          ${opp.user_id},
          ${opp.deal_id},
          ${opp.contact_id},
          ${opp.opportunity_type},
          ${opp.recommended_product},
          ${opp.estimated_value},
          ${opp.confidence_score},
          ${opp.reasoning},
          ${opp.similar_customers},
          ${opp.optimal_timing},
          ${opp.status},
          NOW(),
          NOW()
        )
      `;
      console.log(`   ✅ ${opp.recommended_product}: $${opp.estimated_value.toLocaleString()}`);
    }
    
    console.log('\n📊 Verifying data...');
    const verified = await sql`
      SELECT recommended_product, estimated_value, confidence_score 
      FROM upsell_opportunities 
      WHERE user_id = ${IVAN_USER_ID}
      ORDER BY created_at DESC
    `;
    
    const total = verified.reduce((sum, row) => {
      const value = typeof row.estimated_value === 'string' 
        ? parseFloat(row.estimated_value) || 0
        : row.estimated_value || 0;
      return sum + value;
    }, 0);
    
    console.log(`\n   Total opportunities: ${verified.length}`);
    console.log(`   Total potential revenue: $${total.toLocaleString()}`);
    
    verified.forEach(row => {
      console.log(`   - ${row.recommended_product}: $${parseFloat(row.estimated_value).toLocaleString()} (${row.confidence_score}% confidence)`);
    });
    
    console.log('\n✅ Database fixed successfully!');
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
})();
