"use client";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { useEffect, useState } from "react";

type DealStage = "Lead" | "Qualified" | "Proposal Sent" | "Negotiation" | "Closed Won" | "Closed Lost";

type Deal = {
  id: string;
  company: string;
  contact_id: string | null;
  value: number | null;
  stage: DealStage;
  notes: string;
  created_at: string;
  updated_at: string;
};

const stages: DealStage[] = [
  "Lead",
  "Qualified",
  "Proposal Sent",
  "Negotiation",
  "Closed Won",
  "Closed Lost"
];

const stageColors: Record<DealStage, string> = {
  "Lead": "border-slate-400/30 bg-slate-400/10",
  "Qualified": "border-blue-400/30 bg-blue-400/10",
  "Proposal Sent": "border-purple-400/30 bg-purple-400/10",
  "Negotiation": "border-amber-400/30 bg-amber-400/10",
  "Closed Won": "border-emerald-400/30 bg-emerald-400/10",
  "Closed Lost": "border-rose-400/30 bg-rose-400/10"
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

export default function PipelinePage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDeals = async () => {
    try {
      const res = await fetch("/api/deals", { cache: "no-store" });
      const data = await res.json();
      setDeals(data.deals || []);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch deals:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeals();
    const interval = setInterval(fetchDeals, 30000);
    return () => clearInterval(interval);
  }, []);

  const totalValue = deals.reduce((sum, deal) => sum + (deal.value || 0), 0);

  return (
    <main className="min-h-screen px-4 pb-8 pt-6 text-slate-100 sm:px-6 sm:pt-10 lg:px-10">
      <div className="mx-auto w-full max-w-7xl">
        {/* Header */}
        <header className="glass-panel border-white/20 px-5 py-6 sm:px-8 sm:py-7">
          <p className="text-xs font-medium uppercase tracking-[0.24em] text-cyan-200/90">
            Sales Pipeline
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            CRM Pipeline
          </h1>
          <div className="mt-4 flex flex-wrap gap-4 text-sm">
            <div>
              <span className="text-slate-400">Total Pipeline:</span>{" "}
              <span className="font-semibold text-white">
                ${totalValue >= 1000 ? `${(totalValue / 1000).toFixed(0)}K+` : totalValue}
              </span>
            </div>
            <div>
              <span className="text-slate-400">Active Deals:</span>{" "}
              <span className="font-semibold text-white">{deals.length}</span>
            </div>
          </div>
        </header>

        {loading ? (
          <div className="mt-6 text-center text-slate-400">Loading pipeline...</div>
        ) : (
          <section className="mt-6">
            <div className="flex gap-4 overflow-x-auto pb-4">
              {stages.map((stage) => {
                const stageDeals = deals.filter((deal) => deal.stage === stage);
                const stageValue = stageDeals.reduce((sum, deal) => sum + (deal.value || 0), 0);

                return (
                  <article
                    key={stage}
                    className="glass-card min-w-[280px] flex-shrink-0 p-4 sm:min-w-[320px]"
                  >
                    <div className="mb-4">
                      <h2 className="text-lg font-semibold text-white">{stage}</h2>
                      <div className="mt-1 flex items-baseline gap-2">
                        <span className="text-sm text-slate-400">
                          {stageDeals.length} {stageDeals.length === 1 ? "deal" : "deals"}
                        </span>
                        {stageValue > 0 && (
                          <>
                            <span className="text-slate-600">•</span>
                            <span className="text-sm font-medium text-cyan-300">
                              ${(stageValue / 1000).toFixed(0)}K
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="space-y-3">
                      {stageDeals.map((deal) => (
                        <div
                          key={deal.id}
                          className={`rounded-xl border p-4 transition-transform hover:scale-[1.02] ${stageColors[stage]}`}
                        >
                          <h3 className="font-semibold text-white">{deal.company}</h3>
                          <p className="mt-1 text-sm text-slate-300">
                            {deal.contact_id || "No contact"}
                          </p>
                          <div className="mt-3 flex items-center justify-between text-xs">
                            <span className="font-medium text-cyan-300">
                              {deal.value ? `$${deal.value.toLocaleString()}` : "TBD"}
                            </span>
                            <span className="text-slate-400">{getTimeAgo(deal.updated_at)}</span>
                          </div>
                          {deal.notes && (
                            <p className="mt-2 text-xs text-slate-400">{deal.notes}</p>
                          )}
                        </div>
                      ))}

                      {stageDeals.length === 0 && (
                        <div className="rounded-xl border border-dashed border-white/10 bg-white/5 px-3 py-8 text-center text-xs text-slate-400">
                          Drop deal card here
                        </div>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
