"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { MysticalCommandCenter } from "./components/MysticalCommandCenter";
import { EnhancedMysticalInsights } from "./components/EnhancedMysticalInsights";
import TodaysFocusCompact from "./components/TodaysFocusCompact";
import CriticalAlerts from "./components/CriticalAlerts";
import IntelligenceTabs from "./components/IntelligenceTabs";
import CreateTaskModal from "./components/CreateTaskModal";
import { getGreeting, getGreetingSubtitle } from "@/lib/greeting";

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
  const { data: session } = useSession();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false);
  const [isMysticalExpanded, setIsMysticalExpanded] = useState(false);

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
    <main className="min-h-screen px-4 pb-24 pt-6 text-slate-100 sm:px-6 sm:pt-10 lg:px-10">
      <div className="mx-auto w-full max-w-7xl">
        {/* 1. COMPACT HEADER */}
        <header className="glass-panel border-white/20 px-5 py-4 sm:px-8 sm:py-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <p className="text-xs font-medium uppercase tracking-[0.24em] text-cyan-200/90">
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                  timeZone: 'America/New_York'
                })}
              </p>
              <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                {session?.user?.name ? getGreeting(session.user.name.split(' ')[0]) : 'Welcome back'}
              </h1>
              <p className="mt-1 text-sm text-slate-400">
                {getGreetingSubtitle()}
              </p>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="mt-4 flex gap-2">
            <button
              onClick={() => setIsCreateTaskModalOpen(true)}
              className="flex-1 rounded-lg bg-cyan-400/20 px-4 py-2 text-sm font-semibold text-cyan-200 transition-all hover:bg-cyan-400/30"
            >
              + Task
            </button>
            <Link
              href="/pipeline"
              className="flex-1 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-center text-sm font-medium text-slate-300 transition-colors hover:bg-white/10"
            >
              Pipeline →
            </Link>
          </div>
        </header>

        {session?.user && (
          <>
            {/* 2. TODAY'S FOCUS - TOP PRIORITY */}
            <div className="mt-4 sm:mt-5">
              <TodaysFocusCompact onCreateTask={() => setIsCreateTaskModalOpen(true)} />
            </div>

            {/* 3. CRITICAL ALERTS */}
            <div className="mt-4 sm:mt-5">
              <CriticalAlerts userId={session.user.id || "1"} />
            </div>

            {/* 4. QUICK STATS */}
            <div className="mt-4 sm:mt-5">
              <div className="glass-card p-4">
                <h3 className="mb-3 text-sm font-semibold text-slate-300">Quick Stats</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                    <p className="text-xs text-slate-400">Pipeline Value</p>
                    <p className="mt-1 text-xl font-bold text-cyan-300">$36K</p>
                  </div>
                  <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                    <p className="text-xs text-slate-400">Active Projects</p>
                    <p className="mt-1 text-xl font-bold text-white">{projects.length}</p>
                  </div>
                  <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                    <p className="text-xs text-slate-400">On Track</p>
                    <p className="mt-1 text-xl font-bold text-emerald-300">{onTrackCount}</p>
                  </div>
                  <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                    <p className="text-xs text-slate-400">Avg Progress</p>
                    <p className="mt-1 text-xl font-bold text-white">{avgProgress}%</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 5. MYSTICAL TIMING - COLLAPSIBLE */}
            <div className="mt-4 sm:mt-5">
              <div className="glass-card p-4">
                <button
                  onClick={() => setIsMysticalExpanded(!isMysticalExpanded)}
                  className="w-full flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🌙</span>
                    <h2 className="text-lg font-semibold">Today's Energy</h2>
                  </div>
                  <motion.div
                    animate={{ rotate: isMysticalExpanded ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </motion.div>
                </button>

                {isMysticalExpanded && (
                  <div className="mt-4 space-y-4">
                    <MysticalCommandCenter />
                    <EnhancedMysticalInsights />
                  </div>
                )}
              </div>
            </div>

            {/* 6. INTELLIGENCE LAYER - TABBED */}
            <div className="mt-4 sm:mt-5">
              <IntelligenceTabs userId={session.user.id || "1"} />
            </div>
          </>
        )}

        {/* 7. PROJECTS - BOTTOM */}
        {loading ? (
          <div className="mt-6 text-center text-slate-400">Loading projects...</div>
        ) : projects.length === 0 ? (
          <div className="mt-6 text-center text-slate-400">No projects yet</div>
        ) : (
          <section className="mt-4 sm:mt-5">
            <div className="glass-card p-4">
              <h3 className="mb-3 text-lg font-semibold">Projects ({projects.length})</h3>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {projects.map((project) => (
                  <Link key={project.id} href={`/p/${project.id}`}>
                    <article className="relative overflow-hidden rounded-lg border border-white/10 bg-white/5 p-4 transition-all hover:border-cyan-400/30 cursor-pointer">
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <h3 className="text-sm font-semibold text-white flex-1">
                          {project.name}
                        </h3>
                        <span
                          className={`shrink-0 rounded-full border px-2 py-0.5 text-xs font-medium ${statusStyles[project.status]}`}
                        >
                          {project.status}
                        </span>
                      </div>

                      <div className="mb-2 flex items-center justify-between text-xs text-slate-400">
                        <span>Progress</span>
                        <span className="font-medium text-white">{project.progress}%</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-white/10">
                        <div
                          className={`h-full rounded-full bg-gradient-to-r ${progressStyles[project.status]}`}
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>

                      <p className="mt-3 text-xs text-slate-400">
                        {getTimeAgo(project.updated_at)}
                      </p>
                    </article>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}
      </div>

      {/* Create Task Modal */}
      <CreateTaskModal
        isOpen={isCreateTaskModalOpen}
        onClose={() => setIsCreateTaskModalOpen(false)}
        onTaskCreated={() => {
          setIsCreateTaskModalOpen(false);
          // Could refresh tasks here if needed
        }}
      />
    </main>
  );
}
