"use client";
import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/services/api";
import { usePolling } from "@/hooks/usePolling";
import type { AnalyticsResponse, CampaignEvent } from "@/types";
import { SectionLabel } from "@/components/shared/SectionLabel";
import {
  formatRevenue, formatPct, statusColor, statusLabel,
  channelIcon, channelLabel, timeAgo, CAMPAIGN_STATUSES,
} from "@/lib/utils";

// ─── Sub-components ────────────────────────────────────────────────────────────

function StatBar({ label, value, total, color = "bg-accent-primary" }: {
  label: string; value: number; total: number; color?: string;
}) {
  const pct = total > 0 ? Math.min(100, (value / total) * 100) : 0;
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-[11px] text-text-muted uppercase tracking-wider">{label}</span>
        <span className="text-[13px] font-bold text-text-primary tabular-nums">{value.toLocaleString()}</span>
      </div>
      <div className="h-1.5 w-full bg-bg-elevated rounded-full overflow-hidden">
        <motion.div
          className={`h-1.5 ${color} rounded-full`}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

function EventEntry({ event, index }: { event: CampaignEvent; index: number }) {
  const isPurchase = event.event_type === "purchased";
  return (
    <motion.div
      initial={{ opacity: 0, y: -12, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.25, delay: index * 0.03 }}
      className={`flex items-center gap-3 py-2.5 px-3 rounded-lg transition-all ${
        isPurchase ? "revenue-flash bg-accent-success/5" : ""
      }`}
    >
      <span className="text-sm flex-shrink-0">
        {isPurchase ? "⚡" : "·"}
      </span>
      <div className="flex-1 min-w-0">
        <span className={`text-[13px] font-medium ${isPurchase ? "text-text-primary" : "text-text-secondary"}`}>
          {event.customer_name}
        </span>
        <span className="text-[12px] text-text-muted ml-1.5">
          {statusLabel(event.event_type).toLowerCase()} message
        </span>
        {isPurchase && event.value && (
          <span className="text-[12px] font-bold text-revenue-green ml-1.5">
            {formatRevenue(event.value)}
          </span>
        )}
      </div>
      <span className="text-[10px] text-text-muted flex-shrink-0">
        {timeAgo(event.timestamp)}
      </span>
    </motion.div>
  );
}

function StateProgressBar({ status }: { status: string }) {
  const currentIdx = CAMPAIGN_STATUSES.indexOf(status as any);
  return (
    <div className="flex items-center gap-1">
      {CAMPAIGN_STATUSES.map((s, i) => (
        <div key={s} className="flex items-center gap-1 flex-1 last:flex-none">
          <div className="flex flex-col items-center gap-0.5 flex-shrink-0">
            <div className={`w-2 h-2 rounded-full border transition-all duration-500 ${
              i < currentIdx
                ? "bg-accent-primary border-accent-primary"
                : i === currentIdx
                ? "bg-accent-primary border-accent-primary shadow-glow-sm"
                : "bg-transparent border-border-bright"
            }`} />
            <span className="text-[9px] text-text-muted whitespace-nowrap capitalize">{s}</span>
          </div>
          {i < CAMPAIGN_STATUSES.length - 1 && (
            <div className={`h-px flex-1 mb-3 transition-all duration-500 ${
              i < currentIdx ? "bg-accent-primary/50" : "bg-border-dim"
            }`} />
          )}
        </div>
      ))}
    </div>
  );
}

// ─── War Room Page ─────────────────────────────────────────────────────────────

export default function WarRoomPage() {
  const params   = useParams();
  const router   = useRouter();
  const id       = params.id as string;
  const [done, setDone] = useState(false);

  const fetcher = useCallback(() => api.getAnalytics(id), [id]);
  const { data, loading, error } = usePolling<AnalyticsResponse>(
    fetcher,
    2000,
    !done,
  );

  // Stop polling when campaign reaches "purchased"
  useEffect(() => {
    if (data?.status === "purchased") setDone(true);
  }, [data?.status]);

  if (loading && !data) {
    return (
      <div className="min-h-screen px-8 py-8 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-accent-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-text-muted text-[13px]">Connecting to campaign…</p>
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="min-h-screen px-8 py-8 flex items-center justify-center">
        <div className="text-center">
          <p className="text-accent-danger mb-2">Campaign not found</p>
          <button onClick={() => router.push("/campaigns")} className="text-accent-primary text-sm hover:underline">
            ← Back to campaigns
          </button>
        </div>
      </div>
    );
  }

  const d = data!;
  const isLive = d.status !== "purchased";

  return (
    <div className="min-h-screen px-8 py-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <SectionLabel>Campaign War Room</SectionLabel>
          {isLive ? (
            <div className="flex items-center gap-1.5 bg-accent-danger/10 border border-accent-danger/20 rounded-full px-2.5 py-0.5">
              <div className="w-1.5 h-1.5 rounded-full bg-accent-danger live-dot" />
              <span className="text-[10px] font-semibold text-accent-danger tracking-widest uppercase">Live</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 bg-accent-success/10 border border-accent-success/20 rounded-full px-2.5 py-0.5">
              <span className="text-[10px] font-semibold text-accent-success tracking-widest uppercase">Complete</span>
            </div>
          )}
        </div>
        <h1 className="text-2xl font-bold text-text-primary mb-1">Mission Control</h1>
        <p className="text-[13px] text-text-secondary">
          {d.sent} messages dispatched · {isLive ? "Events streaming in real-time" : "Campaign complete"}
        </p>
      </motion.div>

      {/* State progress bar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-bg-surface border border-border-dim rounded-xl p-4 mb-6"
      >
        <StateProgressBar status={d.status} />
      </motion.div>

      <div className="grid grid-cols-[1fr_320px] gap-6">
        {/* Left column */}
        <div className="space-y-5">
          {/* Mission Progress */}
          <div className="bg-bg-surface border border-border-dim rounded-xl p-5">
            <SectionLabel className="mb-4">Mission Progress</SectionLabel>
            <div className="space-y-4">
              <StatBar label="Sent"      value={d.sent}      total={d.sent}      color="bg-accent-primary" />
              <StatBar label="Delivered" value={d.delivered} total={d.sent}      color="bg-blue-400" />
              <StatBar label="Opened"    value={d.opened}    total={d.delivered} color="bg-accent-warning" />
              <StatBar label="Clicked"   value={d.clicked}   total={d.opened}    color="bg-orange-400" />
              <StatBar label="Purchased" value={d.purchased} total={d.clicked}   color="bg-accent-success" />
            </div>
          </div>

          {/* Revenue Meter */}
          <div className="bg-bg-surface border border-border-dim rounded-xl p-5">
            <div className="flex items-end justify-between mb-2">
              <div>
                <SectionLabel className="mb-1">Revenue Meter</SectionLabel>
                <motion.p
                  key={d.revenue_generated}
                  initial={{ scale: 1.05 }}
                  animate={{ scale: 1 }}
                  className="text-4xl font-black text-revenue-green"
                >
                  {formatRevenue(d.revenue_generated)}
                </motion.p>
                <p className="text-[12px] text-text-muted mt-0.5">campaign purchases (live)</p>
              </div>
              {d.purchased > 0 && (
                <div className="text-right">
                  <p className="text-[11px] text-text-muted">Avg order</p>
                  <p className="text-[16px] font-bold text-text-primary">
                    {formatRevenue(d.revenue_generated / d.purchased)}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Control Group */}
          <div className="bg-bg-surface border border-border-dim rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm">🧪</span>
                  <SectionLabel>Control Group</SectionLabel>
                </div>
                <p className="text-[12px] text-text-muted">No message sent · monitoring organic purchases</p>
              </div>
              <div className="text-right">
                <p className="text-[11px] text-text-muted">Organic conv.</p>
                <p className="text-[16px] font-bold text-text-primary">3%</p>
              </div>
            </div>
          </div>

          {/* Post-mortem CTA when complete */}
          {!isLive && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-accent-success/8 border border-accent-success/30 rounded-xl p-5 flex items-center justify-between"
            >
              <div>
                <p className="text-[13px] font-semibold text-text-primary mb-0.5">Campaign complete</p>
                <p className="text-[12px] text-text-muted">AI post-mortem is ready.</p>
              </div>
              <button
                onClick={() => router.push(`/campaigns/${id}/postmortem`)}
                className="px-4 py-2 text-[13px] font-semibold bg-accent-success text-bg-base rounded-lg hover:bg-accent-success/90 transition-all flex-shrink-0"
              >
                View Report →
              </button>
            </motion.div>
          )}
        </div>

        {/* Right column — Activity Stream */}
        <div className="bg-bg-surface border border-border-dim rounded-xl p-4 h-fit sticky top-8">
          <div className="flex items-center justify-between mb-3">
            <SectionLabel>Live Activity</SectionLabel>
            {isLive && (
              <div className="flex items-center gap-1">
                <div className="w-1 h-1 rounded-full bg-accent-success live-dot" />
                <span className="text-[9px] text-text-muted">streaming</span>
              </div>
            )}
          </div>

          <div className="space-y-0 divide-y divide-border-dim/50 max-h-[520px] overflow-y-auto">
            <AnimatePresence initial={false}>
              {d.recent_events.length === 0 ? (
                <div className="py-8 text-center">
                  <div className="w-4 h-4 border-2 border-accent-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  <p className="text-[12px] text-text-muted">Waiting for first events…</p>
                </div>
              ) : (
                d.recent_events.slice(0, 20).map((ev, i) => (
                  <EventEntry key={`${ev.customer_name}-${ev.event_type}-${i}`} event={ev} index={i} />
                ))
              )}
            </AnimatePresence>
          </div>

          {/* Analytics quick link */}
          <div className="mt-3 pt-3 border-t border-border-dim">
            <button
              onClick={() => router.push(`/analytics?campaign=${id}`)}
              className="w-full text-[12px] text-text-muted hover:text-text-secondary text-center transition-colors"
            >
              View full analytics →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
