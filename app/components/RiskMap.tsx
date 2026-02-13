"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface Risk {
  id: string;
  user_id: string;
  risk_category: "financial" | "operational" | "strategic" | "relationship";
  risk_title: string;
  risk_description: string;
  entity_type: "deal" | "project" | "contact" | "business";
  entity_id: string | null;
  probability: number | string; // Neon returns NUMERIC as string
  impact: number | string; // Neon returns NUMERIC as string
  risk_score: number | string; // Neon returns NUMERIC as string
  mitigation_strategies: string[];
  mitigation_status: string;
  identified_at: string;
}

export default function RiskMap({ userId }: { userId: string }) {
  const [risks, setRisks] = useState<Risk[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState("");

  const fetchRisks = async () => {
    try {
      const res = await fetch(`/api/intelligence/risk-cartographer?user_id=${userId}`);
      const data = await res.json();
      
      if (data.risks) {
        setRisks(data.risks.slice(0, 8)); // Top 8 risks
      }
      setLoading(false);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const runAnalysis = async () => {
    setAnalyzing(true);
    try {
      const res = await fetch(`/api/intelligence/risk-cartographer?user_id=${userId}&analyze=true`);
      const data = await res.json();
      
      if (data.risks) {
        setRisks(data.risks.slice(0, 8));
      }
    } catch (err: any) {
      setError(err.message);
    }
    setAnalyzing(false);
  };

  const mitigateRisk = async (riskId: string) => {
    try {
      await fetch(`/api/intelligence/risk-cartographer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, risk_id: riskId, action: 'mitigate' })
      });
      fetchRisks(); // Refresh
    } catch (err: any) {
      console.error('Mitigate error:', err);
    }
  };

  useEffect(() => {
    fetchRisks();
    const interval = setInterval(fetchRisks, 60000); // Refresh every 60s
    return () => clearInterval(interval);
  }, [userId]);

  const getRiskLevel = (score: number | string) => {
    // Parse string to number if needed (Neon returns NUMERIC as string)
    const numScore = typeof score === 'string' ? parseFloat(score) : score;
    
    if (numScore >= 50) return { label: "CRITICAL", color: "text-red-400", bg: "bg-red-500/20", border: "border-red-500/30" };
    if (numScore >= 25) return { label: "HIGH", color: "text-orange-400", bg: "bg-orange-500/20", border: "border-orange-500/30" };
    if (numScore >= 10) return { label: "MEDIUM", color: "text-yellow-400", bg: "bg-yellow-500/20", border: "border-yellow-500/30" };
    return { label: "LOW", color: "text-green-400", bg: "bg-green-500/20", border: "border-green-500/30" };
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "financial": return "💰";
      case "operational": return "⚙️";
      case "strategic": return "🎯";
      case "relationship": return "🤝";
      default: return "⚠️";
    }
  };

  if (loading) {
    return (
      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="text-2xl">🗺️</div>
          <h2 className="text-xl font-semibold">Risk Map</h2>
        </div>
        <p className="text-gray-400">Loading risks...</p>
      </div>
    );
  }

  if (error && risks.length === 0) {
    return (
      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="text-2xl">🗺️</div>
          <h2 className="text-xl font-semibold">Risk Map</h2>
        </div>
        <p className="text-red-400">Error: {error}</p>
        <button 
          onClick={runAnalysis}
          className="mt-3 px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 rounded-lg text-cyan-400 transition-colors"
        >
          Retry Analysis
        </button>
      </div>
    );
  }

  const criticalRisks = risks.filter(r => {
    const score = typeof r.risk_score === 'string' ? parseFloat(r.risk_score) : r.risk_score;
    return score >= 50;
  });
  const highRisks = risks.filter(r => {
    const score = typeof r.risk_score === 'string' ? parseFloat(r.risk_score) : r.risk_score;
    return score >= 25 && score < 50;
  });
  const mediumRisks = risks.filter(r => {
    const score = typeof r.risk_score === 'string' ? parseFloat(r.risk_score) : r.risk_score;
    return score >= 10 && score < 25;
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-400">AI-powered risk identification</p>
        <button
          onClick={runAnalysis}
          disabled={analyzing}
          className="px-3 py-1.5 bg-cyan-500/20 hover:bg-cyan-500/30 rounded-lg text-cyan-400 text-sm transition-colors disabled:opacity-50"
        >
          {analyzing ? "Analyzing..." : "Refresh"}
        </button>
      </div>

      {risks.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <p className="mb-4">No risks detected yet.</p>
          <button 
            onClick={runAnalysis}
            className="px-6 py-3 bg-cyan-500/20 hover:bg-cyan-500/30 rounded-lg text-cyan-400 transition-colors"
          >
            Run AI Analysis
          </button>
        </div>
      ) : (
        <>
          {/* Risk Summary */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="p-4 bg-red-500/10 rounded-lg border border-red-500/20">
              <p className="text-xs text-gray-400 mb-1">Critical</p>
              <p className="text-3xl font-bold text-red-400">{criticalRisks.length}</p>
            </div>
            <div className="p-4 bg-orange-500/10 rounded-lg border border-orange-500/20">
              <p className="text-xs text-gray-400 mb-1">High</p>
              <p className="text-3xl font-bold text-orange-400">{highRisks.length}</p>
            </div>
            <div className="p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
              <p className="text-xs text-gray-400 mb-1">Medium</p>
              <p className="text-3xl font-bold text-yellow-400">{mediumRisks.length}</p>
            </div>
          </div>

          {/* Risk List */}
          <div className="space-y-4">
            {risks.map((risk, idx) => {
              const level = getRiskLevel(risk.risk_score);
              
              return (
                <motion.div
                  key={risk.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className={`p-4 bg-white/5 rounded-lg border ${level.border} hover:border-cyan-500/30 transition-colors`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="text-2xl">{getCategoryIcon(risk.risk_category)}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{risk.risk_title}</h3>
                          <span className={`px-2 py-0.5 rounded text-xs ${level.bg} ${level.color}`}>
                            {level.label}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mb-2 uppercase tracking-wide">
                          {risk.risk_category} • {risk.entity_type}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-400">Risk Score</p>
                      <p className={`text-2xl font-bold ${level.color}`}>
                        {typeof risk.risk_score === 'string' ? Math.round(parseFloat(risk.risk_score)) : Math.round(risk.risk_score)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {typeof risk.probability === 'string' ? Math.round(parseFloat(risk.probability)) : Math.round(risk.probability)}% × {typeof risk.impact === 'string' ? Math.round(parseFloat(risk.impact)) : Math.round(risk.impact)}%
                      </p>
                    </div>
                  </div>

                  <p className="text-sm text-gray-300 mb-3">{risk.risk_description}</p>

                  {risk.mitigation_strategies && risk.mitigation_strategies.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs font-semibold text-gray-400 mb-2">Mitigation Strategies:</p>
                      <ul className="space-y-1">
                        {risk.mitigation_strategies.slice(0, 3).map((strategy, sidx) => (
                          <li key={sidx} className="text-sm text-gray-300 flex items-start gap-2">
                            <span className="text-cyan-400 mt-0.5">→</span>
                            <span>{strategy}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {risk.mitigation_status === "pending" && (
                    <button
                      onClick={() => mitigateRisk(risk.id)}
                      className="w-full px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 rounded text-cyan-400 text-sm transition-colors"
                    >
                      Start Mitigation
                    </button>
                  )}

                  {risk.mitigation_status === "in_progress" && (
                    <div className="px-4 py-2 bg-yellow-500/20 rounded text-yellow-400 text-sm text-center">
                      ⏳ Mitigation in progress
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
