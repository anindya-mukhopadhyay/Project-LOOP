import type { PrismaClient, Prisma } from "@prisma/client";
import { BaseRepository, type RepositoryContext } from "./base.repository";

export class AnalyticsRepository extends BaseRepository {
  constructor(context: RepositoryContext = {}, db?: PrismaClient) {
    super(context, db);
  }

  async getOverviewMetrics(
    workspaceId: string,
    currentWhere: Prisma.FeedbackWhereInput,
    previousWhere: Prisma.FeedbackWhereInput,
    startOfToday: Date,
    startOfWeek: Date
  ) {
    const currentBaseWhere: Prisma.FeedbackWhereInput = { ...currentWhere, workspaceId, deletedAt: null };
    const previousBaseWhere: Prisma.FeedbackWhereInput = { ...previousWhere, workspaceId, deletedAt: null };

    const [
      totalCurrent,
      totalPrevious,
      reviewedCurrent,
      reviewedPrevious,
      actionedCurrent,
      actionedPrevious,
      avgScoreCurrent,
      avgScorePrevious,
      sentimentCurrent,
      sentimentPrevious,
      newToday,
      newThisWeek,
      activeThemesCount,
      membersCount,
      pendingInvitesCount,
    ] = await Promise.all([
      this.db.feedback.count({ where: currentBaseWhere }),
      this.db.feedback.count({ where: previousBaseWhere }),
      this.db.feedback.count({ where: { ...currentBaseWhere, status: "REVIEWED" } }),
      this.db.feedback.count({ where: { ...previousBaseWhere, status: "REVIEWED" } }),
      this.db.feedback.count({ where: { ...currentBaseWhere, status: "ACTIONED" } }),
      this.db.feedback.count({ where: { ...previousBaseWhere, status: "ACTIONED" } }),
      this.db.feedback.aggregate({ _avg: { score: true }, where: currentBaseWhere }),
      this.db.feedback.aggregate({ _avg: { score: true }, where: previousBaseWhere }),
      this.db.feedback.groupBy({ by: ["sentiment"], where: currentBaseWhere, _count: { _all: true } }),
      this.db.feedback.groupBy({ by: ["sentiment"], where: previousBaseWhere, _count: { _all: true } }),
      this.db.feedback.count({ where: { workspaceId, deletedAt: null, createdAt: { gte: startOfToday } } }),
      this.db.feedback.count({ where: { workspaceId, deletedAt: null, createdAt: { gte: startOfWeek } } }),
      this.db.theme.count({ where: { workspaceId, deletedAt: null } }),
      this.db.user.count({ where: { workspaceId } }),
      this.db.invitation.count({ where: { workspaceId, status: "PENDING" } }),
    ]);

    return {
      totalCurrent,
      totalPrevious,
      reviewedCurrent,
      reviewedPrevious,
      actionedCurrent,
      actionedPrevious,
      avgScoreCurrent: avgScoreCurrent._avg.score ? Number(avgScoreCurrent._avg.score) : 0,
      avgScorePrevious: avgScorePrevious._avg.score ? Number(avgScorePrevious._avg.score) : 0,
      sentimentCurrent,
      sentimentPrevious,
      newToday,
      newThisWeek,
      activeThemesCount,
      membersCount,
      pendingInvitesCount,
    };
  }

  async getTimeSeriesRaw(workspaceId: string, whereClause: Prisma.FeedbackWhereInput) {
    return this.db.feedback.findMany({
      where: { ...whereClause, workspaceId, deletedAt: null },
      select: {
        createdAt: true,
        sentiment: true,
        channel: true,
        status: true,
      },
      orderBy: { createdAt: "asc" },
    });
  }

  async getChannelDistribution(workspaceId: string, whereClause: Prisma.FeedbackWhereInput) {
    return this.db.feedback.groupBy({
      by: ["channel"],
      where: { ...whereClause, workspaceId, deletedAt: null },
      _count: { _all: true },
    });
  }

  async getSentimentDistribution(workspaceId: string, whereClause: Prisma.FeedbackWhereInput) {
    return this.db.feedback.groupBy({
      by: ["sentiment"],
      where: { ...whereClause, workspaceId, deletedAt: null },
      _count: { _all: true },
    });
  }

  async getStatusDistribution(workspaceId: string, whereClause: Prisma.FeedbackWhereInput) {
    return this.db.feedback.groupBy({
      by: ["status"],
      where: { ...whereClause, workspaceId, deletedAt: null },
      _count: { _all: true },
    });
  }

  async getTopThemes(workspaceId: string, whereClause: Prisma.FeedbackWhereInput, limit = 10) {
    const themeCounts = await this.db.feedbackTheme.groupBy({
      by: ["themeId"],
      where: {
        feedback: { ...whereClause, workspaceId, deletedAt: null },
      },
      _count: { feedbackId: true },
      orderBy: { _count: { feedbackId: "desc" } },
      take: limit,
    });

    if (themeCounts.length === 0) return [];

    const themeIds = themeCounts.map((t) => t.themeId);
    const themes = await this.db.theme.findMany({
      where: { id: { in: themeIds }, workspaceId, deletedAt: null },
      select: { id: true, name: true },
    });

    const themeMap = new Map(themes.map((t) => [t.id, t.name]));

    return themeCounts.map((tc) => ({
      themeId: tc.themeId,
      themeName: themeMap.get(tc.themeId) || "Unknown Theme",
      count: tc._count.feedbackId,
    }));
  }
}
