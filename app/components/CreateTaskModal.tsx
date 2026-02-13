"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTaskCreated?: () => void;
}

export default function CreateTaskModal({ isOpen, onClose, onTaskCreated }: CreateTaskModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [context, setContext] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [energy, setEnergy] = useState<"low" | "medium" | "high">("medium");
  const [status, setStatus] = useState<"inbox" | "next" | "waiting" | "someday" | "done">("inbox");
  const [dueDate, setDueDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description: description || null,
          context: context || null,
          priority,
          energy_level: energy,
          status,
          due_date: dueDate || null,
          created_by: "user" // Will be set by API based on session
        })
      });

      if (!response.ok) throw new Error("Failed to create task");

      // Reset form
      setTitle("");
      setDescription("");
      setContext("");
      setPriority("medium");
      setEnergy("medium");
      setStatus("inbox");
      setDueDate("");
      
      onTaskCreated?.();
      onClose();
    } catch (error) {
      console.error("Error creating task:", error);
      alert("Failed to create task. Please try again.");
    } finally {
      setIsSubmitting(false);
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
              className="glass-panel relative w-full max-w-lg border-white/20 p-6"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="mb-6">
                <h2 className="text-2xl font-semibold text-white">Create Task</h2>
                <p className="mt-1 text-sm text-slate-400">Add a new task to your workflow</p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-slate-300">
                    Title <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    placeholder="What needs to be done?"
                    className="mt-1.5 w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-slate-500 focus:border-cyan-400/50 focus:outline-none focus:ring-2 focus:ring-cyan-400/20"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-slate-300">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    placeholder="Additional details..."
                    className="mt-1.5 w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-slate-500 focus:border-cyan-400/50 focus:outline-none focus:ring-2 focus:ring-cyan-400/20"
                  />
                </div>

                {/* Context & Status Row */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300">Context</label>
                    <select
                      value={context}
                      onChange={(e) => setContext(e.target.value)}
                      className="mt-1.5 w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white focus:border-cyan-400/50 focus:outline-none focus:ring-2 focus:ring-cyan-400/20"
                    >
                      <option value="">None</option>
                      <option value="@computer">@computer</option>
                      <option value="@phone">@phone</option>
                      <option value="@email">@email</option>
                      <option value="@meeting">@meeting</option>
                      <option value="@anywhere">@anywhere</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300">Status</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as any)}
                      className="mt-1.5 w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white focus:border-cyan-400/50 focus:outline-none focus:ring-2 focus:ring-cyan-400/20"
                    >
                      <option value="inbox">Inbox</option>
                      <option value="next">Next Action</option>
                      <option value="waiting">Waiting</option>
                      <option value="someday">Someday</option>
                    </select>
                  </div>
                </div>

                {/* Priority & Energy Row */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300">Priority</label>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value as any)}
                      className="mt-1.5 w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white focus:border-cyan-400/50 focus:outline-none focus:ring-2 focus:ring-cyan-400/20"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300">Energy</label>
                    <select
                      value={energy}
                      onChange={(e) => setEnergy(e.target.value as any)}
                      className="mt-1.5 w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white focus:border-cyan-400/50 focus:outline-none focus:ring-2 focus:ring-cyan-400/20"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>

                {/* Due Date */}
                <div>
                  <label className="block text-sm font-medium text-slate-300">Due Date</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="mt-1.5 w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white focus:border-cyan-400/50 focus:outline-none focus:ring-2 focus:ring-cyan-400/20"
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:bg-white/10"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || !title.trim()}
                    className="flex-1 rounded-lg bg-cyan-400 px-4 py-2.5 text-sm font-semibold text-slate-900 transition-all hover:bg-cyan-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? "Creating..." : "Create Task"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
