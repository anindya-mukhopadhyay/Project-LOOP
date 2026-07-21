import { ThemeAnalyticsRepository } from "@/repositories/theme-analytics.repository";
import { ThemeAnalyticsData } from "@/schemas/theme.schema";

export class ThemeAnalyticsService {
  constructor(private readonly analyticsRepository: ThemeAnalyticsRepository = new ThemeAnalyticsRepository()) {}

  async getAnalyticsForTheme(themeId: string, workspaceId: string): Promise<ThemeAnalyticsData> {
    const feedbackCount = await this.analyticsRepository.getFeedbackCountForTheme(themeId, workspaceId);
    const customerCount = await this.analyticsRepository.getCustomerCountForTheme(themeId, workspaceId);
    
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const twoMonthsAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    const countThisWeek = await this.analyticsRepository.getFeedbackCountForThemeByDateRange(themeId, workspaceId, oneWeekAgo, now);
    const countLastWeek = await this.analyticsRepository.getFeedbackCountForThemeByDateRange(themeId, workspaceId, twoWeeksAgo, oneWeekAgo);

    const countThisMonth = await this.analyticsRepository.getFeedbackCountForThemeByDateRange(themeId, workspaceId, oneMonthAgo, now);
    const countLastMonth = await this.analyticsRepository.getFeedbackCountForThemeByDateRange(themeId, workspaceId, twoMonthsAgo, oneMonthAgo);

    const weeklyGrowth = countLastWeek === 0 ? (countThisWeek > 0 ? 100 : 0) : ((countThisWeek - countLastWeek) / countLastWeek) * 100;
    const monthlyGrowth = countLastMonth === 0 ? (countThisMonth > 0 ? 100 : 0) : ((countThisMonth - countLastMonth) / countLastMonth) * 100;

    const averageSentimentScore = await this.analyticsRepository.getAverageSentimentForTheme(themeId, workspaceId);
    
    // Placeholder values for complex computations to be fleshed out later
    const trendVelocity = countThisWeek * (weeklyGrowth > 0 ? 1.5 : 0.5);
    const momentum = trendVelocity * 1.2;
    const popularity = feedbackCount + customerCount * 2;
    const averageUrgencyScore = 0.5; // Stub
    const averageConfidence = 0.85; // Stub

    return {
      themeId,
      feedbackCount,
      customerCount,
      weeklyGrowth,
      monthlyGrowth,
      trendVelocity,
      momentum,
      popularity,
      averageSentimentScore,
      averageUrgencyScore,
      averageConfidence
    };
  }
}
