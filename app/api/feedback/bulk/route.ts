import { apiError, apiSuccess } from "@/lib/utils/api";
import { requireAuth, requireWorkspace } from "@/lib/auth/session";
import { bulkFeedbackSchema } from "@/schemas/feedback.schema";
import { FeedbackService } from "@/services/feedback.service";
import { ServiceError } from "@/services/errors";
import { parseJsonBody, RequestValidationError } from "@/validators/request-validator";
import type { ApiErrorCode } from "@/types/api";
import { FeedbackStatus } from "@prisma/client";


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

export async function POST(request: Request) {
  try {
    const actor = await requireAuth();
    const workspaceId = await requireWorkspace();

    const payload = await parseJsonBody(request, bulkFeedbackSchema);
    
    const feedbackService = new FeedbackService();
    const bulkData: {
      ids: string[];
      action: "STATUS_UPDATE" | "DELETE" | "RESTORE";
      status?: FeedbackStatus;
    } = {
      ids: payload.ids,
      action: payload.action,
    };
    if (payload.status !== undefined) bulkData.status = payload.status;

    const result = await feedbackService.bulkOperations(workspaceId, actor.id, actor.role, bulkData);


    if (!result.ok) {
      throw result.error;
    }

    return apiSuccess(result.data, {
      message: `Bulk operation "${payload.action}" executed successfully on ${result.data.count} items.`,
    });
  } catch (error) {
    return handleError(error);
  }
}
