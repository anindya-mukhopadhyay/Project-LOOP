import { z } from 'zod';

export const PrioritySchema = z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']);
export const TimeHorizonSchema = z.enum(['IMMEDIATE', '30_DAYS', '90_DAYS', 'FUTURE']);

export const EvidenceBlockSchema = z.object({
  themeId: z.string().uuid().optional(),
  themeName: z.string().optional(),
  feedbackIds: z.array(z.string().uuid()),
  quotes: z.array(z.string()),
  confidence: z.number().min(0).max(1),
  source: z.string().describe('Where this evidence was retrieved from (e.g., Ask LOOP, Analytics)'),
});

export const RecommendationSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  priority: PrioritySchema,
  timeHorizon: TimeHorizonSchema,
  expectedImpact: z.string(),
  effort: z.enum(['LOW', 'MEDIUM', 'HIGH']),
  evidence: EvidenceBlockSchema.optional(),
});

export const BusinessImpactScoreSchema = z.object({
  score: z.number().min(0).max(100),
  factors: z.object({
    sentiment: z.number().min(0).max(100),
    urgency: z.number().min(0).max(100),
    volume: z.number().min(0).max(100),
    trend: z.number().min(0).max(100),
    confidence: z.number().min(0).max(100),
  }),
  narrative: z.string(),
});

export const ExecutiveSummarySchema = z.object({
  highlights: z.array(z.string()),
  topRisks: z.array(z.string()),
  opportunities: z.array(z.string()),
  businessHealth: BusinessImpactScoreSchema,
});

export const ReportMetadataSchema = z.object({
  generatedBy: z.string().uuid().optional(),
  provider: z.string().optional(),
  model: z.string().optional(),
  promptVersion: z.string().optional(),
  workspaceId: z.string().uuid(),
  dateRange: z.object({
    start: z.string().datetime(),
    end: z.string().datetime(),
  }),
  filters: z.record(z.string(), z.any()),
  generationTimeMs: z.number(),
  tokenUsage: z.object({
    prompt: z.number(),
    completion: z.number(),
    total: z.number(),
  }).optional(),
  cost: z.number().optional(),
});

export const ReportHealthSchema = z.object({
  completeness: z.number().min(0).max(100),
  citationCoverage: z.number().min(0).max(100),
  aiConfidence: z.number().min(0).max(100),
  dataFreshness: z.string().describe('ISO 8601 timestamp of oldest data point'),
  missingDataFields: z.array(z.string()),
});

export const ReportSectionSchema = z.object({
  id: z.string(),
  type: z.enum([
    'EXECUTIVE_SUMMARY',
    'KEY_METRICS',
    'CUSTOMER_SENTIMENT',
    'THEME_INTELLIGENCE',
    'BUSINESS_IMPACT',
    'RECOMMENDATIONS',
    'SUPPORTING_EVIDENCE',
    'APPENDIX'
  ]),
  title: z.string(),
  content: z.any().describe('Structured data for this section based on its type'),
});

export const StructuredReportSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  sections: z.array(ReportSectionSchema),
  metadata: ReportMetadataSchema,
  health: ReportHealthSchema.optional(),
});

export const ReportRequestSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  templateId: z.string(),
  dateRange: z.object({
    start: z.string().datetime(),
    end: z.string().datetime(),
  }),
  filters: z.record(z.string(), z.any()).optional(),
  schedule: z.object({
    cron: z.string().optional(),
    timezone: z.string().optional(),
  }).optional(),
});

export const ReportTemplateSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  sections: z.array(z.string()), // IDs of sections to include
  defaultFilters: z.record(z.string(), z.any()).optional(),
});

export const ExportFormatSchema = z.enum(['HTML', 'PDF', 'MARKDOWN', 'JSON', 'CSV']);

export type Priority = z.infer<typeof PrioritySchema>;
export type TimeHorizon = z.infer<typeof TimeHorizonSchema>;
export type EvidenceBlock = z.infer<typeof EvidenceBlockSchema>;
export type Recommendation = z.infer<typeof RecommendationSchema>;
export type BusinessImpactScore = z.infer<typeof BusinessImpactScoreSchema>;
export type ExecutiveSummary = z.infer<typeof ExecutiveSummarySchema>;
export type ReportMetadata = z.infer<typeof ReportMetadataSchema>;
export type ReportHealth = z.infer<typeof ReportHealthSchema>;
export type ReportSection = z.infer<typeof ReportSectionSchema>;
export type StructuredReport = z.infer<typeof StructuredReportSchema>;
export type ReportRequest = z.infer<typeof ReportRequestSchema>;
export type ReportTemplate = z.infer<typeof ReportTemplateSchema>;
export type ExportFormat = z.infer<typeof ExportFormatSchema>;
