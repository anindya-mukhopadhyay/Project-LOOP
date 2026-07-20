import { apiError, apiSuccess } from "@/lib/utils/api";
import { acceptInvitationSchema } from "@/schemas/workspace.schema";
import { InvitationService } from "@/services/invitation.service";
import { ServiceError } from "@/services/errors";
import { prisma } from "@/lib/database";
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

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const token = url.searchParams.get("token");

    if (!token) {
      return apiError({
        code: "BAD_REQUEST",
        message: "Token parameter is required.",
        status: 400,
      });
    }

    const invitationService = new InvitationService();
    const result = await invitationService.verifyInvitationToken(token);

    if (!result.ok) {
      throw result.error;
    }

    const invite = result.data;
    const workspace = await prisma.workspace.findUnique({
      where: { id: invite.workspaceId },
    });

    const userExists = await prisma.user.findFirst({
      where: { email: invite.email, deletedAt: null },
    });

    return apiSuccess({
      email: invite.email,
      role: invite.role,
      userExists: !!userExists,
      workspace: workspace
        ? {
            id: workspace.id,
            name: workspace.name,
            slug: workspace.slug,
          }
        : null,
    });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: Request) {
  try {
    const payload = await parseJsonBody(request, acceptInvitationSchema);
    const invitationService = new InvitationService();

    const registration: { name?: string; password?: string } = {};
    if (payload.name !== undefined) registration.name = payload.name;
    if (payload.password !== undefined) registration.password = payload.password;

    const result = await invitationService.acceptInvitation(payload.token, registration);


    if (!result.ok) {
      throw result.error;
    }

    const { user, invitation } = result.data;

    return apiSuccess({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      invitation: {
        id: invitation.id,
        status: invitation.status,
        acceptedAt: invitation.acceptedAt,
      },
    }, { message: "Invitation accepted successfully." });
  } catch (error) {
    return handleError(error);
  }
}
