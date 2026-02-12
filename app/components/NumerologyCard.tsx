"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

type NumerologyInsight = {
  number: number;
  energy: string;
  bestFor: string[];
  avoid: string[];
  advice: string;
  color: string;
};

const numerologyData: Record<number, NumerologyInsight> = {
  1: {
    number: 1,
    energy: "New Beginnings & Leadership",
    bestFor: ["Launching new ventures", "Taking initiative", "Solo projects", "Bold decisions"],
    avoid: ["Waiting for others", "Playing it safe", "Following the crowd"],
    advice: "Today is your day to lead. Start that project you've been putting off.",
    color: "from-red-500/20 to-orange-500/20 border-red-400/30"
  },
  2: {
    number: 2,
    energy: "Partnership & Cooperation",
    bestFor: ["Collaborations", "Negotiations", "Building relationships", "Team meetings"],
    avoid: ["Going solo", "Forcing decisions", "Aggressive tactics"],
    advice: "Seek input from partners. Two heads are better than one today.",
    color: "from-blue-500/20 to-cyan-500/20 border-blue-400/30"
  },
  3: {
    number: 3,
    energy: "Creativity & Expression",
    bestFor: ["Content creation", "Marketing", "Social media", "Brainstorming", "Pitching ideas"],
    avoid: ["Boring tasks", "Rigid schedules", "Overthinking"],
    advice: "Let your creativity flow. Perfect day for content and communication.",
    color: "from-yellow-500/20 to-amber-500/20 border-yellow-400/30"
  },
  4: {
    number: 4,
    energy: "Foundation & Structure",
    bestFor: ["Planning", "Building systems", "Organizing", "Detail work", "Financial review"],
    avoid: ["Rushing", "Taking shortcuts", "Impulse decisions"],
    advice: "Focus on the fundamentals. Build systems that will pay off long-term.",
    color: "from-green-500/20 to-emerald-500/20 border-green-400/30"
  },
  5: {
    number: 5,
    energy: "Change & Adventure",
    bestFor: ["Pivoting strategies", "Testing new ideas", "Travel", "Networking", "Taking risks"],
    avoid: ["Sticking to routine", "Fear of change", "Playing it safe"],
    advice: "Embrace the unexpected. Freedom and flexibility are your superpowers today.",
    color: "from-purple-500/20 to-pink-500/20 border-purple-400/30"
  },
  6: {
    number: 6,
    energy: "Harmony & Service",
    bestFor: ["Customer service", "Team harmony", "Partnerships", "Family business", "Community"],
    avoid: ["Self-centered moves", "Ignoring relationships", "Cutting corners"],
    advice: "Focus on serving others. Your reputation grows through generosity today.",
    color: "from-cyan-500/20 to-teal-500/20 border-cyan-400/30"
  },
  7: {
    number: 7,
    energy: "Analysis & Strategy",
    bestFor: ["Research", "Strategic planning", "Learning", "Introspection", "Data analysis"],
    avoid: ["Surface-level thinking", "Rushing decisions", "Ignoring gut feelings"],
    advice: "Dig deep. The answers you seek require reflection and analysis.",
    color: "from-indigo-500/20 to-violet-500/20 border-indigo-400/30"
  },
  8: {
    number: 8,
    energy: "Power & Material Success",
    bestFor: ["Closing deals", "Money moves", "Investments", "Sports betting", "Bold business plays"],
    avoid: ["Timidity", "Small thinking", "Avoiding money talks"],
    advice: "Money flows to you today. Make power moves and think big.",
    color: "from-emerald-500/20 to-green-500/20 border-emerald-400/30"
  },
  9: {
    number: 9,
    energy: "Completion & Wisdom",
    bestFor: ["Finishing projects", "Letting go", "Sharing knowledge", "Charitable work", "Closure"],
    avoid: ["Starting new things", "Holding grudges", "Resisting endings"],
    advice: "Wrap it up. Clear the deck for new opportunities coming your way.",
    color: "from-rose-500/20 to-pink-500/20 border-rose-400/30"
  }
};

function calculateUniversalDayNumber(date: Date): number {
  const month = date.getMonth() + 1; // 0-indexed
  const day = date.getDate();
  const year = date.getFullYear();
  
  // Sum all digits
  let sum = 0;
  const dateStr = `${month}${day}${year}`;
  
  for (const char of dateStr) {
    sum += parseInt(char, 10);
  }
  
  // Reduce to single digit (1-9)
  while (sum > 9) {
    sum = sum.toString().split('').reduce((acc, digit) => acc + parseInt(digit, 10), 0);
  }
  
  return sum;
}

export function NumerologyCard() {
  const [todayNumber, setTodayNumber] = useState<number | null>(null);
  const [insight, setInsight] = useState<NumerologyInsight | null>(null);

  useEffect(() => {
    const today = new Date();
    const number = calculateUniversalDayNumber(today);
    setTodayNumber(number);
    setInsight(numerologyData[number]);
  }, []);

  if (!todayNumber || !insight) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`glass-panel border border-white/20 bg-gradient-to-br ${insight.color}`}
    >
      <div className="px-4 py-4 sm:px-5 sm:py-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-cyan-200/90">
              Universal Day Number
            </p>
            <div className="mt-2 flex items-baseline gap-3">
              <span className="text-5xl font-bold text-white">{todayNumber}</span>
              <h2 className="text-lg font-semibold text-white sm:text-xl">
                {insight.energy}
              </h2>
            </div>
            <p className="mt-3 text-sm text-slate-200 sm:text-base">
              {insight.advice}
            </p>
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-white/15 bg-white/5 px-3 py-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-300">
              ✓ Best For
            </p>
            <ul className="mt-2 space-y-1">
              {insight.bestFor.map((item, i) => (
                <li key={i} className="text-xs text-slate-200 sm:text-sm">
                  • {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-lg border border-white/15 bg-white/5 px-3 py-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-rose-300">
              ✗ Avoid
            </p>
            <ul className="mt-2 space-y-1">
              {insight.avoid.map((item, i) => (
                <li key={i} className="text-xs text-slate-200 sm:text-sm">
                  • {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">
          <span className="h-1.5 w-1.5 rounded-full bg-cyan-400"></span>
          <span>Numerology updates daily at midnight</span>
        </div>
      </div>
    </motion.div>
  );
}
