import { RankedDocument } from "../ranking.service";
import { SearchFilters } from "@/schemas/ask.schema";

export interface KnowledgeProvider {
  /**
   * Identifies the type of knowledge this provider handles (e.g., FEEDBACK, THEME)
   */
  readonly type: string;

  /**
   * Search for relevant documents in this provider's domain.
   */
  search(workspaceId: string, query: string, limit: number, filters?: SearchFilters): Promise<RankedDocument[]>;

  /**
   * Fetch a specific document by ID.
   */
  getById(workspaceId: string, id: string): Promise<RankedDocument | null>;
}
