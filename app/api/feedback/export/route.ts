import { NextResponse } from "next/server";
import { requireAuth, requireWorkspace } from "@/lib/auth/session";
import { feedbackFilterSchema } from "@/schemas/feedback.schema";
import { FeedbackService } from "@/services/feedback.service";
import { ServiceError } from "@/services/errors";
import { parseSearchParams } from "@/validators/request-validator";
import type { Channel, FeedbackStatus, Sentiment } from "@prisma/client";

function escapeCSV(val: unknown): string {
  if (val === null || val === undefined) return "";
  const str = String(val);
  if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export async function GET(request: Request) {
  try {
    await requireAuth();
    const workspaceId = await requireWorkspace();

    const url = new URL(request.url);
    const filters = parseSearchParams(url.searchParams, feedbackFilterSchema);

    // Map exactOptionalPropertyTypes cleanly for the export query
    const { query, status, channel, sentiment, themeId, startDate, endDate, sortBy, sortOrder } = filters;
    
    const cleanFilters: {
      query?: string;
      status?: FeedbackStatus;
      channel?: Channel;
      sentiment?: Sentiment;
      themeId?: string;
      startDate?: string;
      endDate?: string;
      page: number;
      perPage: number;
      sortBy: "createdAt" | "updatedAt" | "status" | "channel" | "customerName" | "customerEmail";
      sortOrder: "asc" | "desc";
    } = {
      page: 1,
      perPage: 5000, // Export up to 5000 rows
      sortBy,
      sortOrder,
    };

    if (query !== undefined) cleanFilters.query = query;
    if (status !== undefined) cleanFilters.status = status;
    if (channel !== undefined) cleanFilters.channel = channel;
    if (sentiment !== undefined) cleanFilters.sentiment = sentiment;
    if (themeId !== undefined) cleanFilters.themeId = themeId;
    if (startDate !== undefined) cleanFilters.startDate = startDate;
    if (endDate !== undefined) cleanFilters.endDate = endDate;

    const feedbackService = new FeedbackService();
    const result = await feedbackService.listFeedback(workspaceId, cleanFilters);

    if (!result.ok) {
      throw result.error;
    }

    const items = result.data.items;

    // Build CSV Content
    const csvHeaders = [
      "ID",
      "Title",
      "Body",
      "Channel",
      "Status",
      "Sentiment",
      "Sentiment Score",
      "External ID",
      "Customer Name",
      "Customer Email",
      "Source URL",
      "Priority",
      "Language",
      "Created At",
    ];

    const csvRows = items.map((f) => [
      escapeCSV(f.id),
      escapeCSV(f.title),
      escapeCSV(f.body),
      escapeCSV(f.channel),
      escapeCSV(f.status),
      escapeCSV(f.sentiment),
      escapeCSV(f.score ? f.score.toString() : ""),
      escapeCSV(f.externalId),
      escapeCSV(f.customerName),
      escapeCSV(f.customerEmail),
      escapeCSV(f.sourceUrl),
      escapeCSV(f.priority),
      escapeCSV(f.language),
      escapeCSV(f.createdAt.toISOString()),
    ]);

    const csvContent = [csvHeaders.join(","), ...csvRows.map((r) => r.join(","))].join("\n");

    const response = new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="feedback_export_${new Date().toISOString().split("T")[0]}.csv"`,
      },
    });

    return response;
  } catch (error) {
    const errorDetails = error instanceof ServiceError ? error.message : "Failed to export CSV file.";
    return new Response(errorDetails, {
      status: error instanceof ServiceError && error.code === "FORBIDDEN" ? 403 : 500,
    });
  }
}
