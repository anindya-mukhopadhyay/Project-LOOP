/* eslint-disable @typescript-eslint/no-unused-vars */
import { RankedDocument } from "./ranking.service";
import { Citation, KnowledgeSourceType } from "@/schemas/ask.schema";

export class CitationService {
  buildCitations(usedDocuments: RankedDocument[], _generatedAnswer: string): Citation[] {
    // In a real Phase 9 LLM system, the LLM would output [Source: 123] and we parse it here.
    // For this architecture stub, we assume all used documents are cited.
    
    return usedDocuments.map(doc => {
      // Determine what to put in the snippet based on content
      const snippet = doc.content.length > 150 ? doc.content.substring(0, 150) + "..." : doc.content;
      
      let title = "Document";
      if (doc.type === "FEEDBACK") title = "Customer Feedback";
      if (doc.type === "THEME") title = "Identified Theme";
      
      return {
        id: doc.id,
        type: doc.type as KnowledgeSourceType,
        relevanceScore: doc.score,
        snippet,
        title,
        metadata: doc.metadata,
      };
    });
  }
}
