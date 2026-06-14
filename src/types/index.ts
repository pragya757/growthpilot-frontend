// ─── Enums ────────────────────────────────────────────────────────────────────

export type CampaignStatus =
  | "draft"
  | "sent"
  | "delivered"
  | "opened"
  | "clicked"
  | "purchased";

export type Channel = "whatsapp" | "email" | "sms";

export type OpportunityPriority = "high" | "medium" | "upcoming";

// ─── Opportunity ──────────────────────────────────────────────────────────────

export interface Opportunity {
  id: string;
  title: string;
  description: string;
  estimated_revenue: number;
  confidence: number;
  audience_size: number;
  expected_roi: number;
  priority: OpportunityPriority;
  segment_type: string;
  reasoning: string;
}

export interface OpportunityListResponse {
  opportunities: Opportunity[];
}

// ─── Audience ─────────────────────────────────────────────────────────────────

export interface AudienceRequest {
  query: string;
}

export interface AudienceResponse {
  query: string;
  inactive_days: number | null;
  min_spend: number | null;
  estimated_customers: number;
  avg_ltv: number;
  top_city: string;
  preferred_channel: string;
  segment_quality: number;
  reasoning: string;
}

// ─── Campaign Simulation ──────────────────────────────────────────────────────

export interface SimulateRequest {
  segment_query: string;
  audience_size: number;
  opportunity_id?: string;
}

export interface StrategyMetrics {
  channel: Channel;
  estimated_revenue: number;
  roi: number;
  open_rate: number;
  conversion_rate: number;
  cost: number;
  message_sample: string;
  ai_reasoning: string;
}

export interface SimulateResponse {
  strategy_a: StrategyMetrics;
  strategy_b: StrategyMetrics;
  recommended: "A" | "B";
  recommendation_reason: string;
}

// ─── Campaign Launch ──────────────────────────────────────────────────────────

export interface LaunchRequest {
  segment_query: string;
  audience_size: number;
  selected_strategy: "A" | "B";
  channel: Channel;
  message: string;
  opportunity_id?: string;
}

export interface LaunchResponse {
  campaign_id: string;
  status: CampaignStatus;
  treatment_count: number;
  control_count: number;
  message: string;
}

export interface CampaignEvent {
  timestamp: string;
  customer_name: string;
  event_type: CampaignStatus;
  value?: number;
}

export interface Campaign {
  id: string;
  name: string;
  status: CampaignStatus;
  channel: Channel;
  audience_size: number;
  treatment_count: number;
  control_count: number;
  message: string;
  launched_at: string;
  completed_at?: string;
  events: CampaignEvent[];
  metrics: Record<string, number>;
}

// ─── Analytics ────────────────────────────────────────────────────────────────

export interface AnalyticsResponse {
  campaign_id: string;
  status: CampaignStatus;
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  purchased: number;
  revenue_generated: number;
  open_rate: number;
  click_rate: number;
  conversion_rate: number;
  incremental_revenue: number;
  true_roi: number;
  recent_events: CampaignEvent[];
}

// ─── Post-Mortem ──────────────────────────────────────────────────────────────

export interface Finding {
  title: string;
  evidence: string;
  evidence_tag: string;
  implication: string;
}

export interface Recommendation {
  text: string;
  confidence: number;
}

export interface PostMortemResponse {
  campaign_id: string;
  executive_summary: string;
  what_worked: Finding[];
  what_failed: Finding[];
  revenue_impact: {
    total_revenue: number;
    incremental_revenue: number;
    counterfactual_revenue: number;
    true_roi: number;
    cost: number;
  };
  recommendations: Recommendation[];
  memory_saved: string;
}
