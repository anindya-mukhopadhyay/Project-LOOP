import { ThemeRepository } from "./theme.repository";

export class ThemeRelationshipRepository {
  constructor(private readonly themeRepository: ThemeRepository = new ThemeRepository()) {}

  async addParent(childId: string, parentId: string, workspaceId: string): Promise<void> {
    await this.themeRepository.updateMetadata(childId, workspaceId, (metadata) => {
      if (!metadata.relationships.parents.includes(parentId)) {
        metadata.relationships.parents.push(parentId);
      }
      return metadata;
    });

    await this.themeRepository.updateMetadata(parentId, workspaceId, (metadata) => {
      if (!metadata.relationships.children.includes(childId)) {
        metadata.relationships.children.push(childId);
      }
      return metadata;
    });
  }

  async addRelated(themeId1: string, themeId2: string, workspaceId: string): Promise<void> {
    await this.themeRepository.updateMetadata(themeId1, workspaceId, (metadata) => {
      if (!metadata.relationships.related.includes(themeId2)) {
        metadata.relationships.related.push(themeId2);
      }
      return metadata;
    });

    await this.themeRepository.updateMetadata(themeId2, workspaceId, (metadata) => {
      if (!metadata.relationships.related.includes(themeId1)) {
        metadata.relationships.related.push(themeId1);
      }
      return metadata;
    });
  }
}
