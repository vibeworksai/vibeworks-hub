type DealStage = "Lead" | "Qualified" | "Proposal Sent" | "Negotiation" | "Closed Won" | "Closed Lost";

type Deal = {
  id: string;
  company: string;
  contact: string;
  value: string;
  stage: DealStage;
  lastContact: string;
  notes: string;
};

const deals: Deal[] = [
  {
    id: "1",
    company: "Supreme Financial",
    contact: "Jameel",
    value: "$36,000",
    stage: "Proposal Sent",
    lastContact: "2 hours ago",
    notes: "Copy trading platform proposal delivered"
  },
  {
    id: "2",
    company: "Alabama Barker",
    contact: "Management Team",
    value: "TBD",
    stage: "Lead",
    lastContact: "3 days ago",
    notes: "Celebrity proposal filed"
  }
];

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

export default function PipelinePage() {
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
              <span className="font-semibold text-white">$36K+</span>
            </div>
            <div>
              <span className="text-slate-400">Active Deals:</span>{" "}
              <span className="font-semibold text-white">2</span>
            </div>
          </div>
        </header>

        {/* Pipeline Stages */}
        <section className="mt-6">
          <div className="flex gap-4 overflow-x-auto pb-4">
            {stages.map((stage) => {
              const stageDeals = deals.filter((deal) => deal.stage === stage);
              const stageValue = stageDeals.reduce((sum, deal) => {
                const value = deal.value.replace(/[^0-9]/g, "");
                return sum + (value ? parseInt(value) : 0);
              }, 0);

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
                        <p className="mt-1 text-sm text-slate-300">{deal.contact}</p>
                        <div className="mt-3 flex items-center justify-between text-xs">
                          <span className="font-medium text-cyan-300">{deal.value}</span>
                          <span className="text-slate-400">{deal.lastContact}</span>
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
      </div>
    </main>
  );
}
