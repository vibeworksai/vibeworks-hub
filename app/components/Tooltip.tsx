"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Props = {
  content: string;
  children: React.ReactNode;
  position?: "top" | "bottom" | "left" | "right";
};

export function Tooltip({ content, children, position = "top" }: Props) {
  const [isVisible, setIsVisible] = useState(false);

  const positionClasses = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  };

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onClick={() => setIsVisible(!isVisible)}
    >
      {children}
      
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className={`pointer-events-none absolute z-50 ${positionClasses[position]}`}
          >
            <div className="glass-panel whitespace-nowrap rounded-lg border border-white/30 px-3 py-2 text-xs text-white shadow-xl">
              {content}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function InfoIcon({ tooltip }: { tooltip: string }) {
  return (
    <Tooltip content={tooltip}>
      <span className="inline-flex h-4 w-4 cursor-help items-center justify-center rounded-full border border-slate-400 text-[10px] text-slate-400 transition-colors hover:border-cyan-300 hover:text-cyan-300">
        ?
      </span>
    </Tooltip>
  );
}
