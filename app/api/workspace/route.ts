import { apiError, apiSuccess } from "@/lib/utils/api";
import { requireAuth, requireWorkspace } from "@/lib/auth/session";
import { updateWorkspaceSchema } from "@/schemas/workspace.schema";
import { WorkspaceService } from "@/services/workspace.service";
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
    const actor = await requireAuth();
    const workspaceId = await requireWorkspace();

    const workspaceService = new WorkspaceService();
    const result = await workspaceService.getWorkspaceDashboard(workspaceId, actor.id);

    if (!result.ok) {
      throw result.error;
    }

    return apiSuccess(result.data);
  } catch (error) {
    return handleError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const actor = await requireAuth();
    const workspaceId = await requireWorkspace();

    if (actor.role !== "ADMIN") {
      return apiError({
        code: "FORBIDDEN",
        message: "Only administrators can update workspace settings.",
        status: 403,
      });
    }

    const payload = await parseJsonBody(request, updateWorkspaceSchema);
    const workspaceService = new WorkspaceService();

    const updateData: {
      name: string;
      description?: string | null;
      logoUrl?: string | null;
      domain?: string | null;
      preferences?: Record<string, unknown>;
    } = {
      name: payload.name,
    };

    if (payload.description !== undefined) updateData.description = payload.description;
    if (payload.logoUrl !== undefined) updateData.logoUrl = payload.logoUrl;
    if (payload.domain !== undefined) updateData.domain = payload.domain;
    if (payload.preferences !== undefined) updateData.preferences = payload.preferences;

    const result = await workspaceService.updateWorkspace(workspaceId, actor.id, updateData);

    if (!result.ok) {
      throw result.error;
    }

    return apiSuccess(result.data, { message: "Workspace updated successfully." });

  } catch (error) {
    return handleError(error);
  }
}
