"use client";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { api } from "@/services/api";
import type { AudienceResponse, Opportunity } from "@/types";
import { AIThinkingSteps, ThinkingStep } from "@/components/audience/AIThinkingSteps";
import { ConfidenceBar } from "@/components/shared/ConfidenceBar";
import { SectionLabel } from "@/components/shared/SectionLabel";
import { formatRevenue } from "@/lib/utils";

const THINKING_STEPS: ThinkingStep[] = [
  { id: "parse",    label: "Parsing your audience description",      duration: 600 },
  { id: "history",  label: "Analyzing customer purchase history",     duration: 900 },
  { id: "inactive", label: "Detecting inactive customers",            duration: 700 },
  { id: "filter",   label: "Filtering high-value users",             duration: 600 },
  { id: "predict",  label: "Predicting campaign potential",           duration: 500 },
];

type Stage = "input" | "thinking" | "result";

export default function AudiencePage() {
  const [query, setQuery]       = useState("");
  const [stage, setStage]       = useState<Stage>("input");
  const [result, setResult]     = useState<AudienceResponse | null>(null);
  const [error, setError]       = useState<string | null>(null);
  const [prefill, setPrefill]   = useState<Opportunity | null>(null);
  const [animComplete, setAnimComplete] = useState(false);
  const router                  = useRouter();
  const inputRef                = useRef<HTMLTextAreaElement>(null);

  // Pre-fill from opportunity if coming from Mission Control
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("selected_opportunity");
      if (raw) {
        const opp: Opportunity = JSON.parse(raw);
        setPrefill(opp);
        const q =
          opp.segment_type === "dormant_high_value"
            ? `Customers who spent more than ₹3,000 and haven't ordered in 60 days`
            : opp.segment_type === "churn_risk"
            ? `Customers with 2+ orders who haven't purchased in 45 days`
            : `Customers due for repeat purchase this week`;
        setQuery(q);
      }
    } catch {}
  }, []);

  // Transition when BOTH animation is done AND result has arrived — no stale closures
  useEffect(() => {
    if (animComplete && result) setStage("result");
    if (animComplete && error)  setStage("input");
  }, [animComplete, result, error]);

  async function handleSubmit() {
    if (query.trim().length < 5) return;
    setError(null);
    setAnimComplete(false);
    setStage("thinking");
    api.generateAudience({ query }).then(setResult).catch((e) => {
      setError(e.message);
    });
  }

  function handleThinkingComplete() {
    setAnimComplete(true);
  }



  function handleProceed() {
    if (!result) return;
    sessionStorage.setItem("audience_result", JSON.stringify(result));
    router.push("/campaigns/new");
  }

  return (
    <div className="min-h-screen px-8 py-8 max-w-2xl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        {prefill && (
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1.5 h-1.5 rounded-full bg-accent-primary" />
            <span className="text-[11px] text-accent-primary font-medium">
              From opportunity: {prefill.title.slice(0, 50)}…
            </span>
          </div>
        )}
        <SectionLabel className="mb-1">Audience Builder</SectionLabel>
        <h1 className="text-2xl font-bold text-text-primary mb-1">Build Your Audience</h1>
        <p className="text-[13px] text-text-secondary">
          Describe who you want to reach in plain English. The AI will identify the exact customers.
        </p>
      </motion.div>

      {/* Query input */}
      <AnimatePresence mode="wait">
        {stage === "input" && (
          <motion.div
            key="input"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            <div className="relative">
              <textarea
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit();
                  }
                }}
                rows={3}
                placeholder="e.g. Customers who spent above ₹5,000 and haven't ordered in 60 days"
                className="w-full bg-bg-elevated border border-border-bright rounded-xl px-4 py-3.5 text-[14px] text-text-primary placeholder:text-text-muted resize-none focus:outline-none focus:border-accent-primary/50 focus:shadow-glow-sm transition-all"
              />
              <button
                onClick={handleSubmit}
                disabled={query.trim().length < 5}
                className="absolute right-3 bottom-3 w-8 h-8 rounded-lg bg-accent-primary flex items-center justify-center disabled:opacity-30 hover:bg-accent-primary/90 transition-all"
              >
                <svg width="14" height="14" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>

            {error && (
              <p className="text-accent-danger text-[12px]">⚠ {error}</p>
            )}

            <div className="flex flex-wrap gap-2">
              {[
                "Customers inactive 60 days with spend above ₹5,000",
                "High-value customers who haven't ordered this month",
                "Customers who ordered 3+ times but went silent",
              ].map((ex) => (
                <button
                  key={ex}
                  onClick={() => setQuery(ex)}
                  className="text-[11px] px-2.5 py-1.5 rounded-lg border border-border-dim text-text-muted hover:border-border-bright hover:text-text-secondary transition-all"
                >
                  {ex.slice(0, 40)}…
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {stage === "thinking" && (
          <motion.div
            key="thinking"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            <div className="bg-bg-elevated rounded-xl p-4 border border-border-dim">
              <p className="text-[11px] text-text-muted mb-1">Query</p>
              <p className="text-[13px] text-text-primary font-mono">{query}</p>
            </div>
            <AIThinkingSteps
              steps={THINKING_STEPS}
              onComplete={handleThinkingComplete}
              contextNote="Checking all 500 customers against both conditions simultaneously."
            />
          </motion.div>
        )}

        {stage === "result" && result && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Filter spec display */}
            <div className="bg-bg-elevated border border-border-dim rounded-xl p-4">
              <SectionLabel className="mb-2">Generated Segment Logic</SectionLabel>
              <div className="font-mono text-[12px] text-text-secondary space-y-1 leading-relaxed">
                {result.inactive_days && (
                  <p>
                    <span className="text-accent-primary">days_since_last_order</span>
                    {" "}<span className="text-text-muted">&gt;=</span>{" "}
                    <span className="text-revenue-green">{result.inactive_days}</span>
                  </p>
                )}
                {result.inactive_days && result.min_spend && (
                  <p className="text-text-muted">AND</p>
                )}
                {result.min_spend && (
                  <p>
                    <span className="text-accent-primary">lifetime_spend</span>
                    {" "}<span className="text-text-muted">&gt;=</span>{" "}
                    <span className="text-revenue-green">{result.min_spend.toLocaleString()}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Segment preview */}
            <div className="bg-bg-surface border border-border-dim rounded-xl p-5">
              <div className="flex items-baseline gap-3 mb-4">
                <span className="text-3xl font-bold text-text-primary">
                  {result.estimated_customers.toLocaleString()}
                </span>
                <span className="text-text-muted text-sm">customers matched</span>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                {[
                  { label: "Avg LTV",         value: formatRevenue(result.avg_ltv) },
                  { label: "Top City",        value: result.top_city },
                  { label: "Preferred Chan.", value: result.preferred_channel.split(" ")[0] },
                  { label: "Segment Quality", value: `${Math.round(result.segment_quality * 100)}%` },
                ].map((m) => (
                  <div key={m.label} className="bg-bg-elevated rounded-lg p-3">
                    <p className="text-[10px] text-text-muted uppercase tracking-wider mb-0.5">{m.label}</p>
                    <p className="text-[13px] font-semibold text-text-primary">{m.value}</p>
                  </div>
                ))}
              </div>

              <ConfidenceBar score={result.segment_quality} />
            </div>

            {/* AI explanation */}
            <div className="border border-border-dim rounded-xl p-4 bg-bg-elevated">
              <SectionLabel className="mb-2">Why these customers?</SectionLabel>
              <p className="text-[13px] text-text-secondary leading-relaxed">{result.reasoning}</p>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => { setStage("input"); setResult(null); }}
                className="px-4 py-2.5 text-[13px] border border-border-bright text-text-secondary rounded-lg hover:text-text-primary hover:border-border-bright/80 transition-all"
              >
                ← Refine
              </button>
              <button
                onClick={handleProceed}
                className="flex-1 py-2.5 text-[13px] font-semibold bg-accent-primary text-white rounded-lg hover:bg-accent-primary/90 hover:shadow-glow-sm transition-all"
              >
                Design Campaign →
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
