import { RankedDocument } from "./ranking.service";

export class ContextBuilderService {
  private readonly MAX_TOKENS = 12000; // rough estimation for prompt window

  buildContext(documents: RankedDocument[]): { contextString: string; usedDocuments: RankedDocument[] } {
    let contextString = "--- RETRIEVED KNOWLEDGE BASE ---\n\n";
    let estimatedTokens = 0;
    const usedDocuments: RankedDocument[] = [];

    for (const doc of documents) {
      // Rough token estimation: 4 chars = 1 token
      const docString = `[Source ID: ${doc.id} | Type: ${doc.type}]\n${doc.content}\n\n`;
      const tokens = docString.length / 4;

      if (estimatedTokens + tokens > this.MAX_TOKENS) {
        // Context window full
        break;
      }

      contextString += docString;
      estimatedTokens += tokens;
      usedDocuments.push(doc);
    }

    return { contextString, usedDocuments };
  }
}
