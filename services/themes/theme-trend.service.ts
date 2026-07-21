import { ThemeAnalyticsService } from "./theme-analytics.service";
import { ThemeRepository } from "@/repositories/theme.repository";

export class ThemeTrendService {
  constructor(
    private readonly analyticsService: ThemeAnalyticsService = new ThemeAnalyticsService(),
    private readonly themeRepo: ThemeRepository = new ThemeRepository()
  ) {}

  /**
   * Emerging Score = Growth Rate + Feedback Volume + Average Urgency + Average Confidence - Age Penalty
   */
  async calculateEmergingScore(themeId: string, workspaceId: string, themeCreatedAt: Date): Promise<number> {
    const analytics = await this.analyticsService.getAnalyticsForTheme(themeId, workspaceId);

    const growthRateWeight = analytics.weeklyGrowth > 0 ? analytics.weeklyGrowth / 100 : 0;
    const volumeWeight = Math.min(analytics.feedbackCount / 100, 1); // Cap at 100 feedback
    
    const ageInDays = (new Date().getTime() - themeCreatedAt.getTime()) / (1000 * 3600 * 24);
    const agePenalty = ageInDays > 30 ? (ageInDays - 30) * 0.01 : 0; // Penalize 0.01 per day after 30 days

    const score = (growthRateWeight * 0.4) + (volumeWeight * 0.3) + (analytics.averageUrgencyScore * 0.15) + (analytics.averageConfidence * 0.15) - agePenalty;

    return Math.max(0, Math.min(score, 1)); // Normalize to 0-1
  }

  async detectEmergingThemes(workspaceId: string) {
    const themes = await this.themeRepo.findAll(workspaceId);
    const scores = await Promise.all(
      themes.map(async (theme) => {
        const score = await this.calculateEmergingScore(theme.id, workspaceId, theme.createdAt);
        return { theme, score };
      })
    );

    // Return top 5 emerging themes
    return scores
      .filter((s) => s.score > 0.5) // Threshold
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map((s) => s.theme);
  }

  async detectDecliningThemes(workspaceId: string) {
    const themes = await this.themeRepo.findAll(workspaceId);
    
    const declining = await Promise.all(
      themes.map(async (theme) => {
        const analytics = await this.analyticsService.getAnalyticsForTheme(theme.id, workspaceId);
        return { theme, growth: analytics.monthlyGrowth };
      })
    );

    // Negative growth = declining
    return declining
      .filter((d) => d.growth < -10) // More than 10% decline
      .sort((a, b) => a.growth - b.growth) // Most declining first
      .slice(0, 5)
      .map((d) => d.theme);
  }
}
