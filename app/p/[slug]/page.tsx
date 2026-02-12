type ProjectStatus = "On Track" | "Caution" | "At Risk";

type Task = {
  id: string;
  title: string;
  completed: boolean;
  assignee: string;
};

type Milestone = {
  title: string;
  date: string;
  completed: boolean;
};

type ActivityItem = {
  username: string;
  action: string;
  timestamp: string;
};

type Project = {
  slug: string;
  name: string;
  status: ProjectStatus;
  progress: number;
  lastUpdated: string;
  description: string;
  tasks: Task[];
  milestones: Milestone[];
  activity: ActivityItem[];
  notes: string[];
};

const projectsData: Record<string, Project> = {
  "supreme-copy-trader": {
    slug: "supreme-copy-trader",
    name: "Supreme Copy Trader",
    status: "On Track",
    progress: 86,
    lastUpdated: "12 minutes ago",
    description: "Complete copy trading platform for Supreme Financial. Client proposal sent, awaiting response.",
    tasks: [
      { id: "1", title: "Backend API implementation", completed: true, assignee: "Farrah" },
      { id: "2", title: "Trading bot integration", completed: true, assignee: "Farrah" },
      { id: "3", title: "Dashboard UI design", completed: true, assignee: "Fero" },
      { id: "4", title: "Real-time data streaming", completed: false, assignee: "Farrah" },
      { id: "5", title: "Client presentation deck", completed: false, assignee: "Ivanlee" }
    ],
    milestones: [
      { title: "Proposal sent to client", date: "Feb 10, 2026", completed: true },
      { title: "Technical demo ready", date: "Feb 15, 2026", completed: false },
      { title: "Contract signed", date: "Feb 25, 2026", completed: false }
    ],
    activity: [
      { username: "Farrah", action: "Completed trading bot integration tests", timestamp: "12 min ago" },
      { username: "Ivanlee", action: "Sent proposal to Jameel (Supreme Financial)", timestamp: "2 hours ago" },
      { username: "Fero", action: "Updated dashboard mockups", timestamp: "5 hours ago" },
      { username: "Farrah", action: "Deployed backend to staging", timestamp: "1 day ago" }
    ],
    notes: [
      "Client interested in high-frequency trading capabilities",
      "Jameel wants live demo by Feb 15th",
      "Potential $36K contract value",
      "Consider offering tiered pricing model"
    ]
  },
  "instagram-dm-automation": {
    slug: "instagram-dm-automation",
    name: "Instagram DM Automation",
    status: "Caution",
    progress: 61,
    lastUpdated: "34 minutes ago",
    description: "Automated Instagram DM responses and lead qualification system. Paused waiting on Meta credentials.",
    tasks: [
      { id: "1", title: "Meta API setup", completed: true, assignee: "Farrah" },
      { id: "2", title: "DM parsing logic", completed: true, assignee: "Farrah" },
      { id: "3", title: "Response templates", completed: false, assignee: "Natasha" },
      { id: "4", title: "Lead qualification flow", completed: false, assignee: "Farrah" }
    ],
    milestones: [
      { title: "API credentials approved", date: "Feb 8, 2026", completed: false },
      { title: "MVP testing", date: "Feb 20, 2026", completed: false }
    ],
    activity: [
      { username: "Farrah", action: "Waiting on Meta app approval", timestamp: "34 min ago" },
      { username: "Natasha", action: "Drafted initial response templates", timestamp: "2 days ago" }
    ],
    notes: [
      "Meta app review taking longer than expected",
      "Consider backup using unofficial APIs",
      "Need Natasha's input on response tone"
    ]
  }
};

const statusStyles: Record<ProjectStatus, string> = {
  "On Track": "border-emerald-300/35 bg-emerald-300/15 text-emerald-100",
  "Caution": "border-amber-300/35 bg-amber-300/15 text-amber-100",
  "At Risk": "border-rose-300/35 bg-rose-300/15 text-rose-100"
};

const progressStyles: Record<ProjectStatus, string> = {
  "On Track": "from-emerald-300 to-cyan-300",
  "Caution": "from-amber-300 to-orange-300",
  "At Risk": "from-rose-300 to-pink-300"
};

export default async function ProjectPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = projectsData[slug];

  if (!project) {
    return (
      <main className="flex min-h-screen items-center justify-center p-8">
        <div className="glass-card p-8 text-center">
          <h1 className="text-2xl font-semibold text-white">Project not found</h1>
          <p className="mt-2 text-slate-300">The project &quot;{slug}&quot; does not exist.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-4 pb-8 pt-6 text-slate-100 sm:px-6 sm:pt-10 lg:px-10">
      <div className="mx-auto w-full max-w-7xl">
        {/* Header */}
        <header className="glass-panel border-white/20 px-5 py-6 sm:px-8 sm:py-7">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.24em] text-cyan-200/90">
                Project Details
              </p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                {project.name}
              </h1>
              <p className="mt-3 max-w-2xl text-sm text-slate-300 sm:text-base">
                {project.description}
              </p>
            </div>
            <span
              className={`shrink-0 rounded-full border px-3 py-1.5 text-sm font-medium ${statusStyles[project.status]}`}
            >
              {project.status}
            </span>
          </div>

          <div className="mt-6">
            <div className="mb-2 flex items-center justify-between text-xs text-slate-300">
              <span>Overall Progress</span>
              <span>{project.progress}%</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-white/10 ring-1 ring-white/15">
              <div
                className={`h-full rounded-full bg-gradient-to-r ${progressStyles[project.status]}`}
                style={{ width: `${project.progress}%` }}
              />
            </div>
          </div>
        </header>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Tasks */}
          <section className="lg:col-span-2">
            <article className="glass-card p-6">
              <h2 className="text-xl font-semibold text-white">Tasks</h2>
              <ul className="mt-4 space-y-3">
                {project.tasks.map((task) => (
                  <li
                    key={task.id}
                    className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-4"
                  >
                    <input
                      type="checkbox"
                      checked={task.completed}
                      readOnly
                      className="mt-0.5 h-5 w-5 shrink-0 cursor-pointer rounded border-white/20 bg-white/10"
                    />
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${task.completed ? 'text-slate-400 line-through' : 'text-white'}`}>
                        {task.title}
                      </p>
                      <p className="mt-1 text-xs text-slate-400">Assigned to {task.assignee}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </article>

            {/* Activity Feed */}
            <article className="glass-card mt-6 p-6">
              <h2 className="text-xl font-semibold text-white">Activity</h2>
              <ul className="mt-4 space-y-4">
                {project.activity.map((item, idx) => (
                  <li key={idx} className="border-l-2 border-cyan-300/30 pl-4">
                    <p className="text-sm text-white">
                      <span className="font-semibold text-cyan-200">{item.username}</span> {item.action}
                    </p>
                    <p className="mt-1 text-xs text-slate-400">{item.timestamp}</p>
                  </li>
                ))}
              </ul>
            </article>
          </section>

          {/* Sidebar */}
          <aside className="space-y-6">
            {/* Milestones */}
            <article className="glass-card p-6">
              <h2 className="text-xl font-semibold text-white">Milestones</h2>
              <ul className="mt-4 space-y-3">
                {project.milestones.map((milestone, idx) => (
                  <li key={idx} className="rounded-xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-start gap-3">
                      <div className={`mt-1 h-4 w-4 shrink-0 rounded-full ${milestone.completed ? 'bg-emerald-400' : 'border-2 border-white/30'}`} />
                      <div className="flex-1">
                        <p className={`text-sm font-medium ${milestone.completed ? 'text-slate-300' : 'text-white'}`}>
                          {milestone.title}
                        </p>
                        <p className="mt-1 text-xs text-slate-400">{milestone.date}</p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </article>

            {/* Notes */}
            <article className="glass-card p-6">
              <h2 className="text-xl font-semibold text-white">Notes</h2>
              <ul className="mt-4 space-y-2">
                {project.notes.map((note, idx) => (
                  <li key={idx} className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-slate-200">
                    {note}
                  </li>
                ))}
              </ul>
            </article>
          </aside>
        </div>
      </div>
    </main>
  );
}
