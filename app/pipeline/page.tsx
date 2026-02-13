"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { DealProbabilityIndicator } from "../components/DealProbabilityIndicator";

type RawDealStage =
  | "Lead"
  | "Qualified"
  | "Proposal Sent"
  | "Negotiation"
  | "Closed Won"
  | "Closed Lost"
  | "Discovery"
  | "Proposal"
  | "On Hold";

type PipelineStage =
  | "Discovery"
  | "Proposal"
  | "Negotiation"
  | "Closed Won"
  | "Closed Lost"
  | "On Hold";

type Deal = {
  id: string;
  company: string;
  contact_id: string | null;
  value: number | null;
  stage: RawDealStage;
  notes: string;
  created_at: string;
  updated_at: string;
};

const stages: PipelineStage[] = [
  "Discovery",
  "Proposal",
  "Negotiation",
  "Closed Won",
  "Closed Lost",
  "On Hold"
];

const stageLabelStyles: Record<PipelineStage, string> = {
  Discovery: "bg-cyan-400/15 text-cyan-100 border-cyan-300/30",
  Proposal: "bg-sky-400/15 text-sky-100 border-sky-300/30",
  Negotiation: "bg-blue-400/15 text-blue-100 border-blue-300/30",
  "Closed Won": "bg-emerald-400/15 text-emerald-100 border-emerald-300/30",
  "Closed Lost": "bg-rose-400/15 text-rose-100 border-rose-300/30",
  "On Hold": "bg-amber-400/15 text-amber-100 border-amber-300/30"
};

const statusDotStyles: Record<PipelineStage, string> = {
  Discovery: "bg-cyan-300",
  Proposal: "bg-sky-300",
  Negotiation: "bg-blue-300",
  "Closed Won": "bg-emerald-300",
  "Closed Lost": "bg-rose-300",
  "On Hold": "bg-amber-300"
};

function normalizeStage(stage: RawDealStage): PipelineStage {
  if (stage === "Lead" || stage === "Qualified") return "Discovery";
  if (stage === "Proposal Sent") return "Proposal";
  if (stages.includes(stage as PipelineStage)) return stage as PipelineStage;
  return "On Hold";
}

function formatCurrency(value: number, compact = false): string {
  if (compact && value >= 1000000) {
    // For millions
    return `$${(value / 1000000).toFixed(1)}M`;
  } else if (compact && value >= 1000) {
    // For thousands
    return `$${(value / 1000).toFixed(0)}K`;
  }
  
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  });
}

function getDaysInStage(updatedAt: string): number {
  const now = new Date();
  const then = new Date(updatedAt);
  const diffMs = now.getTime() - then.getTime();
  return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
}

export default function PipelinePage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [collapsedStages, setCollapsedStages] = useState<Record<PipelineStage, boolean>>({
    Discovery: true,
    Proposal: true,
    Negotiation: true,
    "Closed Won": true,
    "Closed Lost": true,
    "On Hold": true
  });
  const [expandedDealId, setExpandedDealId] = useState<string | null>(null);

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

  const normalizedDeals = useMemo(
    () => deals.map((deal) => ({ ...deal, pipelineStage: normalizeStage(deal.stage) })),
    [deals]
  );

  const summary = useMemo(() => {
    const totalDeals = normalizedDeals.length;
    const totalValue = normalizedDeals.reduce((sum, deal) => sum + (deal.value || 0), 0);
    const won = normalizedDeals.filter((deal) => deal.pipelineStage === "Closed Won").length;
    const lost = normalizedDeals.filter((deal) => deal.pipelineStage === "Closed Lost").length;
    const winRate = won + lost > 0 ? (won / (won + lost)) * 100 : 0;

    return {
      totalDeals,
      totalValue,
      winRate
    };
  }, [normalizedDeals]);

  const groupedDeals = useMemo(
    () =>
      stages.reduce(
        (acc, stage) => {
          acc[stage] = normalizedDeals.filter((deal) => deal.pipelineStage === stage);
          return acc;
        },
        {} as Record<PipelineStage, (Deal & { pipelineStage: PipelineStage })[]>
      ),
    [normalizedDeals]
  );

  const toggleStage = (stage: PipelineStage) => {
    setCollapsedStages((prev) => ({ ...prev, [stage]: !prev[stage] }));
  };

  const toggleDeal = (id: string) => {
    setExpandedDealId((prev) => (prev === id ? null : id));
  };

  const updateDealStage = async (dealId: string, newStage: PipelineStage) => {
    try {
      const res = await fetch("/api/deals", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: dealId, stage: newStage })
      });
      
      if (res.ok) {
        await fetchDeals(); // Refresh deals
      }
    } catch (error) {
      console.error("Failed to update deal stage:", error);
    }
  };

  return (
    <main className="min-h-screen px-3 pb-8 pt-5 text-slate-100 sm:px-6 sm:pt-8">
      <div className="mx-auto w-full max-w-3xl">
        <header className="glass-panel border-white/20 px-4 py-4 sm:px-5">
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-cyan-200/90">
            Sales Pipeline
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Pipeline Overview
          </h1>
          <div className="mt-4 grid grid-cols-3 gap-2 sm:gap-3">
            <div className="glass-card rounded-xl border border-white/10 px-3 py-3">
              <p className="text-[10px] uppercase tracking-[0.14em] text-slate-400">Deals</p>
              <p className="mt-1 truncate text-base font-semibold text-white sm:text-lg">{summary.totalDeals}</p>
            </div>
            <div className="glass-card rounded-xl border border-white/10 px-3 py-3">
              <p className="text-[10px] uppercase tracking-[0.14em] text-slate-400">Value</p>
              <p className="mt-1 truncate text-base font-semibold text-white sm:text-lg">
                {summary.totalValue > 0 ? formatCurrency(summary.totalValue, true) : "$0"}
              </p>
            </div>
            <div className="glass-card rounded-xl border border-white/10 px-3 py-3">
              <p className="text-[10px] uppercase tracking-[0.14em] text-slate-400">Win Rate</p>
              <p className="mt-1 truncate text-base font-semibold text-white sm:text-lg">
                {summary.winRate.toFixed(0)}%
              </p>
            </div>
          </div>
        </header>

        {loading ? (
          <div className="mt-6 glass-card border border-white/10 px-4 py-8 text-center text-sm text-slate-300">
            Loading pipeline...
          </div>
        ) : (
          <section className="mt-4 space-y-3">
            {stages.map((stage) => {
              const stageDeals = groupedDeals[stage];
              const stageValue = stageDeals.reduce((sum, deal) => sum + (deal.value || 0), 0);
              const isCollapsed = collapsedStages[stage];

              return (
                <article key={stage} className="glass-card overflow-hidden border border-white/10">
                  <button
                    type="button"
                    onClick={() => toggleStage(stage)}
                    className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left active:scale-[0.99]"
                    aria-expanded={!isCollapsed}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h2 className="truncate text-base font-semibold text-white sm:text-lg">{stage}</h2>
                        <span
                          className={`inline-flex h-6 min-w-6 items-center justify-center rounded-full border px-2 text-xs font-medium ${stageLabelStyles[stage]}`}
                        >
                          {stageDeals.length}
                        </span>
                      </div>
                      <p className="mt-1 truncate text-sm text-slate-300">
                        {stageValue > 0 ? formatCurrency(stageValue, true) : "$0"}
                      </p>
                    </div>
                    <motion.span
                      animate={{ rotate: isCollapsed ? 0 : 180 }}
                      transition={{ duration: 0.2 }}
                      className="text-lg leading-none text-cyan-200"
                    >
                      ⌄
                    </motion.span>
                  </button>

                  <AnimatePresence initial={false}>
                    {!isCollapsed && (
                      <motion.div
                        key={`${stage}-content`}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.22, ease: "easeOut" }}
                        className="overflow-hidden"
                      >
                        <div className="space-y-2 px-3 pb-3">
                          {stageDeals.length === 0 && (
                            <div className="rounded-lg border border-dashed border-white/15 bg-white/5 px-3 py-4 text-center text-xs text-slate-400">
                              No deals in this stage
                            </div>
                          )}

                          {stageDeals.map((deal) => {
                            const isExpanded = expandedDealId === deal.id;
                            const daysInStage = getDaysInStage(deal.updated_at);

                            return (
                              <motion.div
                                key={deal.id}
                                layout
                                className="glass-panel rounded-xl border border-white/10"
                              >
                                <button
                                  type="button"
                                  onClick={() => toggleDeal(deal.id)}
                                  className="w-full px-3 py-3 text-left"
                                  aria-expanded={isExpanded}
                                >
                                  <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                      <div className="flex items-center gap-2">
                                        <span
                                          className={`mt-1 h-2.5 w-2.5 flex-shrink-0 rounded-full ${statusDotStyles[deal.pipelineStage]}`}
                                          aria-hidden="true"
                                        />
                                        <p className="truncate text-sm font-semibold text-white sm:text-base">
                                          {deal.company}
                                        </p>
                                      </div>
                                      <p className="mt-1 truncate text-xs text-slate-300 sm:text-sm">
                                        {deal.contact_id || "No contact"}
                                      </p>
                                    </div>
                                    <div className="text-right">
                                      <p className="text-sm font-semibold text-cyan-200 sm:text-base">
                                        {deal.value ? formatCurrency(deal.value) : "TBD"}
                                      </p>
                                      <p className="mt-1 text-xs text-slate-400">{daysInStage}d</p>
                                    </div>
                                  </div>
                                </button>

                                <AnimatePresence initial={false}>
                                  {isExpanded && (
                                    <motion.div
                                      initial={{ height: 0, opacity: 0 }}
                                      animate={{ height: "auto", opacity: 1 }}
                                      exit={{ height: 0, opacity: 0 }}
                                      transition={{ duration: 0.2 }}
                                      className="overflow-hidden"
                                    >
                                      <div className="border-t border-white/10 px-3 py-3 text-xs text-slate-300 sm:text-sm">
                                        <p>
                                          <span className="text-slate-400">Created:</span>{" "}
                                          {new Date(deal.created_at).toLocaleDateString()}
                                        </p>
                                        <p className="mt-1">
                                          <span className="text-slate-400">Last update:</span>{" "}
                                          {new Date(deal.updated_at).toLocaleDateString()}
                                        </p>
                                        <p className="mt-1">
                                          <span className="text-slate-400">Days in stage:</span> {daysInStage}
                                        </p>
                                        {deal.notes && (
                                          <p className="mt-2 text-slate-200">
                                            <span className="text-slate-400">Notes:</span> {deal.notes}
                                          </p>
                                        )}
                                        
                                        {/* Deal Closing Probability */}
                                        <DealProbabilityIndicator
                                          dealId={deal.id}
                                          dealValue={deal.value || 0}
                                          dealStage={deal.pipelineStage}
                                        />
                                        
                                        {/* Stage Controls */}
                                        <div className="mt-3 border-t border-white/10 pt-3">
                                          <p className="mb-2 text-xs text-slate-400">Move to stage:</p>
                                          <div className="flex flex-wrap gap-1.5">
                                            {stages.map((targetStage) => {
                                              const isCurrent = targetStage === deal.pipelineStage;
                                              return (
                                                <button
                                                  key={targetStage}
                                                  type="button"
                                                  onClick={() => {
                                                    if (!isCurrent) {
                                                      updateDealStage(deal.id, targetStage);
                                                    }
                                                  }}
                                                  disabled={isCurrent}
                                                  className={`rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-all active:scale-95 ${
                                                    isCurrent
                                                      ? "border-cyan-400/50 bg-cyan-400/20 text-cyan-100 cursor-default"
                                                      : "border-white/20 bg-white/5 text-slate-200 hover:border-cyan-300/40 hover:bg-cyan-400/10 hover:text-cyan-100"
                                                  }`}
                                                >
                                                  {targetStage}
                                                </button>
                                              );
                                            })}
                                          </div>
                                        </div>
                                      </div>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </motion.div>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </article>
              );
            })}
          </section>
        )}
      </div>
    </main>
  );
}
