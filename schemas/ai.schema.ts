import { z } from "zod";
import { Sentiment } from "@prisma/client";

export const AiProviderTypeSchema = z.enum(["openai", "claude", "gemini", "mock"]);
export type AiProviderType = z.infer<typeof AiProviderTypeSchema>;

export const AiStatusSchema = z.enum(["QUEUED", "STARTED", "COMPLETED", "FAILED", "RETRYING"]);
export type AiStatus = z.infer<typeof AiStatusSchema>;

export const AiUrgencySchema = z.enum(["CRITICAL", "HIGH", "MEDIUM", "LOW"]);
export type AiUrgency = z.infer<typeof AiUrgencySchema>;

export const ConfidenceReviewStatusSchema = z.enum(["AUTO_ACCEPT", "REVIEW_RECOMMENDED", "MANUAL_REVIEW_REQUIRED"]);
export type ConfidenceReviewStatus = z.infer<typeof ConfidenceReviewStatusSchema>;

export const AiErrorCategorySchema = z.enum([
  "PROVIDER_ERROR",
  "TIMEOUT",
  "RATE_LIMIT",
  "INVALID_PROMPT",
  "INVALID_RESPONSE",
  "AUTH",
  "NETWORK",
  "UNKNOWN"
]);
export type AiErrorCategory = z.infer<typeof AiErrorCategorySchema>;

export const NormalizedAiResponseSchema = z.object({
  // Classification
  sentiment: z.nativeEnum(Sentiment),
  emotion: z.string().min(1),
  urgency: AiUrgencySchema,
  intent: z.string().min(1),
  theme: z.string().min(1),
  featureArea: z.string().min(1),
  language: z.string().min(2).max(10).default("en"),
  
  // Explainability
  confidence: z.number().min(0).max(1),
  reasoning: z.string().min(1),
  supportingEvidence: z.array(z.string()).default([]),
  
  // Versioning & Traceability
  provider: z.string(),
  model: z.string(),
  promptVersion: z.string(),
  classificationVersion: z.string(),
  generatedAt: z.string().datetime(),
  
  // Metrics
  latency: z.number(), // in ms
  tokens: z.number(),
  estimatedCost: z.number(),
});
export type NormalizedAiResponse = z.infer<typeof NormalizedAiResponseSchema>;

export const AiExecutionTimelineSchema = z.object({
  queuedAt: z.string().datetime().optional(),
  startedAt: z.string().datetime().optional(),
  completedAt: z.string().datetime().optional(),
  failedAt: z.string().datetime().optional(),
  retriedAt: z.string().datetime().optional(),
});
export type AiExecutionTimeline = z.infer<typeof AiExecutionTimelineSchema>;

export const AiErrorDetailsSchema = z.object({
  category: AiErrorCategorySchema,
  message: z.string(),
  code: z.string().optional(),
});
export type AiErrorDetails = z.infer<typeof AiErrorDetailsSchema>;

export const FeedbackAiMetadataSchema = z.object({
  status: AiStatusSchema,
  reviewStatus: ConfidenceReviewStatusSchema.optional(),
  
  classification: NormalizedAiResponseSchema.optional(),
  history: z.array(NormalizedAiResponseSchema).default([]),
  
  error: AiErrorDetailsSchema.optional(),
  
  timeline: AiExecutionTimelineSchema.default({}),
  retryCount: z.number().default(0),
});
export type FeedbackAiMetadata = z.infer<typeof FeedbackAiMetadataSchema>;

// API Requests
export const ClassifyRequestSchema = z.object({
  feedbackId: z.string().uuid(),
});

export const BulkClassifyRequestSchema = z.object({
  feedbackIds: z.array(z.string().uuid()).min(1).max(50),
});

export const RetryClassifyRequestSchema = z.object({
  feedbackId: z.string().uuid(),
});
