"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import RevenueOpportunities from "./RevenueOpportunities";
import IdealCustomerProfile from "./IdealCustomerProfile";
import RiskMap from "./RiskMap";

type Tab = "revenue" | "icp" | "risks";

export default function IntelligenceTabs({ userId }: { userId: string }) {
  const [activeTab, setActiveTab] = useState<Tab>("revenue");

  const tabs = [
    { id: "revenue" as Tab, label: "Revenue", icon: "💰" },
    { id: "icp" as Tab, label: "ICP", icon: "🎯" },
    { id: "risks" as Tab, label: "Risks", icon: "⚠️" }
  ];

  return (
    <div className="glass-card p-4">
      <h3 className="mb-3 text-lg font-semibold">Strategic Intelligence</h3>
      
      {/* Tab Headers */}
      <div className="flex gap-2 mb-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? "bg-cyan-400/20 text-cyan-200"
                : "text-slate-400 hover:text-slate-300 hover:bg-white/5"
            }`}
          >
            <span className="text-base">{tab.icon}</span>
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        {activeTab === "revenue" && <RevenueOpportunities userId={userId} />}
        {activeTab === "icp" && <IdealCustomerProfile userId={userId} />}
        {activeTab === "risks" && <RiskMap userId={userId} />}
      </motion.div>
    </div>
  );
}
