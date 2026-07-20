import { z } from "zod";
import { apiError, apiSuccess } from "@/lib/utils/api";
import { requireAuth, requireWorkspace } from "@/lib/auth/session";
import { ImportService } from "@/services/import.service";
import { ServiceError } from "@/services/errors";
import { parseJsonBody, RequestValidationError } from "@/validators/request-validator";
import type { ApiErrorCode } from "@/types/api";

const importPayloadSchema = z.object({
  csvText: z.string().min(1, "CSV text content is required."),
  columnMapping: z.record(z.string(), z.string()),
  execute: z.boolean().default(false),
});

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

export async function POST(request: Request) {
  try {
    const actor = await requireAuth();
    const workspaceId = await requireWorkspace();

    const payload = await parseJsonBody(request, importPayloadSchema);
    const importService = new ImportService();

    // 1. Parse CSV string into matrix
    const parsedRows = importService.parseCSV(payload.csvText);

    // 2. Validate and check duplicates
    const prepareResult = await importService.validateAndPrepare(
      workspaceId,
      parsedRows,
      payload.columnMapping
    );

    if (!prepareResult.ok) {
      throw prepareResult.error;
    }

    const { validRows, summary } = prepareResult.data;

    // 3. Execute batch insertion if requested
    if (payload.execute) {
      if (validRows.length === 0) {
        return apiError({
          code: "BAD_REQUEST",
          message: "No valid rows found to import.",
          status: 400,
          details: { summary },
        });
      }

      const importResult = await importService.importCSV(
        workspaceId,
        actor.id,
        actor.role,
        validRows
      );

      if (!importResult.ok) {
        throw importResult.error;
      }

      return apiSuccess({
        summary: {
          ...summary,
          importedCount: importResult.data.count,
        },
      }, { message: "CSV import completed successfully." });
    }

    // Return dry-run preview validation
    return apiSuccess({
      summary,
    }, { message: "CSV validation completed. Preview ready." });
  } catch (error) {
    return handleError(error);
  }
}
