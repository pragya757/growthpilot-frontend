"use client";
import { Suspense, useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/services/api";
import { usePolling } from "@/hooks/usePolling";
import type { AnalyticsResponse, Campaign } from "@/types";
import { SectionLabel } from "@/components/shared/SectionLabel";
import { formatRevenue, formatPct, formatROI, channelIcon, statusLabel } from "@/lib/utils";

// ─── Sub-components ────────────────────────────────────────────────────────────

function MetricCard({ label, value, sub, color = "text-text-primary", big = false }: {
  label: string; value: string; sub?: string; color?: string; big?: boolean;
}) {
  return (
    <div className="bg-bg-surface border border-border-dim rounded-xl p-4">
      <p className="text-[10px] text-text-muted uppercase tracking-widest mb-1.5">{label}</p>
      <motion.p
        key={value}
        initial={{ scale: 1.04 }}
        animate={{ scale: 1 }}
        className={`${big ? "text-3xl" : "text-xl"} font-black ${color}`}
      >
        {value}
      </motion.p>
      {sub && <p className="text-[11px] text-text-muted mt-0.5">{sub}</p>}
    </div>
  );
}

function FunnelBar({ label, count, total, rate, color }: {
  label: string; count: number; total: number; rate: number; color: string;
}) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div className="flex items-center gap-4">
      <div className="w-20 text-right flex-shrink-0">
        <p className="text-[11px] text-text-muted uppercase tracking-wider">{label}</p>
      </div>
      <div className="flex-1 h-6 bg-bg-elevated rounded-md overflow-hidden">
        <motion.div
          className={`h-full ${color} rounded-md`}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
      <div className="w-28 flex items-center gap-2 flex-shrink-0">
        <span className="text-[13px] font-bold text-text-primary tabular-nums w-12 text-right">
          {count.toLocaleString()}
        </span>
        <span className="text-[11px] text-text-muted">{formatPct(rate)}</span>
      </div>
    </div>
  );
}

function IncrementalBar({ treatment, organic, incremental }: {
  treatment: number; organic: number; incremental: number;
}) {
  if (treatment === 0) return null;
  const organicPct = Math.round((organic / treatment) * 100);
  const incrPct    = Math.max(0, Math.round((incremental / treatment) * 100));
  return (
    <div className="space-y-4">
      <div>
        <div className="flex justify-between mb-1.5">
          <span className="text-[11px] text-text-muted">With Campaign</span>
          <span className="text-[13px] font-bold text-text-primary">{formatRevenue(treatment)}</span>
        </div>
        <div className="h-7 bg-bg-elevated rounded-lg overflow-hidden flex">
          <motion.div
            className="h-full bg-text-muted/30"
            initial={{ width: 0 }}
            animate={{ width: `${organicPct}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
          <motion.div
            className="h-full bg-accent-success"
            initial={{ width: 0 }}
            animate={{ width: `${incrPct}%` }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
          />
        </div>
      </div>
      <div>
        <div className="flex justify-between mb-1.5">
          <span className="text-[11px] text-text-muted">Without Campaign (organic baseline)</span>
          <span className="text-[13px] font-bold text-text-muted">{formatRevenue(organic)}</span>
        </div>
        <div className="h-7 bg-bg-elevated rounded-lg overflow-hidden">
          <motion.div
            className="h-full bg-text-muted/30"
            initial={{ width: 0 }}
            animate={{ width: `${organicPct}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>
      </div>
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-accent-success" />
          <span className="text-[11px] text-text-muted">Incremental (+{formatRevenue(incremental)})</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-text-muted/30" />
          <span className="text-[11px] text-text-muted">Organic baseline</span>
        </div>
      </div>
    </div>
  );
}

// ─── Inner component (uses useSearchParams — must be inside Suspense) ──────────

function AnalyticsInner() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const campaignId   = searchParams.get("campaign");

  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [listLoading, setListLoading] = useState(true);
  // Immediately use URL param — don't wait for the campaigns list to load
  const [selected, setSelected]   = useState<string | null>(campaignId);
  const [done, setDone]           = useState(false);

  useEffect(() => {
    api.getAllCampaigns()
      .then((r) => {
        setCampaigns(r.campaigns);
        // Auto-select first only if nothing is already selected
        if (!selected && r.campaigns.length > 0) setSelected(r.campaigns[0].id);
      })
      .catch(() => {})
      .finally(() => setListLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetcher = useCallback(
    () => (selected ? api.getAnalytics(selected) : Promise.reject("no campaign")),
    [selected],
  );

  const { data } = usePolling<AnalyticsResponse>(fetcher, 2000, !!selected && !done);

  useEffect(() => { if (data?.status === "purchased") setDone(true); }, [data?.status]);
  useEffect(() => { setDone(false); }, [selected]);

  const d = data;

  return (
    <div className="min-h-screen px-8 py-8">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <SectionLabel className="mb-1">Analytics</SectionLabel>
        <h1 className="text-2xl font-bold text-text-primary mb-1">Campaign Results</h1>
        <p className="text-[13px] text-text-secondary">Business impact — not vanity metrics.</p>
      </motion.div>

      {/* Campaign selector */}
      {campaigns.length > 0 && (
        <div className="flex gap-2 mb-6 flex-wrap">
          {campaigns.map((c) => (
            <button
              key={c.id}
              onClick={() => { setSelected(c.id); setDone(false); }}
              className={`px-3 py-1.5 text-[12px] rounded-lg border transition-all ${
                selected === c.id
                  ? "border-accent-primary bg-accent-primary/10 text-text-primary"
                  : "border-border-dim text-text-muted hover:border-border-bright"
              }`}
            >
              {channelIcon(c.channel)} {c.name.slice(0, 30)}
            </button>
          ))}
        </div>
      )}

      {!d ? (
        // Show spinner while: list is loading OR a campaign is selected but data not yet arrived
        listLoading || selected ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-6 h-6 border-2 border-accent-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="text-center py-20 border border-dashed border-border-dim rounded-xl max-w-lg">
            <p className="text-2xl mb-3">📊</p>
            <p className="text-text-primary font-medium mb-1">No campaigns yet</p>
            <p className="text-text-muted text-[13px] mb-4">Launch a campaign to see analytics here.</p>
            <button onClick={() => router.push("/")} className="text-accent-primary text-[13px] hover:underline">
              Find opportunities →
            </button>
          </div>
        )
      ) : (
        <div className="space-y-6 max-w-3xl">
          {/* Top KPIs */}
          <div className="grid grid-cols-4 gap-4">
            <MetricCard label="Incremental Revenue" value={formatRevenue(d.incremental_revenue)} sub="campaign caused this" color="text-revenue-green" big />
            <MetricCard label="True ROI"            value={formatROI(d.true_roi)}                sub="return on spend" />
            <MetricCard label="Conversion Rate"     value={formatPct(d.conversion_rate)}         sub="messaged → purchased" />
            <MetricCard label="Total Revenue"       value={formatRevenue(d.revenue_generated)}   sub="all purchases" />
          </div>

          {/* Funnel */}
          <div className="bg-bg-surface border border-border-dim rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <SectionLabel>Delivery Funnel</SectionLabel>
              <div className="flex items-center gap-1.5">
                {d.status !== "purchased" && (
                  <div className="w-1.5 h-1.5 rounded-full bg-accent-success live-dot" />
                )}
                <span className="text-[11px] text-text-muted capitalize">{statusLabel(d.status)}</span>
              </div>
            </div>
            <div className="space-y-3">
              <FunnelBar label="Sent"      count={d.sent}      total={d.sent}      rate={1}                                           color="bg-accent-primary" />
              <FunnelBar label="Delivered" count={d.delivered} total={d.sent}      rate={d.delivered / Math.max(d.sent, 1)}           color="bg-blue-400" />
              <FunnelBar label="Opened"    count={d.opened}    total={d.delivered} rate={d.open_rate}                                 color="bg-accent-warning" />
              <FunnelBar label="Clicked"   count={d.clicked}   total={d.opened}    rate={d.click_rate}                                color="bg-orange-400" />
              <FunnelBar label="Purchased" count={d.purchased} total={d.clicked}   rate={d.purchased / Math.max(d.clicked, 1)}       color="bg-accent-success" />
            </div>
          </div>

          {/* Incremental Revenue Visualizer */}
          <div className="bg-bg-surface border border-border-dim rounded-xl p-5">
            <SectionLabel className="mb-1">Incremental Revenue Visualizer</SectionLabel>
            <p className="text-[11px] text-text-muted mb-4">
              Isolating what the campaign caused vs. what would have happened anyway.
            </p>
            <IncrementalBar
              treatment={d.revenue_generated}
              organic={Math.max(0, d.revenue_generated - d.incremental_revenue)}
              incremental={d.incremental_revenue}
            />
          </div>

          {/* Treatment vs Control */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-bg-surface border border-border-dim rounded-xl p-5">
              <SectionLabel className="mb-3">Messaged Group</SectionLabel>
              <div className="space-y-0 divide-y divide-border-dim">
                {[
                  { l: "Sent",      v: d.sent.toLocaleString() },
                  { l: "Delivered", v: d.delivered.toLocaleString() },
                  { l: "Purchased", v: d.purchased.toLocaleString() },
                  { l: "Revenue",   v: formatRevenue(d.revenue_generated) },
                ].map((r) => (
                  <div key={r.l} className="flex justify-between py-2">
                    <span className="text-[12px] text-text-muted">{r.l}</span>
                    <span className="text-[12px] font-semibold text-text-primary">{r.v}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-bg-surface border border-border-dim rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm">🧪</span>
                <SectionLabel>Control Group</SectionLabel>
              </div>
              <div className="space-y-0 divide-y divide-border-dim">
                {[
                  { l: "Group Size",      v: "5% of audience" },
                  { l: "No message sent", v: "—" },
                  { l: "Organic conv.",   v: "3%" },
                  { l: "Organic revenue", v: formatRevenue(Math.max(0, d.revenue_generated - d.incremental_revenue)) },
                ].map((r) => (
                  <div key={r.l} className="flex justify-between py-2">
                    <span className="text-[12px] text-text-muted">{r.l}</span>
                    <span className="text-[12px] font-semibold text-text-primary">{r.v}</span>
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-text-muted mt-3 leading-relaxed">
                The control group proves {formatRevenue(d.incremental_revenue)} was caused by the campaign.
              </p>
            </div>
          </div>

          {/* Post-mortem CTA */}
          {d.status === "purchased" && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-accent-success/8 border border-accent-success/30 rounded-xl p-5 flex items-center justify-between"
            >
              <div>
                <p className="text-[13px] font-semibold text-text-primary mb-0.5">Campaign complete</p>
                <p className="text-[12px] text-text-muted">AI post-mortem analysis is ready.</p>
              </div>
              <button
                onClick={() => router.push(`/campaigns/${selected}/postmortem`)}
                className="px-4 py-2 text-[13px] font-semibold bg-accent-success text-bg-base rounded-lg hover:bg-accent-success/90 transition-all flex-shrink-0"
              >
                View Report →
              </button>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Page export — wraps inner component in Suspense (required by Next.js 15) ──

export default function AnalyticsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen px-8 py-8 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-accent-primary border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <AnalyticsInner />
    </Suspense>
  );
}
