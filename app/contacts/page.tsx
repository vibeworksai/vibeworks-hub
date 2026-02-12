"use client";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { useState, useEffect } from "react";
import Link from "next/link";

type Contact = {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string | null;
  tags: string[];
  notes: string;
  created_at: string;
  updated_at: string;
};

function getTimeAgo(timestamp: string): string {
  const now = new Date();
  const then = new Date(timestamp);
  const diffMs = now.getTime() - then.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins} minute${diffMins === 1 ? "" : "s"} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
  return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
}

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newContact, setNewContact] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    notes: ""
  });

  const fetchContacts = async () => {
    try {
      const res = await fetch("/api/contacts", { cache: "no-store" });
      const data = await res.json();
      setContacts(data.contacts || []);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch contacts:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
    const interval = setInterval(fetchContacts, 30000);
    return () => clearInterval(interval);
  }, []);

  const filteredContacts = contacts.filter(
    (contact) =>
      contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddContact = () => {
    if (!newContact.name || !newContact.company) return;

    const now = new Date().toISOString();
    const contact: Contact = {
      id: Date.now().toString(),
      ...newContact,
      tags: [],
      created_at: now,
      updated_at: now
    };

    setContacts([contact, ...contacts]);
    setNewContact({ name: "", company: "", email: "", phone: "", notes: "" });
    setShowAddForm(false);
  };

  return (
    <main className="min-h-screen px-4 pb-8 pt-6 text-slate-100 sm:px-6 sm:pt-10 lg:px-10">
      <div className="mx-auto w-full max-w-6xl">
        {/* Header */}
        <header className="glass-panel border-white/20 px-5 py-6 sm:px-8 sm:py-7">
          <p className="text-xs font-medium uppercase tracking-[0.24em] text-cyan-200/90">
            Contact Management
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Contacts
          </h1>
          <div className="mt-4 flex flex-wrap gap-4 text-sm">
            <div>
              <span className="text-slate-400">Total Contacts:</span>{" "}
              <span className="font-semibold text-white">{contacts.length}</span>
            </div>
            <div>
              <span className="text-slate-400">With Active Deals:</span>{" "}
              <span className="font-semibold text-white">
                {contacts.filter((c) => c.dealId).length}
              </span>
            </div>
          </div>
        </header>

        {/* Search & Add */}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search contacts..."
            className="flex-1 rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-white placeholder-slate-400 outline-none focus:border-cyan-400/50 focus:bg-white/10"
          />
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="rounded-lg bg-cyan-400/20 px-6 py-3 font-semibold text-cyan-200 transition-colors hover:bg-cyan-400/30"
          >
            {showAddForm ? "Cancel" : "+ Add Contact"}
          </button>
        </div>

        {/* Add Contact Form */}
        {showAddForm && (
          <div className="glass-card mt-4 p-6">
            <h3 className="text-lg font-semibold text-white">New Contact</h3>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <input
                type="text"
                value={newContact.name}
                onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                placeholder="Name *"
                className="rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-white placeholder-slate-400 outline-none focus:border-cyan-400/50"
              />
              <input
                type="text"
                value={newContact.company}
                onChange={(e) => setNewContact({ ...newContact, company: e.target.value })}
                placeholder="Company *"
                className="rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-white placeholder-slate-400 outline-none focus:border-cyan-400/50"
              />
              <input
                type="email"
                value={newContact.email}
                onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                placeholder="Email"
                className="rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-white placeholder-slate-400 outline-none focus:border-cyan-400/50"
              />
              <input
                type="tel"
                value={newContact.phone}
                onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                placeholder="Phone"
                className="rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-white placeholder-slate-400 outline-none focus:border-cyan-400/50"
              />
              <textarea
                value={newContact.notes}
                onChange={(e) => setNewContact({ ...newContact, notes: e.target.value })}
                placeholder="Notes"
                rows={3}
                className="rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-white placeholder-slate-400 outline-none focus:border-cyan-400/50 sm:col-span-2"
              />
            </div>
            <button
              onClick={handleAddContact}
              className="mt-4 rounded-lg bg-cyan-400/20 px-6 py-3 font-semibold text-cyan-200 transition-colors hover:bg-cyan-400/30"
            >
              Save Contact
            </button>
          </div>
        )}

        {/* Contacts List */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredContacts.map((contact) => (
            <div key={contact.id} className="glass-card p-5 transition-transform hover:scale-[1.02]">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white">{contact.name}</h3>
                  <p className="text-sm text-cyan-300">{contact.company}</p>
                </div>
                {contact.dealId && (
                  <Link
                    href="/pipeline"
                    className="rounded-full bg-emerald-400/20 px-3 py-1 text-xs font-medium text-emerald-300"
                  >
                    Active Deal
                  </Link>
                )}
              </div>

              <div className="mt-4 space-y-2 text-sm">
                {contact.email && (
                  <div className="flex items-center gap-2 text-slate-300">
                    <span className="text-slate-500">📧</span>
                    <a href={`mailto:${contact.email}`} className="hover:text-cyan-300">
                      {contact.email}
                    </a>
                  </div>
                )}
                {contact.phone && (
                  <div className="flex items-center gap-2 text-slate-300">
                    <span className="text-slate-500">📞</span>
                    <a href={`tel:${contact.phone}`} className="hover:text-cyan-300">
                      {contact.phone}
                    </a>
                  </div>
                )}
              </div>

              {contact.tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {contact.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="rounded-full bg-white/10 px-2 py-1 text-xs text-slate-300"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {contact.notes && (
                <p className="mt-3 text-xs text-slate-400">{contact.notes}</p>
              )}

              <p className="mt-3 text-xs text-slate-500">Last contact: {getTimeAgo(contact.updated_at)}</p>
            </div>
          ))}
        </div>

        {filteredContacts.length === 0 && (
          <div className="glass-card mt-6 p-12 text-center">
            <p className="text-slate-400">No contacts found</p>
          </div>
        )}
      </div>
    </main>
  );
}
