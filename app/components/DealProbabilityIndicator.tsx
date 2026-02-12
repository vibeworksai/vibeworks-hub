"use client";

import { useEffect, useState } from "react";

type DealProbability = {
  probability: number;
  confidence: "Low" | "Medium" | "High";
  factors: string[];
  recommendation: string;
};

type Props = {
  dealId: string;
  dealValue: number;
  dealStage: string;
};

export function DealProbabilityIndicator({ dealId, dealValue, dealStage }: Props) {
  const [probability, setProbability] = useState<DealProbability | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProbability();
  }, [dealId]);

  const fetchProbability = async () => {
    try {
      const response = await fetch(
        `/api/deal-probability?dealId=${dealId}&dealValue=${dealValue}&dealStage=${encodeURIComponent(
          dealStage
        )}`
      );
      if (response.ok) {
        const data = await response.json();
        setProbability(data.data);
      }
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch deal probability:", error);
      setLoading(false);
    }
  };

  if (loading || !probability) return null;

  const getColorClass = (prob: number) => {
    if (prob >= 75) return "text-emerald-300 border-emerald-300/50 bg-emerald-400/10";
    if (prob >= 60) return "text-cyan-300 border-cyan-300/50 bg-cyan-400/10";
    if (prob >= 40) return "text-amber-300 border-amber-300/50 bg-amber-400/10";
    return "text-rose-300 border-rose-300/50 bg-rose-400/10";
  };

  return (
    <div className="mt-3 space-y-2">
      <div
        className={`rounded-lg border px-3 py-2 ${getColorClass(probability.probability)}`}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium">Close Probability</span>
          <span className="text-sm font-bold">{probability.probability}%</span>
        </div>
        <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full bg-current transition-all duration-500"
            style={{ width: `${probability.probability}%` }}
          />
        </div>
      </div>

      <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2">
        <p className="text-xs font-medium text-white">{probability.recommendation}</p>
        <div className="mt-2 space-y-1">
          {probability.factors.slice(0, 3).map((factor, idx) => (
            <p key={idx} className="text-[10px] text-slate-400">
              • {factor}
            </p>
          ))}
        </div>
        <p className="mt-1 text-[10px] text-slate-500">
          Confidence: {probability.confidence}
        </p>
      </div>
    </div>
  );
}
