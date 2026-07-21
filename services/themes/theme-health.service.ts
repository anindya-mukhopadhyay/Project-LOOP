import { ThemeHealthData, ThemeMetadata } from "@/schemas/theme.schema";

export class ThemeHealthService {
  /**
   * Health Score (0-100) based on:
   * - confidence (AI classification confidence)
   * - representative feedback count (Completeness)
   * - recency (Freshness)
   * - classification stability (Coverage)
   */
  calculateHealth(metadata: ThemeMetadata, lastUpdated: Date): ThemeHealthData {
    // 1. Confidence (0-30 points)
    const confidenceScore = (metadata.ai.confidence || 0.5) * 30;
    
    // 2. Completeness (0-30 points) - based on having relationships and summaries
    let completenessScore = 0;
    if (metadata.ai.executiveSummary) completenessScore += 10;
    if (metadata.ai.representativeQuotes.length > 0) completenessScore += 10;
    if (metadata.relationships.parents.length > 0 || metadata.relationships.children.length > 0 || metadata.relationships.related.length > 0) {
      completenessScore += 10;
    }

    // 3. Freshness (0-20 points) - how recently the theme was updated
    const daysSinceUpdate = (new Date().getTime() - lastUpdated.getTime()) / (1000 * 3600 * 24);
    const freshnessScore = Math.max(0, 20 - daysSinceUpdate);

    // 4. Coverage (0-20 points) - based on having multiple keywords
    const coverageScore = Math.min(20, metadata.ai.keywords.length * 4);

    const totalScore = Math.min(100, Math.round(confidenceScore + completenessScore + freshnessScore + coverageScore));

    return {
      themeId: "placeholder", // Injected later
      healthScore: totalScore,
      completeness: completenessScore / 30,
      freshness: freshnessScore / 20,
      coverage: coverageScore / 20,
    };
  }
}
