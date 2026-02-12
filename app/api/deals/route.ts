import { NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

// Mock data fallback
const mockDeals = [
  {
    id: "1",
    company: "Supreme Financial",
    contact: "Jameel",
    value: 36000,
    stage: "Proposal Sent",
    last_contact: new Date().toISOString(),
    notes: "Copy trading platform proposal delivered - awaiting response"
  },
  {
    id: "2",
    company: "Alabama Barker",
    contact: "Management Team",
    value: null,
    stage: "Lead",
    last_contact: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    notes: "Celebrity proposal filed"
  }
];

export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ deals: mockDeals });
  }

  const { data, error } = await supabase
    .from("deals")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Supabase error:", error);
    return NextResponse.json({ deals: mockDeals });
  }

  return NextResponse.json({ deals: data || [] });
}

export async function POST(request: Request) {
  const body = await request.json();

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ 
      success: true, 
      message: "Mock: Deal created", 
      data: { id: Date.now().toString(), ...body }
    });
  }

  const deal = {
    id: body.id || `deal-${Date.now()}`,
    company: body.company,
    contact: body.contact,
    value: body.value || null,
    stage: body.stage || "Lead",
    notes: body.notes || "",
    last_contact: new Date().toISOString()
  };

  const { data, error } = await supabase
    .from("deals")
    .insert(deal)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }

  await supabase.from("activity_feed").insert({
    user_name: "Farrah",
    action: `Created deal: ${deal.company} ($${deal.value ? (deal.value / 1000) + 'K' : 'TBD'})`,
    entity_type: "deal",
    entity_id: deal.id
  });

  return NextResponse.json({ success: true, message: "Deal created", data });
}

export async function PATCH(request: Request) {
  const body = await request.json();

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ 
      success: true, 
      message: "Mock: Deal updated", 
      data: body 
    });
  }

  const { id, ...updates } = body;
  updates.last_contact = new Date().toISOString();

  const { data, error } = await supabase
    .from("deals")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }

  await supabase.from("activity_feed").insert({
    user_name: "Farrah",
    action: `Updated deal: ${data.company} → ${data.stage}`,
    entity_type: "deal",
    entity_id: id
  });

  return NextResponse.json({ success: true, message: "Deal updated", data });
}
