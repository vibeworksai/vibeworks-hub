"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

type EnhancedInsights = {
  moonPhase: {
    phase: string;
    emoji: string;
    meaning: string;
    businessGuidance: string;
    illumination: number;
  };
  tarot: {
    name: string;
    emoji: string;
    meaning: string;
    businessMeaning: string;
    reversed: boolean;
  };
  businessRecommendations: Array<{
    category: string;
    score: number;
    recommendation: string;
    reasoning: string;
  }>;
  nextFullMoon?: string;
  nextNewMoon?: string;
};

export function EnhancedMysticalInsights() {
  const [insights, setInsights] = useState<EnhancedInsights | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInsights();
  }, []);

  const fetchInsights = async () => {
    try {
      const response = await fetch("/api/enhanced-insights");
      if (response.ok) {
        const data = await response.json();
        setInsights(data.data);
      }
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch enhanced insights:", error);
      setLoading(false);
    }
  };

  if (loading || !insights) return null;

  return (
    <div className="space-y-4">
      {/* Moon Phase Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel border border-white/20 bg-gradient-to-br from-indigo-400/10 via-transparent to-purple-400/10"
      >
        <div className="px-5 py-5">
          <div className="mb-4 flex items-start justify-between">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-indigo-200">
                Moon Phase
              </p>
              <div className="mt-2 flex items-baseline gap-3">
                <span className="text-5xl">{insights.moonPhase.emoji}</span>
                <h3 className="text-xl font-bold text-white">{insights.moonPhase.phase}</h3>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-400">Illumination</p>
              <p className="text-2xl font-bold text-white">{insights.moonPhase.illumination}%</p>
            </div>
          </div>

          <p className="mb-3 text-sm text-slate-300">{insights.moonPhase.meaning}</p>

          <div className="rounded-lg border border-indigo-300/20 bg-indigo-400/10 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-indigo-200">
              Business Guidance
            </p>
            <p className="mt-1 text-sm text-white">{insights.moonPhase.businessGuidance}</p>
          </div>

          {(insights.nextFullMoon || insights.nextNewMoon) && (
            <div className="mt-3 flex gap-4 text-xs text-slate-400">
              {insights.nextNewMoon && (
                <div>
                  <span className="text-slate-500">Next New Moon:</span>{" "}
                  <span className="text-slate-300">{insights.nextNewMoon}</span>
                </div>
              )}
              {insights.nextFullMoon && (
                <div>
                  <span className="text-slate-500">Next Full Moon:</span>{" "}
                  <span className="text-slate-300">{insights.nextFullMoon}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>

      {/* Daily Tarot Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-panel border border-white/20 bg-gradient-to-br from-purple-400/10 via-transparent to-pink-400/10"
      >
        <div className="px-5 py-5">
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-purple-200">
            Daily Tarot
          </p>
          <div className="mt-2 flex items-baseline gap-3">
            <span className="text-5xl">{insights.tarot.emoji}</span>
            <div>
              <h3 className="text-xl font-bold text-white">{insights.tarot.name}</h3>
              {insights.tarot.reversed && (
                <span className="text-xs font-medium text-rose-300">(Reversed)</span>
              )}
            </div>
          </div>

          <p className="mt-3 text-sm text-slate-300">{insights.tarot.meaning}</p>

          <div className="mt-3 rounded-lg border border-purple-300/20 bg-purple-400/10 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-purple-200">
              Business Meaning
            </p>
            <p className="mt-1 text-sm text-white">{insights.tarot.businessMeaning}</p>
          </div>
        </div>
      </motion.div>

      {/* Business Timing Recommendations */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-panel border border-white/20 bg-gradient-to-br from-emerald-400/10 via-transparent to-cyan-400/10"
      >
        <div className="px-5 py-5">
          <p className="mb-4 text-[11px] font-medium uppercase tracking-[0.22em] text-emerald-200">
            Business Timing • Today
          </p>

          <div className="space-y-3">
            {insights.businessRecommendations.map((rec, idx) => (
              <div
                key={idx}
                className="rounded-lg border border-white/10 bg-white/5 px-4 py-3"
              >
                <div className="mb-2 flex items-center justify-between">
                  <h4 className="font-semibold text-white">{rec.category}</h4>
                  <div className="flex items-center gap-2">
                    <div className="flex gap-0.5">
                      {Array.from({ length: 10 }).map((_, i) => (
                        <div
                          key={i}
                          className={`h-2 w-1.5 rounded-sm ${
                            i < rec.score
                              ? rec.score >= 8
                                ? "bg-emerald-400"
                                : rec.score >= 6
                                ? "bg-cyan-400"
                                : "bg-amber-400"
                              : "bg-white/10"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs font-medium text-slate-300">
                      {rec.score}/10
                    </span>
                  </div>
                </div>
                <p className="mb-1 text-sm font-medium text-cyan-200">{rec.recommendation}</p>
                <p className="text-xs text-slate-400">{rec.reasoning}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
