import { z } from "zod";
import { Channel, FeedbackStatus, Sentiment } from "@prisma/client";

export const createFeedbackSchema = z.object({
  title: z.string().trim().min(2, "Title must be at least 2 characters long.").max(240, "Title cannot exceed 240 characters."),
  body: z.string().trim().min(5, "Feedback body must be at least 5 characters long."),
  channel: z.nativeEnum(Channel, { message: "Invalid channel selected." }),
  status: z.nativeEnum(FeedbackStatus).default(FeedbackStatus.NEW).optional(),
  externalId: z.string().trim().max(160).optional().nullable(),
  customerEmail: z.string().trim().email("Invalid email address.").or(z.string().length(0)).optional().nullable(),
  customerName: z.string().trim().max(160).optional().nullable(),
  sourceUrl: z.string().trim().url("Invalid URL.").or(z.string().length(0)).optional().nullable(),
  language: z.string().trim().max(16).default("en").optional(),
  priority: z.number().int().default(0).optional(),
});

export const updateFeedbackSchema = z.object({
  title: z.string().trim().min(2).max(240).optional(),
  body: z.string().trim().min(5).optional(),
  channel: z.nativeEnum(Channel).optional(),
  status: z.nativeEnum(FeedbackStatus).optional(),
  externalId: z.string().trim().max(160).optional().nullable(),
  customerEmail: z.string().trim().email("Invalid email address.").or(z.string().length(0)).optional().nullable(),
  customerName: z.string().trim().max(160).optional().nullable(),
  sourceUrl: z.string().trim().url("Invalid URL.").or(z.string().length(0)).optional().nullable(),
  language: z.string().trim().max(16).optional(),
  priority: z.number().int().optional(),
  sentiment: z.nativeEnum(Sentiment).optional(),
  score: z.coerce.number().min(-1).max(1).optional().nullable(),
  metadata: z.record(z.string(), z.any()).optional(),
  assignedToId: z.string().uuid().optional().nullable(),
  lastUpdatedAt: z.string().datetime({ message: "Invalid ISO timestamp for concurrency verification." }).optional(),
});

export const feedbackFilterSchema = z.object({
  query: z.string().trim().optional(),
  status: z.nativeEnum(FeedbackStatus).optional(),
  channel: z.nativeEnum(Channel).optional(),
  sentiment: z.nativeEnum(Sentiment).optional(),
  themeId: z.string().uuid().optional(),
  startDate: z.string().optional(), // validated as date strings in service layer
  endDate: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  perPage: z.coerce.number().int().positive().max(100).default(20),
  sortBy: z.enum(["createdAt", "updatedAt", "status", "channel", "customerName", "customerEmail"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export const bulkFeedbackSchema = z.object({
  ids: z.array(z.string().uuid()).min(1, "At least one feedback ID is required.").max(200, "Bulk operations are limited to 200 items."),
  action: z.enum(["STATUS_UPDATE", "DELETE", "RESTORE"]),
  status: z.nativeEnum(FeedbackStatus).optional(),
});

export type CreateFeedbackInput = z.infer<typeof createFeedbackSchema>;
export type UpdateFeedbackInput = z.infer<typeof updateFeedbackSchema>;
export type FeedbackFilterInput = z.infer<typeof feedbackFilterSchema>;
export type BulkFeedbackInput = z.infer<typeof bulkFeedbackSchema>;
export type CsvRowInput = {
  title: string;
  body: string;
  channel: string;
  externalId?: string;
  customerEmail?: string;
  customerName?: string;
  sourceUrl?: string;
  language?: string;
  priority?: string;
};
