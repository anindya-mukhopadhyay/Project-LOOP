/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { KnowledgeProvider } from "./knowledge.provider";
import { RankedDocument } from "../ranking.service";
import { SearchFilters } from "@/schemas/ask.schema";
import { SemanticSearchService } from "../semantic-search.service";
import { RankingService } from "../ranking.service";

export class FeedbackProvider implements KnowledgeProvider {
  readonly type = "FEEDBACK";

  constructor(
    private readonly searchService = new SemanticSearchService(),
    private readonly rankingService = new RankingService()
  ) {}

  async search(workspaceId: string, query: string, limit: number, filters?: SearchFilters): Promise<RankedDocument[]> {
    // We filter semantic search to only return Feedback embeddings if the service supported type filtering.
    // In this stub, we just route to semantic search.
    const results = await this.searchService.search(workspaceId, query, limit, filters as any);
    return this.rankingService.rankAndHydrate(workspaceId, results, limit);
  }

  async getById(_workspaceId: string, _id: string): Promise<RankedDocument | null> {
    return null; // Stub implementation
  }
}
