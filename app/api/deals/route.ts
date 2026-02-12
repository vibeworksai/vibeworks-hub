import { NextResponse } from "next/server";

// Mock data - in production this would come from a database
const deals = [
  {
    id: "1",
    company: "Supreme Financial",
    contact: "Jameel",
    value: 36000,
    stage: "Proposal Sent",
    lastContact: new Date().toISOString(),
    notes: "Copy trading platform proposal delivered"
  },
  {
    id: "2",
    company: "Alabama Barker",
    contact: "Management Team",
    value: null,
    stage: "Lead",
    lastContact: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    notes: "Celebrity proposal filed"
  }
];

export async function GET() {
  return NextResponse.json({ deals });
}

export async function POST(request: Request) {
  const body = await request.json();
  // In production: validate and save to database
  return NextResponse.json({ success: true, message: "Deal created", data: body });
}

export async function PATCH(request: Request) {
  const body = await request.json();
  // In production: update deal in database
  return NextResponse.json({ success: true, message: "Deal updated", data: body });
}
