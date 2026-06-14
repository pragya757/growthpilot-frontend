"use client";
import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/services/api";
import type { PostMortemResponse, Finding, Recommendation } from "@/types";
import { SectionLabel } from "@/components/shared/SectionLabel";
import { ConfidenceBar } from "@/components/shared/ConfidenceBar";
import { formatRevenue, formatROI } from "@/lib/utils";

// ─── Sub-components ────────────────────────────────────────────────────────────

function FindingCard({ finding, index, variant }: {
  finding: Finding;
  index: number;
  variant: "success" | "danger";
}) {
  const accent = variant === "success" ? "border-l-accent-success" : "border-l-accent-danger";
  const tagColor = variant === "success" ? "bg-accent-success/15 text-accent-success" : "bg-accent-danger/15 text-accent-danger";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 * index }}
      className={`bg-bg-surface border border-border-dim border-l-[3px] ${accent} rounded-r-xl rounded-l-sm p-5`}
    >
      <div className="flex items-start gap-4">
        <span className="text-[32px] font-black text-text-muted leading-none flex-shrink-0 tabular-nums">
          {String(index + 1).padStart(2, "0")}
        </span>
        <div className="flex-1 min-w-0">
          <h3 className="text-[15px] font-semibold text-text-primary mb-2 leading-snug">
            {finding.title}
          </h3>
          <p className="text-[13px] text-text-secondary mb-2 leading-relaxed">
            {finding.evidence}{" "}
            <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${tagColor}`}>
              {finding.evidence_tag}
            </span>
          </p>
          <div className="flex items-start gap-1.5">
            <span className="text-accent-primary font-bold text-[13px] flex-shrink-0">→</span>
            <p className="text-[13px] text-text-primary font-medium leading-relaxed">
              {finding.implication}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function RevenueImpactCard({ impact }: { impact: PostMortemResponse["revenue_impact"] }) {
  return (
    <div className="bg-bg-surface border border-border-dim rounded-xl p-5">
      <SectionLabel className="mb-4">Revenue Impact</SectionLabel>

      {/* Main incremental number */}
      <div className="bg-accent-success/8 border border-accent-success/20 rounded-xl p-5 mb-4">
        <p className="text-[11px] text-accent-success uppercase tracking-widest font-semibold mb-1">
          Incremental Revenue
        </p>
        <p className="text-4xl font-black text-revenue-green mb-1">
          {formatRevenue(impact.incremental_revenue)}
        </p>
        <p className="text-[12px] text-text-muted">
          Directly caused by this campaign · {formatROI(impact.true_roi)} ROI
        </p>
      </div>

      {/* Breakdown */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total Revenue",        value: formatRevenue(impact.total_revenue),         sub: "messaged group" },
          { label: "Organic Baseline",     value: formatRevenue(impact.counterfactual_revenue), sub: "would have occurred anyway" },
          { label: "Campaign Cost",        value: `₹${Math.round(impact.cost).toLocaleString()}`, sub: "channel spend" },
        ].map((m) => (
          <div key={m.label} className="bg-bg-elevated rounded-lg p-3">
            <p className="text-[10px] text-text-muted uppercase tracking-wider mb-1">{m.label}</p>
            <p className="text-[15px] font-bold text-text-primary">{m.value}</p>
            <p className="text-[10px] text-text-muted mt-0.5">{m.sub}</p>
          </div>
        ))}
      </div>

      <p className="text-[11px] text-text-muted mt-3 leading-relaxed">
        The <span className="text-text-secondary font-medium">{formatRevenue(impact.counterfactual_revenue)}</span> organic
        baseline (from the control group) proves{" "}
        <span className="text-revenue-green font-semibold">{formatRevenue(impact.incremental_revenue)}</span> was
        directly caused by this campaign — not coincidental timing.
      </p>
    </div>
  );
}

// ─── Post-Mortem Page ─────────────────────────────────────────────────────────

export default function PostMortemPage() {
  const params   = useParams();
  const router   = useRouter();
  const id       = params.id as string;
  const [report, setReport]   = useState<PostMortemResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    api.getPostMortem(id)
      .then(setReport)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen px-8 py-8 flex items-center justify-center">
        <div className="text-center max-w-xs">
          <div className="w-8 h-8 border-2 border-accent-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-text-primary font-medium mb-1">Writing analysis…</p>
          <p className="text-text-muted text-[12px]">
            AI is reviewing {`"`}all campaign events, comparing against the control group, and generating your report.
          </p>
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="min-h-screen px-8 py-8 flex items-center justify-center">
        <div className="text-center">
          <p className="text-accent-warning text-[13px] mb-2">
            {error?.includes("only available") ? "⏳ Campaign still running" : "⚠ Analysis unavailable"}
          </p>
          <p className="text-text-muted text-[12px] mb-4">{error}</p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => router.push(`/campaigns/${id}`)} className="text-accent-primary text-sm hover:underline">
              ← Back to War Room
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-8 py-8 max-w-3xl">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <SectionLabel>AI Consultant Report</SectionLabel>
          <span className="text-[10px] text-text-muted">· Generated by AI · Based on real campaign events</span>
        </div>
        <h1 className="text-2xl font-bold text-text-primary mb-1">Campaign Post-Mortem</h1>
        <div className="w-16 h-px bg-accent-primary mt-3" />
      </motion.div>

      <div className="space-y-8">
        {/* Executive Summary */}
        <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.05 }}>
          <div className="mb-3">
            <SectionLabel>Executive Summary</SectionLabel>
          </div>
          <div className="bg-bg-surface border border-border-dim rounded-xl p-5">
            <p className="text-[15px] text-text-secondary leading-[1.8]">
              {report.executive_summary}
            </p>
          </div>
        </motion.section>

        <div className="h-px bg-border-dim" />

        {/* What Worked */}
        <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
          <SectionLabel className="mb-3">What Worked</SectionLabel>
          <div className="space-y-3">
            {report.what_worked.map((f, i) => (
              <FindingCard key={i} finding={f} index={i} variant="success" />
            ))}
          </div>
        </motion.section>

        {/* What Failed */}
        {report.what_failed.length > 0 && (
          <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}>
            <SectionLabel className="mb-3">What Failed</SectionLabel>
            <div className="space-y-3">
              {report.what_failed.map((f, i) => (
                <FindingCard key={i} finding={f} index={i} variant="danger" />
              ))}
            </div>
          </motion.section>
        )}

        <div className="h-px bg-border-dim" />

        {/* Revenue Impact */}
        <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          <RevenueImpactCard impact={report.revenue_impact} />
        </motion.section>

        <div className="h-px bg-border-dim" />

        {/* Recommendations */}
        <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}>
          <SectionLabel className="mb-3">Recommendations</SectionLabel>
          <div className="space-y-3">
            {report.recommendations.map((r, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * i }}
                className="bg-bg-surface border border-border-dim rounded-xl p-4"
              >
                <div className="flex items-start gap-3 mb-3">
                  <span className="text-accent-primary font-bold text-[15px] flex-shrink-0 mt-0.5">
                    {i + 1}.
                  </span>
                  <p className="text-[14px] text-text-primary font-medium leading-snug">{r.text}</p>
                </div>
                <div className="pl-6">
                  <ConfidenceBar score={r.confidence} size="sm" />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        <div className="h-px bg-border-dim" />

        {/* Memory saved */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-accent-primary/8 border border-accent-primary/20 rounded-xl p-4 flex items-start gap-3"
        >
          <span className="text-lg flex-shrink-0">🧠</span>
          <div>
            <p className="text-[11px] font-semibold text-accent-primary tracking-widest uppercase mb-1">
              Learning Saved to AI Memory
            </p>
            <p className="text-[13px] text-text-secondary italic leading-relaxed">
              "{report.memory_saved}"
            </p>
            <p className="text-[11px] text-text-muted mt-1.5">
              The next campaign will build on what worked here.
            </p>
          </div>
        </motion.div>

        {/* Footer actions */}
        <div className="flex gap-3 pb-8">
          <button
            onClick={() => router.push(`/campaigns/${id}`)}
            className="px-4 py-2.5 text-[13px] border border-border-bright text-text-secondary rounded-lg hover:text-text-primary transition-all"
          >
            ← War Room
          </button>
          <button
            onClick={() => router.push("/")}
            className="flex-1 py-2.5 text-[13px] font-semibold bg-accent-primary text-white rounded-lg hover:bg-accent-primary/90 hover:shadow-glow-sm transition-all"
          >
            Find Next Opportunity →
          </button>
        </div>
      </div>
    </div>
  );
}
