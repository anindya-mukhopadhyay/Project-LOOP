import { AIService } from "./ai.service";
import { AIRepository } from "@/repositories/ai.repository";
import { FeedbackRepository } from "@/repositories/feedback.repository";
import { AuditService } from "../audit.service";
import { ServiceError, type ServiceResult } from "../errors";
import type { Role } from "@prisma/client";
import type { FeedbackAiMetadata, AiProviderType, ConfidenceReviewStatus, AiErrorCategory } from "@/schemas/ai.schema";
import { AiEventsService } from "./ai-events.service";

export class ClassificationService {
  private aiService: AIService;
  private aiRepository: AIRepository;
  private feedbackRepository: FeedbackRepository;
  private auditService: AuditService;
  private aiEventsService: AiEventsService;

  constructor(
    aiService = new AIService(),
    aiRepository = new AIRepository(),
    feedbackRepository = new FeedbackRepository(),
    auditService = new AuditService(),
    aiEventsService = new AiEventsService()
  ) {
    this.aiService = aiService;
    this.aiRepository = aiRepository;
    this.feedbackRepository = feedbackRepository;
    this.auditService = auditService;
    this.aiEventsService = aiEventsService;
  }

  private enforceAnalystAccess(role: Role) {
    if (role === "VIEWER") {
      throw new ServiceError("Forbidden. Viewers cannot run AI classifications.", "FORBIDDEN");
    }
  }

  private enforceAdminAccess(role: Role) {
    if (role !== "ADMIN") {
      throw new ServiceError("Forbidden. Only administrators can perform this operation.", "FORBIDDEN");
    }
  }

  /**
   * Classify a single feedback item.
   */
  async classifyFeedback(
    workspaceId: string,
    actorId: string,
    role: Role,
    feedbackId: string,
    provider?: AiProviderType,
    isRetry = false
  ): Promise<ServiceResult<FeedbackAiMetadata>> {
    try {
      this.enforceAnalystAccess(role);

      // 1. Fetch the raw feedback
      const feedback = await this.feedbackRepository.findById(feedbackId, workspaceId);
      if (!feedback) {
        throw new ServiceError("Feedback not found.", "NOT_FOUND");
      }

      // 2. Fetch current AI status
      const currentMetadata = await this.aiRepository.getFeedbackAiMetadata(feedbackId, workspaceId);
      
      if (currentMetadata?.status === "STARTED" || currentMetadata?.status === "QUEUED") {
        throw new ServiceError("Feedback is already being processed.", "CONFLICT");
      }
      if (currentMetadata?.status === "COMPLETED" && !isRetry) {
        throw new ServiceError("Feedback is already classified. Use retry to re-classify.", "CONFLICT");
      }

      // 3. Mark as started
      const now = new Date().toISOString();
      const processingMeta: FeedbackAiMetadata = {
        status: isRetry ? "RETRYING" : "STARTED",
        retryCount: currentMetadata?.retryCount || 0,
        history: currentMetadata?.history || [],
        timeline: {
          ...currentMetadata?.timeline,
          [isRetry ? "retriedAt" : "startedAt"]: now,
        }
      };
      await this.aiRepository.updateFeedbackAiMetadata(feedbackId, workspaceId, processingMeta);

      // 4. Execute AI call
      const aiResult = await this.aiService.classifyFeedback(feedback.body, provider);

      if (!aiResult.ok) {
        // Handle Failure
        let errorCategory: AiErrorCategory = "UNKNOWN";
        const msg = aiResult.error.message.toLowerCase();
        if (msg.includes("timeout")) errorCategory = "TIMEOUT";
        else if (msg.includes("rate limit") || msg.includes("429")) errorCategory = "RATE_LIMIT";
        else if (msg.includes("unauthorized") || msg.includes("api key")) errorCategory = "AUTH";
        
        const failedMeta: FeedbackAiMetadata = {
          status: "FAILED",
          error: {
            category: errorCategory,
            message: aiResult.error.message || "Unknown AI error",
            code: aiResult.error.code,
          },
          retryCount: (currentMetadata?.retryCount || 0) + (isRetry ? 1 : 0),
          history: currentMetadata?.history || [],
          timeline: {
            ...currentMetadata?.timeline,
            failedAt: new Date().toISOString(),
          }
        };
        await this.aiRepository.updateFeedbackAiMetadata(feedbackId, workspaceId, failedMeta);
        throw aiResult.error;
      }

      // 5. Handle Success
      let reviewStatus: ConfidenceReviewStatus = "MANUAL_REVIEW_REQUIRED";
      if (aiResult.data.confidence > 0.90) {
        reviewStatus = "AUTO_ACCEPT";
      } else if (aiResult.data.confidence >= 0.70) {
        reviewStatus = "REVIEW_RECOMMENDED";
      }

      const completedMeta: FeedbackAiMetadata = {
        status: "COMPLETED",
        reviewStatus,
        classification: aiResult.data,
        retryCount: currentMetadata?.retryCount || 0,
        history: currentMetadata?.history || [],
        timeline: {
          ...currentMetadata?.timeline,
          completedAt: new Date().toISOString(),
        }
      };

      // Save classification back to DB and update the Sentiment/Language columns
      await this.aiRepository.updateFeedbackAiMetadata(
        feedbackId, 
        workspaceId, 
        completedMeta,
        aiResult.data.sentiment,
        aiResult.data.language
      );

      // 6. Audit Logging
      await this.auditService.logAction({
        workspaceId,
        actorId,
        action: "CLASSIFY",
        entityType: "Feedback",
        entityId: feedbackId,
        summary: `AI Classification completed using ${aiResult.data.model} with ${Math.round(aiResult.data.confidence * 100)}% confidence. Review Status: ${reviewStatus}`,
      });

      // 7. Fire AI Event Hook
      await this.aiEventsService.onClassificationComplete(feedbackId, workspaceId);

      return { ok: true, data: completedMeta };
    } catch (error) {
      return {
        ok: false,
        error: error instanceof ServiceError ? error : new ServiceError(
          error instanceof Error ? error.message : "Failed to classify feedback.",
          "INTERNAL_ERROR"
        ),
      };
    }
  }

  /**
   * Bulk classify multiple feedback items.
   */
  async bulkClassify(
    workspaceId: string,
    actorId: string,
    role: Role,
    feedbackIds: string[],
    provider?: AiProviderType
  ): Promise<ServiceResult<{ count: number }>> {
    try {
      this.enforceAdminAccess(role);

      if (!feedbackIds || feedbackIds.length === 0) {
        throw new ServiceError("No feedback IDs provided.", "BAD_REQUEST");
      }

      // In a real enterprise app, we'd dispatch to a queue.
      // For this phase, we process sequentially or in small parallel chunks.
      // We will process sequentially here to avoid rate limits with providers.
      let successCount = 0;

      for (const id of feedbackIds) {
        // We catch errors per item so one failure doesn't stop the batch.
        try {
          const res = await this.classifyFeedback(workspaceId, actorId, role, id, provider, false);
          if (res.ok) successCount++;
        } catch (e) {
          console.error(`Bulk classify failed for ${id}:`, e);
        }
      }

      return { ok: true, data: { count: successCount } };
    } catch (error) {
      return {
        ok: false,
        error: error instanceof ServiceError ? error : new ServiceError(
          error instanceof Error ? error.message : "Failed to execute bulk classification.",
          "INTERNAL_ERROR"
        ),
      };
    }
  }
}
