import { EmbeddingProvider } from "./embedding.provider";
import { MockEmbeddingProvider } from "./mock.provider";

export class EmbeddingService {
  private provider: EmbeddingProvider;

  constructor(provider?: EmbeddingProvider) {
    // Defaults to Mock in development/Phase 9 architecture unless specified
    this.provider = provider || new MockEmbeddingProvider();
  }

  async embedTexts(texts: string[]) {
    return this.provider.generateEmbeddings(texts);
  }

  async embedQuery(query: string) {
    return this.provider.generateQueryEmbedding(query);
  }
}
