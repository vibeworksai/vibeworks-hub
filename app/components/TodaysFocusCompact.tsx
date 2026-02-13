"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

interface Task {
  id: string;
  title: string;
  context: string | null;
  priority: string | null;
  status: string;
}

export default function TodaysFocusCompact({ onCreateTask }: { onCreateTask?: () => void }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await fetch("/api/tasks?status=next_actions", { cache: "no-store" });
      const data = await res.json();
      setTasks(data.tasks?.slice(0, 3) || []); // Top 3 next actions
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
      setLoading(false);
    }
  };

  const toggleTask = async (taskId: string) => {
    try {
      await fetch("/api/tasks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          id: taskId, 
          status: "completed",
          completed_at: new Date().toISOString()
        }),
      });
      fetchTasks();
    } catch (error) {
      console.error("Failed to toggle task:", error);
    }
  };

  const getPriorityColor = (priority: string | null) => {
    if (priority === "high") return "text-red-400";
    if (priority === "medium") return "text-yellow-400";
    return "text-green-400";
  };

  const getPriorityIcon = (priority: string | null) => {
    if (priority === "high") return "🔴";
    if (priority === "medium") return "🟡";
    return "🟢";
  };

  const getContextIcon = (context: string | null) => {
    if (context === "@computer") return "💻";
    if (context === "@phone") return "📞";
    if (context === "@email") return "📧";
    if (context === "@meeting") return "👥";
    return "";
  };

  if (loading) {
    return (
      <div className="glass-card p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">⚡️</span>
            <h2 className="text-lg font-semibold">Today's Focus</h2>
          </div>
        </div>
        <p className="text-sm text-slate-400">Loading...</p>
      </div>
    );
  }

  return (
    <div className="glass-card p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">⚡️</span>
          <h2 className="text-lg font-semibold">Today's Focus</h2>
        </div>
        <button
          onClick={onCreateTask}
          className="flex items-center gap-1 rounded-lg bg-cyan-400/20 px-3 py-1.5 text-sm font-medium text-cyan-300 transition-colors hover:bg-cyan-400/30"
        >
          <span>+</span>
        </button>
      </div>

      {tasks.length === 0 ? (
        <div className="py-6 text-center">
          <p className="text-sm text-slate-400 mb-3">No next actions</p>
          <button
            onClick={onCreateTask}
            className="rounded-lg bg-cyan-400/20 px-4 py-2 text-sm font-medium text-cyan-300 transition-colors hover:bg-cyan-400/30"
          >
            + Add Task
          </button>
        </div>
      ) : (
        <>
          <div className="space-y-2 mb-3">
            {tasks.map((task, idx) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="flex items-start gap-3 rounded-lg border border-white/10 bg-white/5 p-3 transition-all hover:border-cyan-400/30"
              >
                <button
                  onClick={() => toggleTask(task.id)}
                  className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 border-slate-400 transition-colors hover:border-cyan-300"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-2">
                    <span className="text-sm">{getPriorityIcon(task.priority)}</span>
                    <p className="flex-1 text-sm font-medium text-white">
                      {task.title}
                    </p>
                    {task.context && (
                      <span className="text-xs text-slate-400">{getContextIcon(task.context)}</span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <Link
            href="/tasks"
            className="block text-center text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            See all tasks →
          </Link>
        </>
      )}
    </div>
  );
}
