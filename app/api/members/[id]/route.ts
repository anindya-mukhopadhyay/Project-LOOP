import { apiError, apiSuccess } from "@/lib/utils/api";
import { requireAuth, requireWorkspace } from "@/lib/auth/session";
import { updateMemberRoleSchema } from "@/schemas/workspace.schema";
import { MemberService } from "@/services/member.service";
import { ServiceError } from "@/services/errors";
import { parseJsonBody, RequestValidationError } from "@/validators/request-validator";
import type { ApiErrorCode } from "@/types/api";
import { z } from "zod";

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

// Zod schema to inspect toggle suspension payload
const toggleSuspensionSchema = z.object({
  toggleSuspension: z.boolean(),
});

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const actor = await requireAuth();
    const workspaceId = await requireWorkspace();
    const { id: targetUserId } = await context.params;

    if (actor.role !== "ADMIN") {
      return apiError({
        code: "FORBIDDEN",
        message: "Only administrators can manage workspace members.",
        status: 403,
      });
    }

    // Try parsing as a suspension toggle first or a role update
    const body = await request.clone().json();
    const memberService = new MemberService();

    if (body && typeof body === "object" && "toggleSuspension" in body) {
      await parseJsonBody(request, toggleSuspensionSchema);
      const result = await memberService.toggleSuspension(workspaceId, actor.id, targetUserId);

      if (!result.ok) {
        throw result.error;
      }

      const stateLabel = (result.data.metadata as Record<string, unknown>)?.suspended ? "suspended" : "activated";

      return apiSuccess(result.data, { message: `Member account ${stateLabel} successfully.` });
    } else {
      const payload = await parseJsonBody(request, updateMemberRoleSchema);
      const result = await memberService.updateMemberRole(workspaceId, actor.id, targetUserId, payload.role);

      if (!result.ok) {
        throw result.error;
      }

      return apiSuccess(result.data, { message: "Member role updated successfully." });
    }
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const actor = await requireAuth();
    const workspaceId = await requireWorkspace();
    const { id: targetUserId } = await context.params;

    if (actor.role !== "ADMIN") {
      return apiError({
        code: "FORBIDDEN",
        message: "Only administrators can remove members.",
        status: 403,
      });
    }

    const memberService = new MemberService();
    const result = await memberService.removeMember(workspaceId, actor.id, targetUserId);

    if (!result.ok) {
      throw result.error;
    }

    return apiSuccess(null, { message: "Member removed from workspace successfully." });
  } catch (error) {
    return handleError(error);
  }
}
