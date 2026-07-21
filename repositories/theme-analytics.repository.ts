import { prisma } from "@/lib/database";

export class ThemeAnalyticsRepository {
  async getFeedbackCountForTheme(themeId: string, workspaceId: string): Promise<number> {
    return prisma.feedbackTheme.count({
      where: { themeId, workspaceId },
    });
  }

  async getFeedbackCountForThemeByDateRange(
    themeId: string,
    workspaceId: string,
    startDate: Date,
    endDate: Date
  ): Promise<number> {
    return prisma.feedbackTheme.count({
      where: {
        themeId,
        workspaceId,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });
  }

  async getCustomerCountForTheme(themeId: string, workspaceId: string): Promise<number> {
    const result = await prisma.feedbackTheme.findMany({
      where: { themeId, workspaceId },
      include: {
        feedback: {
          select: { customerEmail: true },
        },
      },
    });
    
    const uniqueCustomers = new Set(
      result.map((ft) => ft.feedback.customerEmail).filter(Boolean)
    );
    return uniqueCustomers.size;
  }

  async getAverageSentimentForTheme(themeId: string, workspaceId: string): Promise<number> {
    const feedbackThemes = await prisma.feedbackTheme.findMany({
      where: { themeId, workspaceId },
      include: { feedback: { select: { sentiment: true } } },
    });

    if (feedbackThemes.length === 0) return 0;

    let totalScore = 0;
    feedbackThemes.forEach((ft) => {
      if (ft.feedback.sentiment === "POSITIVE") totalScore += 1;
      else if (ft.feedback.sentiment === "NEGATIVE") totalScore -= 1;
      // NEUTRAL is 0
    });

    return totalScore / feedbackThemes.length;
  }
}
