"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

interface Alert {
  type: "opportunity" | "risk" | "deadline";
  title: string;
  subtitle: string;
  value?: string;
  severity: "critical" | "high" | "medium";
  link?: string;
}

export default function CriticalAlerts({ userId }: { userId: string }) {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(true);

  useEffect(() => {
    fetchAlerts();
  }, [userId]);

  const fetchAlerts = async () => {
    try {
      // Fetch high-priority opportunities
      const revenueRes = await fetch(`/api/intelligence/revenue-catalyst?user_id=${userId}`);
      const revenueData = await revenueRes.json();
      
      // Fetch high-severity risks
      const riskRes = await fetch(`/api/intelligence/risk-cartographer?user_id=${userId}`);
      const riskData = await riskRes.json();

      const newAlerts: Alert[] = [];

      // Add high-confidence opportunities (>70%)
      if (revenueData.opportunities) {
        revenueData.opportunities
          .filter((opp: any) => {
            const confidence = typeof opp.confidence_score === 'string' 
              ? parseFloat(opp.confidence_score) 
              : opp.confidence_score;
            return confidence >= 70;
          })
          .slice(0, 2)
          .forEach((opp: any) => {
            const value = typeof opp.estimated_value === 'string'
              ? parseFloat(opp.estimated_value)
              : opp.estimated_value;
            
            newAlerts.push({
              type: "opportunity",
              title: opp.recommended_product,
              subtitle: `${Math.round(typeof opp.confidence_score === 'string' ? parseFloat(opp.confidence_score) : opp.confidence_score)}% confidence`,
              value: formatValue(value),
              severity: "high",
              link: "/pipeline"
            });
          });
      }

      // Add critical/high risks
      if (riskData.risks) {
        riskData.risks
          .filter((risk: any) => {
            const score = typeof risk.risk_score === 'string'
              ? parseFloat(risk.risk_score)
              : risk.risk_score;
            return score >= 25; // High or Critical
          })
          .slice(0, 2)
          .forEach((risk: any) => {
            const score = typeof risk.risk_score === 'string'
              ? parseFloat(risk.risk_score)
              : risk.risk_score;
            
            newAlerts.push({
              type: "risk",
              title: risk.risk_title,
              subtitle: risk.risk_category,
              severity: score >= 50 ? "critical" : "high",
              link: "/"
            });
          });
      }

      setAlerts(newAlerts.slice(0, 3)); // Max 3 alerts
      setLoading(false);
    } catch (error) {
      console.error("Error fetching alerts:", error);
      setLoading(false);
    }
  };

  const formatValue = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${Math.round(value / 1000)}K`;
    return `$${Math.round(value)}`;
  };

  const getAlertIcon = (type: string) => {
    if (type === "opportunity") return "💰";
    if (type === "risk") return "⚠️";
    return "📅";
  };

  const getAlertColor = (severity: string) => {
    if (severity === "critical") return "border-red-400/30 bg-red-400/5";
    if (severity === "high") return "border-orange-400/30 bg-orange-400/5";
    return "border-yellow-400/30 bg-yellow-400/5";
  };

  if (loading || alerts.length === 0) {
    return null; // Don't show if no alerts
  }

  return (
    <div className="glass-card p-4">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between mb-3"
      >
        <div className="flex items-center gap-2">
          <span className="text-xl">🚨</span>
          <h2 className="text-lg font-semibold">
            Needs Attention ({alerts.length})
          </h2>
        </div>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </motion.div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-2 overflow-hidden"
          >
            {alerts.map((alert, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                {alert.link ? (
                  <Link href={alert.link}>
                    <div className={`p-3 rounded-lg border ${getAlertColor(alert.severity)} cursor-pointer hover:border-cyan-400/50 transition-colors`}>
                      <div className="flex items-start gap-3">
                        <span className="text-xl">{getAlertIcon(alert.type)}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className="font-medium text-white text-sm">{alert.title}</p>
                            {alert.value && (
                              <p className="text-cyan-400 font-semibold text-sm whitespace-nowrap">{alert.value}</p>
                            )}
                          </div>
                          <p className="text-xs text-slate-400 mt-1">{alert.subtitle}</p>
                        </div>
                      </div>
                    </div>
                  </Link>
                ) : (
                  <div className={`p-3 rounded-lg border ${getAlertColor(alert.severity)}`}>
                    <div className="flex items-start gap-3">
                      <span className="text-xl">{getAlertIcon(alert.type)}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-medium text-white text-sm">{alert.title}</p>
                          {alert.value && (
                            <p className="text-cyan-400 font-semibold text-sm whitespace-nowrap">{alert.value}</p>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 mt-1">{alert.subtitle}</p>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
