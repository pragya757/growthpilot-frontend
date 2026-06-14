"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { api } from "@/services/api";
import type { Campaign, LaunchRequest } from "@/types";
import { SectionLabel } from "@/components/shared/SectionLabel";
import { channelIcon, channelLabel, statusColor, statusLabel, formatRevenue, timeAgo } from "@/lib/utils";

function ControlGroupModal({
  payload,
  onConfirm,
  onCancel,
}: {
  payload: LaunchRequest;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const controlCount = Math.max(1, Math.floor(payload.audience_size * 0.05));
  const treatmentCount = payload.audience_size - controlCount;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-bg-base/80 backdrop-blur-sm px-4"
    >
      <motion.div
        initial={{ scale: 0.96, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.96, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="bg-bg-surface border border-border-bright rounded-2xl p-6 max-w-md w-full shadow-elevated"
      >
        <p className="text-[10px] font-semibold tracking-widest uppercase text-text-muted mb-1">
          Launch Campaign
        </p>
        <h2 className="text-lg font-bold text-text-primary mb-1">
          Review before sending
        </h2>
        <p className="text-[12px] text-text-muted mb-5">This cannot be undone.</p>

        <div className="space-y-2 mb-5">
          {[
            { label: "Channel",    value: `${channelIcon(payload.channel)} ${channelLabel(payload.channel)}` },
            { label: "Audience",   value: `${payload.audience_size.toLocaleString()} customers` },
            { label: "Messages",   value: `${treatmentCount.toLocaleString()} will receive the message` },
          ].map((r) => (
            <div key={r.label} className="flex justify-between py-2 border-b border-border-dim">
              <span className="text-[12px] text-text-muted">{r.label}</span>
              <span className="text-[12px] font-medium text-text-primary">{r.value}</span>
            </div>
          ))}
        </div>

        {/* Control group callout */}
        <div className="bg-accent-primary/8 border border-accent-primary/20 rounded-xl p-4 mb-5">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-base">🧪</span>
            <p className="text-[11px] font-semibold text-accent-primary tracking-wider uppercase">
              Measurement Baseline
            </p>
          </div>
          <p className="text-[12px] text-text-secondary leading-relaxed">
            <span className="font-semibold text-text-primary">{controlCount} customers (5%)</span> are
            reserved as a control group. They won't receive a message — their behaviour measures
            the campaign's true incremental impact.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 text-[13px] border border-border-bright text-text-secondary rounded-lg hover:text-text-primary transition-all"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 text-[13px] font-semibold bg-accent-primary text-white rounded-lg hover:bg-accent-primary/90 hover:shadow-glow-sm transition-all"
          >
            Launch Campaign →
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function CampaignRow({ campaign }: { campaign: Campaign }) {
  const router = useRouter();
  const revenue = campaign.metrics?.revenue ?? 0;
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={() => router.push(`/campaigns/${campaign.id}`)}
      className="flex items-center gap-4 p-4 bg-bg-surface border border-border-dim rounded-xl hover:border-border-bright cursor-pointer transition-all group"
    >
      <div className="w-8 h-8 rounded-lg bg-bg-elevated flex items-center justify-center text-base flex-shrink-0">
        {channelIcon(campaign.channel)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-medium text-text-primary truncate">{campaign.name}</p>
        <p className="text-[11px] text-text-muted">{timeAgo(campaign.launched_at)}</p>
      </div>
      <div className="text-right flex-shrink-0">
        <p className={`text-[12px] font-semibold ${statusColor(campaign.status)}`}>
          {statusLabel(campaign.status)}
        </p>
        {revenue > 0 && (
          <p className="text-[11px] text-revenue-green">{formatRevenue(revenue)}</p>
        )}
      </div>
      <svg
        width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5"
        className="text-text-muted group-hover:text-text-secondary transition-colors flex-shrink-0"
        viewBox="0 0 24 24"
      >
        <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </motion.div>
  );
}

export default function CampaignsPage() {
  const [payload, setPayload]     = useState<LaunchRequest | null>(null);
  const [launching, setLaunching] = useState(false);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();

  // Load launch payload from session (set by Battle Arena)
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("launch_payload");
      if (raw) setPayload(JSON.parse(raw));
    } catch {}

    api.getAllCampaigns().then((r) => setCampaigns(r.campaigns)).catch(() => {});
  }, []);

  async function handleLaunch() {
    if (!payload) return;
    setLaunching(true);
    try {
      const res = await api.launchCampaign(payload);
      sessionStorage.removeItem("launch_payload");
      sessionStorage.removeItem("audience_result");
      setShowModal(false);
      router.push(`/campaigns/${res.campaign_id}`);
    } catch (e) {
      console.error(e);
      setLaunching(false);
    }
  }

  return (
    <div className="min-h-screen px-8 py-8 max-w-2xl">
      <AnimatePresence>
        {showModal && payload && (
          <ControlGroupModal
            payload={payload}
            onConfirm={handleLaunch}
            onCancel={() => setShowModal(false)}
          />
        )}
      </AnimatePresence>

      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <SectionLabel className="mb-1">Campaign Arena</SectionLabel>
        <h1 className="text-2xl font-bold text-text-primary mb-1">Campaigns</h1>
        <p className="text-[13px] text-text-secondary">
          Launch campaigns and monitor live performance.
        </p>
      </motion.div>

      {/* Pending launch */}
      {payload && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-accent-primary/8 border border-accent-primary/30 rounded-xl p-5 mb-6"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-semibold tracking-widest uppercase text-accent-primary mb-1">
                READY TO LAUNCH
              </p>
              <p className="text-[14px] font-semibold text-text-primary mb-0.5">
                Strategy {payload.selected_strategy} · {channelLabel(payload.channel)}
              </p>
              <p className="text-[12px] text-text-muted">
                {payload.audience_size.toLocaleString()} customers · {payload.segment_query.slice(0, 50)}…
              </p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              disabled={launching}
              className="flex-shrink-0 px-4 py-2.5 text-[13px] font-semibold bg-accent-primary text-white rounded-lg hover:bg-accent-primary/90 disabled:opacity-50 hover:shadow-glow-sm transition-all"
            >
              {launching ? "Launching…" : "Launch →"}
            </button>
          </div>
        </motion.div>
      )}

      {/* Campaign list */}
      <div className="space-y-2">
        {campaigns.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-border-dim rounded-xl">
            <p className="text-2xl mb-3">🚀</p>
            <p className="text-text-primary font-medium mb-1">No growth missions launched yet</p>
            <p className="text-text-muted text-[13px] mb-4">
              Start from an opportunity to design and launch your first campaign.
            </p>
            <button
              onClick={() => router.push("/")}
              className="text-[13px] text-accent-primary hover:underline"
            >
              Find opportunities →
            </button>
          </div>
        ) : (
          campaigns.map((c) => <CampaignRow key={c.id} campaign={c} />)
        )}
      </div>
    </div>
  );
}
