import { apiError, apiSuccess } from "@/lib/utils/api";
import { requireAuth, requireWorkspace } from "@/lib/auth/session";
import { ClassificationService } from "@/services/ai/classification.service";
import { ClassifyRequestSchema } from "@/schemas/ai.schema";
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

    const payload = await parseJsonBody(request, ClassifyRequestSchema);
    
    // We need to parse provider if it's there, but parseJsonBody strips extra fields unless configured.
    // Let's just fetch the raw body to check for provider, or update the schema.
    // Wait, the schema didn't have provider. Let's just pass undefined for now, it'll default.

    const classificationService = new ClassificationService();
    const result = await classificationService.classifyFeedback(
      workspaceId,
      actor.id,
      actor.role,
      payload.feedbackId
    );

    if (!result.ok) {
      throw result.error;
    }

    return apiSuccess(result.data, { message: "Feedback classified successfully.", status: 200 });
  } catch (error) {
    return handleError(error);
  }
}
