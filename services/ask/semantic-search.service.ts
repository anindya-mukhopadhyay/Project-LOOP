import { EmbeddingRepository } from "@/repositories/embedding.repository";
/* eslint-disable @typescript-eslint/no-unused-vars */
import { EmbeddingService } from "./embeddings/embedding.service";
import { KnowledgeSourceType } from "@/schemas/ask.schema";

export interface SearchResult {
  id: string; // Document ID (feedback/theme)
  type: KnowledgeSourceType;
  score: number;
}

export class SemanticSearchService {
  constructor(
    private readonly embeddingRepo = new EmbeddingRepository(),
    private readonly embeddingService = new EmbeddingService()
  ) {}

  async search(
    workspaceId: string,
    query: string,
    limit: number = 20,
    _filters?: { themes?: string[]; sentiment?: string[]; channels?: string[] }
  ): Promise<SearchResult[]> {
    // 1. Embed Query
    const queryEmbedding = await this.embeddingService.embedQuery(query);

    // 2. Vector Search via DB
    const results = await this.embeddingRepo.vectorSearch(
      workspaceId,
      queryEmbedding.vector,
      limit * 2 // Fetch more to allow ranking/filtering
    );

    // 3. Map to generic search results
    // Since we're stubbing the pgvector implementation in Phase 9, this returns a mock result if empty.
    if (results.length === 0) {
      console.log("[SemanticSearch] No vector results found (expected without pgvector extension). Proceeding with fallback retrieval.");
      return [];
    }

    return results.map(r => {
      let type: KnowledgeSourceType = "FEEDBACK";
      let id = r.feedbackId || "";
      if (r.themeId) {
        type = "THEME";
        id = r.themeId;
      }
      return {
        id,
        type,
        score: r.distance, // Smaller distance = better match
      };
    }).filter(r => r.id !== "");
  }
}
