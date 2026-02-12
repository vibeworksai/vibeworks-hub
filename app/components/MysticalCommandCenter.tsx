"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { calculateUniversalDayNumber, getLifePathMeaning } from "@/lib/numerology";
import { getZodiacEmoji } from "@/lib/astrology";

type PersonalizedData = {
  universalDayNumber: number;
  universalDayEnergy: string;
  horoscope: {
    description: string;
    mood: string;
    color: string;
    lucky_number: string;
  };
  personalizedAdvice: string;
};

export function MysticalCommandCenter() {
  const { data: session } = useSession();
  const [data, setData] = useState<PersonalizedData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPersonalizedData = async () => {
    if (!session?.user) return;

    try {
      const response = await fetch("/api/mystical-dashboard");
      if (response.ok) {
        const result = await response.json();
        setData(result.data);
      }
      setLoading(false);
      setRefreshing(false);
    } catch (error) {
      console.error("Failed to fetch personalized data:", error);
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPersonalizedData();

    // Auto-refresh on visibility change (PWA app open)
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && !loading) {
        setRefreshing(true);
        fetchPersonalizedData();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [session]);

  const handleManualRefresh = () => {
    setRefreshing(true);
    fetchPersonalizedData();
  };

  if (!session?.user) return null;

  const lifePathMeaning = getLifePathMeaning(session.user.lifePathNumber);
  const zodiacEmoji = getZodiacEmoji(session.user.sunSign);

  if (loading) {
    return (
      <div className="glass-card border border-white/20 p-8 text-center">
        <p className="text-slate-300">Loading your mystical insights...</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel border border-white/20 bg-gradient-to-br from-cyan-400/10 via-transparent to-purple-400/10"
    >
      <div className="px-5 py-5 sm:px-6 sm:py-6">
        {/* Header */}
        <div className="mb-6 flex items-start justify-between">
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-cyan-200/90">
              Mystical Command Center
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">
              {session.user.name}'s Daily Insights
            </h2>
          </div>
          <button
            onClick={handleManualRefresh}
            disabled={refreshing}
            className="rounded-lg border border-cyan-300/30 bg-cyan-400/20 px-4 py-2 text-sm font-medium text-cyan-100 transition-all hover:bg-cyan-400/30 active:scale-95 disabled:opacity-50"
          >
            {refreshing ? "⟳" : "↻"} Refresh
          </button>
        </div>

        {/* Core Numbers */}
        <div className="mb-6 grid gap-4 sm:grid-cols-2">
          {/* Universal Day Number */}
          <div className="rounded-xl border border-cyan-300/30 bg-cyan-400/10 p-5">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full border-2 border-cyan-300 bg-cyan-400/20 text-3xl font-bold text-cyan-100">
                {data?.universalDayNumber || calculateUniversalDayNumber()}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-wider text-cyan-200">
                  Universal Day
                </p>
                <p className="mt-1 text-base font-semibold text-white sm:text-lg">
                  {data?.universalDayEnergy || "Loading..."}
                </p>
              </div>
            </div>
          </div>

          {/* Life Path Number */}
          <div className="rounded-xl border border-purple-300/30 bg-purple-400/10 p-5">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full border-2 border-purple-300 bg-purple-400/20 text-3xl font-bold text-purple-100">
                {session.user.lifePathNumber}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-wider text-purple-200">
                  Your Life Path
                </p>
                <p className="mt-1 text-base font-semibold text-white sm:text-lg">
                  {lifePathMeaning.title}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Horoscope */}
        {data?.horoscope && (
          <div className="mb-6 rounded-xl border border-white/20 bg-white/5 p-5">
            <div className="mb-3 flex items-center gap-3">
              <span className="text-3xl">{zodiacEmoji}</span>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                  {session.user.sunSign} Daily Horoscope
                </p>
                <p className="mt-1 text-sm text-slate-300">
                  Mood: <span className="font-medium text-white">{data.horoscope.mood}</span> •
                  Lucky: <span className="font-medium text-white">{data.horoscope.color}</span>
                </p>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-slate-200 sm:text-base">
              {data.horoscope.description}
            </p>
          </div>
        )}

        {/* Personalized Advice */}
        {data?.personalizedAdvice && (
          <div className="rounded-xl border border-emerald-300/30 bg-gradient-to-br from-emerald-400/10 to-cyan-400/5 p-5">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-emerald-300">
              ✨ Your Personalized Guidance
            </p>
            <p className="text-base leading-relaxed text-white sm:text-lg">
              {data.personalizedAdvice}
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-6 flex items-center gap-2 text-xs text-slate-400">
          <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
          <span>Updates daily • Refreshes automatically on app open</span>
        </div>
      </div>
    </motion.div>
  );
}
