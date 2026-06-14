import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { CampaignStatus } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatRevenue(amount: number): string {
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
  if (amount >= 1000)   return `₹${(amount / 1000).toFixed(1)}K`;
  return `₹${amount.toFixed(0)}`;
}

export function formatFullRevenue(amount: number): string {
  return `₹${amount.toLocaleString("en-IN")}`;
}

export function formatPct(rate: number): string {
  return `${(rate * 100).toFixed(1)}%`;
}

export function formatROI(roi: number): string {
  return `${roi.toFixed(1)}×`;
}

export function confidenceLabel(score: number): {
  label: string;
  color: string;
  barColor: string;
} {
  if (score >= 0.85) return { label: "VERY HIGH", color: "text-accent-primary",  barColor: "bg-accent-primary"  };
  if (score >= 0.65) return { label: "HIGH",      color: "text-accent-success",  barColor: "bg-accent-success"  };
  if (score >= 0.45) return { label: "MEDIUM",    color: "text-accent-warning",  barColor: "bg-accent-warning"  };
  return               { label: "LOW",       color: "text-accent-danger",   barColor: "bg-accent-danger"   };
}

export function statusColor(status: CampaignStatus): string {
  const map: Record<CampaignStatus, string> = {
    draft:     "text-text-muted",
    sent:      "text-accent-primary",
    delivered: "text-blue-400",
    opened:    "text-accent-warning",
    clicked:   "text-orange-400",
    purchased: "text-accent-success",
  };
  return map[status] ?? "text-text-secondary";
}

export function statusLabel(status: CampaignStatus): string {
  const map: Record<CampaignStatus, string> = {
    draft:     "Draft",
    sent:      "Sent",
    delivered: "Delivered",
    opened:    "Opened",
    clicked:   "Clicked",
    purchased: "Purchased",
  };
  return map[status] ?? status;
}

export function timeAgo(isoString: string): string {
  const diff = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000);
  if (diff < 5)   return "just now";
  if (diff < 60)  return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
}

export function channelIcon(channel: string): string {
  const map: Record<string, string> = {
    whatsapp: "💬",
    email: "📧",
    sms: "💬",
  };
  return map[channel.toLowerCase()] ?? "📨";
}

export function channelLabel(channel: string): string {
  const map: Record<string, string> = {
    whatsapp: "WhatsApp",
    email: "Email",
    sms: "SMS",
  };
  return map[channel.toLowerCase()] ?? channel;
}

export const CAMPAIGN_STATUSES: CampaignStatus[] = [
  "draft", "sent", "delivered", "opened", "clicked", "purchased",
];

export function statusProgress(status: CampaignStatus): number {
  const idx = CAMPAIGN_STATUSES.indexOf(status);
  return idx < 0 ? 0 : Math.round((idx / (CAMPAIGN_STATUSES.length - 1)) * 100);
}
