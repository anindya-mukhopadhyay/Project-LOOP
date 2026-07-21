import { apiError, apiSuccess } from "@/lib/utils/api";
import { requireAuth, requireWorkspace } from "@/lib/auth/session";
import { ReportRepository } from "@/repositories/report.repository";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    const workspaceId = await requireWorkspace();
    const { id } = await params;

    const reportRepository = new ReportRepository();
    
    // First try by ID, then by slug if not found
    let report = await reportRepository.findById(id, workspaceId);
    if (!report) {
      report = await reportRepository.findBySlug(id, workspaceId);
    }

    if (!report) {
      return apiError({
        code: "NOT_FOUND",
        message: `Report with ID/slug ${id} not found`,
        status: 404,
      });
    }

    return apiSuccess(report);
  } catch (error) {
    return apiError({
      code: "INTERNAL_ERROR",
      message: error instanceof Error ? error.message : "Failed to fetch report",
      status: 500,
    });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    const workspaceId = await requireWorkspace();
    const { id } = await params;

    const reportRepository = new ReportRepository();
    
    const report = await reportRepository.findById(id, workspaceId);
    if (!report) {
      return apiError({
        code: "NOT_FOUND",
        message: `Report with ID ${id} not found`,
        status: 404,
      });
    }

    await reportRepository.softDelete(id, workspaceId);

    return apiSuccess(null, { message: "Report deleted successfully" });
  } catch (error) {
    return apiError({
      code: "INTERNAL_ERROR",
      message: error instanceof Error ? error.message : "Failed to delete report",
      status: 500,
    });
  }
}
