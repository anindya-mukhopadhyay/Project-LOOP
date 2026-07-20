import { apiError, apiSuccess } from "@/lib/utils/api";
import { requireAuth, requireWorkspace } from "@/lib/auth/session";
import { analyticsFilterSchema, type AnalyticsFilterInput } from "@/schemas/analytics.schema";
import { AnalyticsService } from "@/services/analytics.service";
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
    const parsedFilters = parseSearchParams(url.searchParams, analyticsFilterSchema);

    // Map exactOptionalPropertyTypes cleanly
    const cleanFilters: AnalyticsFilterInput = {
      range: parsedFilters.range,
      ...(parsedFilters.startDate ? { startDate: parsedFilters.startDate } : {}),
      ...(parsedFilters.endDate ? { endDate: parsedFilters.endDate } : {}),
      ...(parsedFilters.channel ? { channel: parsedFilters.channel } : {}),
      ...(parsedFilters.status ? { status: parsedFilters.status } : {}),
      ...(parsedFilters.sentiment ? { sentiment: parsedFilters.sentiment } : {}),
      ...(parsedFilters.themeId ? { themeId: parsedFilters.themeId } : {}),
    };

    const service = new AnalyticsService();
    const requestId = request.headers.get("x-request-id") || `req-${Math.random().toString(36).substring(2, 9)}`;
    const result = await service.getDashboardAnalytics(workspaceId, cleanFilters, requestId);

    if (!result.ok) {
      throw result.error;
    }

    return apiSuccess(result.data);
  } catch (error) {
    return handleError(error);
  }
}
