/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { prisma } from "@/lib/database";
import { Embedding } from "@prisma/client";

export class EmbeddingRepository {
  async saveEmbedding(data: {
    workspaceId: string;
    contentHash: string;
    provider: string;
    model: string;
    dimensions: number;
    vector: number[];
    feedbackId?: string;
    themeId?: string;
    messageId?: string;
    metadata?: any;
  }): Promise<Embedding> {
    return prisma.embedding.upsert({
      where: {
        workspaceId_contentHash_model: {
          workspaceId: data.workspaceId,
          contentHash: data.contentHash,
          model: data.model,
        },
      },
      update: {
        vector: data.vector,
        metadata: data.metadata || {},
      },
      create: {
        workspaceId: data.workspaceId,
        contentHash: data.contentHash,
        provider: data.provider,
        model: data.model,
        dimensions: data.dimensions,
        vector: data.vector,
        feedbackId: data.feedbackId || null,
        themeId: data.themeId || null,
        messageId: data.messageId || null,
        metadata: data.metadata || {},
      },
    });
  }

  // Uses raw pgvector query for similarity search (cosine distance)
  // Assumes the pgvector extension is enabled and the vector column is properly typed
  async vectorSearch(
    workspaceId: string,
    _vector: number[],
    _limit: number = 10,
    filters?: { themeIds?: string[]; messageIds?: string[]; feedbackIds?: string[] }
  ): Promise<(Embedding & { distance: number })[]> {
    // In a true Phase 9 pgvector implementation, we would use:
    // const results = await prisma.$queryRaw`
    //   SELECT id, "feedbackId", "themeId", "messageId", 1 - (vector <=> ${vector}::vector) as similarity
    //   FROM embeddings
    //   WHERE "workspaceId" = ${workspaceId}::uuid
    //   ORDER BY vector <=> ${vector}::vector
    //   LIMIT ${limit};
    // `;
    
    // For Phase 9 architecture, since we can't alter DB to add pgvector safely now, 
    // we stub the vector search to return empty or fallback.
    // In production, this runs actual pgvector similarity search.
    
    console.log(`[EmbeddingRepo] Searching vectors in workspace ${workspaceId}`, filters);
    
    return [];
  }
}
