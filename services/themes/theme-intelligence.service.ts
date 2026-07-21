/* eslint-disable @typescript-eslint/no-explicit-any */
 
import { ThemeDiscoveryService } from "./theme-discovery.service";
import { ThemeClassificationService } from "./theme-classification.service";
import { ThemeClusterService } from "./theme-cluster.service";
import { ThemeRelationshipService } from "./theme-relationship.service";
import { ThemeTrendService } from "./theme-trend.service";
import { ThemeSummaryService } from "./theme-summary.service";
import { ThemeAnalyticsService } from "./theme-analytics.service";
import { ThemeHealthService } from "./theme-health.service";
import { ThemeRepository } from "@/repositories/theme.repository";

export class ThemeIntelligenceService {
  constructor(
    private readonly discoveryService = new ThemeDiscoveryService(),
    private readonly classificationService = new ThemeClassificationService(),
    private readonly clusterService = new ThemeClusterService(),
    private readonly relationshipService = new ThemeRelationshipService(),
    private readonly trendService = new ThemeTrendService(),
    private readonly summaryService = new ThemeSummaryService(),
    private readonly analyticsService = new ThemeAnalyticsService(),
    private readonly healthService = new ThemeHealthService(),
    private readonly themeRepo = new ThemeRepository()
  ) {}

  async runDiscoveryCycle(workspaceId: string, unclassifiedFeedback: any[]) {
    return this.discoveryService.discoverThemes(workspaceId, unclassifiedFeedback);
  }

  async runClusterCycle(workspaceId: string) {
    await this.clusterService.clusterThemes(workspaceId);
  }

  async runClassificationCycle(feedbackIds: string[], workspaceId: string, actorId: string, role: any) {
    for (const id of feedbackIds) {
      await this.classificationService.classifyFeedback(id, workspaceId, actorId, role);
    }
  }

  async mergeThemes(sourceIds: string[], targetId: string, workspaceId: string) {
    await this.relationshipService.mergeThemes(sourceIds, targetId, workspaceId);
    await this.summaryService.generateSummary(targetId, workspaceId); // Regenerate summary
  }

  async getDashboardIntelligence(workspaceId: string) {
    const emerging = await this.trendService.detectEmergingThemes(workspaceId);
    const declining = await this.trendService.detectDecliningThemes(workspaceId);
    const allThemes = await this.themeRepo.findAll(workspaceId);
    
    // Top Themes by Popularity
    const themesWithAnalytics = await Promise.all(
      allThemes.map(async (t) => {
        const analytics = await this.analyticsService.getAnalyticsForTheme(t.id, workspaceId);
        const health = this.healthService.calculateHealth(t.metadata as any, t.updatedAt);
        return { theme: t, analytics, health };
      })
    );

    const topThemes = themesWithAnalytics.sort((a, b) => b.analytics.popularity - a.analytics.popularity).slice(0, 10);

    return {
      topThemes,
      emergingThemes: emerging,
      decliningThemes: declining,
    };
  }
}
