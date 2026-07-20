import { apiError, apiSuccess } from "@/lib/utils/api";
import { requireAuth, requireWorkspace } from "@/lib/auth/session";
import { updateFeedbackSchema } from "@/schemas/feedback.schema";
import { FeedbackService } from "@/services/feedback.service";
import { ServiceError } from "@/services/errors";
import { parseJsonBody, RequestValidationError } from "@/validators/request-validator";
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

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_request: Request, context: RouteContext) {

  try {
    await requireAuth();
    const workspaceId = await requireWorkspace();
    const { id } = await context.params;

    const feedbackService = new FeedbackService();
    const result = await feedbackService.getFeedbackDetails(workspaceId, id);

    if (!result.ok) {
      throw result.error;
    }

    return apiSuccess(result.data);
  } catch (error) {
    return handleError(error);
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const actor = await requireAuth();
    const workspaceId = await requireWorkspace();
    const { id } = await context.params;

    const url = new URL(request.url);
    const restoreParam = url.searchParams.get("restore");

    const feedbackService = new FeedbackService();

    // Check if performing restore operation (Admin only)
    if (restoreParam === "true") {
      const result = await feedbackService.restoreFeedback(workspaceId, actor.id, actor.role, id);
      if (!result.ok) {
        throw result.error;
      }
      return apiSuccess(result.data, { message: "Feedback restored successfully." });
    }

    const payload = await parseJsonBody(request, updateFeedbackSchema);

    // Map exactOptionalPropertyTypes cleanly
    const updateData: {
      title?: string;
      body?: string;
      channel?: Channel;
      status?: FeedbackStatus;
      externalId?: string | null;
      customerEmail?: string | null;
      customerName?: string | null;
      sourceUrl?: string | null;
      language?: string;
      priority?: number;
      sentiment?: Sentiment;
      score?: number | null;
      metadata?: Record<string, unknown>;
      assignedToId?: string | null;
      lastUpdatedAt?: string;
    } = {};

    if (payload.title !== undefined) updateData.title = payload.title;
    if (payload.body !== undefined) updateData.body = payload.body;
    if (payload.channel !== undefined) updateData.channel = payload.channel;
    if (payload.status !== undefined) updateData.status = payload.status;
    if (payload.externalId !== undefined) updateData.externalId = payload.externalId;
    if (payload.customerEmail !== undefined) updateData.customerEmail = payload.customerEmail;
    if (payload.customerName !== undefined) updateData.customerName = payload.customerName;
    if (payload.sourceUrl !== undefined) updateData.sourceUrl = payload.sourceUrl;
    if (payload.language !== undefined) updateData.language = payload.language;
    if (payload.priority !== undefined) updateData.priority = payload.priority;
    if (payload.sentiment !== undefined) updateData.sentiment = payload.sentiment;
    if (payload.score !== undefined) updateData.score = payload.score;
    if (payload.metadata !== undefined) updateData.metadata = payload.metadata;
    if (payload.assignedToId !== undefined) updateData.assignedToId = payload.assignedToId;
    if (payload.lastUpdatedAt !== undefined) updateData.lastUpdatedAt = payload.lastUpdatedAt;

    const result = await feedbackService.updateFeedback(workspaceId, actor.id, actor.role, id, updateData);

    if (!result.ok) {
      throw result.error;
    }

    return apiSuccess(result.data, { message: "Feedback updated successfully." });
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {

  try {
    const actor = await requireAuth();
    const workspaceId = await requireWorkspace();
    const { id } = await context.params;

    const feedbackService = new FeedbackService();
    const result = await feedbackService.softDeleteFeedback(workspaceId, actor.id, actor.role, id);

    if (!result.ok) {
      throw result.error;
    }

    return apiSuccess(result.data, { message: "Feedback archived/deleted successfully." });
  } catch (error) {
    return handleError(error);
  }
}
