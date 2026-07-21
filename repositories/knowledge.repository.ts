import { prisma } from "@/lib/database";
import { Feedback, Theme } from "@prisma/client";

/**
 * A wrapper repository for fetching domain objects needed strictly by the RAG pipeline.
 */
export class KnowledgeRepository {
  async getFeedbackByIds(workspaceId: string, feedbackIds: string[]): Promise<Feedback[]> {
    if (!feedbackIds.length) return [];
    return prisma.feedback.findMany({
      where: {
        workspaceId,
        id: { in: feedbackIds },
        deletedAt: null,
      },
    });
  }

  async getThemesByIds(workspaceId: string, themeIds: string[]): Promise<Theme[]> {
    if (!themeIds.length) return [];
    return prisma.theme.findMany({
      where: {
        workspaceId,
        id: { in: themeIds },
        deletedAt: null,
      },
    });
  }

  async getRecentFeedback(workspaceId: string, limit: number = 50): Promise<Feedback[]> {
    return prisma.feedback.findMany({
      where: {
        workspaceId,
        deletedAt: null,
      },
      orderBy: {
        receivedAt: 'desc',
      },
      take: limit,
    });
  }

  async getTopThemes(workspaceId: string, limit: number = 20): Promise<Theme[]> {
    return prisma.theme.findMany({
      where: {
        workspaceId,
        deletedAt: null,
        isArchived: false,
      },
      orderBy: {
        confidence: 'desc',
      },
      take: limit,
    });
  }
}
