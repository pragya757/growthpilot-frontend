"use client";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { api } from "@/services/api";
import type { AudienceResponse, SimulateResponse, StrategyMetrics } from "@/types";
import { AIThinkingSteps, ThinkingStep } from "@/components/audience/AIThinkingSteps";
import { ConfidenceBar } from "@/components/shared/ConfidenceBar";
import { SectionLabel } from "@/components/shared/SectionLabel";
import { formatRevenue, formatPct, formatROI, channelLabel, channelIcon } from "@/lib/utils";

const THINKING_STEPS: ThinkingStep[] = [
  { id: "segment",  label: "Analyzing segment characteristics",    duration: 700 },
  { id: "memories", label: "Loading past campaign memories",       duration: 600 },
  { id: "strat",    label: "Generating campaign strategies",       duration: 900 },
  { id: "predict",  label: "Predicting performance outcomes",      duration: 700 },
  { id: "rec",      label: "Preparing recommendation",             duration: 400 },
];

type Stage = "thinking" | "arena";

interface MetricRowProps { label: string; a: string; b: string; aWins?: boolean; bWins?: boolean }
function MetricRow({ label, a, b, aWins, bWins }: MetricRowProps) {
  return (
    <div className="grid grid-cols-[1fr_auto_1fr] gap-2 items-center py-2 border-b border-border-dim last:border-0">
      <p className={`text-right text-[13px] font-semibold ${aWins ? "text-accent-success" : "text-text-primary"}`}>{a}</p>
      <p className="text-[10px] text-text-muted uppercase tracking-widest text-center w-20">{label}</p>
      <p className={`text-left text-[13px] font-semibold ${bWins ? "text-accent-success" : "text-text-primary"}`}>{b}</p>
    </div>
  );
}

export default function CampaignArenaPage() {
  const [stage, setStage]       = useState<Stage>("thinking");
  const [sim, setSim]           = useState<SimulateResponse | null>(null);
  const [simError, setSimError] = useState(false);
  const [selected, setSelected] = useState<"A" | "B" | null>(null);
  const [audience, setAudience] = useState<AudienceResponse | null>(null);
  const router                  = useRouter();

  // Ref always holds the latest sim — fixes stale closure inside setInterval
  const simRef = useRef<SimulateResponse | null>(null);
  useEffect(() => { simRef.current = sim; }, [sim]);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("audience_result");
      if (!raw) { router.push("/audience"); return; }
      const aud: AudienceResponse = JSON.parse(raw);
      setAudience(aud);
      api.simulateCampaign({
        segment_query: aud.query,
        audience_size: aud.estimated_customers,
      }).then((result) => {
        setSim(result);
        simRef.current = result;
      }).catch((err) => {
        console.error("simulate-campaign failed:", err);
        setSimError(true);
      });
    } catch { router.push("/audience"); }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function handleThinkingComplete() {
    // Read from ref — avoids stale closure bug where sim is always null
    if (simRef.current) {
      setStage("arena");
      return;
    }
    // API hasn't responded yet — poll until it does (handles Render cold-start latency)
    const iv = setInterval(() => {
      if (simRef.current) {
        clearInterval(iv);
        setStage("arena");
      }
    }, 200);
    // Safety: after 20s give up and show error
    setTimeout(() => {
      clearInterval(iv);
      if (!simRef.current) setSimError(true);
    }, 20000);
  }

  function handleLaunch() {
    if (!sim || !selected || !audience) return;
    const strategy = selected === "A" ? sim.strategy_a : sim.strategy_b;
    sessionStorage.setItem("launch_payload", JSON.stringify({
      segment_query: audience.query,
      audience_size: audience.estimated_customers,
      selected_strategy: selected,
      channel: strategy.channel,
      message: strategy.message_sample,
    }));
    router.push("/campaigns");
  }

  const s = sim;

  // Error state
  if (simError) {
    return (
      <div className="min-h-screen px-8 py-8 flex items-center justify-center">
        <div className="text-center max-w-sm">
          <p className="text-2xl mb-3">⚠️</p>
          <p className="text-text-primary font-semibold mb-1">Strategy generation failed</p>
          <p className="text-text-muted text-[13px] mb-4">The backend took too long to respond. Please try again.</p>
          <button
            onClick={() => router.push("/audience")}
            className="px-4 py-2.5 text-[13px] font-semibold bg-accent-primary text-white rounded-lg hover:bg-accent-primary/90 transition-all"
          >
            ← Back to Audience Builder
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-8 py-8">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <SectionLabel className="mb-1">Campaign Arena</SectionLabel>
        <h1 className="text-2xl font-bold text-text-primary mb-1">Strategy Battle</h1>
        <p className="text-[13px] text-text-secondary">
          AI generated two competing strategies.{" "}
          {audience && <span className="text-text-primary font-medium">{audience.estimated_customers} customers</span>}{" "}
          in segment.
        </p>
      </motion.div>

      <AnimatePresence mode="wait">
        {stage === "thinking" && (
          <motion.div key="thinking" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="max-w-md">
            <AIThinkingSteps steps={THINKING_STEPS} onComplete={handleThinkingComplete} contextNote="Incorporating 2 past campaign memories into predictions." />
          </motion.div>
        )}

        {stage === "arena" && s && (
          <motion.div key="arena" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {/* AI Recommendation banner */}
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-accent-primary/10 border border-accent-primary/30 rounded-xl px-5 py-3.5 flex items-start gap-3"
            >
              <div className="w-5 h-5 rounded-full bg-accent-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-[10px]">⭐</span>
              </div>
              <div>
                <p className="text-[11px] font-semibold text-accent-primary tracking-widest uppercase mb-0.5">
                  AI RECOMMENDS STRATEGY {s.recommended}
                </p>
                <p className="text-[13px] text-text-secondary leading-relaxed">{s.recommendation_reason}</p>
              </div>
            </motion.div>

            {/* Battle Arena */}
            <div className="grid grid-cols-[1fr_auto_1fr] gap-0 items-stretch">
              {/* Strategy A */}
              <StrategyCard
                label="A"
                strategy={s.strategy_a}
                recommended={s.recommended === "A"}
                selected={selected === "A"}
                onSelect={() => setSelected("A")}
              />

              {/* VS divider */}
              <div className="flex flex-col items-center justify-center px-4 gap-3">
                <div className="w-px flex-1 bg-border-dim" />
                <div className="glass-bright rounded-xl px-3 py-2 text-center">
                  <p className="text-lg font-black text-text-muted">VS</p>
                  {s.strategy_a.estimated_revenue > s.strategy_b.estimated_revenue ? (
                    <p className="text-[9px] text-accent-success font-semibold">A leads on 3/4</p>
                  ) : (
                    <p className="text-[9px] text-accent-warning font-semibold">B leads on 3/4</p>
                  )}
                </div>
                <div className="w-px flex-1 bg-border-dim" />
              </div>

              {/* Strategy B */}
              <StrategyCard
                label="B"
                strategy={s.strategy_b}
                recommended={s.recommended === "B"}
                selected={selected === "B"}
                onSelect={() => setSelected("B")}
              />
            </div>

            {/* Comparison table */}
            <div className="bg-bg-surface border border-border-dim rounded-xl p-5">
              <SectionLabel className="mb-3">Side-by-Side Comparison</SectionLabel>
              <MetricRow label="Revenue"    a={formatRevenue(s.strategy_a.estimated_revenue)} b={formatRevenue(s.strategy_b.estimated_revenue)} aWins={s.strategy_a.estimated_revenue > s.strategy_b.estimated_revenue} bWins={s.strategy_b.estimated_revenue > s.strategy_a.estimated_revenue} />
              <MetricRow label="ROI"        a={formatROI(s.strategy_a.roi)}      b={formatROI(s.strategy_b.roi)}      aWins={s.strategy_a.roi > s.strategy_b.roi}      bWins={s.strategy_b.roi > s.strategy_a.roi} />
              <MetricRow label="Open Rate"  a={formatPct(s.strategy_a.open_rate)} b={formatPct(s.strategy_b.open_rate)} aWins={s.strategy_a.open_rate > s.strategy_b.open_rate} bWins={s.strategy_b.open_rate > s.strategy_a.open_rate} />
              <MetricRow label="Cost"       a={`₹${s.strategy_a.cost.toLocaleString()}`} b={`₹${s.strategy_b.cost.toLocaleString()}`} aWins={s.strategy_a.cost < s.strategy_b.cost} bWins={s.strategy_b.cost < s.strategy_a.cost} />
            </div>

            {/* Launch */}
            <div className="flex gap-3">
              <button onClick={() => router.push("/audience")} className="px-4 py-2.5 text-[13px] border border-border-bright text-text-secondary rounded-lg hover:text-text-primary transition-all">
                ← Back
              </button>
              <button
                onClick={handleLaunch}
                disabled={!selected}
                className="flex-1 py-2.5 text-[13px] font-semibold bg-accent-primary text-white rounded-lg disabled:opacity-40 hover:bg-accent-primary/90 hover:shadow-glow-sm transition-all"
              >
                {selected ? `Launch Strategy ${selected} →` : "Select a strategy to launch"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Strategy Card ─────────────────────────────────────────────────────────────

interface StrategyCardProps {
  label: "A" | "B";
  strategy: StrategyMetrics;
  recommended: boolean;
  selected: boolean;
  onSelect: () => void;
}

function StrategyCard({ label, strategy, recommended, selected, onSelect }: StrategyCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.15 }}
      onClick={onSelect}
      className={`relative rounded-xl border-2 p-5 cursor-pointer transition-all ${
        selected
          ? "border-accent-primary bg-accent-primary/5 shadow-glow-sm"
          : recommended
          ? "border-accent-primary/40 bg-bg-surface"
          : "border-border-dim bg-bg-surface hover:border-border-bright"
      }`}
    >
      {recommended && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent-primary text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full tracking-wider">
          AI PICK
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-4 pt-1">
        <div>
          <p className="text-[10px] text-text-muted uppercase tracking-widest">Strategy {label}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-base">{channelIcon(strategy.channel)}</span>
            <p className="text-[15px] font-bold text-text-primary">{channelLabel(strategy.channel)}</p>
          </div>
        </div>
        {selected && (
          <div className="w-6 h-6 rounded-full bg-accent-primary flex items-center justify-center">
            <svg width="12" height="12" fill="none" stroke="white" strokeWidth="2.5" viewBox="0 0 24 24">
              <polyline points="4,12 9,17 20,6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        )}
      </div>

      {/* Revenue hero */}
      <div className="bg-bg-elevated rounded-lg p-3.5 mb-4">
        <p className="text-[10px] text-text-muted uppercase tracking-widest mb-1">Est. Revenue</p>
        <p className="text-2xl font-black text-text-primary">{formatRevenue(strategy.estimated_revenue)}</p>
        <p className="text-[11px] text-text-muted mt-0.5">{formatROI(strategy.roi)} ROI · ₹{strategy.cost.toLocaleString()} spend</p>
      </div>

      {/* Metrics */}
      <div className="space-y-2 mb-4">
        {[
          { label: "Open Rate",    value: strategy.open_rate,       display: formatPct(strategy.open_rate) },
          { label: "Conversion",   value: strategy.conversion_rate,  display: formatPct(strategy.conversion_rate) },
        ].map((m) => (
          <div key={m.label}>
            <div className="flex justify-between mb-1">
              <span className="text-[11px] text-text-muted">{m.label}</span>
              <span className="text-[11px] font-semibold text-text-primary">{m.display}</span>
            </div>
            <div className="h-1 w-full bg-bg-elevated rounded-full overflow-hidden">
              <motion.div
                className="h-1 bg-accent-primary rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${m.value * 100}%` }}
                transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Message preview */}
      <div className="bg-bg-elevated rounded-lg p-3 mb-4">
        <p className="text-[10px] text-text-muted mb-1.5">Message Preview</p>
        <p className="text-[11px] text-text-secondary font-mono leading-relaxed line-clamp-3">
          {strategy.message_sample}
        </p>
      </div>

      {/* AI Reasoning */}
      <p className="text-[11px] text-text-muted leading-relaxed">{strategy.ai_reasoning}</p>
    </motion.div>
  );
}
