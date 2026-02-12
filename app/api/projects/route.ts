import { NextResponse } from "next/server";
import { sql, isDatabaseConfigured } from "@/lib/db";

// Mock data fallback (used if DATABASE_URL not configured)
const mockProjects = [
  {
    id: "supreme-copy-trader",
    name: "Supreme Copy Trader",
    status: "On Track",
    progress: 100,
    description: "Complete copy trading platform for Supreme Financial",
    updated_at: new Date().toISOString()
  },
  {
    id: "trading-bot-v18",
    name: "Trading Bot v18",
    status: "On Track",
    progress: 95,
    description: "Automated trading bot - running and monitoring",
    updated_at: new Date().toISOString()
  },
  {
    id: "sports-betting-engine",
    name: "Sports Betting Engine",
    status: "On Track",
    progress: 85,
    description: "Running with daily retraining",
    updated_at: new Date().toISOString()
  },
  {
    id: "vibeworks-hub",
    name: "VibeWorks Hub",
    status: "On Track",
    progress: 80,
    description: "This project - database connected!",
    updated_at: new Date().toISOString()
  },
  {
    id: "live-voice-farrah",
    name: "Live Voice Farrah",
    status: "Caution",
    progress: 35,
    description: "Research complete, prototype next",
    updated_at: new Date().toISOString()
  },
  {
    id: "mac-mini-dual-gateway",
    name: "Mac Mini Dual Gateway",
    status: "At Risk",
    progress: 20,
    description: "Planning phase",
    updated_at: new Date().toISOString()
  },
  {
    id: "instagram-dm-automation",
    name: "Instagram DM Automation",
    status: "Caution",
    progress: 15,
    description: "Paused - waiting on Meta credentials",
    updated_at: new Date().toISOString()
  }
];

export async function GET() {
  if (!isDatabaseConfigured() || !sql) {
    return NextResponse.json({ projects: mockProjects });
  }

  try {
    const projects = await sql`
      SELECT * FROM projects ORDER BY progress DESC
    `;
    
    return NextResponse.json({ projects });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json({ projects: mockProjects });
  }
}

export async function POST(request: Request) {
  const body = await request.json();

  if (!isDatabaseConfigured() || !sql) {
    return NextResponse.json({ 
      success: true, 
      message: "Mock: Project created (Database not configured)", 
      data: { id: Date.now().toString(), ...body }
    });
  }

  try {
    const project = {
      id: body.id || `project-${Date.now()}`,
      name: body.name,
      status: body.status || "On Track",
      progress: body.progress || 0,
      description: body.description || "",
      tech: body.tech || [],
      updated_at: new Date().toISOString()
    };

    const result = await sql`
      INSERT INTO projects (id, name, status, progress, description, tech, updated_at)
      VALUES (${project.id}, ${project.name}, ${project.status}, ${project.progress}, ${project.description}, ${project.tech}, ${project.updated_at})
      RETURNING *
    `;

    // Log activity
    await sql`
      INSERT INTO activity_feed (id, username, action, target, timestamp)
      VALUES (${`activity-${Date.now()}`}, ${"Farrah"}, ${"created"}, ${`project: ${project.name}`}, ${new Date().toISOString()})
    `;

    return NextResponse.json({ success: true, message: "Project created", data: result[0] });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function PATCH(request: Request) {
  const body = await request.json();

  if (!isDatabaseConfigured() || !sql) {
    return NextResponse.json({ 
      success: true, 
      message: "Mock: Project updated (Database not configured)", 
      data: body 
    });
  }

  try {
    const { id, ...updates } = body;
    const updated_at = new Date().toISOString();

    const result = await sql`
      UPDATE projects 
      SET 
        name = COALESCE(${updates.name}, name),
        status = COALESCE(${updates.status}, status),
        progress = COALESCE(${updates.progress}, progress),
        description = COALESCE(${updates.description}, description),
        tech = COALESCE(${updates.tech}, tech),
        updated_at = ${updated_at}
      WHERE id = ${id}
      RETURNING *
    `;

    if (result.length === 0) {
      return NextResponse.json({ success: false, error: "Project not found" }, { status: 404 });
    }

    // Log activity
    const changes = Object.keys(updates).join(", ");
    await sql`
      INSERT INTO activity_feed (id, username, action, target, timestamp)
      VALUES (${`activity-${Date.now()}`}, ${"Farrah"}, ${"updated"}, ${`project: ${result[0].name} (${changes})`}, ${new Date().toISOString()})
    `;

    return NextResponse.json({ success: true, message: "Project updated", data: result[0] });
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
      message: "Mock: Project deleted (Database not configured)" 
    });
  }

  try {
    const result = await sql`
      DELETE FROM projects WHERE id = ${id}
      RETURNING name
    `;

    if (result.length === 0) {
      return NextResponse.json({ success: false, error: "Project not found" }, { status: 404 });
    }

    // Log activity
    await sql`
      INSERT INTO activity_feed (id, username, action, target, timestamp)
      VALUES (${`activity-${Date.now()}`}, ${"Farrah"}, ${"deleted"}, ${`project: ${result[0].name}`}, ${new Date().toISOString()})
    `;

    return NextResponse.json({ success: true, message: "Project deleted" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
