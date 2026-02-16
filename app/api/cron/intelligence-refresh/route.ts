import { NextResponse } from "next/server";
import { sql, isDatabaseConfigured } from "@/lib/db";

/**
 * Nightly Intelligence Refresh Cron Job
 * 
 * Runs AI analysis for all active users across all three intelligence engines:
 * - Revenue Catalyst (upsell opportunities)
 * - Client Zero-D (ICP + lead scoring)
 * - Risk Cartographer (risk detection)
 * 
 * Security: Requires CRON_SECRET environment variable
 * Schedule: 3 AM ET daily (configured in OpenClaw cron)
 */

export async function POST(request: Request) {
  const {searchParams} = new URL(request.url);
  const secret = searchParams.get("secret");
  
  // Security check
  const CRON_SECRET = process.env.CRON_SECRET || "dev-secret-12345";
  if (secret !== CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  // Check database configuration
  if (!isDatabaseConfigured() || !sql) {
    return NextResponse.json({
      success: false,
      error: "Database not configured",
      timestamp: new Date().toISOString()
    });
  }
  
  const startTime = Date.now();
  const results = {
    timestamp: new Date().toISOString(),
    users_processed: 0,
    revenue_catalyst: { success: 0, failed: 0, opportunities: 0 },
    client_zero_d: { success: 0, failed: 0, profiles: 0 },
    risk_cartographer: { success: 0, failed: 0, risks: 0 },
    errors: [] as string[]
  };
  
  try {
    // Fetch all active users (users with at least one deal or contact)
    const users = await sql`
      SELECT DISTINCT user_id 
      FROM (
        SELECT user_id FROM deals
        UNION
        SELECT user_id FROM contacts
      ) AS all_users
      LIMIT 50
    `;
    
    results.users_processed = users.length;
    console.log(`[Cron] Processing ${users.length} users...`);
    
    // Process each user
    for (const user of users) {
      const userId = user.user_id;
      console.log(`[Cron] Processing user: ${userId}`);
      
      // 1. Revenue Catalyst Analysis
      try {
        const revResponse = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/intelligence/revenue-catalyst?user_id=${userId}&analyze=true`,
          { method: "GET", headers: { "x-cron-secret": CRON_SECRET } }
        );
        
        if (revResponse.ok) {
          const data = await revResponse.json();
          results.revenue_catalyst.success++;
          results.revenue_catalyst.opportunities += data.count || 0;
        } else {
          results.revenue_catalyst.failed++;
          results.errors.push(`Revenue Catalyst failed for ${userId}: ${revResponse.statusText}`);
        }
      } catch (error) {
        results.revenue_catalyst.failed++;
        results.errors.push(`Revenue Catalyst error for ${userId}: ${error}`);
      }
      
      // 2. Client Zero-D Analysis
      try {
        const icpResponse = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/intelligence/client-zero-d?user_id=${userId}&analyze=true`,
          { method: "GET", headers: { "x-cron-secret": CRON_SECRET } }
        );
        
        if (icpResponse.ok) {
          const data = await icpResponse.json();
          results.client_zero_d.success++;
          results.client_zero_d.profiles += data.profile ? 1 : 0;
        } else {
          results.client_zero_d.failed++;
          results.errors.push(`Client Zero-D failed for ${userId}: ${icpResponse.statusText}`);
        }
      } catch (error) {
        results.client_zero_d.failed++;
        results.errors.push(`Client Zero-D error for ${userId}: ${error}`);
      }
      
      // 3. Risk Cartographer Analysis
      try {
        const riskResponse = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/intelligence/risk-cartographer?user_id=${userId}&analyze=true`,
          { method: "GET", headers: { "x-cron-secret": CRON_SECRET } }
        );
        
        if (riskResponse.ok) {
          const data = await riskResponse.json();
          results.risk_cartographer.success++;
          results.risk_cartographer.risks += data.summary?.total || 0;
        } else {
          results.risk_cartographer.failed++;
          results.errors.push(`Risk Cartographer failed for ${userId}: ${riskResponse.statusText}`);
        }
      } catch (error) {
        results.risk_cartographer.failed++;
        results.errors.push(`Risk Cartographer error for ${userId}: ${error}`);
      }
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    const duration = Date.now() - startTime;
    
    console.log(`[Cron] Intelligence refresh complete in ${duration}ms`);
    console.log(JSON.stringify(results, null, 2));
    
    return NextResponse.json({
      success: true,
      duration_ms: duration,
      ...results
    });
    
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

// Also support GET for manual testing with secret
export async function GET(request: Request) {
  return POST(request);
}
