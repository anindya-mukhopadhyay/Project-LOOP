import { apiError, apiSuccess } from "@/lib/utils/api";
import { requireAuth, requireWorkspace } from "@/lib/auth/session";
import { inviteMemberSchema } from "@/schemas/workspace.schema";
import { InvitationService } from "@/services/invitation.service";
import { ServiceError } from "@/services/errors";
import { parseJsonBody, RequestValidationError } from "@/validators/request-validator";
import type { ApiErrorCode } from "@/types/api";

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

export async function GET() {
  try {
    await requireAuth();

    const workspaceId = await requireWorkspace();

    const invitationService = new InvitationService();
    const result = await invitationService.listInvitations(workspaceId);

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

    if (actor.role !== "ADMIN") {
      return apiError({
        code: "FORBIDDEN",
        message: "Only administrators can invite members.",
        status: 403,
      });
    }

    const payload = await parseJsonBody(request, inviteMemberSchema);
    const invitationService = new InvitationService();

    const result = await invitationService.inviteMember(
      workspaceId,
      actor.id,
      payload.email,
      payload.role
    );

    if (!result.ok) {
      throw result.error;
    }

    return apiSuccess(result.data, {
      message: `Invitation successfully created for ${payload.email}.`,
    });
  } catch (error) {
    return handleError(error);
  }
}
