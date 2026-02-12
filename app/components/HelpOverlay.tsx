"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function HelpOverlay() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Help Button (Fixed position) */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex h-12 w-12 items-center justify-center rounded-full border border-cyan-300/30 bg-cyan-400/20 text-2xl shadow-lg backdrop-blur-sm transition-all hover:scale-110 hover:bg-cyan-400/30 active:scale-95"
        aria-label="Help"
      >
        ?
      </button>

      {/* Help Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            />

            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed left-1/2 top-1/2 z-50 w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 px-4"
            >
              <div className="glass-card max-h-[80vh] overflow-y-auto border border-white/20 p-6">
                <div className="mb-6 flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-white">VibeWorks Hub Guide</h2>
                    <p className="mt-1 text-sm text-slate-400">
                      Your mystical command center explained
                    </p>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="text-2xl text-slate-400 transition-colors hover:text-white"
                  >
                    ×
                  </button>
                </div>

                <div className="space-y-6 text-sm">
                  {/* Universal Day Number */}
                  <div>
                    <h3 className="mb-2 font-semibold text-cyan-300">
                      🌍 Universal Day Number
                    </h3>
                    <p className="text-slate-300">
                      Calculated from today's date (month + day + year). Each number 1-9
                      carries specific energy. Use this to align your activities with the
                      day's natural flow.
                    </p>
                  </div>

                  {/* Life Path Number */}
                  <div>
                    <h3 className="mb-2 font-semibold text-purple-300">
                      ✨ Life Path Number
                    </h3>
                    <p className="text-slate-300">
                      Your core number, calculated from your birth date. Reveals your life's
                      purpose and natural strengths. Master Numbers (11, 22, 33) indicate
                      elevated spiritual calling.
                    </p>
                  </div>

                  {/* Daily Horoscope */}
                  <div>
                    <h3 className="mb-2 font-semibold text-amber-300">⭐ Daily Horoscope</h3>
                    <p className="text-slate-300">
                      Based on your Sun Sign (zodiac). Provides planetary insights and daily
                      guidance specific to your astrological profile.
                    </p>
                  </div>

                  {/* Moon Phase */}
                  <div>
                    <h3 className="mb-2 font-semibold text-indigo-300">🌙 Moon Phase</h3>
                    <p className="text-slate-300">
                      The lunar cycle affects energy and timing. New Moon favors new
                      beginnings, Full Moon favors completion and celebration. Use for
                      strategic timing.
                    </p>
                  </div>

                  {/* Daily Tarot */}
                  <div>
                    <h3 className="mb-2 font-semibold text-pink-300">🃏 Daily Tarot</h3>
                    <p className="text-slate-300">
                      22 Major Arcana cards with business interpretations. Each card offers
                      guidance for decision-making. Reversed cards indicate obstacles or
                      delays.
                    </p>
                  </div>

                  {/* Deal Probability */}
                  <div>
                    <h3 className="mb-2 font-semibold text-emerald-300">
                      📊 Deal Probability
                    </h3>
                    <p className="text-slate-300">
                      Combines 5+ mystical factors to score each deal's closing likelihood
                      (0-100%). Factors include your Life Path, Universal Day, Moon Phase,
                      Tarot, and deal characteristics.
                    </p>
                  </div>

                  {/* Business Timing */}
                  <div>
                    <h3 className="mb-2 font-semibold text-cyan-300">⏰ Business Timing</h3>
                    <p className="text-slate-300">
                      Three categories (Deal Closing, New Ventures, Strategic Planning) scored
                      1-10 based on today's mystical alignment. Use to prioritize activities.
                    </p>
                  </div>

                  <div className="mt-6 rounded-lg border border-cyan-300/30 bg-cyan-400/10 px-4 py-3">
                    <p className="text-xs text-cyan-200">
                      💡 <strong>Pro Tip:</strong> These tools work best when combined with
                      your own intuition and business judgment. Use them as additional data
                      points, not absolute rules.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
