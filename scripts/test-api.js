#!/usr/bin/env node

const IVAN_USER_ID = '640401e9-106a-488f-8585-86519c60fc99';
const API_URL = `https://app-dir-mu.vercel.app/api/intelligence/revenue-catalyst?user_id=${IVAN_USER_ID}`;

(async () => {
  try {
    console.log('🌐 Fetching from API:', API_URL);
    console.log('='.repeat(60));
    
    const res = await fetch(API_URL);
    
    console.log(`Status: ${res.status} ${res.statusText}`);
    console.log('Headers:', Object.fromEntries(res.headers.entries()));
    
    const data = await res.json();
    
    console.log('\n📦 API Response:');
    console.log(JSON.stringify(data, null, 2));
    
    if (data.opportunities) {
      console.log('\n💰 Values from API:');
      data.opportunities.forEach((opp, idx) => {
        console.log(`[${idx + 1}] ${opp.recommended_product}`);
        console.log(`    estimated_value: ${JSON.stringify(opp.estimated_value)} (typeof: ${typeof opp.estimated_value})`);
        console.log(`    parseFloat: ${parseFloat(opp.estimated_value)}`);
      });
      
      const total = data.opportunities.reduce((sum, opp) => {
        const value = typeof opp.estimated_value === 'string' 
          ? parseFloat(opp.estimated_value) || 0
          : opp.estimated_value || 0;
        console.log(`\n  sum=${sum}, adding=${value}, result=${sum + value}`);
        return sum + value;
      }, 0);
      
      console.log(`\n📊 Calculated Total: $${total.toLocaleString()}`);
    }
    
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
})();
