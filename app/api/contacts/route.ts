import { NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

// Mock data fallback
const mockContacts = [
  {
    id: "1",
    name: "Jameel",
    company: "Supreme Financial",
    email: "jameel@supremefinancial.com",
    phone: "+1-555-0123",
    tags: ["High Value", "Copy Trading"],
    last_contact: new Date().toISOString(),
    notes: "Primary contact for $36K copy trading platform",
    deal_id: "1"
  },
  {
    id: "2",
    name: "Management Team",
    company: "Alabama Barker",
    email: "contact@alabamabarker.com",
    phone: "",
    tags: ["Celebrity", "High Profile"],
    last_contact: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    notes: "Celebrity proposal - awaiting response",
    deal_id: "2"
  }
];

export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ contacts: mockContacts });
  }

  const { data, error } = await supabase
    .from("contacts")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Supabase error:", error);
    return NextResponse.json({ contacts: mockContacts });
  }

  return NextResponse.json({ contacts: data || [] });
}

export async function POST(request: Request) {
  const body = await request.json();

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ 
      success: true, 
      message: "Mock: Contact created", 
      data: { id: Date.now().toString(), ...body }
    });
  }

  const contact = {
    id: body.id || `contact-${Date.now()}`,
    name: body.name,
    company: body.company,
    email: body.email || "",
    phone: body.phone || "",
    tags: body.tags || [],
    notes: body.notes || "",
    deal_id: body.dealId || body.deal_id || null,
    last_contact: new Date().toISOString()
  };

  const { data, error } = await supabase
    .from("contacts")
    .insert(contact)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }

  await supabase.from("activity_feed").insert({
    user_name: "Farrah",
    action: `Added contact: ${contact.name} (${contact.company})`,
    entity_type: "contact",
    entity_id: contact.id
  });

  return NextResponse.json({ success: true, message: "Contact created", data });
}

export async function PATCH(request: Request) {
  const body = await request.json();

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ 
      success: true, 
      message: "Mock: Contact updated", 
      data: body 
    });
  }

  const { id, dealId, ...updates } = body;
  if (dealId !== undefined) updates.deal_id = dealId;
  updates.last_contact = new Date().toISOString();

  const { data, error } = await supabase
    .from("contacts")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true, message: "Contact updated", data });
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ success: false, error: "Missing id" }, { status: 400 });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ success: true, message: "Mock: Contact deleted" });
  }

  const { error } = await supabase
    .from("contacts")
    .delete()
    .eq("id", id);

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true, message: `Contact ${id} deleted` });
}
