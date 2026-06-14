import type {
  AudienceRequest,
  AudienceResponse,
  AnalyticsResponse,
  LaunchRequest,
  LaunchResponse,
  OpportunityListResponse,
  PostMortemResponse,
  SimulateRequest,
  SimulateResponse,
  Campaign,
} from "@/types";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...init?.headers },
    ...init,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail ?? "Request failed");
  }
  return res.json() as Promise<T>;
}

export const api = {
  // Opportunities
  getOpportunities: () =>
    request<OpportunityListResponse>("/opportunities"),

  // Audience
  generateAudience: (body: AudienceRequest) =>
    request<AudienceResponse>("/generate-audience", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  // Campaign Simulation
  simulateCampaign: (body: SimulateRequest) =>
    request<SimulateResponse>("/simulate-campaign", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  // Campaign Launch
  launchCampaign: (body: LaunchRequest) =>
    request<LaunchResponse>("/launch-campaign", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  // Campaign detail
  getCampaign: (id: string) =>
    request<Campaign>(`/campaigns/${id}`),

  getAllCampaigns: () =>
    request<{ campaigns: Campaign[] }>("/campaigns"),

  // Analytics (used for polling)
  getAnalytics: (campaignId: string) =>
    request<AnalyticsResponse>(`/campaign/${campaignId}/analytics`),

  // Post-Mortem
  getPostMortem: (campaignId: string) =>
    request<PostMortemResponse>("/post-mortem", {
      method: "POST",
      body: JSON.stringify({ campaign_id: campaignId }),
    }),
};
