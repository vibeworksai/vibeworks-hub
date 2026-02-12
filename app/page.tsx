import Link from "next/link";

type ProjectStatus = "On Track" | "Caution" | "At Risk";

type ProjectCard = {
  name: string;
  slug: string;
  status: ProjectStatus;
  progress: number;
  lastUpdated: string;
};

const projects: ProjectCard[] = [
  {
    name: "Supreme Copy Trader",
    slug: "supreme-copy-trader",
    status: "On Track",
    progress: 86,
    lastUpdated: "12 minutes ago"
  },
  {
    name: "Instagram DM Automation",
    slug: "instagram-dm-automation",
    status: "Caution",
    progress: 61,
    lastUpdated: "34 minutes ago"
  },
  {
    name: "Live Voice Farrah",
    slug: "live-voice-farrah",
    status: "On Track",
    progress: 74,
    lastUpdated: "8 minutes ago"
  },
  {
    name: "Mac Mini Dual Gateway",
    slug: "mac-mini-dual-gateway",
    status: "At Risk",
    progress: 42,
    lastUpdated: "1 hour ago"
  },
  {
    name: "Sports Betting Engine",
    slug: "sports-betting-engine",
    status: "Caution",
    progress: 57,
    lastUpdated: "22 minutes ago"
  },
  {
    name: "Trading Bot v18",
    slug: "trading-bot-v18",
    status: "On Track",
    progress: 91,
    lastUpdated: "5 minutes ago"
  }
];

const statusStyles: Record<ProjectStatus, string> = {
  "On Track":
    "border-emerald-300/35 bg-emerald-300/15 text-emerald-100 shadow-[0_0_22px_rgba(52,211,153,0.3)]",
  Caution:
    "border-amber-300/35 bg-amber-300/15 text-amber-100 shadow-[0_0_22px_rgba(251,191,36,0.3)]",
  "At Risk":
    "border-rose-300/35 bg-rose-300/15 text-rose-100 shadow-[0_0_22px_rgba(251,113,133,0.3)]"
};

const progressStyles: Record<ProjectStatus, string> = {
  "On Track": "from-emerald-300 to-cyan-300",
  Caution: "from-amber-300 to-orange-300",
  "At Risk": "from-rose-300 to-pink-300"
};

export default function HomePage() {
  return (
    <main className="min-h-screen px-4 pb-8 pt-6 text-slate-100 sm:px-6 sm:pt-10 lg:px-10">
      <div className="mx-auto w-full max-w-7xl">
        <header className="glass-panel border-white/20 px-5 py-6 sm:px-8 sm:py-7">
          <p className="text-xs font-medium uppercase tracking-[0.24em] text-cyan-200/90">
            Active Project Dashboard
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            VibeWorks Hub
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-slate-300 sm:text-base">
            Real-time portfolio view with execution momentum, delivery risk, and system health.
          </p>
        </header>

        <section className="mt-6 grid grid-cols-1 gap-4 sm:mt-7 sm:gap-5 lg:grid-cols-2 xl:grid-cols-3">
          {projects.map((project) => (
            <Link key={project.slug} href={`/p/${project.slug}`}>
              <article className="glass-card relative overflow-hidden p-5 transition-transform duration-300 hover:-translate-y-0.5 sm:p-6 cursor-pointer">
                <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-cyan-300/10 blur-2xl" />
                <div className="relative z-10">
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="text-lg font-semibold tracking-tight text-white">
                      {project.name}
                    </h2>
                    <span
                      className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-medium ${statusStyles[project.status]}`}
                    >
                      {project.status}
                    </span>
                  </div>

                  <div className="mt-5">
                    <div className="mb-2 flex items-center justify-between text-xs text-slate-300">
                      <span>Progress</span>
                      <span>{project.progress}%</span>
                    </div>
                    <div className="h-2.5 overflow-hidden rounded-full bg-white/10 ring-1 ring-white/15">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${progressStyles[project.status]}`}
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                  </div>

                  <p className="mt-5 text-xs text-slate-300">Last updated {project.lastUpdated}</p>
                </div>
              </article>
            </Link>
          ))}
        </section>
      </div>
    </main>
  );
}
