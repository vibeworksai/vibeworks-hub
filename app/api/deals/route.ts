import { NextResponse } from "next/server";
import { sql, isDatabaseConfigured } from "@/lib/db";

// Mock data fallback
const mockDeals = [
  {
    id: "1",
    company: "Supreme Financial",
    contact_id: "jameel",
    value: 36000,
    stage: "Proposal Sent",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    notes: "Copy trading platform proposal delivered - awaiting response"
  },
  {
    id: "2",
    company: "Alabama Barker",
    contact_id: "mgmt-team",
    value: null,
    stage: "Lead",
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    notes: "Celebrity proposal filed"
  }
];

export async function GET() {
  if (!isDatabaseConfigured() || !sql) {
    return NextResponse.json({ deals: mockDeals });
  }

  try {
    const deals = await sql`
      SELECT * FROM deals ORDER BY created_at DESC
    `;
    
    return NextResponse.json({ deals });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json({ deals: mockDeals });
  }
}

export async function POST(request: Request) {
  const body = await request.json();

  if (!isDatabaseConfigured() || !sql) {
    return NextResponse.json({ 
      success: true, 
      message: "Mock: Deal created", 
      data: { id: Date.now().toString(), ...body }
    });
  }

  try {
    const deal = {
      id: body.id || `deal-${Date.now()}`,
      company: body.company,
      contact_id: body.contact_id || null,
      value: body.value || null,
      stage: body.stage || "Lead",
      notes: body.notes || "",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const result = await sql`
      INSERT INTO deals (id, company, contact_id, value, stage, notes, created_at, updated_at)
      VALUES (${deal.id}, ${deal.company}, ${deal.contact_id}, ${deal.value}, ${deal.stage}, ${deal.notes}, ${deal.created_at}, ${deal.updated_at})
      RETURNING *
    `;

    // Log activity
    await sql`
      INSERT INTO activity_feed (id, user, action, target, timestamp)
      VALUES (${`activity-${Date.now()}`}, ${"Farrah"}, ${"created"}, ${`deal: ${deal.company} ($${deal.value ? (deal.value / 1000) + 'K' : 'TBD'})`}, ${new Date().toISOString()})
    `;

    return NextResponse.json({ success: true, message: "Deal created", data: result[0] });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function PATCH(request: Request) {
  const body = await request.json();

  if (!isDatabaseConfigured() || !sql) {
    return NextResponse.json({ 
      success: true, 
      message: "Mock: Deal updated", 
      data: body 
    });
  }

  try {
    const { id, ...updates } = body;
    const updated_at = new Date().toISOString();

    const result = await sql`
      UPDATE deals 
      SET 
        company = COALESCE(${updates.company}, company),
        contact_id = COALESCE(${updates.contact_id}, contact_id),
        value = COALESCE(${updates.value}, value),
        stage = COALESCE(${updates.stage}, stage),
        notes = COALESCE(${updates.notes}, notes),
        updated_at = ${updated_at}
      WHERE id = ${id}
      RETURNING *
    `;

    if (result.length === 0) {
      return NextResponse.json({ success: false, error: "Deal not found" }, { status: 404 });
    }

    // Log activity
    await sql`
      INSERT INTO activity_feed (id, user, action, target, timestamp)
      VALUES (${`activity-${Date.now()}`}, ${"Farrah"}, ${"updated"}, ${`deal: ${result[0].company} → ${result[0].stage}`}, ${new Date().toISOString()})
    `;

    return NextResponse.json({ success: true, message: "Deal updated", data: result[0] });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ success: false, error: "ID required" }, { status: 400 });
  }

  if (!isDatabaseConfigured() || !sql) {
    return NextResponse.json({ 
      success: true, 
      message: "Mock: Deal deleted" 
    });
  }

  try {
    const result = await sql`
      DELETE FROM deals WHERE id = ${id}
      RETURNING company
    `;

    if (result.length === 0) {
      return NextResponse.json({ success: false, error: "Deal not found" }, { status: 404 });
    }

    // Log activity
    await sql`
      INSERT INTO activity_feed (id, user, action, target, timestamp)
      VALUES (${`activity-${Date.now()}`}, ${"Farrah"}, ${"deleted"}, ${`deal: ${result[0].company}`}, ${new Date().toISOString()})
    `;

    return NextResponse.json({ success: true, message: "Deal deleted" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
