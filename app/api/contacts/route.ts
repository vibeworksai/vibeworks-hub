import { NextResponse } from "next/server";
import { sql, isDatabaseConfigured } from "@/lib/db";

// Mock data fallback
const mockContacts = [
  {
    id: "1",
    name: "Jameel",
    company: "Supreme Financial",
    email: "jameel@supremefinancial.com",
    phone: "+1-555-0123",
    role: "CFO",
    tags: ["High Value", "Copy Trading"],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "2",
    name: "Management Team",
    company: "Alabama Barker",
    email: "contact@alabamabarker.com",
    phone: "",
    role: "Management",
    tags: ["Celebrity", "High Profile"],
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  }
];

export async function GET() {
  if (!isDatabaseConfigured() || !sql) {
    return NextResponse.json({ contacts: mockContacts });
  }

  try {
    const contacts = await sql`
      SELECT * FROM contacts ORDER BY created_at DESC
    `;
    
    return NextResponse.json({ contacts });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json({ contacts: mockContacts });
  }
}

export async function POST(request: Request) {
  const body = await request.json();

  if (!isDatabaseConfigured() || !sql) {
    return NextResponse.json({ 
      success: true, 
      message: "Mock: Contact created", 
      data: { id: Date.now().toString(), ...body }
    });
  }

  try {
    const contact = {
      id: body.id || `contact-${Date.now()}`,
      name: body.name,
      company: body.company || "",
      email: body.email || "",
      phone: body.phone || "",
      role: body.role || "",
      tags: body.tags || [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const result = await sql`
      INSERT INTO contacts (id, name, company, email, phone, role, tags, created_at, updated_at)
      VALUES (${contact.id}, ${contact.name}, ${contact.company}, ${contact.email}, ${contact.phone}, ${contact.role}, ${contact.tags}, ${contact.created_at}, ${contact.updated_at})
      RETURNING *
    `;

    // Log activity
    await sql`
      INSERT INTO activity_feed (id, username, action, target, timestamp)
      VALUES (${`activity-${Date.now()}`}, ${"Farrah"}, ${"created"}, ${`contact: ${contact.name} (${contact.company})`}, ${new Date().toISOString()})
    `;

    return NextResponse.json({ success: true, message: "Contact created", data: result[0] });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function PATCH(request: Request) {
  const body = await request.json();

  if (!isDatabaseConfigured() || !sql) {
    return NextResponse.json({ 
      success: true, 
      message: "Mock: Contact updated", 
      data: body 
    });
  }

  try {
    const { id, ...updates } = body;
    const updated_at = new Date().toISOString();

    const result = await sql`
      UPDATE contacts 
      SET 
        name = COALESCE(${updates.name}, name),
        company = COALESCE(${updates.company}, company),
        email = COALESCE(${updates.email}, email),
        phone = COALESCE(${updates.phone}, phone),
        role = COALESCE(${updates.role}, role),
        tags = COALESCE(${updates.tags}, tags),
        updated_at = ${updated_at}
      WHERE id = ${id}
      RETURNING *
    `;

    if (result.length === 0) {
      return NextResponse.json({ success: false, error: "Contact not found" }, { status: 404 });
    }

    // Log activity
    await sql`
      INSERT INTO activity_feed (id, username, action, target, timestamp)
      VALUES (${`activity-${Date.now()}`}, ${"Farrah"}, ${"updated"}, ${`contact: ${result[0].name}`}, ${new Date().toISOString()})
    `;

    return NextResponse.json({ success: true, message: "Contact updated", data: result[0] });
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
      message: "Mock: Contact deleted" 
    });
  }

  try {
    const result = await sql`
      DELETE FROM contacts WHERE id = ${id}
      RETURNING name
    `;

    if (result.length === 0) {
      return NextResponse.json({ success: false, error: "Contact not found" }, { status: 404 });
    }

    // Log activity
    await sql`
      INSERT INTO activity_feed (id, username, action, target, timestamp)
      VALUES (${`activity-${Date.now()}`}, ${"Farrah"}, ${"deleted"}, ${`contact: ${result[0].name}`}, ${new Date().toISOString()})
    `;

    return NextResponse.json({ success: true, message: "Contact deleted" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
