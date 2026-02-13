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
  created_at: string;
};

const statusLabels: Record<string, string> = {
  inbox: "Inbox",
  next_actions: "Next Actions",
  waiting: "Waiting",
  someday: "Someday",
  completed: "Completed",
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

const priorityColors: Record<string, string> = {
  critical: "text-rose-200 border-rose-300/30",
  high: "text-orange-200 border-orange-300/30",
  medium: "text-cyan-200 border-cyan-300/30",
  low: "text-slate-300 border-slate-500/30",
};

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string>("all");

  const fetchTasks = async () => {
    try {
      const url = activeFilter === "all" 
        ? "/api/tasks"
        : `/api/tasks?status=${activeFilter}`;
      
      const res = await fetch(url, { cache: "no-store" });
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
    const interval = setInterval(fetchTasks, 30000);
    return () => clearInterval(interval);
  }, [activeFilter]);

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
      
      await fetchTasks();
    } catch (error) {
      console.error("Failed to toggle task:", error);
    }
  };

  const groupedTasks = {
    inbox: tasks.filter((t) => t.status === "inbox"),
    next_actions: tasks.filter((t) => t.status === "next_actions"),
    waiting: tasks.filter((t) => t.status === "waiting"),
    someday: tasks.filter((t) => t.status === "someday"),
    completed: tasks.filter((t) => t.status === "completed"),
  };

  return (
    <main className="min-h-screen px-4 pb-8 pt-6 text-slate-100 sm:px-6 sm:pt-10">
      <div className="mx-auto w-full max-w-4xl">
        {/* Header */}
        <header className="glass-panel border-white/20 px-5 py-6 sm:px-8 sm:py-7">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.24em] text-cyan-200/90">
                GTD Task Management
              </p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                Tasks
              </h1>
            </div>
            <Link
              href="/"
              className="text-sm font-medium text-cyan-300 transition-colors hover:text-cyan-200"
            >
              ← Dashboard
            </Link>
          </div>

          {/* Quick Stats */}
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-5">
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs text-slate-400">Inbox</p>
              <p className="mt-1 text-2xl font-semibold text-white">
                {groupedTasks.inbox.length}
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs text-slate-400">Next Actions</p>
              <p className="mt-1 text-2xl font-semibold text-cyan-300">
                {groupedTasks.next_actions.length}
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs text-slate-400">Waiting</p>
              <p className="mt-1 text-2xl font-semibold text-amber-300">
                {groupedTasks.waiting.length}
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs text-slate-400">Someday</p>
              <p className="mt-1 text-2xl font-semibold text-slate-400">
                {groupedTasks.someday.length}
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs text-slate-400">Completed</p>
              <p className="mt-1 text-2xl font-semibold text-emerald-300">
                {groupedTasks.completed.length}
              </p>
            </div>
          </div>

          {/* Filters */}
          <div className="mt-6 flex flex-wrap gap-2">
            {["all", "inbox", "next_actions", "waiting", "someday", "completed"].map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`rounded-lg border px-4 py-2 text-sm font-medium transition-all ${
                  activeFilter === filter
                    ? "border-cyan-300/50 bg-cyan-400/20 text-cyan-100"
                    : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                }`}
              >
                {filter === "all" ? "All Tasks" : statusLabels[filter]}
              </button>
            ))}
          </div>
        </header>

        {/* Task List */}
        <section className="mt-6 space-y-4">
          {loading ? (
            <div className="glass-card border border-white/10 p-8 text-center text-slate-400">
              Loading tasks...
            </div>
          ) : tasks.length === 0 ? (
            <div className="glass-card border border-white/10 p-8 text-center">
              <p className="text-slate-300">🎉 No tasks found</p>
              <p className="mt-2 text-sm text-slate-400">
                {activeFilter === "all" 
                  ? "You're all caught up!" 
                  : `No tasks in ${statusLabels[activeFilter]}`}
              </p>
            </div>
          ) : (
            tasks.map((task) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card border border-white/10 p-5 transition-all hover:border-cyan-300/30"
              >
                <div className="flex items-start gap-4">
                  {/* Checkbox */}
                  <button
                    onClick={() => toggleTask(task.id, task.status)}
                    className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded border-2 border-slate-400 transition-colors hover:border-cyan-300"
                  >
                    {task.status === "completed" && (
                      <span className="text-sm text-cyan-300">✓</span>
                    )}
                  </button>

                  {/* Task Content */}
                  <div className="min-w-0 flex-1">
                    <h3
                      className={`text-lg font-medium ${
                        task.status === "completed"
                          ? "text-slate-400 line-through"
                          : "text-white"
                      }`}
                    >
                      {task.title}
                    </h3>

                    {task.description && (
                      <p className="mt-2 text-sm text-slate-300">
                        {task.description}
                      </p>
                    )}

                    {/* Metadata */}
                    <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-400">
                      {/* Status Badge */}
                      <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1">
                        {statusLabels[task.status]}
                      </span>

                      {/* Context */}
                      {task.context && (
                        <span className="flex items-center gap-1">
                          {contextIcons[task.context] || "📌"} {task.context}
                        </span>
                      )}

                      {/* Priority */}
                      {task.priority && (
                        <span
                          className={`rounded border px-2 py-0.5 ${
                            priorityColors[task.priority] || "text-slate-300"
                          }`}
                        >
                          {task.priority.toUpperCase()}
                        </span>
                      )}

                      {/* Time Estimate */}
                      {task.time_estimate && (
                        <span>⏱️ {task.time_estimate}min</span>
                      )}

                      {/* Energy Level */}
                      {task.energy_level && (
                        <span>
                          {task.energy_level === "high" && "🔥 High Energy"}
                          {task.energy_level === "medium" && "⚡️ Medium Energy"}
                          {task.energy_level === "low" && "💡 Low Energy"}
                        </span>
                      )}

                      {/* Created By */}
                      <span>• by {task.created_by}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </section>

        {/* Coming Soon */}
        <div className="mt-8 glass-card border border-white/10 p-6 text-center">
          <p className="text-sm font-medium text-cyan-200">🚀 Coming Soon</p>
          <p className="mt-2 text-xs text-slate-400">
            Task detail view • Subtasks • Notes • Drag & drop • Filters by context/project/deal
          </p>
        </div>
      </div>
    </main>
  );
}
