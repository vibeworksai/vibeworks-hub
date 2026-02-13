"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Task {
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
  completed_at?: string | null;
}

interface TaskDetailModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onTaskUpdated?: () => void;
  onTaskDeleted?: () => void;
}

export default function TaskDetailModal({ 
  task, 
  isOpen, 
  onClose, 
  onTaskUpdated,
  onTaskDeleted 
}: TaskDetailModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTask, setEditedTask] = useState<Partial<Task>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!task) return null;

  const handleEdit = () => {
    setEditedTask({
      title: task.title,
      description: task.description,
      context: task.context,
      priority: task.priority,
      energy_level: task.energy_level,
      status: task.status,
      due_date: task.due_date,
      time_estimate: task.time_estimate
    });
    setIsEditing(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch("/api/tasks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: task.id,
          ...editedTask
        })
      });

      if (!response.ok) throw new Error("Failed to update task");

      setIsEditing(false);
      onTaskUpdated?.();
    } catch (error) {
      console.error("Error updating task:", error);
      alert("Failed to update task. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this task?")) return;
    
    setIsDeleting(true);
    try {
      const response = await fetch("/api/tasks", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: task.id })
      });

      if (!response.ok) throw new Error("Failed to delete task");

      onTaskDeleted?.();
      onClose();
    } catch (error) {
      console.error("Error deleting task:", error);
      alert("Failed to delete task. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const toggleStatus = async () => {
    const newStatus = task.status === "completed" ? "next_actions" : "completed";
    
    try {
      await fetch("/api/tasks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: task.id,
          status: newStatus,
          completed_at: newStatus === "completed" ? new Date().toISOString() : null
        })
      });

      onTaskUpdated?.();
    } catch (error) {
      console.error("Error toggling task:", error);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="glass-panel relative w-full max-w-2xl max-h-[90vh] overflow-y-auto border-white/20 p-6"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="mb-6 flex items-start justify-between">
                <div className="flex-1">
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedTask.title || ""}
                      onChange={(e) => setEditedTask({ ...editedTask, title: e.target.value })}
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-xl font-semibold text-white focus:border-cyan-400/50 focus:outline-none focus:ring-2 focus:ring-cyan-400/20"
                    />
                  ) : (
                    <h2 className="text-2xl font-semibold text-white">{task.title}</h2>
                  )}
                  
                  {/* Status Badge */}
                  <div className="mt-3 flex items-center gap-3">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
                      task.status === "completed" 
                        ? "bg-emerald-400/20 text-emerald-200"
                        : task.status === "next_actions"
                        ? "bg-cyan-400/20 text-cyan-200"
                        : task.status === "waiting"
                        ? "bg-amber-400/20 text-amber-200"
                        : "bg-slate-400/20 text-slate-300"
                    }`}>
                      {task.status === "inbox" && "📥 Inbox"}
                      {task.status === "next_actions" && "▶️ Next Action"}
                      {task.status === "waiting" && "⏳ Waiting"}
                      {task.status === "someday" && "🌙 Someday"}
                      {task.status === "completed" && "✅ Completed"}
                    </span>

                    {task.priority && (
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                        task.priority === "high" 
                          ? "bg-red-400/20 text-red-200"
                          : task.priority === "medium"
                          ? "bg-cyan-400/20 text-cyan-200"
                          : "bg-slate-400/20 text-slate-300"
                      }`}>
                        {task.priority.toUpperCase()}
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={onClose}
                  className="text-slate-400 hover:text-white"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Description */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
                {isEditing ? (
                  <textarea
                    value={editedTask.description || ""}
                    onChange={(e) => setEditedTask({ ...editedTask, description: e.target.value })}
                    rows={4}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-slate-500 focus:border-cyan-400/50 focus:outline-none focus:ring-2 focus:ring-cyan-400/20"
                  />
                ) : (
                  <p className="text-slate-300">{task.description || "No description"}</p>
                )}
              </div>

              {/* Details Grid */}
              <div className="mb-6 grid grid-cols-2 gap-4">
                {/* Context */}
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Context</label>
                  {isEditing ? (
                    <select
                      value={editedTask.context || ""}
                      onChange={(e) => setEditedTask({ ...editedTask, context: e.target.value })}
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white focus:border-cyan-400/50 focus:outline-none"
                    >
                      <option value="">None</option>
                      <option value="@computer">@computer</option>
                      <option value="@phone">@phone</option>
                      <option value="@email">@email</option>
                      <option value="@meeting">@meeting</option>
                      <option value="@anywhere">@anywhere</option>
                    </select>
                  ) : (
                    <p className="text-white">{task.context || "—"}</p>
                  )}
                </div>

                {/* Energy */}
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Energy Level</label>
                  {isEditing ? (
                    <select
                      value={editedTask.energy_level || ""}
                      onChange={(e) => setEditedTask({ ...editedTask, energy_level: e.target.value })}
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white focus:border-cyan-400/50 focus:outline-none"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  ) : (
                    <p className="text-white">
                      {task.energy_level === "high" && "🔥 High"}
                      {task.energy_level === "medium" && "⚡️ Medium"}
                      {task.energy_level === "low" && "💡 Low"}
                    </p>
                  )}
                </div>

                {/* Due Date */}
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Due Date</label>
                  {isEditing ? (
                    <input
                      type="date"
                      value={editedTask.due_date || ""}
                      onChange={(e) => setEditedTask({ ...editedTask, due_date: e.target.value })}
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white focus:border-cyan-400/50 focus:outline-none"
                    />
                  ) : (
                    <p className="text-white">
                      {task.due_date ? new Date(task.due_date).toLocaleDateString() : "—"}
                    </p>
                  )}
                </div>

                {/* Time Estimate */}
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Time Estimate</label>
                  {isEditing ? (
                    <input
                      type="number"
                      value={editedTask.time_estimate || ""}
                      onChange={(e) => setEditedTask({ ...editedTask, time_estimate: parseInt(e.target.value) || null })}
                      placeholder="Minutes"
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white focus:border-cyan-400/50 focus:outline-none"
                    />
                  ) : (
                    <p className="text-white">{task.time_estimate ? `${task.time_estimate} min` : "—"}</p>
                  )}
                </div>
              </div>

              {/* Metadata */}
              <div className="mb-6 rounded-lg border border-white/10 bg-white/5 p-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-slate-400">Created By</p>
                    <p className="text-white">{task.created_by}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Created At</p>
                    <p className="text-white">{new Date(task.created_at).toLocaleString()}</p>
                  </div>
                  {task.completed_at && (
                    <div className="col-span-2">
                      <p className="text-slate-400">Completed At</p>
                      <p className="text-white">{new Date(task.completed_at).toLocaleString()}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-3">
                {isEditing ? (
                  <>
                    <button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="flex-1 rounded-lg bg-cyan-400 px-4 py-2.5 text-sm font-semibold text-slate-900 transition-all hover:bg-cyan-300 disabled:opacity-50"
                    >
                      {isSaving ? "Saving..." : "Save Changes"}
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="flex-1 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:bg-white/10"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={toggleStatus}
                      className="flex-1 rounded-lg bg-emerald-400/20 px-4 py-2.5 text-sm font-semibold text-emerald-200 transition-all hover:bg-emerald-400/30"
                    >
                      {task.status === "completed" ? "Mark Incomplete" : "Mark Complete"}
                    </button>
                    <button
                      onClick={handleEdit}
                      className="flex-1 rounded-lg bg-cyan-400/20 px-4 py-2.5 text-sm font-semibold text-cyan-200 transition-all hover:bg-cyan-400/30"
                    >
                      Edit Task
                    </button>
                    <button
                      onClick={handleDelete}
                      disabled={isDeleting}
                      className="rounded-lg border border-red-400/30 px-4 py-2.5 text-sm font-medium text-red-300 transition-colors hover:bg-red-400/10 disabled:opacity-50"
                    >
                      {isDeleting ? "Deleting..." : "Delete"}
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
