import { apiError, apiSuccess } from "@/lib/utils/api";
import { requireAuth, requireWorkspace } from "@/lib/auth/session";
import { ClassificationService } from "@/services/ai/classification.service";
import { BulkClassifyRequestSchema } from "@/schemas/ai.schema";
import { ServiceError } from "@/services/errors";
import { parseJsonBody } from "@/validators/request-validator";

function handleError(error: unknown) {
  if (error instanceof ServiceError) {
    const statusMap: Record<string, number> = {
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

    const payload = await parseJsonBody(request, BulkClassifyRequestSchema);

    const classificationService = new ClassificationService();
    const result = await classificationService.bulkClassify(
      workspaceId,
      actor.id,
      actor.role,
      payload.feedbackIds
    );

    if (!result.ok) {
      throw result.error;
    }

    return apiSuccess(result.data, { message: "Bulk classification finished.", status: 200 });
  } catch (error) {
    return handleError(error);
  }
}
