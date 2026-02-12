import { NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

// Mock data fallback
const mockIdeas = [
  {
    id: "1",
    title: "AI-Powered Video Editing Tool",
    description: "Automated video editing using AI to cut, color grade, and add effects",
    created_by: "Ivanlee",
    priority: 1,
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "2",
    title: "Live Voice Farrah Mobile App",
    description: "Native iOS/Android app for voice conversations with Farrah on the go",
    created_by: "Natasha",
    priority: 2,
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  }
];

export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ ideas: mockIdeas });
  }

  const { data, error } = await supabase
    .from("ideas")
    .select("*")
    .order("priority", { ascending: true });

  if (error) {
    console.error("Supabase error:", error);
    return NextResponse.json({ ideas: mockIdeas });
  }

  return NextResponse.json({ ideas: data || [] });
}

export async function POST(request: Request) {
  const body = await request.json();

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ 
      success: true, 
      message: "Mock: Idea created", 
      data: { id: Date.now().toString(), ...body }
    });
  }

  const idea = {
    id: body.id || `idea-${Date.now()}`,
    title: body.title,
    description: body.description || "",
    created_by: body.created_by || "System",
    priority: body.priority || 999
  };

  const { data, error } = await supabase
    .from("ideas")
    .insert(idea)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }

  await supabase.from("activity_feed").insert({
    user_name: idea.created_by,
    action: `Added idea: ${idea.title}`,
    entity_type: "idea",
    entity_id: idea.id
  });

  return NextResponse.json({ success: true, message: "Idea created", data });
}

export async function PATCH(request: Request) {
  const body = await request.json();

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ 
      success: true, 
      message: "Mock: Idea updated", 
      data: body 
    });
  }

  const { id, ...updates } = body;

  const { data, error } = await supabase
    .from("ideas")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true, message: "Idea updated", data });
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ success: false, error: "Missing id" }, { status: 400 });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ success: true, message: "Mock: Idea deleted" });
  }

  const { error } = await supabase
    .from("ideas")
    .delete()
    .eq("id", id);

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true, message: `Idea ${id} deleted` });
}
