import { NextResponse } from "next/server";

// Mock data - in production this would come from a database
const projects = [
  {
    id: "supreme-copy-trader",
    name: "Supreme Copy Trader",
    status: "On Track",
    progress: 86,
    lastUpdated: new Date().toISOString()
  },
  {
    id: "instagram-dm-automation",
    name: "Instagram DM Automation",
    status: "Caution",
    progress: 61,
    lastUpdated: new Date().toISOString()
  },
  {
    id: "live-voice-farrah",
    name: "Live Voice Farrah",
    status: "On Track",
    progress: 74,
    lastUpdated: new Date().toISOString()
  },
  {
    id: "mac-mini-dual-gateway",
    name: "Mac Mini Dual Gateway",
    status: "At Risk",
    progress: 42,
    lastUpdated: new Date().toISOString()
  },
  {
    id: "sports-betting-engine",
    name: "Sports Betting Engine",
    status: "Caution",
    progress: 57,
    lastUpdated: new Date().toISOString()
  },
  {
    id: "trading-bot-v18",
    name: "Trading Bot v18",
    status: "On Track",
    progress: 91,
    lastUpdated: new Date().toISOString()
  }
];

export async function GET() {
  return NextResponse.json({ projects });
}

export async function POST(request: Request) {
  const body = await request.json();
  // In production: validate and save to database
  return NextResponse.json({ success: true, message: "Project created", data: body });
}
