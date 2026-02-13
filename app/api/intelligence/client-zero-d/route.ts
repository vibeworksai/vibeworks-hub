import { NextResponse } from "next/server";
import { sql, isDatabaseConfigured } from "@/lib/db";
import { callGPT4JSON, isOpenAIConfigured } from "@/lib/openai";

/**
 * Client Zero-D - Ideal Customer Profiling
 * 
 * Analyzes your best customers to build a data-driven ideal customer profile (ICP).
 * Uses GPT-4 to identify patterns in high-value, low-friction clients.
 */

interface CustomerAttributes {
  industry?: string[];
  company_size?: string;
  budget_range?: string;
  decision_maker_role?: string[];
  geographic_region?: string[];
  common_pain_points?: string[];
  technology_stack?: string[];
}

interface IdealCustomerProfile {
  profile_version: number;
  attributes: CustomerAttributes;
  avg_ltv: number;
  avg_deal_size: number;
  avg_time_to_close: number;
  churn_rate: number;
  referral_rate: number;
  common_pain_points: string[];
  common_objections: string[];
  decision_factors: string[];
  sample_customer_ids: string[];
}

interface GPT4ICPAnalysis {
  profile: IdealCustomerProfile;
  insights: string;
  targeting_recommendations: string[];
}

// Mock ICP data
const mockICP = {
  id: "icp-1",
  user_id: "user-1",
  profile_version: 1,
  attributes: {
    industry: ["Financial Services", "FinTech"],
    company_size: "50-500 employees",
    budget_range: "$25K-$100K",
    decision_maker_role: ["CFO", "CTO", "Head of Operations"],
    geographic_region: ["North America"],
    common_pain_points: [
      "Need to scale operations without hiring",
      "Struggling with manual processes",
      "Want to modernize technology stack"
    ]
  },
  avg_ltv: 85000,
  avg_deal_size: 42000,
  avg_time_to_close: 45,
  churn_rate: 0.15,
  referral_rate: 0.35,
  common_pain_points: [
    "Legacy systems holding them back",
    "Need better data visibility",
    "Team spending too much time on repetitive tasks"
  ],
  common_objections: [
    "Price concerns",
    "Implementation timeline",
    "Integration with existing systems"
  ],
  decision_factors: [
    "ROI demonstration",
    "Case studies from similar companies",
    "Implementation support"
  ],
  sample_customer_ids: ["contact-1"],
  created_at: new Date().toISOString()
};

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
      profile: mockICP,
      mock: true 
    });
  }

  try {
    // Fetch latest ICP
    const profiles = await sql`
      SELECT * FROM ideal_customer_profiles 
      WHERE user_id = ${userId}
      ORDER BY profile_version DESC
      LIMIT 1
    `;

    // If analyze=true, generate new ICP with GPT-4
    if (analyze && isOpenAIConfigured()) {
      try {
        const newProfile = await generateIdealCustomerProfile(userId);
        
        // Get current version
        const currentVersion = profiles.length > 0 ? profiles[0].profile_version : 0;
        const newVersion = currentVersion + 1;

        // Store new profile
        await sql`
          INSERT INTO ideal_customer_profiles (
            id, user_id, profile_version, generated_at,
            attributes, avg_ltv, avg_deal_size, avg_time_to_close,
            churn_rate, referral_rate, common_pain_points,
            common_objections, decision_factors, sample_customer_ids,
            created_at
          ) VALUES (
            ${'icp-' + Date.now()},
            ${userId}, ${newVersion}, NOW(),
            ${JSON.stringify(newProfile.attributes)},
            ${newProfile.avg_ltv}, ${newProfile.avg_deal_size}, ${newProfile.avg_time_to_close},
            ${newProfile.churn_rate}, ${newProfile.referral_rate},
            ${newProfile.common_pain_points}, ${newProfile.common_objections},
            ${newProfile.decision_factors}, ${newProfile.sample_customer_ids},
            NOW()
          )
        `;

        // Fetch the new profile
        const updatedProfiles = await sql`
          SELECT * FROM ideal_customer_profiles 
          WHERE user_id = ${userId}
          ORDER BY profile_version DESC
          LIMIT 1
        `;

        return NextResponse.json({ 
          profile: updatedProfiles[0],
          analyzed: true,
          version: newVersion
        });
      } catch (aiError: any) {
        console.error("GPT-4 analysis error:", aiError);
        return NextResponse.json({ 
          profile: profiles[0] || null,
          error: "AI analysis failed: " + aiError.message,
          analyzed: false
        });
      }
    }

    return NextResponse.json({ 
      profile: profiles[0] || null 
    });
  } catch (error: any) {
    console.error("Database error:", error);
    return NextResponse.json({ 
      profile: mockICP, 
      error: error.message,
      mock: true 
    });
  }
}

export async function POST(request: Request) {
  const body = await request.json();
  const { user_id, contact_id, deal_id } = body;

  if (!user_id) {
    return NextResponse.json({ 
      error: "user_id required" 
    }, { status: 400 });
  }

  if (!isDatabaseConfigured() || !sql) {
    return NextResponse.json({ 
      score: 85,
      priority: "high",
      match_details: "Mock: High ICP match",
      mock: true
    });
  }

  try {
    // Fetch the latest ICP
    const profiles = await sql`
      SELECT * FROM ideal_customer_profiles 
      WHERE user_id = ${user_id}
      ORDER BY profile_version DESC
      LIMIT 1
    `;

    if (profiles.length === 0) {
      return NextResponse.json({ 
        error: "No ICP found. Run analysis first." 
      }, { status: 404 });
    }

    const icp = profiles[0];

    // Fetch the contact or deal to score
    let entity;
    if (contact_id) {
      const contacts = await sql`SELECT * FROM contacts WHERE id = ${contact_id}`;
      entity = contacts[0];
    } else if (deal_id) {
      const deals = await sql`SELECT * FROM deals WHERE id = ${deal_id}`;
      entity = deals[0];
    } else {
      return NextResponse.json({ 
        error: "contact_id or deal_id required" 
      }, { status: 400 });
    }

    if (!entity) {
      return NextResponse.json({ 
        error: "Entity not found" 
      }, { status: 404 });
    }

    // Score the lead against the ICP
    const score = await scoreLeadAgainstICP(icp, entity);

    // Store the score
    await sql`
      INSERT INTO lead_scores (
        id, user_id, contact_id, deal_id,
        overall_score, icp_match_score, engagement_score,
        score_factors, priority_level, recommended_actions,
        scored_at
      ) VALUES (
        ${'score-' + Date.now()},
        ${user_id}, ${contact_id || null}, ${deal_id || null},
        ${score.overall_score}, ${score.icp_match_score}, ${score.engagement_score},
        ${JSON.stringify(score.factors)}, ${score.priority_level},
        ${score.recommended_actions}, NOW()
      )
    `;

    return NextResponse.json({ 
      success: true,
      score: score.overall_score,
      priority: score.priority_level,
      details: score
    });
  } catch (error: any) {
    return NextResponse.json({ 
      error: error.message 
    }, { status: 500 });
  }
}

/**
 * Generate ICP by analyzing best customers with GPT-4
 */
async function generateIdealCustomerProfile(userId: string): Promise<IdealCustomerProfile> {
  if (!sql) throw new Error("Database not configured");

  // Fetch all contacts and deals
  const contacts = await sql`SELECT * FROM contacts ORDER BY created_at DESC`;
  const deals = await sql`
    SELECT * FROM deals 
    WHERE stage = 'Won'
    ORDER BY value DESC
    LIMIT 20
  `;

  const systemPrompt = `You are an AI business intelligence analyst for VibeWorks Hub.
Your job is to analyze CRM data and build an Ideal Customer Profile (ICP).

Look for patterns in:
- Industry/sector
- Company size indicators
- Budget/deal size
- Decision maker roles
- Common pain points
- Success factors

Identify the characteristics of the BEST customers (highest value, fastest close, longest retention).

Return JSON with this structure:
{
  "profile": {
    "profile_version": 1,
    "attributes": { ... },
    "avg_ltv": number,
    "avg_deal_size": number,
    "avg_time_to_close": number (days),
    "churn_rate": 0.0-1.0,
    "referral_rate": 0.0-1.0,
    "common_pain_points": [...],
    "common_objections": [...],
    "decision_factors": [...],
    "sample_customer_ids": [...]
  },
  "insights": "explanation of the profile",
  "targeting_recommendations": ["actionable tips"]
}`;

  const userPrompt = `Analyze this CRM data to build an ideal customer profile:

CONTACTS:
${JSON.stringify(contacts, null, 2)}

WON DEALS:
${JSON.stringify(deals, null, 2)}

Build a data-driven ICP based on the best customers.`;

  const analysis = await callGPT4JSON<GPT4ICPAnalysis>(systemPrompt, userPrompt);
  
  return analysis.profile;
}

/**
 * Score a lead against the ICP
 */
async function scoreLeadAgainstICP(icp: any, entity: any) {
  // Simple scoring logic (can be enhanced with GPT-4)
  let score = 50; // Base score
  const factors: any = {};

  // Industry match
  if (icp.attributes?.industry?.includes(entity.company)) {
    score += 20;
    factors.industry_match = true;
  }

  // Role match
  if (icp.attributes?.decision_maker_role?.includes(entity.role)) {
    score += 15;
    factors.role_match = true;
  }

  // Deal size match
  if (entity.value && entity.value >= icp.avg_deal_size * 0.7) {
    score += 15;
    factors.budget_match = true;
  }

  const overall_score = Math.min(score, 100);
  const priority_level = overall_score >= 80 ? "high" : overall_score >= 60 ? "medium" : "low";

  return {
    overall_score,
    icp_match_score: score,
    engagement_score: 70, // Placeholder
    factors,
    priority_level,
    recommended_actions: priority_level === "high" 
      ? ["Schedule demo ASAP", "Share relevant case studies", "Fast-track proposal"]
      : ["Nurture with content", "Qualify further", "Monitor engagement"]
  };
}
