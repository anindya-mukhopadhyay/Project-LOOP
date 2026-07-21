/* eslint-disable @typescript-eslint/no-unused-vars */
import { KnowledgeProvider } from "./knowledge.provider";
import { RankedDocument } from "../ranking.service";
import { SearchFilters } from "@/schemas/ask.schema";

export class AnalyticsProvider implements KnowledgeProvider {
  readonly type = "ANALYTICS";

  async search(_workspaceId: string, _query: string, _limit: number, _filters?: SearchFilters): Promise<RankedDocument[]> {
    // Analytics provider would fetch from a fast analytics/metrics datastore
    // instead of vector search. Stub implementation.
    return [];
  }

  async getById(_workspaceId: string, _id: string): Promise<RankedDocument | null> {
    return null;
  }
}
