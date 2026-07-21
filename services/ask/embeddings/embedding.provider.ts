export interface EmbeddingResult {
  vector: number[];
  dimensions: number;
  provider: string;
  model: string;
  tokensUsed: number;
}

export interface EmbeddingProvider {
  /**
   * Generates embeddings for a batch of text inputs.
   */
  generateEmbeddings(texts: string[]): Promise<EmbeddingResult[]>;
  
  /**
   * Generates a single embedding for search queries.
   */
  generateQueryEmbedding(query: string): Promise<EmbeddingResult>;
}
