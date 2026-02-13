import { NextResponse } from "next/server";
import { sql, isDatabaseConfigured } from "@/lib/db";
import { callGPT4JSON, isOpenAIConfigured } from "@/lib/openai";

/**
 * Risk Cartographer - Risk Identification & Mitigation
 * 
 * Analyzes projects, deals, and business context to identify risks
 * and suggest mitigation strategies using GPT-4.
 */

interface Risk {
  risk_category: "financial" | "operational" | "strategic" | "relationship";
  risk_title: string;
  risk_description: string;
  entity_type: "deal" | "project" | "contact" | "business";
  entity_id: string | null;
  probability: number; // 0-100
  impact: number; // 0-100
  risk_score: number; // probability * impact / 100
  mitigation_strategies: string[];
}

interface GPT4RiskAnalysis {
  risks: Risk[];
  summary: string;
  priority_actions: string[];
}

// Mock risks
const mockRisks = [
  {
    id: "risk-1",
    user_id: "user-1",
    risk_category: "financial",
    risk_title: "Single Client Dependency",
    risk_description: "Supreme Financial represents 80% of Q1 revenue. Losing this client would severely impact cash flow.",
    entity_type: "business",
    entity_id: null,
    probability: 20,
    impact: 90,
    risk_score: 18,
    mitigation_strategies: [
      "Close 2-3 smaller deals to diversify revenue",
      "Build stronger relationship with Supreme Financial",
      "Develop contingency budget for client loss scenarios"
    ],
    mitigation_status: "pending",
    identified_at: new Date().toISOString(),
    created_at: new Date().toISOString()
  },
  {
    id: "risk-2",
    user_id: "user-1",
    risk_category: "operational",
    risk_title: "Capacity Constraints",
    risk_description: "Current pipeline at 150% of team capacity. Risk of project delays and quality issues.",
    entity_type: "business",
    entity_id: null,
    probability: 70,
    impact: 60,
    risk_score: 42,
    mitigation_strategies: [
      "Hire contractor for overflow work",
      "Extend timelines on lower-priority projects",
      "Automate repetitive tasks to free up capacity"
    ],
    mitigation_status: "pending",
    identified_at: new Date().toISOString(),
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
      risks: mockRisks,
      mock: true 
    });
  }

  try {
    // Fetch existing risks
    const risks = await sql`
      SELECT * FROM risks 
      WHERE user_id = ${userId}
      ORDER BY risk_score DESC, created_at DESC
      LIMIT 20
    `;

    // If analyze=true, run fresh GPT-4 risk analysis
    if (analyze && isOpenAIConfigured()) {
      try {
        const newRisks = await analyzeRisks(userId);
        
        // Store new risks in database
        for (const risk of newRisks) {
          await sql`
            INSERT INTO risks (
              id, user_id, risk_category, risk_title, risk_description,
              entity_type, entity_id, probability, impact, risk_score,
              mitigation_strategies, mitigation_status, identified_at, created_at, updated_at
            ) VALUES (
              ${'risk-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9)},
              ${userId}, ${risk.risk_category}, ${risk.risk_title}, ${risk.risk_description},
              ${risk.entity_type}, ${risk.entity_id}, ${risk.probability}, ${risk.impact}, ${risk.risk_score},
              ${risk.mitigation_strategies}, 'pending', NOW(), NOW(), NOW()
            )
          `;
        }

        // Fetch updated list
        const updatedRisks = await sql`
          SELECT * FROM risks 
          WHERE user_id = ${userId}
          ORDER BY risk_score DESC, created_at DESC
          LIMIT 20
        `;

        return NextResponse.json({ 
          risks: updatedRisks,
          analyzed: true,
          count: newRisks.length
        });
      } catch (aiError: any) {
        console.error("GPT-4 analysis error:", aiError);
        return NextResponse.json({ 
          risks,
          error: "AI analysis failed: " + aiError.message,
          analyzed: false
        });
      }
    }

    return NextResponse.json({ risks });
  } catch (error: any) {
    console.error("Database error:", error);
    return NextResponse.json({ 
      risks: mockRisks, 
      error: error.message,
      mock: true 
    });
  }
}

export async function POST(request: Request) {
  const body = await request.json();
  const { user_id, risk_id, action, mitigation_deadline } = body;

  if (!user_id || !risk_id || !action) {
    return NextResponse.json({ 
      error: "user_id, risk_id, and action required" 
    }, { status: 400 });
  }

  if (!isDatabaseConfigured() || !sql) {
    return NextResponse.json({ 
      success: true, 
      message: `Mock: Risk ${action}`,
      mock: true
    });
  }

  try {
    // Update risk mitigation status
    const newStatus = action === "mitigate" ? "in_progress" : 
                      action === "resolve" ? "completed" : "pending";
    
    const result = await sql`
      UPDATE risks
      SET mitigation_status = ${newStatus}, 
          mitigation_deadline = ${mitigation_deadline || null},
          resolved_at = ${action === "resolve" ? new Date().toISOString() : null},
          updated_at = NOW()
      WHERE id = ${risk_id} AND user_id = ${user_id}
      RETURNING *
    `;

    if (result.length === 0) {
      return NextResponse.json({ 
        error: "Risk not found" 
      }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      message: `Risk ${action}`,
      risk: result[0]
    });
  } catch (error: any) {
    return NextResponse.json({ 
      error: error.message 
    }, { status: 500 })
  }
}

/**
 * Analyze business data with GPT-4 to identify risks
 */
async function analyzeRisks(userId: string): Promise<Risk[]> {
  if (!sql) throw new Error("Database not configured");

  // Fetch business data
  const deals = await sql`
    SELECT * FROM deals 
    WHERE stage NOT IN ('Won', 'Lost')
    ORDER BY created_at DESC
    LIMIT 20
  `;

  const projects = await sql`
    SELECT * FROM projects
    ORDER BY updated_at DESC
    LIMIT 10
  `;

  const contacts = await sql`
    SELECT * FROM contacts
    ORDER BY created_at DESC
    LIMIT 20
  `;

  // Build context for GPT-4
  const systemPrompt = `You are an AI risk management consultant for VibeWorks Hub.\nYour job is to analyze business data and identify potential risks.\n\nConsider:\n- Financial risks (revenue concentration, cash flow, payment delays)\n- Operational risks (capacity constraints, project delays, resource gaps)\n- Strategic risks (market changes, competitive threats, technology shifts)\n- Relationship risks (client dependencies, key person risk, partnership issues)\n\nFor each risk, provide:\n1. risk_category: \"financial\", \"operational\", \"strategic\", or \"relationship\"\n2. risk_title: Short, clear title\n3. risk_description: 2-3 sentences explaining the risk\n4. entity_type: \"deal\", \"project\", \"contact\", or \"business\"\n5. entity_id: ID of related entity (or null if business-wide)\n6. probability: 0-100 (likelihood of occurrence)\n7. impact: 0-100 (severity if it occurs)\n8. risk_score: probability * impact / 100\n9. mitigation_strategies: Array of 2-4 actionable mitigation steps\n\nReturn JSON with structure: { \"risks\": [...], \"summary\": \"brief overview\", \"priority_actions\": [...] }`;

  const userPrompt = `Analyze this business data and identify the top 5-8 risks:\n\nDEALS:\n${JSON.stringify(deals, null, 2)}\n\nPROJECTS:\n${JSON.stringify(projects, null, 2)}\n\nCONTACTS:\n${JSON.stringify(contacts, null, 2)}\n\nIdentify risks and prioritize by risk score.`;

  const analysis = await callGPT4JSON<GPT4RiskAnalysis>(systemPrompt, userPrompt);
  
  return analysis.risks || [];
}
