import { apiError, apiSuccess } from "@/lib/utils/api";
import { requireAuth, requireWorkspace } from "@/lib/auth/session";
import { createFeedbackSchema, feedbackFilterSchema } from "@/schemas/feedback.schema";
import { FeedbackService } from "@/services/feedback.service";
import { ServiceError } from "@/services/errors";
import { parseJsonBody, parseSearchParams, RequestValidationError } from "@/validators/request-validator";
import type { ApiErrorCode } from "@/types/api";
import type { Channel, FeedbackStatus, Sentiment } from "@prisma/client";

function handleError(error: unknown) {
  if (error instanceof RequestValidationError) {
    return apiError({
      code: error.code,
      message: error.message,
      status: error.code === "BAD_REQUEST" ? 400 : 422,
      details: error.details,
    });
  }

  if (error instanceof ServiceError) {
    const statusMap: Record<ApiErrorCode, number> = {
      BAD_REQUEST: 400,
      UNAUTHORIZED: 401,
      FORBIDDEN: 403,
      NOT_FOUND: 404,
      CONFLICT: 409,
      VALIDATION_ERROR: 422,
      NOT_IMPLEMENTED: 501,
      INTERNAL_ERROR: 500,
    };
    return apiError({
      code: error.code,
      message: error.message,
      status: statusMap[error.code] || 500,
      details: error.details,
    });
  }

  return apiError({
    code: "INTERNAL_ERROR",
    message: error instanceof Error ? error.message : "An unexpected error occurred.",
    status: 500,
  });
}

export async function GET(request: Request) {
  try {
    await requireAuth();
    const workspaceId = await requireWorkspace();

    const url = new URL(request.url);
    const filters = parseSearchParams(url.searchParams, feedbackFilterSchema);

    // Map exactOptionalPropertyTypes cleanly
    const { query, status, channel, sentiment, themeId, startDate, endDate, page, perPage, sortBy, sortOrder } = filters;
    
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
      page,
      perPage,
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

    return apiSuccess(result.data);
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: Request) {
  try {
    const actor = await requireAuth();
    const workspaceId = await requireWorkspace();

    const payload = await parseJsonBody(request, createFeedbackSchema);
    
    const feedbackService = new FeedbackService();
    const createData: {
      title: string;
      body: string;
      channel: Channel;
      status?: FeedbackStatus;
      externalId?: string | null;
      customerEmail?: string | null;
      customerName?: string | null;
      sourceUrl?: string | null;
      language?: string;
      priority?: number;
    } = {
      title: payload.title,
      body: payload.body,
      channel: payload.channel,
    };

    if (payload.status !== undefined) createData.status = payload.status;
    if (payload.externalId !== undefined) createData.externalId = payload.externalId;
    if (payload.customerEmail !== undefined) createData.customerEmail = payload.customerEmail;
    if (payload.customerName !== undefined) createData.customerName = payload.customerName;
    if (payload.sourceUrl !== undefined) createData.sourceUrl = payload.sourceUrl;
    if (payload.language !== undefined) createData.language = payload.language;
    if (payload.priority !== undefined) createData.priority = payload.priority;

    const result = await feedbackService.createFeedback(workspaceId, actor.id, actor.role, createData);


    if (!result.ok) {
      throw result.error;
    }

    return apiSuccess(result.data, { message: "Feedback record created successfully.", status: 201 });
  } catch (error) {
    return handleError(error);
  }
}
