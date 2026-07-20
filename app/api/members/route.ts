import { apiError, apiSuccess } from "@/lib/utils/api";
import { requireAuth, requireWorkspace } from "@/lib/auth/session";
import { Role } from "@prisma/client";

import { membersFilterSchema } from "@/schemas/workspace.schema";
import { MemberService } from "@/services/member.service";
import { ServiceError } from "@/services/errors";
import { parseSearchParams, RequestValidationError } from "@/validators/request-validator";
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
    await requireAuth();
    const workspaceId = await requireWorkspace();

    const url = new URL(request.url);
    const filters = parseSearchParams(url.searchParams, membersFilterSchema);

    const { query, role, page, perPage, sortBy, sortOrder } = filters;
    const cleanFilters: {
      query?: string;
      role?: Role;
      page: number;
      perPage: number;
      sortBy?: "name" | "email" | "role" | "createdAt";
      sortOrder?: "asc" | "desc";
    } = {
      page,
      perPage,
      sortBy,
      sortOrder,
    };

    if (query !== undefined) cleanFilters.query = query;
    if (role !== undefined) cleanFilters.role = role;

    const memberService = new MemberService();
    const result = await memberService.listMembers(workspaceId, cleanFilters);


    if (!result.ok) {
      throw result.error;
    }

    return apiSuccess(result.data);
  } catch (error) {
    return handleError(error);
  }
}
