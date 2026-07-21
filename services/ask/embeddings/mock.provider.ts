import { EmbeddingProvider, EmbeddingResult } from "./embedding.provider";

export class MockEmbeddingProvider implements EmbeddingProvider {
  private readonly dimensions = 1536; // Matching OpenAI ada-002 dimensions

  async generateEmbeddings(texts: string[]): Promise<EmbeddingResult[]> {
    // In Phase 9 architecture, we stub real API calls to LLM providers
    // to preserve rate limits and avoid network overhead unless specifically configured.
    return texts.map(text => ({
      vector: this.generateRandomVector(),
      dimensions: this.dimensions,
      provider: "mock",
      model: "mock-embedding-v1",
      tokensUsed: text.length / 4,
    }));
  }

  async generateQueryEmbedding(query: string): Promise<EmbeddingResult> {
    const [result] = await this.generateEmbeddings([query]);
    return result!;
  }

  private generateRandomVector(): number[] {
    const vec = new Array(this.dimensions);
    for (let i = 0; i < this.dimensions; i++) {
      vec[i] = Math.random() * 2 - 1; // -1 to 1
    }
    // Normalize
    const magnitude = Math.sqrt(vec.reduce((sum, val) => sum + val * val, 0));
    return vec.map(val => val / magnitude);
  }
}
