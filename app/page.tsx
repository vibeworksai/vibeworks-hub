"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type ProjectStatus = "On Track" | "Caution" | "At Risk";

type Project = {
  id: string;
  name: string;
  status: ProjectStatus;
  progress: number;
  description: string;
  updated_at: string;
};

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

export default function HomePage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProjects = async () => {
    try {
      const res = await fetch("/api/projects", { cache: "no-store" });
      const data = await res.json();
      setProjects(data.projects || []);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch projects:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();

    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchProjects, 30000);
    return () => clearInterval(interval);
  }, []);

  const onTrackCount = projects.filter((p) => p.status === "On Track").length;
  const avgProgress = projects.length > 0
    ? Math.round(projects.reduce((sum, p) => sum + p.progress, 0) / projects.length)
    : 0;

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

          {/* Quick Stats */}
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs text-slate-400">Active Projects</p>
              <p className="mt-1 text-2xl font-semibold text-white">{projects.length}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs text-slate-400">On Track</p>
              <p className="mt-1 text-2xl font-semibold text-emerald-300">
                {onTrackCount}
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs text-slate-400">Pipeline Value</p>
              <p className="mt-1 text-2xl font-semibold text-cyan-300">$36K+</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs text-slate-400">Avg Progress</p>
              <p className="mt-1 text-2xl font-semibold text-white">{avgProgress}%</p>
            </div>
          </div>
        </header>

        {loading ? (
          <div className="mt-6 text-center text-slate-400">Loading projects...</div>
        ) : projects.length === 0 ? (
          <div className="mt-6 text-center text-slate-400">No projects yet</div>
        ) : (
          <section className="mt-6 grid grid-cols-1 gap-4 sm:mt-7 sm:gap-5 lg:grid-cols-2 xl:grid-cols-3">
            {projects.map((project) => (
              <Link key={project.id} href={`/p/${project.id}`}>
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

                    <p className="mt-5 text-xs text-slate-300">
                      Last updated {getTimeAgo(project.updated_at)}
                    </p>
                  </div>
                </article>
              </Link>
            ))}
          </section>
        )}
      </div>
    </main>
  );
}
