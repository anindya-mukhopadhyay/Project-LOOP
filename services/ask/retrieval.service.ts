/* eslint-disable @typescript-eslint/no-explicit-any */
import { SemanticSearchService } from "./semantic-search.service";
import { RankingService, RankedDocument } from "./ranking.service";
import { ContextBuilderService } from "./context-builder.service";
import { SearchFilters } from "@/schemas/ask.schema";

export class RetrievalService {
  constructor(
    private readonly searchService = new SemanticSearchService(),
    private readonly rankingService = new RankingService(),
    private readonly contextBuilder = new ContextBuilderService()
  ) {}

  async retrieveAndBuildContext(
    workspaceId: string, 
    question: string, 
    filters?: SearchFilters
  ): Promise<{ contextString: string; usedDocuments: RankedDocument[] }> {
    
    // 1. Semantic Search
    const searchResults = await this.searchService.search(workspaceId, question, 15, filters as any);

    // 2. Rank and Hydrate
    const rankedDocuments = await this.rankingService.rankAndHydrate(workspaceId, searchResults, 10);

    // 3. Build Context (Compress / Enforce token limits)
    return this.contextBuilder.buildContext(rankedDocuments);
  }
}
