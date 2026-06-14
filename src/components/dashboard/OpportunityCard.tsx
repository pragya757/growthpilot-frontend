"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import type { Opportunity } from "@/types";
import { ConfidenceBar } from "@/components/shared/ConfidenceBar";
import { formatRevenue } from "@/lib/utils";
import { cn } from "@/lib/utils";

const PRIORITY_CONFIG = {
  high:     { dot: "bg-accent-danger",   border: "border-l-accent-danger",   badge: "text-accent-danger",   label: "HIGH PRIORITY" },
  medium:   { dot: "bg-accent-warning",  border: "border-l-accent-warning",  badge: "text-accent-warning",  label: "MEDIUM PRIORITY" },
  upcoming: { dot: "bg-accent-success",  border: "border-l-accent-success",  badge: "text-accent-success",  label: "UPCOMING WINDOW" },
};

const JOURNEY_STAGES = ["Detected", "Audience", "Strategy", "Live"];

interface Props {
  opportunity: Opportunity;
  index: number;
}

export function OpportunityCard({ opportunity, index }: Props) {
  const [expanded, setExpanded] = useState(false);
  const router = useRouter();
  const cfg = PRIORITY_CONFIG[opportunity.priority] ?? PRIORITY_CONFIG.medium;

  function handleLaunch() {
    // Store opportunity in sessionStorage so the audience builder page can pre-fill
    sessionStorage.setItem("selected_opportunity", JSON.stringify(opportunity));
    router.push("/audience");
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      className={cn(
        "bg-bg-surface border border-border-dim border-l-[3px] rounded-r-xl rounded-l-sm",
        "hover:border-border-bright hover:shadow-elevated transition-all duration-200 cursor-pointer",
        cfg.border
      )}
      onClick={() => setExpanded(!expanded)}
    >
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={cn("w-1.5 h-1.5 rounded-full", cfg.dot)} />
            <span className={cn("text-[10px] font-semibold tracking-widest uppercase", cfg.badge)}>
              {cfg.label}
            </span>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); }}
            className="text-[11px] text-text-muted hover:text-text-secondary transition-colors"
          >
            [Why?]
          </button>
        </div>

        {/* Title */}
        <h3 className="text-[15px] font-semibold text-text-primary leading-snug mb-2">
          {opportunity.title}
        </h3>

        {/* Meta */}
        <p className="text-[12px] text-text-muted mb-4 leading-relaxed">
          {opportunity.audience_size.toLocaleString()} customers ·{" "}
          Avg confidence ·{" "}
          Expected ROI {opportunity.expected_roi}×
        </p>

        {/* Confidence */}
        <div className="mb-4">
          <ConfidenceBar score={opportunity.confidence} />
        </div>

        {/* Journey mini-timeline */}
        <div className="flex items-center gap-1 mb-4">
          {JOURNEY_STAGES.map((stage, i) => (
            <div key={stage} className="flex items-center">
              <div className="flex flex-col items-center gap-0.5">
                <div
                  className={cn(
                    "w-2 h-2 rounded-full border",
                    i === 0
                      ? "bg-accent-primary border-accent-primary"
                      : "bg-transparent border-border-bright"
                  )}
                />
                <span className="text-[9px] text-text-muted whitespace-nowrap">{stage}</span>
              </div>
              {i < JOURNEY_STAGES.length - 1 && (
                <div
                  className={cn(
                    "h-px w-6 mx-1 mb-3",
                    i === 0 ? "bg-accent-primary/40" : "bg-border-dim"
                  )}
                />
              )}
            </div>
          ))}
        </div>

        {/* Metrics row */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          {[
            { label: "Revenue",  value: formatRevenue(opportunity.estimated_revenue) },
            { label: "Audience", value: opportunity.audience_size.toLocaleString() },
            { label: "ROI",      value: `${opportunity.expected_roi}×` },
          ].map((m) => (
            <div key={m.label} className="bg-bg-elevated rounded-lg p-2.5">
              <p className="text-[10px] text-text-muted uppercase tracking-wider mb-0.5">{m.label}</p>
              <p className="text-[14px] font-bold text-text-primary">{m.value}</p>
            </div>
          ))}
        </div>

        {/* Action buttons */}
        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex-1 py-2 px-3 text-[12px] font-medium border border-border-bright text-text-secondary rounded-lg hover:text-text-primary hover:border-border-bright/80 transition-all"
          >
            {expanded ? "Hide reasoning" : "Investigate ↓"}
          </button>
          <button
            onClick={handleLaunch}
            className="flex-1 py-2 px-3 text-[12px] font-semibold bg-accent-primary text-white rounded-lg hover:bg-accent-primary/90 hover:shadow-glow-sm transition-all"
          >
            Build Campaign →
          </button>
        </div>
      </div>

      {/* Expanded AI reasoning */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            key="reasoning"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 border-t border-border-dim pt-4">
              <p className="text-[10px] font-semibold tracking-widest uppercase text-text-muted mb-2">
                AI REASONING
              </p>
              <p className="text-[13px] text-text-secondary leading-relaxed">
                {opportunity.reasoning}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
