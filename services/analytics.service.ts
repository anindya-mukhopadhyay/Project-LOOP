import type { Prisma } from "@prisma/client";
import { AnalyticsRepository } from "@/repositories/analytics.repository";
import { ServiceError, type ServiceResult } from "./errors";
import type {
  AnalyticsFilterInput,
  DashboardPayload,
  GrowthComparison,
  TrendPoint,
  ChannelDistribution,
  SentimentDistribution,
  StatusDistribution,
  ThemeDistribution,
  AiPlaceholdersPayload,
} from "@/schemas/analytics.schema";

export class AnalyticsService {
  private repository: AnalyticsRepository;

  constructor(repository?: AnalyticsRepository) {
    this.repository = repository || new AnalyticsRepository();
  }

  private calculateGrowth(current: number, previous: number): GrowthComparison {
    let deltaPercentage = 0;
    if (previous > 0) {
      deltaPercentage = Number((((current - previous) / previous) * 100).toFixed(1));
    } else if (current > 0) {
      deltaPercentage = 100;
    }

    let direction: "up" | "down" | "flat" = "flat";
    if (deltaPercentage > 0) direction = "up";
    else if (deltaPercentage < 0) direction = "down";

    return {
      currentValue: current,
      previousValue: previous,
      deltaPercentage,
      direction,
    };
  }

  private getDateRanges(filters: AnalyticsFilterInput) {
    const now = new Date();
    let endDate = now;
    let startDate = new Date();

    if (filters.range === "today") {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    } else if (filters.range === "7d") {
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (filters.range === "90d") {
      startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    } else if (filters.range === "custom" && filters.startDate && filters.endDate) {
      startDate = new Date(filters.startDate);
      endDate = new Date(filters.endDate);
    } else {
      // default 30d
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Performance Guardrail: Cap date range at 365 days
    const durationMs = endDate.getTime() - startDate.getTime();
    const maxMs = 365 * 24 * 60 * 60 * 1000;
    if (durationMs > maxMs) {
      startDate = new Date(endDate.getTime() - maxMs);
    }

    // Calculate Previous Period
    const prevEndDate = new Date(startDate.getTime());
    const prevStartDate = new Date(startDate.getTime() - (durationMs > 0 ? durationMs : 24 * 60 * 60 * 1000));

    return { startDate, endDate, prevStartDate, prevEndDate };
  }

  private buildWhereClause(filters: AnalyticsFilterInput, startDate: Date, endDate: Date): Prisma.FeedbackWhereInput {
    const where: Prisma.FeedbackWhereInput = {
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    };

    if (filters.channel) where.channel = filters.channel;
    if (filters.status) where.status = filters.status;
    if (filters.sentiment) where.sentiment = filters.sentiment;
    if (filters.themeId) {
      where.feedbackTheme = {
        some: { themeId: filters.themeId },
      };
    }

    return where;
  }

  async getDashboardAnalytics(
    workspaceId: string,
    filters: AnalyticsFilterInput,
    requestId = "req-" + Math.random().toString(36).substring(2, 9)
  ): Promise<ServiceResult<DashboardPayload>> {
    const startTime = Date.now();

    try {
      if (!workspaceId) {
        return {
          ok: false,
          error: new ServiceError("Workspace ID is required for analytics.", "BAD_REQUEST"),
        };
      }

      const { startDate, endDate, prevStartDate, prevEndDate } = this.getDateRanges(filters);
      const currentWhere = this.buildWhereClause(filters, startDate, endDate);
      const previousWhere = this.buildWhereClause(filters, prevStartDate, prevEndDate);

      const startOfToday = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());
      const startOfWeek = new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000);

      // Execute all aggregations in parallel with Promise.allSettled for Partial Failure Handling
      const [
        overviewResult,
        timeSeriesResult,
        channelResult,
        sentimentResult,
        statusResult,
        themesResult,
      ] = await Promise.allSettled([
        this.repository.getOverviewMetrics(workspaceId, currentWhere, previousWhere, startOfToday, startOfWeek),
        this.repository.getTimeSeriesRaw(workspaceId, currentWhere),
        this.repository.getChannelDistribution(workspaceId, currentWhere),
        this.repository.getSentimentDistribution(workspaceId, currentWhere),
        this.repository.getStatusDistribution(workspaceId, currentWhere),
        this.repository.getTopThemes(workspaceId, currentWhere, 10),
      ]);

      const errors: Record<string, string> = {};

      // 1. Overview Metrics
      let overviewData = {
        totalCurrent: 0,
        totalPrevious: 0,
        reviewedCurrent: 0,
        reviewedPrevious: 0,
        actionedCurrent: 0,
        actionedPrevious: 0,
        avgScoreCurrent: 0,
        avgScorePrevious: 0,
        sentimentCurrent: [] as { sentiment: string; _count: { _all: number } }[],
        sentimentPrevious: [] as { sentiment: string; _count: { _all: number } }[],
        newToday: 0,
        newThisWeek: 0,
        activeThemesCount: 0,
        membersCount: 0,
        pendingInvitesCount: 0,
      };

      if (overviewResult.status === "fulfilled") {
        overviewData = overviewResult.value;
      } else {
        errors.overview = "Failed to load overview KPI metrics.";
      }

      // Compute sentiment counts & percentages
      const posCurrent = overviewData.sentimentCurrent.find((s) => s.sentiment === "POSITIVE")?._count._all || 0;
      const posPrevious = overviewData.sentimentPrevious.find((s) => s.sentiment === "POSITIVE")?._count._all || 0;
      const negCurrent = overviewData.sentimentCurrent.find((s) => s.sentiment === "NEGATIVE")?._count._all || 0;
      const negPrevious = overviewData.sentimentPrevious.find((s) => s.sentiment === "NEGATIVE")?._count._all || 0;
      const neuCurrent = overviewData.sentimentCurrent.find((s) => s.sentiment === "NEUTRAL")?._count._all || 0;
      const neuPrevious = overviewData.sentimentPrevious.find((s) => s.sentiment === "NEUTRAL")?._count._all || 0;

      const posPctCurrent = overviewData.totalCurrent > 0 ? Number(((posCurrent / overviewData.totalCurrent) * 100).toFixed(1)) : 0;
      const posPctPrev = overviewData.totalPrevious > 0 ? Number(((posPrevious / overviewData.totalPrevious) * 100).toFixed(1)) : 0;

      const negPctCurrent = overviewData.totalCurrent > 0 ? Number(((negCurrent / overviewData.totalCurrent) * 100).toFixed(1)) : 0;
      const negPctPrev = overviewData.totalPrevious > 0 ? Number(((negPrevious / overviewData.totalPrevious) * 100).toFixed(1)) : 0;

      const neuPctCurrent = overviewData.totalCurrent > 0 ? Number(((neuCurrent / overviewData.totalCurrent) * 100).toFixed(1)) : 0;
      const neuPctPrev = overviewData.totalPrevious > 0 ? Number(((neuPrevious / overviewData.totalPrevious) * 100).toFixed(1)) : 0;

      const overviewPayload = {
        totalFeedback: this.calculateGrowth(overviewData.totalCurrent, overviewData.totalPrevious),
        newFeedbackToday: overviewData.newToday,
        newFeedbackThisWeek: overviewData.newThisWeek,
        reviewedFeedback: this.calculateGrowth(overviewData.reviewedCurrent, overviewData.reviewedPrevious),
        actionedFeedback: this.calculateGrowth(overviewData.actionedCurrent, overviewData.actionedPrevious),
        avgSentimentScore: this.calculateGrowth(overviewData.avgScoreCurrent, overviewData.avgScorePrevious),
        positivePercentage: this.calculateGrowth(posPctCurrent, posPctPrev),
        negativePercentage: this.calculateGrowth(negPctCurrent, negPctPrev),
        neutralPercentage: this.calculateGrowth(neuPctCurrent, neuPctPrev),
        activeThemesCount: overviewData.activeThemesCount,
        workspaceMembersCount: overviewData.membersCount,
        pendingInvitationsCount: overviewData.pendingInvitesCount,
      };

      // 2. Time Series Bins
      const dailyPoints: Map<string, TrendPoint> = new Map();
      const weeklyPoints: Map<string, TrendPoint> = new Map();
      const monthlyPoints: Map<string, TrendPoint> = new Map();

      if (timeSeriesResult.status === "fulfilled") {
        for (const item of timeSeriesResult.value) {
          const dt = new Date(item.createdAt);
          const dayKey = dt.toISOString().split("T")[0] ?? "";

          // Daily bucket
          if (!dailyPoints.has(dayKey)) {
            dailyPoints.set(dayKey, { date: dayKey, count: 0, positive: 0, neutral: 0, negative: 0 });
          }
          const dPoint = dailyPoints.get(dayKey)!;
          dPoint.count++;
          if (item.sentiment === "POSITIVE") dPoint.positive = (dPoint.positive || 0) + 1;
          if (item.sentiment === "NEUTRAL") dPoint.neutral = (dPoint.neutral || 0) + 1;
          if (item.sentiment === "NEGATIVE") dPoint.negative = (dPoint.negative || 0) + 1;

          // Weekly bucket (Week starting Monday)
          const weekStart = new Date(dt);
          const day = weekStart.getDay();
          const diff = weekStart.getDate() - day + (day === 0 ? -6 : 1);
          weekStart.setDate(diff);
          const weekKey = weekStart.toISOString().split("T")[0] ?? "";

          if (!weeklyPoints.has(weekKey)) {
            weeklyPoints.set(weekKey, { date: weekKey, count: 0, positive: 0, neutral: 0, negative: 0 });
          }
          const wPoint = weeklyPoints.get(weekKey)!;
          wPoint.count++;
          if (item.sentiment === "POSITIVE") wPoint.positive = (wPoint.positive || 0) + 1;

          // Monthly bucket
          const monthKey = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}`;
          if (!monthlyPoints.has(monthKey)) {
            monthlyPoints.set(monthKey, { date: monthKey, count: 0, positive: 0, neutral: 0, negative: 0 });
          }
          const mPoint = monthlyPoints.get(monthKey)!;
          mPoint.count++;
        }
      } else {
        errors.trends = "Failed to process volume trends over time.";
      }

      // 3. Channel Distribution
      const channels: ChannelDistribution[] = [];
      if (channelResult.status === "fulfilled") {
        for (const c of channelResult.value) {
          channels.push({
            channel: c.channel,
            label: c.channel === "SOCIAL" ? "SOCIAL_MEDIA" : c.channel,
            count: c._count._all,
            percentage: overviewData.totalCurrent > 0 ? Number(((c._count._all / overviewData.totalCurrent) * 100).toFixed(1)) : 0,
          });
        }
      } else {
        errors.channels = "Failed to load channel distribution.";
      }

      // 4. Sentiment Distribution
      const sentiment: SentimentDistribution[] = [];
      if (sentimentResult.status === "fulfilled") {
        for (const s of sentimentResult.value) {
          sentiment.push({
            sentiment: s.sentiment,
            label: s.sentiment,
            count: s._count._all,
            percentage: overviewData.totalCurrent > 0 ? Number(((s._count._all / overviewData.totalCurrent) * 100).toFixed(1)) : 0,
          });
        }
      } else {
        errors.sentiment = "Failed to load sentiment distribution.";
      }

      // 5. Status Distribution
      const statusList: StatusDistribution[] = [];
      if (statusResult.status === "fulfilled") {
        for (const st of statusResult.value) {
          statusList.push({
            status: st.status,
            label: st.status,
            count: st._count._all,
            percentage: overviewData.totalCurrent > 0 ? Number(((st._count._all / overviewData.totalCurrent) * 100).toFixed(1)) : 0,
          });
        }
      } else {
        errors.status = "Failed to load workflow status distribution.";
      }

      // 6. Top Themes
      const topThemes: ThemeDistribution[] = [];
      if (themesResult.status === "fulfilled") {
        for (const t of themesResult.value) {
          topThemes.push({
            themeId: t.themeId,
            themeName: t.themeName,
            count: t.count,
            percentage: overviewData.totalCurrent > 0 ? Number(((t.count / overviewData.totalCurrent) * 100).toFixed(1)) : 0,
          });
        }
      } else {
        errors.topThemes = "Failed to load top recurring themes.";
      }

      // AI Placeholders Engine Contracts (For Phase 7, 8, 9, 10 Compatibility)
      const aiPlaceholders: AiPlaceholdersPayload = {
        aiSummary: {
          status: "placeholder",
          title: "AI Executive Summary Placeholder",
          summary: "AI Summary will be generated when Phase 7 AI Classification engine is activated. It will synthesize user feedback across all channels.",
          keyTakeaways: [
            "Customer satisfaction index remains steady across primary support channels.",
            "Performance feedback represents the most frequent active theme cluster.",
          ],
        },
        emergingTrends: {
          status: "placeholder",
          trends: [
            { topic: "API Rate Limits", growth: "+42%", description: "Surge in customer queries regarding API throughput quotas." },
            { topic: "Dark Mode Contrast", growth: "+28%", description: "User reports regarding visual contrast on dark theme layouts." },
          ],
        },
        sentimentInsights: {
          status: "placeholder",
          insight: "Overall customer sentiment is trending positively over the active filter window.",
        },
        recommendedActions: {
          status: "placeholder",
          actions: [
            { priority: "HIGH", action: "Review onboarding workflow drop-off points", impact: "Improves conversion by ~12%" },
            { priority: "MEDIUM", action: "Update API rate limit documentation", impact: "Reduces support volume by ~18%" },
          ],
        },
        featureHighlights: {
          status: "placeholder",
          features: [
            { name: "Single Sign-On (SAML)", requestCount: 34 },
            { name: "Custom Report Exports", requestCount: 22 },
          ],
        },
      };

      const durationMs = Date.now() - startTime;

      const payload: DashboardPayload = {
        meta: {
          version: "1.0",
          lastUpdated: new Date().toISOString(),
          requestId,
          workspaceId,
          appliedFilters: filters as unknown as Record<string, unknown>,
          dataRange: `${startDate.toISOString().split("T")[0] ?? ""} to ${endDate.toISOString().split("T")[0] ?? ""}`,
          health: {
            generationTimeMs: durationMs,
            queryDurationMs: Math.max(1, durationMs - 2),
            cacheStatus: "MISS",
            dataFreshness: "REALTIME",
          },
        },
        overview: overviewPayload,
        trends: {
          daily: Array.from(dailyPoints.values()),
          weekly: Array.from(weeklyPoints.values()),
          monthly: Array.from(monthlyPoints.values()),
        },
        channels,
        sentiment,
        status: statusList,
        topThemes,
        growthTrends: {
          weeklyGrowth: Array.from(weeklyPoints.values()),
          monthlyGrowth: Array.from(monthlyPoints.values()),
        },
        aiPlaceholders,
        ...(Object.keys(errors).length > 0 ? { errors } : {}),
      };

      return {
        ok: true,
        data: payload,
      };
    } catch (error) {
      return {
        ok: false,
        error: error instanceof ServiceError ? error : new ServiceError("Failed to generate analytics dashboard.", "INTERNAL_ERROR"),
      };
    }
  }
}
