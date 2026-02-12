"use client";

import { useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

type Idea = {
  id: string;
  title: string;
  description: string;
  createdBy: string;
  createdAt: string;
};

function SortableIdea({ idea }: { idea: Idea }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: idea.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="glass-card touch-none cursor-grab active:cursor-grabbing p-5 transition-all hover:border-cyan-400/30"
    >
      <div className="flex items-start gap-4">
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-cyan-400/20 text-sm font-semibold text-cyan-300">
          ⋮⋮
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white">{idea.title}</h3>
          <p className="mt-1 text-sm text-slate-300">{idea.description}</p>
          <div className="mt-3 flex items-center gap-3 text-xs text-slate-400">
            <span>by {idea.createdBy}</span>
            <span>•</span>
            <span>{idea.createdAt}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function IdeasPage() {
  const [ideas, setIdeas] = useState<Idea[]>([
    {
      id: "1",
      title: "AI-Powered Video Editing Tool",
      description: "Automated video editing using AI to cut, color grade, and add effects",
      createdBy: "Ivanlee",
      createdAt: "2 days ago"
    },
    {
      id: "2",
      title: "Live Voice Farrah Mobile App",
      description: "Native iOS/Android app for voice conversations with Farrah on the go",
      createdBy: "Natasha",
      createdAt: "5 days ago"
    },
    {
      id: "3",
      title: "Automated Social Media Manager",
      description: "AI agent that creates and schedules social posts across all platforms",
      createdBy: "Ivanlee",
      createdAt: "1 week ago"
    },
    {
      id: "4",
      title: "Client Portal Dashboard",
      description: "White-label dashboard for clients to track project progress and deliverables",
      createdBy: "Natasha",
      createdAt: "1 week ago"
    },
    {
      id: "5",
      title: "Video Testimonial Collection Tool",
      description: "Easy way for clients to record and submit video testimonials",
      createdBy: "Ivanlee",
      createdAt: "2 weeks ago"
    }
  ]);

  const [newIdea, setNewIdea] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 150,
        tolerance: 5
      }
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setIdeas((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleAddIdea = () => {
    if (!newIdea.trim()) return;

    const idea: Idea = {
      id: Date.now().toString(),
      title: newIdea,
      description: "",
      createdBy: "You",
      createdAt: "Just now"
    };

    setIdeas([idea, ...ideas]);
    setNewIdea("");
  };

  return (
    <main className="min-h-screen px-4 pb-8 pt-6 text-slate-100 sm:px-6 sm:pt-10 lg:px-10">
      <div className="mx-auto w-full max-w-4xl">
        {/* Header */}
        <header className="glass-panel border-white/20 px-5 py-6 sm:px-8 sm:py-7">
          <p className="text-xs font-medium uppercase tracking-[0.24em] text-cyan-200/90">
            Idea Backlog
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Ideas
          </h1>
          <p className="mt-3 text-sm text-slate-300 sm:text-base">
            Drag and drop to prioritize. Top ideas get built first.
          </p>
        </header>

        {/* Add New Idea */}
        <div className="glass-card mt-6 p-5">
          <div className="flex gap-3">
            <input
              type="text"
              value={newIdea}
              onChange={(e) => setNewIdea(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddIdea()}
              placeholder="Quick add: type an idea and press Enter..."
              className="flex-1 rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-white placeholder-slate-400 outline-none focus:border-cyan-400/50 focus:bg-white/10"
            />
            <button
              onClick={handleAddIdea}
              className="rounded-lg bg-cyan-400/20 px-6 py-3 font-semibold text-cyan-200 transition-colors hover:bg-cyan-400/30"
            >
              Add
            </button>
          </div>
        </div>

        {/* Ideas List */}
        <div className="mt-6">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-slate-400">
              {ideas.length} {ideas.length === 1 ? "idea" : "ideas"} in backlog
            </p>
            <p className="text-xs text-slate-500">
              Drag to reorder
            </p>
          </div>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={ideas} strategy={verticalListSortingStrategy}>
              <div className="space-y-3">
                {ideas.map((idea, index) => (
                  <div key={idea.id} className="relative">
                    <div className="absolute -left-8 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-600">
                      {index + 1}
                    </div>
                    <SortableIdea idea={idea} />
                  </div>
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      </div>
    </main>
  );
}
