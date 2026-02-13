import { NextResponse } from "next/server";
import { sql, isDatabaseConfigured } from "@/lib/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("user_id") || "1";

  try {
    if (!isDatabaseConfigured() || !sql) {
      return NextResponse.json({ 
        error: "Database not configured",
        mock: true 
      });
    }

    const opportunities = await sql`
      SELECT * FROM upsell_opportunities 
      WHERE user_id = ${userId}
      ORDER BY confidence_score DESC
      LIMIT 5
    `;

    // Debug: show raw data types
    const debug = opportunities.map(opp => ({
      id: opp.id,
      estimated_value: opp.estimated_value,
      estimated_value_type: typeof opp.estimated_value,
      estimated_value_parsed: parseFloat(opp.estimated_value as any),
      estimated_value_number: Number(opp.estimated_value),
      confidence_score: opp.confidence_score,
      confidence_type: typeof opp.confidence_score
    }));

    // Calculate total
    const total = opportunities.reduce((sum, opp) => {
      const value = typeof opp.estimated_value === 'string' 
        ? parseFloat(opp.estimated_value) 
        : opp.estimated_value;
      const numValue = isNaN(value) ? 0 : Number(value);
      return Number(sum) + numValue;
    }, 0);

    return NextResponse.json({
      count: opportunities.length,
      totalValue: total,
      totalValueType: typeof total,
      opportunities: debug,
      raw: opportunities
    });

  } catch (error: any) {
    return NextResponse.json({ 
      error: error.message,
      stack: error.stack 
    }, { status: 500 });
  }
}
