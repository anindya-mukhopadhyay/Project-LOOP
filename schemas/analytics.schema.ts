import { z } from "zod";
import { Channel, FeedbackStatus, Sentiment } from "@prisma/client";

export const analyticsFilterSchema = z.object({
  range: z.enum(["today", "7d", "30d", "90d", "custom"]).default("30d"),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  channel: z.nativeEnum(Channel).optional(),
  status: z.nativeEnum(FeedbackStatus).optional(),
  sentiment: z.nativeEnum(Sentiment).optional(),
  themeId: z.string().optional(),
});

export type AnalyticsFilterInput = z.infer<typeof analyticsFilterSchema>;

export interface GrowthComparison {
  currentValue: number;
  previousValue: number;
  deltaPercentage: number;
  direction: "up" | "down" | "flat";
}

export interface DashboardOverview {
  totalFeedback: GrowthComparison;
  newFeedbackToday: number;
  newFeedbackThisWeek: number;
  reviewedFeedback: GrowthComparison;
  actionedFeedback: GrowthComparison;
  avgSentimentScore: GrowthComparison;
  positivePercentage: GrowthComparison;
  negativePercentage: GrowthComparison;
  neutralPercentage: GrowthComparison;
  activeThemesCount: number;
  workspaceMembersCount: number;
  pendingInvitationsCount: number;
}

export interface TrendPoint {
  date: string;
  count: number;
  positive?: number;
  neutral?: number;
  negative?: number;
}

export interface ChannelDistribution {
  channel: Channel;
  label: string;
  count: number;
  percentage: number;
}

export interface SentimentDistribution {
  sentiment: Sentiment;
  label: string;
  count: number;
  percentage: number;
}

export interface StatusDistribution {
  status: FeedbackStatus;
  label: string;
  count: number;
  percentage: number;
}

export interface ThemeDistribution {
  themeId: string;
  themeName: string;
  count: number;
  percentage: number;
}

export interface DashboardMetadata {
  version: "1.0";
  lastUpdated: string;
  requestId: string;
  workspaceId: string;
  appliedFilters: Record<string, unknown>;
  dataRange: string;
  health?: {
    generationTimeMs: number;
    queryDurationMs: number;
    cacheStatus: "MISS" | "HIT" | "BYPASS";
    dataFreshness: "REALTIME" | "STALE";
  };
}

export interface AiPlaceholdersPayload {
  aiSummary: {
    status: "placeholder";
    title: string;
    summary: string;
    keyTakeaways: string[];
  };
  emergingTrends: {
    status: "placeholder";
    trends: { topic: string; growth: string; description: string }[];
  };
  sentimentInsights: {
    status: "placeholder";
    insight: string;
  };
  recommendedActions: {
    status: "placeholder";
    actions: { priority: "HIGH" | "MEDIUM" | "LOW"; action: string; impact: string }[];
  };
  featureHighlights: {
    status: "placeholder";
    features: { name: string; requestCount: number }[];
  };
}

export interface DashboardPayload {
  meta: DashboardMetadata;
  overview: DashboardOverview;
  trends: {
    daily: TrendPoint[];
    weekly: TrendPoint[];
    monthly: TrendPoint[];
  };
  channels: ChannelDistribution[];
  sentiment: SentimentDistribution[];
  status: StatusDistribution[];
  topThemes: ThemeDistribution[];
  growthTrends: {
    weeklyGrowth: TrendPoint[];
    monthlyGrowth: TrendPoint[];
  };
  aiPlaceholders: AiPlaceholdersPayload;
  errors?: Record<string, string>;
}
