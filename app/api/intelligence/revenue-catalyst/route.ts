import { NextResponse } from "next/server";
import { sql, isDatabaseConfigured } from "@/lib/db";
import { callGPT4JSON, isOpenAIConfigured } from "@/lib/openai";

/**
 * Revenue Catalyst - Upsell Opportunity Detection
 * 
 * Analyzes CRM data to identify upsell and cross-sell opportunities
 * using GPT-4 intelligence.
 */

interface UpsellOpportunity {
  deal_id: string;
  contact_id: string;
  opportunity_type: "upsell" | "cross-sell" | "renewal";
  recommended_product: string;
  estimated_value: number;
  confidence_score: number;
  reasoning: string;
  similar_customers: string[];
  optimal_timing: string;
}

interface GPT4UpsellAnalysis {
  opportunities: UpsellOpportunity[];
  summary: string;
}

// Mock data for when OpenAI is not configured
const mockOpportunities = [
  {
    id: "upsell-1",
    deal_id: "1",
    contact_id: "jameel",
    opportunity_type: "upsell",
    recommended_product: "Premium Copy Trading Platform + White Label",
    estimated_value: 72000,
    confidence_score: 85,
    reasoning: "Supreme Financial has shown strong interest in copy trading. A white-label solution would allow them to offer this to their clients, doubling the deal value.",
    similar_customers: ["FinTech Pro Inc", "Wealth Solutions Ltd"],
    optimal_timing: "within 30 days of initial deal close",
    status: "pending",
    created_at: new Date().toISOString()
  }
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("user_id");
  const analyze = searchParams.get("analyze") === "true";

  if (!userId) {
    return NextResponse.json({ error: "user_id required" }, { status: 400 });
  }

  // If database not configured, return mock data
  if (!isDatabaseConfigured() || !sql) {
    return NextResponse.json({ 
      opportunities: mockOpportunities,
      mock: true 
    });
  }

  try {
    // Fetch existing opportunities
    const opportunities = await sql`
      SELECT * FROM upsell_opportunities 
      WHERE user_id = ${userId}
      ORDER BY confidence_score DESC, created_at DESC
      LIMIT 20
    `;

    // If analyze=true, run fresh GPT-4 analysis
    if (analyze) {
      console.log("[Revenue Catalyst] Analyze requested for user:", userId);
      console.log("[Revenue Catalyst] OpenAI configured:", isOpenAIConfigured());
      
      if (!isOpenAIConfigured()) {
        return NextResponse.json({ 
          opportunities,
          error: "OpenAI API key not configured in environment",
          analyzed: false,
          mock: true
        });
      }
      
      try {
        console.log("[Revenue Catalyst] Starting GPT-4 analysis...");
        const newOpportunities = await analyzeUpsellOpportunities(userId);
        console.log("[Revenue Catalyst] Analysis complete, found opportunities:", newOpportunities.length);
        
        // Store new opportunities in database
        for (const opp of newOpportunities) {
          await sql`
            INSERT INTO upsell_opportunities (
              id, user_id, deal_id, contact_id, opportunity_type,
              recommended_product, estimated_value, confidence_score,
              reasoning, similar_customers, optimal_timing, status, created_at, updated_at
            ) VALUES (
              ${'upsell-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9)},
              ${userId}, ${opp.deal_id}, ${opp.contact_id}, ${opp.opportunity_type},
              ${opp.recommended_product}, ${opp.estimated_value}, ${opp.confidence_score},
              ${opp.reasoning}, ${opp.similar_customers}, ${opp.optimal_timing}, 
              'pending', NOW(), NOW()
            )
          `;
        }

        // Fetch updated list
        const updatedOpportunities = await sql`
          SELECT * FROM upsell_opportunities 
          WHERE user_id = ${userId}
          ORDER BY confidence_score DESC, created_at DESC
          LIMIT 20
        `;

        return NextResponse.json({ 
          opportunities: updatedOpportunities,
          analyzed: true,
          count: newOpportunities.length
        });
      } catch (aiError: any) {
        console.error("GPT-4 analysis error:", aiError);
        return NextResponse.json({ 
          opportunities,
          error: "AI analysis failed: " + aiError.message,
          analyzed: false
        });
      }
    }

    return NextResponse.json({ opportunities });
  } catch (error: any) {
    console.error("Database error:", error);
    return NextResponse.json({ 
      opportunities: mockOpportunities, 
      error: error.message,
      mock: true 
    });
  }
}

export async function POST(request: Request) {
  const body = await request.json();
  const { user_id, opportunity_id, action } = body;

  if (!user_id || !opportunity_id || !action) {
    return NextResponse.json({ 
      error: "user_id, opportunity_id, and action required" 
    }, { status: 400 });
  }

  if (!isDatabaseConfigured() || !sql) {
    return NextResponse.json({ 
      success: true, 
      message: `Mock: Opportunity ${action}`,
      mock: true
    });
  }

  try {
    // Update opportunity status based on action
    const newStatus = action === "accept" ? "accepted" : 
                      action === "reject" ? "rejected" : "pending";
    
    const result = await sql`
      UPDATE upsell_opportunities
      SET status = ${newStatus}, 
          actioned_at = NOW(),
          updated_at = NOW()
      WHERE id = ${opportunity_id} AND user_id = ${user_id}
      RETURNING *
    `;

    if (result.length === 0) {
      return NextResponse.json({ 
        error: "Opportunity not found" 
      }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      message: `Opportunity ${action}ed`,
      opportunity: result[0]
    });
  } catch (error: any) {
    return NextResponse.json({ 
      error: error.message 
    }, { status: 500 });
  }
}

/**
 * Analyze CRM data with GPT-4 to find upsell opportunities
 */
async function analyzeUpsellOpportunities(userId: string): Promise<UpsellOpportunity[]> {
  if (!sql) throw new Error("Database not configured");

  // Fetch CRM data
  const deals = await sql`
    SELECT * FROM deals 
    WHERE stage IN ('Won', 'Proposal Sent', 'Negotiation')
    ORDER BY created_at DESC
    LIMIT 20
  `;

  const contacts = await sql`
    SELECT * FROM contacts
    ORDER BY created_at DESC
    LIMIT 50
  `;

  // Build context for GPT-4
  const systemPrompt = `You are an AI sales intelligence assistant for VibeWorks Hub, a creative agency CRM.
Your job is to analyze deals and contacts to identify upsell, cross-sell, and renewal opportunities.

Consider:
- Deal history and current stage
- Contact engagement patterns
- Industry trends
- Natural expansion paths (e.g., if client bought web design, they might need marketing)
- Timing indicators (renewals, project completion dates)

For each opportunity, provide:
1. opportunity_type: "upsell", "cross-sell", or "renewal"
2. recommended_product: What to offer
3. estimated_value: Expected deal size in dollars
4. confidence_score: 0-100 based on likelihood
5. reasoning: Why this is a good opportunity (2-3 sentences)
6. similar_customers: Array of similar customer names who made this purchase
7. optimal_timing: When to approach (e.g., "within 30 days", "after Q2")

Return JSON with structure: { "opportunities": [...], "summary": "brief overview" }`;

  const userPrompt = `Analyze this CRM data and identify the top 3-5 upsell opportunities:

DEALS:
${JSON.stringify(deals, null, 2)}

CONTACTS:
${JSON.stringify(contacts, null, 2)}

Identify opportunities and explain your reasoning.`;

  const analysis = await callGPT4JSON<GPT4UpsellAnalysis>(systemPrompt, userPrompt);
  
  return analysis.opportunities || [];
}
