import { NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

// Mock data fallback
const mockActivity = [
  {
    id: 1,
    user_name: "Farrah",
    action: "Updated Supreme Copy Trader to 100%",
    entity_type: "project",
    entity_id: "supreme-copy-trader",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 2,
    user_name: "Fero",
    action: "Built VibeWorks Hub CRM system",
    entity_type: "project",
    entity_id: "vibeworks-hub",
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 3,
    user_name: "Farrah",
    action: "Added contact: Jameel (Supreme Financial)",
    entity_type: "contact",
    entity_id: "1",
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
  }
];

export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ activity: mockActivity });
  }

  const { data, error } = await supabase
    .from("activity_feed")
    .select("*")
    .order("timestamp", { ascending: false })
    .limit(50);

  if (error) {
    console.error("Supabase error:", error);
    return NextResponse.json({ activity: mockActivity });
  }

  return NextResponse.json({ activity: data || [] });
}

export async function POST(request: Request) {
  const body = await request.json();

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ 
      success: true, 
      message: "Mock: Activity logged", 
      data: { id: Date.now(), ...body }
    });
  }

  const activity = {
    user_name: body.user_name || "System",
    action: body.action,
    entity_type: body.entity_type || null,
    entity_id: body.entity_id || null
  };

  const { data, error } = await supabase
    .from("activity_feed")
    .insert(activity)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true, message: "Activity logged", data });
}
