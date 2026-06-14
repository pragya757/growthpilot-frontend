"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { api } from "@/services/api";
import type { Opportunity } from "@/types";
import { OpportunityCard } from "@/components/dashboard/OpportunityCard";
import { SectionLabel } from "@/components/shared/SectionLabel";

function OpportunityCardSkeleton() {
  return (
    <div className="bg-bg-surface border border-border-dim border-l-[3px] border-l-border-bright rounded-r-xl rounded-l-sm p-5 animate-pulse">
      <div className="h-2 w-24 bg-bg-elevated rounded mb-3" />
      <div className="h-4 w-3/4 bg-bg-elevated rounded mb-2" />
      <div className="h-3 w-1/2 bg-bg-elevated rounded mb-4" />
      <div className="h-1.5 w-full bg-bg-elevated rounded mb-4" />
      <div className="grid grid-cols-3 gap-3 mb-4">
        {[0,1,2].map(i => <div key={i} className="h-12 bg-bg-elevated rounded-lg" />)}
      </div>
      <div className="flex gap-2">
        <div className="flex-1 h-9 bg-bg-elevated rounded-lg" />
        <div className="flex-1 h-9 bg-bg-elevated rounded-lg" />
      </div>
    </div>
  );
}

export default function MissionControlPage() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    api.getOpportunities()
      .then((r) => setOpportunities(r.opportunities))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen px-8 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-1">
          <SectionLabel>Active Intelligence</SectionLabel>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-accent-success live-dot" />
            <span className="text-[10px] text-text-muted">Live</span>
          </div>
        </div>
        <h1 className="text-2xl font-bold text-text-primary mb-1">Mission Control</h1>
        <p className="text-[13px] text-text-secondary">
          AI has scanned your customer data and found{" "}
          <span className="text-text-primary font-medium">{opportunities.length} revenue opportunities</span>{" "}
          waiting for action.
        </p>
      </motion.div>

      {/* Glow background accent */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-glow-indigo pointer-events-none opacity-50" />

      {/* Opportunity feed */}
      <div className="max-w-2xl space-y-4 relative z-10">
        {loading ? (
          [0, 1, 2].map((i) => <OpportunityCardSkeleton key={i} />)
        ) : error ? (
          <div className="bg-bg-surface border border-accent-danger/30 rounded-xl p-6 text-center">
            <p className="text-accent-danger text-sm mb-2">Failed to load opportunities</p>
            <p className="text-text-muted text-xs">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-3 text-xs text-accent-primary hover:underline"
            >
              Retry
            </button>
          </div>
        ) : opportunities.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-3xl mb-3">🔍</div>
            <p className="text-text-primary font-medium mb-1">AI is scanning your data</p>
            <p className="text-text-muted text-sm">Revenue opportunities will appear here shortly.</p>
          </div>
        ) : (
          opportunities.map((opp, i) => (
            <OpportunityCard key={opp.id} opportunity={opp} index={i} />
          ))
        )}
      </div>

      {/* Bottom stats strip */}
      {!loading && !error && opportunities.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="max-w-2xl mt-8 grid grid-cols-3 gap-4"
        >
          {[
            { label: "Total Opportunity",  value: `₹${(opportunities.reduce((s, o) => s + o.estimated_revenue, 0) / 100000).toFixed(1)}L` },
            { label: "Total Audience",     value: opportunities.reduce((s, o) => s + o.audience_size, 0).toLocaleString() },
            { label: "Avg Confidence",     value: `${Math.round(opportunities.reduce((s, o) => s + o.confidence, 0) / opportunities.length * 100)}%` },
          ].map((stat) => (
            <div key={stat.label} className="glass rounded-xl p-4 text-center">
              <p className="text-[10px] text-text-muted uppercase tracking-widest mb-1">{stat.label}</p>
              <p className="text-xl font-bold text-text-primary">{stat.value}</p>
            </div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
