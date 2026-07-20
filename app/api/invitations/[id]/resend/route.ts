import { apiError, apiSuccess } from "@/lib/utils/api";
import { requireAuth, requireWorkspace } from "@/lib/auth/session";
import { InvitationService } from "@/services/invitation.service";
import { ServiceError } from "@/services/errors";
import type { ApiErrorCode } from "@/types/api";

function handleError(error: unknown) {
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

export async function POST(_request: Request, context: RouteContext) {

  try {
    const actor = await requireAuth();
    const workspaceId = await requireWorkspace();
    const { id: invitationId } = await context.params;

    if (actor.role !== "ADMIN") {
      return apiError({
        code: "FORBIDDEN",
        message: "Only administrators can resend invitations.",
        status: 403,
      });
    }

    const invitationService = new InvitationService();
    const result = await invitationService.resendInvitation(workspaceId, actor.id, invitationId);

    if (!result.ok) {
      throw result.error;
    }

    return apiSuccess(result.data, { message: "Invitation resent successfully." });
  } catch (error) {
    return handleError(error);
  }
}
