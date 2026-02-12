import { NextResponse } from "next/server";
import { sql, isDatabaseConfigured } from "@/lib/db";

// Mock data fallback
const mockIdeas = [
  {
    id: "1",
    title: "AI-Powered Video Editing Tool",
    description: "Automated video editing using AI to cut, color grade, and add effects",
    priority: 1,
    status: "backlog",
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "2",
    title: "Live Voice Farrah Mobile App",
    description: "Native iOS/Android app for voice conversations with Farrah on the go",
    priority: 2,
    status: "backlog",
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  }
];

export async function GET() {
  if (!isDatabaseConfigured() || !sql) {
    return NextResponse.json({ ideas: mockIdeas });
  }

  try {
    const ideas = await sql`
      SELECT * FROM ideas ORDER BY priority ASC
    `;
    
    return NextResponse.json({ ideas });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json({ ideas: mockIdeas });
  }
}

export async function POST(request: Request) {
  const body = await request.json();

  if (!isDatabaseConfigured() || !sql) {
    return NextResponse.json({ 
      success: true, 
      message: "Mock: Idea created", 
      data: { id: Date.now().toString(), ...body }
    });
  }

  try {
    const idea = {
      id: body.id || `idea-${Date.now()}`,
      title: body.title,
      description: body.description || "",
      priority: body.priority || 999,
      status: body.status || "backlog",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const result = await sql`
      INSERT INTO ideas (id, title, description, priority, status, created_at, updated_at)
      VALUES (${idea.id}, ${idea.title}, ${idea.description}, ${idea.priority}, ${idea.status}, ${idea.created_at}, ${idea.updated_at})
      RETURNING *
    `;

    // Log activity
    await sql`
      INSERT INTO activity_feed (id, user, action, target, timestamp)
      VALUES (${`activity-${Date.now()}`}, ${"System"}, ${"created"}, ${`idea: ${idea.title}`}, ${new Date().toISOString()})
    `;

    return NextResponse.json({ success: true, message: "Idea created", data: result[0] });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function PATCH(request: Request) {
  const body = await request.json();

  if (!isDatabaseConfigured() || !sql) {
    return NextResponse.json({ 
      success: true, 
      message: "Mock: Idea updated", 
      data: body 
    });
  }

  try {
    const { id, ...updates } = body;
    const updated_at = new Date().toISOString();

    const result = await sql`
      UPDATE ideas 
      SET 
        title = COALESCE(${updates.title}, title),
        description = COALESCE(${updates.description}, description),
        priority = COALESCE(${updates.priority}, priority),
        status = COALESCE(${updates.status}, status),
        updated_at = ${updated_at}
      WHERE id = ${id}
      RETURNING *
    `;

    if (result.length === 0) {
      return NextResponse.json({ success: false, error: "Idea not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Idea updated", data: result[0] });
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
      message: "Mock: Idea deleted" 
    });
  }

  try {
    const result = await sql`
      DELETE FROM ideas WHERE id = ${id}
      RETURNING title
    `;

    if (result.length === 0) {
      return NextResponse.json({ success: false, error: "Idea not found" }, { status: 404 });
    }

    // Log activity
    await sql`
      INSERT INTO activity_feed (id, user, action, target, timestamp)
      VALUES (${`activity-${Date.now()}`}, ${"System"}, ${"deleted"}, ${`idea: ${result[0].title}`}, ${new Date().toISOString()})
    `;

    return NextResponse.json({ success: true, message: "Idea deleted" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
