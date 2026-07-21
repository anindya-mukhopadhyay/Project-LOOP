import { ThemeRelationshipRepository } from "@/repositories/theme-relationship.repository";
import { ThemeRepository } from "@/repositories/theme.repository";

export class ThemeRelationshipService {
  constructor(
    private readonly relationshipRepo: ThemeRelationshipRepository = new ThemeRelationshipRepository(),
    private readonly themeRepo: ThemeRepository = new ThemeRepository()
  ) {}

  async createParentChildRelation(parentId: string, childId: string, workspaceId: string): Promise<void> {
    await this.relationshipRepo.addParent(childId, parentId, workspaceId);
  }

  async createRelatedRelation(themeId1: string, themeId2: string, workspaceId: string): Promise<void> {
    await this.relationshipRepo.addRelated(themeId1, themeId2, workspaceId);
  }

  async mergeThemes(sourceThemeIds: string[], targetThemeId: string, workspaceId: string): Promise<void> {
    for (const sourceId of sourceThemeIds) {
      // 1. Mark source themes as archived and merged
      await this.themeRepo.updateMetadata(sourceId, workspaceId, (metadata) => {
        metadata.lifecycleState = "ARCHIVED";
        metadata.relationships.mergedInto = targetThemeId;
        metadata.timeline.push({
          stage: "ARCHIVED",
          timestamp: new Date().toISOString(),
          reason: `Merged into ${targetThemeId}`,
        });
        return metadata;
      });
      await this.themeRepo.update(sourceId, workspaceId, { isArchived: true });

      // Note: Reassigning feedback from source to target is a DB action we'd do via prisma directly in a true transaction.
      // For architecture demonstration, we leave that to the ThemeIntelligenceService to orchestrate.
    }
  }

  async splitTheme(sourceThemeId: string, newThemeIds: string[], workspaceId: string): Promise<void> {
    await this.themeRepo.updateMetadata(sourceThemeId, workspaceId, (metadata) => {
      metadata.lifecycleState = "ARCHIVED";
      metadata.timeline.push({
        stage: "ARCHIVED",
        timestamp: new Date().toISOString(),
        reason: `Split into ${newThemeIds.join(", ")}`,
      });
      return metadata;
    });
    await this.themeRepo.update(sourceThemeId, workspaceId, { isArchived: true });

    for (const newId of newThemeIds) {
      await this.themeRepo.updateMetadata(newId, workspaceId, (metadata) => {
        metadata.relationships.splitFrom = sourceThemeId;
        return metadata;
      });
    }
  }
}
