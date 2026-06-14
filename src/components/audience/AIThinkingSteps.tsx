"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export interface ThinkingStep {
  id: string;
  label: string;
  duration: number; // ms to show as "active" before completing
}

type StepState = "pending" | "active" | "done";

interface Props {
  steps: ThinkingStep[];
  onComplete?: () => void;
  contextNote?: string;
}

export function AIThinkingSteps({ steps, onComplete, contextNote }: Props) {
  const [states, setStates] = useState<Record<string, StepState>>(
    Object.fromEntries(steps.map((s) => [s.id, "pending"]))
  );

  useEffect(() => {
    let totalDelay = 0;
    steps.forEach((step, i) => {
      // Start step
      setTimeout(() => {
        setStates((prev) => ({ ...prev, [step.id]: "active" }));
      }, totalDelay);
      totalDelay += step.duration;
      // Complete step
      setTimeout(() => {
        setStates((prev) => ({ ...prev, [step.id]: "done" }));
        if (i === steps.length - 1) {
          setTimeout(() => onComplete?.(), 200);
        }
      }, totalDelay);
      totalDelay += 80; // short gap between steps
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="bg-bg-elevated border border-border-bright rounded-xl p-5 space-y-2.5">
      <p className="text-[10px] font-semibold tracking-widest uppercase text-text-muted mb-3">
        AI PROCESSING
      </p>

      {steps.map((step) => {
        const state = states[step.id];
        return (
          <motion.div
            key={step.id}
            initial={{ opacity: 0, x: -4 }}
            animate={{ opacity: state === "pending" ? 0.4 : 1, x: 0 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-3"
          >
            {/* Icon */}
            <div className="w-4 h-4 flex-shrink-0 flex items-center justify-center">
              {state === "done" ? (
                <motion.svg
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  width="14" height="14" viewBox="0 0 14 14"
                  className="text-accent-success"
                >
                  <polyline
                    points="2,7 6,11 12,3"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="check-draw"
                  />
                </motion.svg>
              ) : state === "active" ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
                  className="w-3.5 h-3.5 border-2 border-accent-primary border-t-transparent rounded-full"
                />
              ) : (
                <div className="w-2 h-2 rounded-full border border-text-muted/40" />
              )}
            </div>

            {/* Label */}
            <span
              className={
                state === "done"
                  ? "text-[13px] text-text-primary"
                  : state === "active"
                  ? "text-[13px] text-text-secondary"
                  : "text-[13px] text-text-muted"
              }
            >
              {step.label}
              {state === "active" && (
                <motion.span
                  animate={{ opacity: [1, 0, 1] }}
                  transition={{ repeat: Infinity, duration: 1.2 }}
                  className="text-text-muted"
                >
                  ...
                </motion.span>
              )}
            </span>
          </motion.div>
        );
      })}

      {/* Context note */}
      {contextNote && (
        <AnimatePresence>
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="text-[11px] text-text-muted pt-2 border-t border-border-dim leading-relaxed"
          >
            {contextNote}
          </motion.p>
        </AnimatePresence>
      )}
    </div>
  );
}
