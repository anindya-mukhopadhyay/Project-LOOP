import { apiError, apiSuccess } from "@/lib/utils/api";
import { requireAuth, requireWorkspace } from "@/lib/auth/session";
import { ReportRepository } from "@/repositories/report.repository";
import type { ReportStatus } from "@prisma/client";
import { parseSearchParams } from "@/validators/request-validator";
import { z } from "zod";

const listReportsSchema = z.object({
  status: z.enum(["DRAFT", "SCHEDULED", "GENERATING", "READY", "FAILED", "ARCHIVED"]).optional(),
  page: z.number().int().positive().default(1),
  perPage: z.number().int().positive().max(100).default(20),
});

export async function GET(request: Request) {
  try {
    await requireAuth();
    const workspaceId = await requireWorkspace();

    const url = new URL(request.url);
    const filters = parseSearchParams(url.searchParams, listReportsSchema);

    const reportRepository = new ReportRepository();
    const reports = await reportRepository.listReports(workspaceId, {
      status: filters.status as ReportStatus,
      page: filters.page,
      perPage: filters.perPage,
    });
    
    const total = await reportRepository.countReports(workspaceId, {
      status: filters.status as ReportStatus,
    });

    return apiSuccess({
      data: reports,
      meta: {
        total,
        page: filters.page,
        perPage: filters.perPage,
        totalPages: Math.ceil(total / filters.perPage),
      }
    });
  } catch (error) {
    return apiError({
      code: "INTERNAL_ERROR",
      message: error instanceof Error ? error.message : "Failed to list reports",
      status: 500,
    });
  }
}
