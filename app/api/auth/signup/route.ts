import { apiError, apiSuccess } from "@/lib/utils/api";
import { signupSchema } from "@/schemas/auth.schema";
import { AuthService } from "@/services/auth.service";
import { ServiceError } from "@/services/errors";
import type { ApiErrorCode } from "@/types/api";
import { parseJsonBody, RequestValidationError } from "@/validators/request-validator";

export async function POST(request: Request) {
  try {
    const payload = await parseJsonBody(request, signupSchema);
    const authService = new AuthService();

    const result = await authService.signup(
      payload.email,
      payload.password,
      payload.workspaceName,
      payload.name
    );

    if (!result.ok) {
      throw result.error;
    }

    const { user, workspace } = result.data;

    // Return the response without returning password hash
    return apiSuccess({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        createdAt: user.createdAt,
      },
      workspace: {
        id: workspace.id,
        name: workspace.name,
        slug: workspace.slug,
        createdAt: workspace.createdAt,
      },
    }, { status: 201 });
  } catch (error) {
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
}
