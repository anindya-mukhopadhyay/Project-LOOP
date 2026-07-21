import { BaseRepository, type RepositoryContext } from "./base.repository";
import type { PrismaClient } from "@prisma/client";
import type { FeedbackAiMetadata } from "@/schemas/ai.schema";

export class AIRepository extends BaseRepository {
  constructor(context?: RepositoryContext, db?: PrismaClient) {
    super(context, db);
  }

  /**
   * Updates the AI metadata payload for a specific feedback item.
   */
  async updateFeedbackAiMetadata(
    id: string, 
    workspaceId: string, 
    aiMetadata: FeedbackAiMetadata,
    newSentiment?: "POSITIVE" | "NEGATIVE" | "NEUTRAL",
    newLanguage?: string
  ): Promise<void> {
    const existing = await this.db.feedback.findFirst({
      where: { id, workspaceId },
      select: { metadata: true }
    });

    if (!existing) {
      throw new Error("Feedback record not found for AI update");
    }

    const currentMetadata = (existing.metadata as Record<string, unknown>) || {};
    const currentAi = (currentMetadata.ai as FeedbackAiMetadata) || {};
    
    // Preserve history: If there's an existing classification, and we're completing a new one
    let history = currentAi.history || [];
    if (aiMetadata.status === "COMPLETED" && currentAi.classification && aiMetadata.classification) {
      // Avoid pushing duplicates if we are just updating the same classification
      const isDuplicate = history.length > 0 && 
        history[history.length - 1]?.generatedAt === currentAi.classification?.generatedAt;
      
      if (!isDuplicate) {
        history = [...history, currentAi.classification];
      }
    }

    // Merge timelines
    const timeline = {
      ...currentAi.timeline,
      ...aiMetadata.timeline
    };

    const updatedMetadata = {
      ...currentMetadata,
      ai: {
        ...currentAi,
        ...aiMetadata,
        history,
        timeline
      }
    };

    await this.db.feedback.update({
      where: { id, workspaceId },
      data: {
        metadata: updatedMetadata,
        ...(newSentiment ? { sentiment: newSentiment } : {}),
        ...(newLanguage ? { language: newLanguage } : {}),
      }
    });
  }

  /**
   * Retrieves the AI metadata for a specific feedback item.
   */
  async getFeedbackAiMetadata(id: string, workspaceId: string): Promise<FeedbackAiMetadata | null> {
    const existing = await this.db.feedback.findFirst({
      where: { id, workspaceId },
      select: { metadata: true }
    });

    if (!existing || !existing.metadata) return null;

    const metadata = existing.metadata as Record<string, unknown>;
    return (metadata.ai as FeedbackAiMetadata) || null;
  }
}
