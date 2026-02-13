"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

type Task = {
  id: string;
  title: string;
  description: string | null;
  context: string | null;
  priority: string | null;
  energy_level: string | null;
  time_estimate: number | null;
  status: string;
  deal_id: string | null;
  project_id: string | null;
  due_date: string | null;
  created_by: string;
};

export function TodaysFocus() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = async () => {
    try {
      const res = await fetch("/api/tasks?today=true", { cache: "no-store" });
      const data = await res.json();
      setTasks(data.tasks || []);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
    const interval = setInterval(fetchTasks, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const toggleTask = async (taskId: string, currentStatus: string) => {
    const newStatus = currentStatus === "completed" ? "next_actions" : "completed";
    
    try {
      await fetch("/api/tasks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          id: taskId, 
          status: newStatus,
          completed_at: newStatus === "completed" ? new Date().toISOString() : null
        }),
      });
      
      await fetchTasks(); // Refresh
    } catch (error) {
      console.error("Failed to toggle task:", error);
    }
  };

  const nextActions = tasks.filter((t) => t.status === "next_actions");
  const waiting = tasks.filter((t) => t.status === "waiting");
  const completed = tasks.filter((t) => t.status === "completed");

  const priorityColors: Record<string, string> = {
    critical: "text-rose-200",
    high: "text-orange-200",
    medium: "text-cyan-200",
    low: "text-slate-300",
  };

  const contextIcons: Record<string, string> = {
    "@calls": "📞",
    "@office": "💼",
    "@computer": "💻",
    "@home": "🏠",
    "@errands": "🚗",
    "@waiting": "⏳",
    "@quick": "⚡️",
    "@deep": "🧠",
  };

  if (loading) {
    return (
      <div className="glass-card border border-white/10 p-6">
        <div className="text-center text-sm text-slate-400">
          Loading tasks...
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card border border-white/10 p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">✅ Today's Focus</h2>
          <p className="mt-1 text-xs text-slate-400">
            {nextActions.length} Next Actions • {waiting.length} Waiting
            {completed.length > 0 && ` • ${completed.length} Completed`}
          </p>
        </div>
        <Link
          href="/tasks"
          className="text-xs font-medium text-cyan-300 transition-colors hover:text-cyan-200"
        >
          View All →
        </Link>
      </div>

      {nextActions.length === 0 && waiting.length === 0 ? (
        <div className="rounded-lg border border-white/10 bg-white/5 px-4 py-8 text-center">
          <p className="text-sm text-slate-300">🎉 No tasks for today!</p>
          <p className="mt-1 text-xs text-slate-400">You're all caught up.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Priority Next Actions */}
          {nextActions.length > 0 && (
            <div>
              <h3 className="mb-2 text-xs font-medium uppercase tracking-wider text-slate-400">
                ⚡️ Priority
              </h3>
              <div className="space-y-2">
                {nextActions.slice(0, 3).map((task) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="group flex items-start gap-3 rounded-lg border border-white/10 bg-white/5 p-3 transition-all hover:border-cyan-300/30 hover:bg-white/10"
                  >
                    <button
                      onClick={() => toggleTask(task.id, task.status)}
                      className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 border-slate-400 transition-colors hover:border-cyan-300 group-hover:border-cyan-300"
                    >
                      {task.status === "completed" && (
                        <span className="text-xs text-cyan-300">✓</span>
                      )}
                    </button>
                    
                    <div className="min-w-0 flex-1">
                      <p
                        className={`text-sm font-medium ${
                          task.status === "completed"
                            ? "text-slate-400 line-through"
                            : priorityColors[task.priority || "medium"]
                        }`}
                      >
                        {task.title}
                      </p>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-400">
                        {task.context && (
                          <span className="flex items-center gap-1">
                            {contextIcons[task.context] || "📌"} {task.context}
                          </span>
                        )}
                        {task.time_estimate && (
                          <span>• {task.time_estimate}min</span>
                        )}
                        {task.priority && (
                          <span className="capitalize">• {task.priority}</span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
                {nextActions.length > 3 && (
                  <Link
                    href="/tasks?status=next_actions"
                    className="block text-center text-xs text-slate-400 transition-colors hover:text-cyan-300"
                  >
                    +{nextActions.length - 3} more
                  </Link>
                )}
              </div>
            </div>
          )}

          {/* Waiting */}
          {waiting.length > 0 && (
            <div>
              <h3 className="mb-2 text-xs font-medium uppercase tracking-wider text-slate-400">
                ⏳ Waiting
              </h3>
              <div className="space-y-2">
                {waiting.slice(0, 2).map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 p-3"
                  >
                    <span className="text-lg">⏳</span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm text-slate-300">{task.title}</p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        Added by {task.created_by}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Completed Today */}
          {completed.length > 0 && (
            <div>
              <h3 className="mb-2 text-xs font-medium uppercase tracking-wider text-emerald-400/70">
                ✅ Completed Today
              </h3>
              <div className="space-y-1">
                {completed.slice(0, 2).map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center gap-2 text-xs text-emerald-200/60"
                  >
                    <span>✓</span>
                    <p className="truncate line-through">{task.title}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-white/10">
        <Link
          href="/tasks"
          className="flex items-center justify-center gap-2 rounded-lg border border-cyan-300/30 bg-cyan-400/10 px-4 py-2.5 text-sm font-medium text-cyan-100 transition-all hover:bg-cyan-400/20 active:scale-95"
        >
          <span>View All Tasks</span>
          <span className="text-lg">→</span>
        </Link>
      </div>
    </div>
  );
}
