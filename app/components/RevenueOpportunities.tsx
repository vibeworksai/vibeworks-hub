"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface UpsellOpportunity {
  id: string;
  deal_id: string;
  contact_id: string;
  opportunity_type: string;
  recommended_product: string;
  estimated_value: number;
  confidence_score: number;
  reasoning: string;
  similar_customers: string[];
  optimal_timing: string;
  status: string;
}

export default function RevenueOpportunities({ userId }: { userId: string }) {
  const [opportunities, setOpportunities] = useState<UpsellOpportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState("");

  const fetchOpportunities = async () => {
    try {
      const res = await fetch(`/api/intelligence/revenue-catalyst?user_id=${userId}`);
      const data = await res.json();
      
      if (data.opportunities) {
        setOpportunities(data.opportunities.slice(0, 5)); // Top 5
      }
      setLoading(false);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const runAnalysis = async () => {
    console.log("[Revenue Opportunities] Starting analysis for user:", userId);
    setAnalyzing(true);
    setError(""); // Clear previous errors
    
    try {
      const url = `/api/intelligence/revenue-catalyst?user_id=${userId}&analyze=true`;
      console.log("[Revenue Opportunities] Fetching:", url);
      
      const res = await fetch(url);
      console.log("[Revenue Opportunities] Response status:", res.status);
      
      const data = await res.json();
      console.log("[Revenue Opportunities] Response data:", data);
      
      if (data.error) {
        setError(data.error);
        console.error("[Revenue Opportunities] API error:", data.error);
      }
      
      if (data.opportunities) {
        setOpportunities(data.opportunities.slice(0, 5));
        console.log("[Revenue Opportunities] Set opportunities:", data.opportunities.length);
      }
    } catch (err: any) {
      console.error("[Revenue Opportunities] Fetch error:", err);
      setError(err.message);
    }
    setAnalyzing(false);
  };

  const acceptOpportunity = async (oppId: string) => {
    try {
      await fetch(`/api/intelligence/revenue-catalyst`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, opportunity_id: oppId, action: 'accept' })
      });
      fetchOpportunities(); // Refresh
    } catch (err: any) {
      console.error('Accept error:', err);
    }
  };

  useEffect(() => {
    fetchOpportunities();
    const interval = setInterval(fetchOpportunities, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, [userId]);

  const formatValue = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value}`;
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 80) return "text-green-400";
    if (score >= 60) return "text-yellow-400";
    return "text-orange-400";
  };

  const getConfidenceBg = (score: number) => {
    if (score >= 80) return "bg-green-500/20";
    if (score >= 60) return "bg-yellow-500/20";
    return "bg-orange-500/20";
  };

  if (loading) {
    return (
      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="text-2xl">💰</div>
          <h2 className="text-xl font-semibold">Revenue Opportunities</h2>
        </div>
        <p className="text-gray-400">Loading opportunities...</p>
      </div>
    );
  }

  if (error && opportunities.length === 0) {
    return (
      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="text-2xl">💰</div>
          <h2 className="text-xl font-semibold">Revenue Opportunities</h2>
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

  const totalValue = opportunities.reduce((sum, opp) => sum + opp.estimated_value, 0);

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="text-2xl">💰</div>
          <div>
            <h2 className="text-xl font-semibold">Revenue Opportunities</h2>
            <p className="text-sm text-gray-400">AI-powered upsell detection</p>
          </div>
        </div>
        <button
          onClick={runAnalysis}
          disabled={analyzing}
          className="px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 rounded-lg text-cyan-400 transition-colors disabled:opacity-50"
        >
          {analyzing ? "Analyzing..." : "Refresh Analysis"}
        </button>
      </div>

      {opportunities.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <p className="mb-4">No opportunities detected yet.</p>
          <button 
            onClick={runAnalysis}
            className="px-6 py-3 bg-cyan-500/20 hover:bg-cyan-500/30 rounded-lg text-cyan-400 transition-colors"
          >
            Run AI Analysis
          </button>
        </div>
      ) : (
        <>
          <div className="mb-6 p-4 bg-cyan-500/10 rounded-lg border border-cyan-500/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Potential Revenue</p>
                <p className="text-3xl font-bold text-cyan-400">{formatValue(totalValue)}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-400">Opportunities</p>
                <p className="text-3xl font-bold">{opportunities.length}</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {opportunities.map((opp, idx) => (
              <motion.div
                key={opp.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="p-4 bg-white/5 rounded-lg border border-white/10 hover:border-cyan-500/30 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-lg">{opp.recommended_product}</span>
                      <span className={`px-2 py-0.5 rounded text-xs ${getConfidenceBg(opp.confidence_score)} ${getConfidenceColor(opp.confidence_score)}`}>
                        {opp.confidence_score}% confidence
                      </span>
                    </div>
                    <p className="text-sm text-gray-400 mb-2">{opp.opportunity_type.toUpperCase()} • {opp.optimal_timing}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-cyan-400">{formatValue(opp.estimated_value)}</p>
                  </div>
                </div>

                <p className="text-sm text-gray-300 mb-3">{opp.reasoning}</p>

                {opp.similar_customers && opp.similar_customers.length > 0 && (
                  <p className="text-xs text-gray-500 mb-3">
                    Similar customers: {opp.similar_customers.join(", ")}
                  </p>
                )}

                {opp.status === "pending" && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => acceptOpportunity(opp.id)}
                      className="flex-1 px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 rounded text-cyan-400 text-sm transition-colors"
                    >
                      Create Follow-up Task
                    </button>
                    <button
                      className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded text-gray-400 text-sm transition-colors"
                    >
                      Dismiss
                    </button>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
