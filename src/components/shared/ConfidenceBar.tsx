"use client";
import { motion } from "framer-motion";
import { confidenceLabel } from "@/lib/utils";

interface Props {
  score: number;          // 0.0 – 1.0
  showLabel?: boolean;
  size?: "sm" | "md";
}

export function ConfidenceBar({ score, showLabel = true, size = "md" }: Props) {
  const { label, color, barColor } = confidenceLabel(score);
  const pct = Math.round(score * 100);
  const h = size === "sm" ? "h-[3px]" : "h-[5px]";

  return (
    <div className="space-y-1">
      {showLabel && (
        <div className="flex items-center justify-between">
          <span className={`text-[10px] font-semibold tracking-widest uppercase ${color}`}>
            {label}
          </span>
          <span className={`text-[11px] font-semibold ${color}`}>{pct}%</span>
        </div>
      )}
      <div className={`w-full bg-bg-elevated rounded-full overflow-hidden ${h}`}>
        <motion.div
          className={`${h} ${barColor} rounded-full`}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}
