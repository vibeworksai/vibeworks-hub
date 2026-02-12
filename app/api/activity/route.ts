import { NextResponse } from "next/server";
import { sql, isDatabaseConfigured } from "@/lib/db";

// Mock data fallback
const mockActivity = [
  {
    id: "1",
    user: "Farrah",
    action: "updated",
    target: "project: Supreme Copy Trader to 100%",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "2",
    user: "Fero",
    action: "built",
    target: "project: VibeWorks Hub CRM system",
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "3",
    user: "Farrah",
    action: "created",
    target: "contact: Jameel (Supreme Financial)",
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
  }
];

export async function GET() {
  if (!isDatabaseConfigured() || !sql) {
    return NextResponse.json({ activity: mockActivity });
  }

  try {
    const activity = await sql`
      SELECT * FROM activity_feed 
      ORDER BY timestamp DESC 
      LIMIT 50
    `;
    
    return NextResponse.json({ activity });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json({ activity: mockActivity });
  }
}

export async function POST(request: Request) {
  const body = await request.json();

  if (!isDatabaseConfigured() || !sql) {
    return NextResponse.json({ 
      success: true, 
      message: "Mock: Activity logged", 
      data: { id: Date.now().toString(), ...body }
    });
  }

  try {
    const activity = {
      id: `activity-${Date.now()}`,
      user: body.user || "System",
      action: body.action,
      target: body.target,
      timestamp: new Date().toISOString()
    };

    const result = await sql`
      INSERT INTO activity_feed (id, user, action, target, timestamp)
      VALUES (${activity.id}, ${activity.user}, ${activity.action}, ${activity.target}, ${activity.timestamp})
      RETURNING *
    `;

    return NextResponse.json({ success: true, message: "Activity logged", data: result[0] });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
