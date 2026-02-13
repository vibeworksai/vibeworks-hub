#!/usr/bin/env node

const { Pool } = require('@neondatabase/serverless');
const ws = require('ws');
const { neonConfig } = require('@neondatabase/serverless');
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

async function seedOpportunities() {
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.error('❌ DATABASE_URL not set');
    process.exit(1);
  }

  const pool = new Pool({ connectionString: databaseUrl });

  try {
    console.log('🌱 Seeding revenue opportunities...\n');

    // Get Ivan's user ID
    const userResult = await pool.query(`SELECT id FROM users WHERE username = 'Ivanlee' LIMIT 1`);
    if (userResult.rows.length === 0) {
      console.error('❌ User "Ivanlee" not found');
      await pool.end();
      process.exit(1);
    }
    const userId = userResult.rows[0].id;
    console.log(`✅ Found user: Ivanlee (${userId})`);

    // Clear existing opportunities
    await pool.query('DELETE FROM upsell_opportunities');
    console.log('✅ Cleared existing opportunities');

    // Insert mock opportunities
    const opportunities = [
      {
        id: 'opp-1',
        user_id: userId,
        deal_id: null,
        contact_id: null,
        opportunity_type: 'upsell',
        recommended_product: 'Premium Copy Trading Platform + White Label',
        estimated_value: 72000,
        confidence_score: 85,
        reasoning: 'Supreme Financial has shown strong interest in copy trading. A white-label solution would allow them to offer this to their clients, doubling the deal value.',
        similar_customers: ['FinTech Pro Inc', 'Wealth Solutions Ltd'],
        optimal_timing: 'within 30 days of initial deal close',
        status: 'pending'
      },
      {
        id: 'opp-2',
        user_id: userId,
        deal_id: null,
        contact_id: null,
        opportunity_type: 'cross-sell',
        recommended_product: 'Advanced Trading Analytics Dashboard',
        estimated_value: 20000,
        confidence_score: 85,
        reasoning: 'AiCryptoTraders is actively negotiating a deal for a crypto trading signals app. Offering an advanced trading analytics dashboard could complement their strategy and enhance their current collaboration.',
        similar_customers: ['Millionaire Essentials LLC', 'Traders Club Worldwide'],
        optimal_timing: 'after current project completion',
        status: 'pending'
      },
      {
        id: 'opp-3',
        user_id: userId,
        deal_id: null,
        contact_id: null,
        opportunity_type: 'cross-sell',
        recommended_product: 'Social Media Marketing Strategy',
        estimated_value: 15000,
        confidence_score: 75,
        reasoning: 'Supreme Financial is in the proposal stage for a $36K copy trading platform. They have the potential to reach a high valuation through effective social media marketing to expand their customer base.',
        similar_customers: ['Growth Marketing Co', 'Digital Reach Agency'],
        optimal_timing: 'after proposal acceptance',
        status: 'pending'
      }
    ];

    for (const opp of opportunities) {
      await pool.query(`
        INSERT INTO upsell_opportunities 
        (id, user_id, deal_id, contact_id, opportunity_type, recommended_product, estimated_value, confidence_score, reasoning, similar_customers, optimal_timing, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      `, [
        opp.id,
        opp.user_id,
        opp.deal_id,
        opp.contact_id,
        opp.opportunity_type,
        opp.recommended_product,
        opp.estimated_value,
        opp.confidence_score,
        opp.reasoning,
        opp.similar_customers,
        opp.optimal_timing,
        opp.status
      ]);
      console.log(`✅ Added: ${opp.recommended_product} ($${opp.estimated_value})`);
    }

    console.log('\n🎉 Seeding complete!');
    console.log(`📊 Total: $${opportunities.reduce((sum, o) => sum + o.estimated_value, 0).toLocaleString()}`);

    await pool.end();
  } catch (error) {
    console.error('❌ Error:', error);
    await pool.end();
    process.exit(1);
  }
}

seedOpportunities();
