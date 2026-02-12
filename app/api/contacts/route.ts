import { NextResponse } from "next/server";

// Mock data - in production this would come from a database
const contacts = [
  {
    id: "1",
    name: "Jameel",
    company: "Supreme Financial",
    email: "jameel@supremefinancial.com",
    phone: "+1-555-0123",
    tags: ["High Value", "Copy Trading"],
    lastContact: new Date().toISOString(),
    notes: "Primary contact for $36K copy trading platform",
    dealId: "1"
  },
  {
    id: "2",
    name: "Management Team",
    company: "Alabama Barker",
    email: "contact@alabamabarker.com",
    phone: "",
    tags: ["Celebrity", "High Profile"],
    lastContact: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    notes: "Celebrity proposal - awaiting response",
    dealId: "2"
  }
];

export async function GET() {
  return NextResponse.json({ contacts });
}

export async function POST(request: Request) {
  const body = await request.json();
  // In production: validate and save to database
  const newContact = {
    id: Date.now().toString(),
    ...body,
    lastContact: new Date().toISOString()
  };
  return NextResponse.json({ success: true, message: "Contact created", data: newContact });
}

export async function PATCH(request: Request) {
  const body = await request.json();
  // In production: update contact in database
  return NextResponse.json({ success: true, message: "Contact updated", data: body });
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  // In production: delete from database
  return NextResponse.json({ success: true, message: `Contact ${id} deleted` });
}
