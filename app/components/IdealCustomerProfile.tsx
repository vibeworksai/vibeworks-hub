"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface CustomerAttributes {
  industry?: string[];
  company_size?: string;
  budget_range?: string;
  decision_maker_role?: string[];
  geographic_region?: string[];
  common_pain_points?: string[];
  technology_stack?: string[];
}

interface ICP {
  id: string;
  user_id: string;
  profile_version: number;
  attributes: CustomerAttributes;
  avg_ltv: number;
  avg_deal_size: number;
  avg_time_to_close: number;
  churn_rate: number;
  referral_rate: number;
  common_pain_points: string[];
  common_objections: string[];
  decision_factors: string[];
  sample_customer_ids: string[];
  created_at: string;
}

export default function IdealCustomerProfile({ userId }: { userId: string }) {
  const [profile, setProfile] = useState<ICP | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState("");

  const fetchProfile = async () => {
    try {
      const res = await fetch(`/api/intelligence/client-zero-d?user_id=${userId}`);
      const data = await res.json();
      
      if (data.profile) {
        setProfile(data.profile);
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
      const res = await fetch(`/api/intelligence/client-zero-d?user_id=${userId}&analyze=true`);
      const data = await res.json();
      
      if (data.profile) {
        setProfile(data.profile);
      }
    } catch (err: any) {
      setError(err.message);
    }
    setAnalyzing(false);
  };

  useEffect(() => {
    fetchProfile();
    const interval = setInterval(fetchProfile, 60000); // Refresh every 60s
    return () => clearInterval(interval);
  }, [userId]);

  const formatValue = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value}`;
  };

  const formatPercent = (value: number) => {
    return `${(value * 100).toFixed(0)}%`;
  };

  if (loading) {
    return (
      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="text-2xl">🎯</div>
          <h2 className="text-xl font-semibold">Ideal Customer Profile</h2>
        </div>
        <p className="text-gray-400">Loading profile...</p>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="text-2xl">🎯</div>
          <h2 className="text-xl font-semibold">Ideal Customer Profile</h2>
        </div>
        <p className="text-red-400">Error: {error}</p>
        <button 
          onClick={runAnalysis}
          className="mt-3 px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 rounded-lg text-cyan-400 transition-colors"
        >
          Generate Profile
        </button>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="text-2xl">🎯</div>
          <div>
            <h2 className="text-xl font-semibold">Ideal Customer Profile</h2>
            <p className="text-sm text-gray-400">AI-powered customer intelligence</p>
          </div>
        </div>
        <div className="text-center py-8 text-gray-400">
          <p className="mb-4">No profile generated yet.</p>
          <button 
            onClick={runAnalysis}
            disabled={analyzing}
            className="px-6 py-3 bg-cyan-500/20 hover:bg-cyan-500/30 rounded-lg text-cyan-400 transition-colors disabled:opacity-50"
          >
            {analyzing ? "Analyzing..." : "Generate with AI"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="text-2xl">🎯</div>
          <div>
            <h2 className="text-xl font-semibold">Ideal Customer Profile</h2>
            <p className="text-sm text-gray-400">
              v{profile.profile_version} • Generated from your best customers
            </p>
          </div>
        </div>
        <button
          onClick={runAnalysis}
          disabled={analyzing}
          className="px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 rounded-lg text-cyan-400 transition-colors disabled:opacity-50"
        >
          {analyzing ? "Updating..." : "Update Profile"}
        </button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-white/5 rounded-lg border border-white/10"
        >
          <p className="text-xs text-gray-400 mb-1">Avg Lifetime Value</p>
          <p className="text-2xl font-bold text-cyan-400">{formatValue(profile.avg_ltv)}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-4 bg-white/5 rounded-lg border border-white/10"
        >
          <p className="text-xs text-gray-400 mb-1">Avg Deal Size</p>
          <p className="text-2xl font-bold text-cyan-400">{formatValue(profile.avg_deal_size)}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-4 bg-white/5 rounded-lg border border-white/10"
        >
          <p className="text-xs text-gray-400 mb-1">Time to Close</p>
          <p className="text-2xl font-bold">{profile.avg_time_to_close} days</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-4 bg-white/5 rounded-lg border border-white/10"
        >
          <p className="text-xs text-gray-400 mb-1">Referral Rate</p>
          <p className="text-2xl font-bold text-green-400">{formatPercent(profile.referral_rate)}</p>
        </motion.div>
      </div>

      {/* Attributes */}
      <div className="space-y-4">
        {profile.attributes.industry && profile.attributes.industry.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-400 mb-2">Industries</h3>
            <div className="flex flex-wrap gap-2">
              {profile.attributes.industry.map((ind, idx) => (
                <span key={idx} className="px-3 py-1 bg-cyan-500/20 text-cyan-400 rounded-full text-sm">
                  {ind}
                </span>
              ))}
            </div>
          </div>
        )}

        {profile.attributes.company_size && (
          <div>
            <h3 className="text-sm font-semibold text-gray-400 mb-2">Company Size</h3>
            <p className="text-sm">{profile.attributes.company_size}</p>
          </div>
        )}

        {profile.attributes.budget_range && (
          <div>
            <h3 className="text-sm font-semibold text-gray-400 mb-2">Budget Range</h3>
            <p className="text-sm">{profile.attributes.budget_range}</p>
          </div>
        )}

        {profile.common_pain_points && profile.common_pain_points.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-400 mb-2">Common Pain Points</h3>
            <ul className="space-y-1">
              {profile.common_pain_points.map((point, idx) => (
                <li key={idx} className="text-sm text-gray-300 flex items-start gap-2">
                  <span className="text-yellow-400 mt-0.5">•</span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {profile.decision_factors && profile.decision_factors.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-400 mb-2">What Makes Them Buy</h3>
            <ul className="space-y-1">
              {profile.decision_factors.map((factor, idx) => (
                <li key={idx} className="text-sm text-gray-300 flex items-start gap-2">
                  <span className="text-green-400 mt-0.5">✓</span>
                  <span>{factor}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
