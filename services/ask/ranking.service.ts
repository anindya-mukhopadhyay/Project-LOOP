/* eslint-disable @typescript-eslint/no-explicit-any */
import { SearchResult } from "./semantic-search.service";
import { KnowledgeRepository } from "@/repositories/knowledge.repository";

export interface RankedDocument {
  id: string;
  type: "FEEDBACK" | "THEME" | "REPORT";
  score: number;
  metadata: any;
  content: string; // Compressed text representation
}

export class RankingService {
  constructor(private readonly knowledgeRepo = new KnowledgeRepository()) {}

  async rankAndHydrate(
    workspaceId: string, 
    semanticResults: SearchResult[], 
    limit: number = 10
  ): Promise<RankedDocument[]> {
    
    // Fallback logic for Phase 9 mock: If no semantic results (because pgvector is stubbed), 
    // we retrieve the latest feedback and top themes to serve as context.
    if (semanticResults.length === 0) {
      return this.hydrateMockContext(workspaceId, limit);
    }

    // 1. Deduplicate
    const uniqueMap = new Map<string, SearchResult>();
    for (const r of semanticResults) {
      if (!uniqueMap.has(r.id)) {
        uniqueMap.set(r.id, r);
      }
    }
    const deduplicated = Array.from(uniqueMap.values());

    // 2. Sort by score (asc because distance)
    deduplicated.sort((a, b) => a.score - b.score);
    const topResults = deduplicated.slice(0, limit);

    // 3. Hydrate with real data
    const feedbackIds = topResults.filter(r => r.type === "FEEDBACK").map(r => r.id);
    const themeIds = topResults.filter(r => r.type === "THEME").map(r => r.id);

    const [feedbacks, themes] = await Promise.all([
      this.knowledgeRepo.getFeedbackByIds(workspaceId, feedbackIds),
      this.knowledgeRepo.getThemesByIds(workspaceId, themeIds),
    ]);

    const feedbackMap = new Map(feedbacks.map(f => [f.id, f]));
    const themeMap = new Map(themes.map(t => [t.id, t]));

    const ranked: RankedDocument[] = [];

    for (const r of topResults) {
      if (r.type === "FEEDBACK" && feedbackMap.has(r.id)) {
        const f = feedbackMap.get(r.id)!;
        ranked.push({
          id: f.id,
          type: "FEEDBACK",
          score: r.score,
          metadata: { channel: f.channel, sentiment: f.sentiment, date: f.receivedAt },
          content: `Customer Feedback: ${f.title}\n${f.body}`,
        });
      } else if (r.type === "THEME" && themeMap.has(r.id)) {
        const t = themeMap.get(r.id)!;
        const aiMeta = t.metadata as any;
        ranked.push({
          id: t.id,
          type: "THEME",
          score: r.score,
          metadata: { confidence: t.confidence },
          content: `Theme: ${t.name}\nDescription: ${t.description}\nSummary: ${aiMeta?.ai?.executiveSummary || "N/A"}`,
        });
      }
    }

    return ranked;
  }

  private async hydrateMockContext(workspaceId: string, limit: number): Promise<RankedDocument[]> {
    // Fetches top recent data to provide context for answers when pgvector isn't available
    const [feedbacks, themes] = await Promise.all([
      this.knowledgeRepo.getRecentFeedback(workspaceId, limit),
      this.knowledgeRepo.getTopThemes(workspaceId, Math.floor(limit / 2)),
    ]);

    const ranked: RankedDocument[] = [];
    let score = 0.1;

    for (const t of themes) {
      const aiMeta = t.metadata as any;
      ranked.push({
        id: t.id,
        type: "THEME",
        score: score,
        metadata: { confidence: t.confidence },
        content: `Theme: ${t.name}\nDescription: ${t.description}\nSummary: ${aiMeta?.ai?.executiveSummary || "N/A"}`,
      });
      score += 0.05;
    }

    for (const f of feedbacks) {
      ranked.push({
        id: f.id,
        type: "FEEDBACK",
        score: score,
        metadata: { channel: f.channel, sentiment: f.sentiment, date: f.receivedAt },
        content: `Customer Feedback: ${f.title}\n${f.body}`,
      });
      score += 0.05;
    }

    return ranked.slice(0, limit);
  }
}
