import { z } from "zod";

// --- Enums & Literals ---
export const MessageRoleSchema = z.enum(["USER", "ASSISTANT", "SYSTEM"]);
export type MessageRole = z.infer<typeof MessageRoleSchema>;

export const ConversationStatusSchema = z.enum(["OPEN", "ARCHIVED"]);
export type ConversationStatus = z.infer<typeof ConversationStatusSchema>;

export const KnowledgeSourceTypeSchema = z.enum(["FEEDBACK", "THEME", "REPORT", "ANALYTICS"]);
export type KnowledgeSourceType = z.infer<typeof KnowledgeSourceTypeSchema>;

export const IntentTypeSchema = z.enum([
  "ANALYTICS_QUERY", 
  "THEME_QUERY", 
  "FEEDBACK_QUERY", 
  "COMPARISON", 
  "TREND_ANALYSIS", 
  "SUMMARY", 
  "RECOMMENDATION", 
  "UNKNOWN"
]);
export type IntentType = z.infer<typeof IntentTypeSchema>;

// --- Filters ---
export const SearchFiltersSchema = z.object({
  themes: z.array(z.string()).optional(),
  sentiment: z.array(z.string()).optional(),
  channels: z.array(z.string()).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});
export type SearchFilters = z.infer<typeof SearchFiltersSchema>;

// --- Citations ---
export const CitationSchema = z.object({
  id: z.string(), // Identifier (e.g. feedback ID or theme ID)
  type: KnowledgeSourceTypeSchema,
  relevanceScore: z.number(),
  snippet: z.string(),
  title: z.string().optional(),
  url: z.string().optional(),
  
  // Phase 9.1 Enhancements
  feedbackId: z.string().optional(),
  theme: z.string().optional(),
  channel: z.string().optional(),
  sentiment: z.string().optional(),
  confidence: z.number().optional(),
  createdAt: z.date().optional(),
  sourceType: z.string().optional(),
  selectionReason: z.string().optional(),
  
  metadata: z.record(z.string(), z.any()).optional(),
});
export type Citation = z.infer<typeof CitationSchema>;

// --- Core Entities ---
export const MessageSchema = z.object({
  id: z.string(),
  conversationId: z.string(),
  role: MessageRoleSchema,
  content: z.string(),
  citations: z.any().optional(), // Avoid Prisma json mismatch
  metadata: z.any().optional(), // Used for metrics and traces
  createdAt: z.date(),
});
export type Message = z.infer<typeof MessageSchema>;

// --- Tracing & Planning ---
export const RetrievalTraceSchema = z.object({
  question: z.string(),
  intent: IntentTypeSchema,
  retrievalStrategy: z.string(),
  retrievedIds: z.array(z.string()),
  rankingScores: z.array(z.number()),
  compressionStatistics: z.record(z.string(), z.any()),
  finalContext: z.string(),
  promptVersion: z.string(),
  provider: z.string(),
  model: z.string(),
  generationTimeMs: z.number(),
});
export type RetrievalTrace = z.infer<typeof RetrievalTraceSchema>;

export const QueryPlanSchema = z.object({
  steps: z.array(z.object({
    action: z.string(),
    description: z.string(),
    parameters: z.record(z.string(), z.any()).optional()
  }))
});
export type QueryPlan = z.infer<typeof QueryPlanSchema>;

// --- API Requests ---
export const AskRequestSchema = z.object({
  question: z.string().min(1).max(2000),
  conversationId: z.string().uuid().optional(),
  filters: SearchFiltersSchema.optional(),
});
export type AskRequest = z.infer<typeof AskRequestSchema>;

export const AskSearchRequestSchema = z.object({
  query: z.string().min(1),
  limit: z.number().min(1).max(50).default(10),
  filters: SearchFiltersSchema.optional(),
});

export const AskFeedbackRequestSchema = z.object({
  messageId: z.string().uuid(),
  rating: z.enum(["UPVOTE", "DOWNVOTE"]),
  comment: z.string().optional(),
});

// --- API Responses ---
export const AnswerMetadataSchema = z.object({
  provider: z.string(),
  model: z.string(),
  promptVersion: z.string(),
  generatedAt: z.date(),
  answerConfidence: z.number(),
  retrievalConfidence: z.number(),
  citationCount: z.number(),
  processingTimeMs: z.number(),
  tokenUsage: z.object({
    prompt: z.number(),
    completion: z.number(),
    total: z.number(),
  }).optional(),
});
export type AnswerMetadata = z.infer<typeof AnswerMetadataSchema>;

export const AskResponseSchema = z.object({
  message: MessageSchema,
  conversationId: z.string(),
  suggestedFollowUps: z.array(z.string()).default([]),
  confidence: z.number(),
  reasoning: z.string().optional(),
  metadata: AnswerMetadataSchema.optional(),
  trace: RetrievalTraceSchema.optional(), // Only returned in debug mode
});
export type AskResponse = z.infer<typeof AskResponseSchema>;
