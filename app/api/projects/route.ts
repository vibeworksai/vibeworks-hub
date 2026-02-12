import { NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

// Mock data fallback (used if Supabase not configured)
const mockProjects = [
  {
    id: "supreme-copy-trader",
    name: "Supreme Copy Trader",
    slug: "supreme-copy-trader",
    status: "On Track",
    progress: 100,
    description: "Complete copy trading platform for Supreme Financial",
    last_updated: new Date().toISOString()
  },
  {
    id: "trading-bot-v18",
    name: "Trading Bot v18",
    slug: "trading-bot-v18",
    status: "On Track",
    progress: 95,
    description: "Automated trading bot - running and monitoring",
    last_updated: new Date().toISOString()
  },
  {
    id: "sports-betting-engine",
    name: "Sports Betting Engine",
    slug: "sports-betting-engine",
    status: "On Track",
    progress: 85,
    description: "Running with daily retraining",
    last_updated: new Date().toISOString()
  },
  {
    id: "vibeworks-hub",
    name: "VibeWorks Hub",
    slug: "vibeworks-hub",
    status: "On Track",
    progress: 80,
    description: "This project - needs Supabase integration",
    last_updated: new Date().toISOString()
  },
  {
    id: "live-voice-farrah",
    name: "Live Voice Farrah",
    slug: "live-voice-farrah",
    status: "Caution",
    progress: 35,
    description: "Research complete, prototype next",
    last_updated: new Date().toISOString()
  },
  {
    id: "mac-mini-dual-gateway",
    name: "Mac Mini Dual Gateway",
    slug: "mac-mini-dual-gateway",
    status: "At Risk",
    progress: 20,
    description: "Planning phase",
    last_updated: new Date().toISOString()
  },
  {
    id: "instagram-dm-automation",
    name: "Instagram DM Automation",
    slug: "instagram-dm-automation",
    status: "Caution",
    progress: 15,
    description: "Paused - waiting on Meta credentials",
    last_updated: new Date().toISOString()
  }
];

export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ projects: mockProjects });
  }

  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .order("progress", { ascending: false });

  if (error) {
    console.error("Supabase error:", error);
    return NextResponse.json({ projects: mockProjects });
  }

  return NextResponse.json({ projects: data || [] });
}

export async function POST(request: Request) {
  const body = await request.json();

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ 
      success: true, 
      message: "Mock: Project created (Supabase not configured)", 
      data: { id: Date.now().toString(), ...body }
    });
  }

  const project = {
    id: body.id || `project-${Date.now()}`,
    name: body.name,
    slug: body.slug || body.name.toLowerCase().replace(/\s+/g, "-"),
    status: body.status || "On Track",
    progress: body.progress || 0,
    description: body.description || "",
    last_updated: new Date().toISOString()
  };

  const { data, error } = await supabase
    .from("projects")
    .insert(project)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }

  // Log activity
  await supabase.from("activity_feed").insert({
    user_name: "Farrah",
    action: `Created project: ${project.name}`,
    entity_type: "project",
    entity_id: project.id
  });

  return NextResponse.json({ success: true, message: "Project created", data });
}

export async function PATCH(request: Request) {
  const body = await request.json();

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ 
      success: true, 
      message: "Mock: Project updated (Supabase not configured)", 
      data: body 
    });
  }

  const { id, ...updates } = body;
  updates.last_updated = new Date().toISOString();

  const { data, error } = await supabase
    .from("projects")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }

  // Log activity
  const changes = Object.keys(updates).filter(k => k !== "last_updated").join(", ");
  await supabase.from("activity_feed").insert({
    user_name: "Farrah",
    action: `Updated project: ${data.name} (${changes})`,
    entity_type: "project",
    entity_id: id
  });

  return NextResponse.json({ success: true, message: "Project updated", data });
}
