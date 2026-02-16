#!/usr/bin/env node
/**
 * Nightly Intelligence Refresh - Runs at 3:00 AM ET
 * 
 * Refreshes all AI intelligence engines for all users:
 * 1. Revenue Catalyst - Upsell opportunities
 * 2. Client Zero-D - ICP + lead scoring
 * 3. Risk Cartographer - Risk detection
 * 
 * This ensures fresh insights are ready when users log in each morning.
 */

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

if (!process.env.DATABASE_URL) {
  console.error('❌ ERROR: DATABASE_URL not found');
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);

const USERS = [
  { id: '640401e9-106a-488f-8585-86519c60fc99', name: 'Ivan Lee' },
  { id: '2ea9500d-8345-4c8d-9a3b-4dd98f31b81a', name: 'Natasha' }
];

async function runAnalysis() {
  console.log('🌙 NIGHTLY INTELLIGENCE REFRESH');
  console.log('='.repeat(60));
  console.log(`Started: ${new Date().toLocaleString('en-US', { timeZone: 'America/New_York' })} ET\n`);
  
  for (const user of USERS) {
    console.log(`\n👤 Processing: ${user.name} (${user.id})`);
    console.log('-'.repeat(60));
    
    // Revenue Catalyst
    try {
      console.log('\n💰 Revenue Catalyst: Analyzing upsell opportunities...');
      const revenueUrl = `https://app-dir-mu.vercel.app/api/intelligence/revenue-catalyst?user_id=${user.id}&analyze=true`;
      const revenueRes = await fetch(revenueUrl);
      const revenueData = await revenueRes.json();
      
      if (revenueData.error) {
        console.log(`   ⚠️  Error: ${revenueData.error}`);
      } else if (revenueData.opportunities) {
        console.log(`   ✅ Found ${revenueData.opportunities.length} opportunities`);
        const total = revenueData.opportunities.reduce((sum, opp) => {
          const value = typeof opp.estimated_value === 'string' 
            ? parseFloat(opp.estimated_value) || 0
            : opp.estimated_value || 0;
          return sum + value;
        }, 0);
        console.log(`   💵 Total potential revenue: $${total.toLocaleString()}`);
      }
    } catch (err) {
      console.log(`   ❌ Failed: ${err.message}`);
    }
    
    // Client Zero-D
    try {
      console.log('\n🎯 Client Zero-D: Analyzing ICP + lead scoring...');
      const clientUrl = `https://app-dir-mu.vercel.app/api/intelligence/client-zero-d?user_id=${user.id}&analyze=true`;
      const clientRes = await fetch(clientUrl);
      const clientData = await clientRes.json();
      
      if (clientData.error) {
        console.log(`   ⚠️  Error: ${clientData.error}`);
      } else {
        if (clientData.icp) {
          console.log(`   ✅ ICP Profile: ${clientData.icp.industry || 'N/A'}`);
        }
        if (clientData.leads) {
          console.log(`   ✅ Scored ${clientData.leads.length} leads`);
          const hot = clientData.leads.filter(l => {
            const score = typeof l.score === 'string' ? parseFloat(l.score) : l.score;
            return score >= 80;
          });
          console.log(`   🔥 Hot leads (80+): ${hot.length}`);
        }
      }
    } catch (err) {
      console.log(`   ❌ Failed: ${err.message}`);
    }
    
    // Risk Cartographer
    try {
      console.log('\n⚠️  Risk Cartographer: Detecting risks...');
      const riskUrl = `https://app-dir-mu.vercel.app/api/intelligence/risk-cartographer?user_id=${user.id}&analyze=true`;
      const riskRes = await fetch(riskUrl);
      const riskData = await riskRes.json();
      
      if (riskData.error) {
        console.log(`   ⚠️  Error: ${riskData.error}`);
      } else if (riskData.risks) {
        console.log(`   ✅ Identified ${riskData.risks.length} risks`);
        const critical = riskData.risks.filter(r => {
          const score = typeof r.risk_score === 'string' ? parseFloat(r.risk_score) : r.risk_score;
          return score >= 50;
        });
        console.log(`   🚨 Critical risks (50+): ${critical.length}`);
      }
    } catch (err) {
      console.log(`   ❌ Failed: ${err.message}`);
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log(`✅ Nightly refresh complete: ${new Date().toLocaleString('en-US', { timeZone: 'America/New_York' })} ET`);
  console.log('='.repeat(60));
}

runAnalysis().catch(err => {
  console.error('❌ Fatal error:', err);
  process.exit(1);
});
