import { z } from "zod";

// Theme Lifecycle Stages
export const ThemeLifecycleStateSchema = z.enum([
  "NEW",
  "DISCOVERED",
  "ACTIVE",
  "TRENDING",
  "STABLE",
  "DECLINING",
  "ARCHIVED",
]);
export type ThemeLifecycleState = z.infer<typeof ThemeLifecycleStateSchema>;

export const ThemeTimelineEventSchema = z.object({
  stage: ThemeLifecycleStateSchema,
  timestamp: z.string().datetime(),
  reason: z.string().optional(),
});
export type ThemeTimelineEvent = z.infer<typeof ThemeTimelineEventSchema>;

// Relationships (Stored abstractly in metadata for Phase 8, ready for future migration)
export const ThemeRelationshipsSchema = z.object({
  parents: z.array(z.string().uuid()).default([]),
  children: z.array(z.string().uuid()).default([]),
  related: z.array(z.string().uuid()).default([]),
  mergedInto: z.string().uuid().optional(),
  splitFrom: z.string().uuid().optional(),
});
export type ThemeRelationships = z.infer<typeof ThemeRelationshipsSchema>;

// AI Generated Metadata for a Theme
export const ThemeAiMetadataSchema = z.object({
  executiveSummary: z.string().optional(),
  businessImpact: z.string().optional(),
  customerImpact: z.string().optional(),
  representativeQuotes: z.array(z.string()).default([]),
  keywords: z.array(z.string()).default([]),
  
  confidence: z.number().min(0).max(1).optional(),
  clusterConfidence: z.number().min(0).max(1).optional(),
  trendConfidence: z.number().min(0).max(1).optional(),

  promptVersion: z.string().optional(),
  provider: z.string().optional(),
  model: z.string().optional(),
  generatedAt: z.string().datetime().optional(),
});
export type ThemeAiMetadata = z.infer<typeof ThemeAiMetadataSchema>;

// The primary JSON structure for Theme.metadata
export const ThemeMetadataSchema = z.object({
  lifecycleState: ThemeLifecycleStateSchema.default("NEW"),
  timeline: z.array(ThemeTimelineEventSchema).default([]),
  relationships: ThemeRelationshipsSchema.default({
    parents: [],
    children: [],
    related: [],
  }),
  ai: ThemeAiMetadataSchema.default({ representativeQuotes: [], keywords: [] }),
});
export type ThemeMetadata = z.infer<typeof ThemeMetadataSchema>;

// API Request/Response Contracts

export const MergeThemesRequestSchema = z.object({
  sourceThemeIds: z.array(z.string().uuid()).min(1),
  targetThemeId: z.string().uuid(),
});

export const SplitThemeRequestSchema = z.object({
  sourceThemeId: z.string().uuid(),
  newThemeNames: z.array(z.string().min(2)).min(2),
});

export const ReclassifyThemeRequestSchema = z.object({
  themeId: z.string().uuid(),
  targetThemeId: z.string().uuid(),
  feedbackIds: z.array(z.string().uuid()).min(1), // Specific feedback to move
});

// Analytics & Trend Types
export const ThemeAnalyticsDataSchema = z.object({
  themeId: z.string().uuid(),
  feedbackCount: z.number(),
  customerCount: z.number(),
  weeklyGrowth: z.number(), // Percentage
  monthlyGrowth: z.number(), // Percentage
  trendVelocity: z.number(), // Arbitrary velocity score
  momentum: z.number(),
  popularity: z.number(),
  averageSentimentScore: z.number(), // -1 to 1 based on sentiment mapping
  averageUrgencyScore: z.number(), // 0 to 1 based on urgency mapping
  averageConfidence: z.number(),
});
export type ThemeAnalyticsData = z.infer<typeof ThemeAnalyticsDataSchema>;

export const ThemeHealthDataSchema = z.object({
  themeId: z.string().uuid(),
  healthScore: z.number().min(0).max(100),
  completeness: z.number(),
  freshness: z.number(),
  coverage: z.number(),
});
export type ThemeHealthData = z.infer<typeof ThemeHealthDataSchema>;
