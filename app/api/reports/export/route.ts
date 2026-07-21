import { apiError } from "@/lib/utils/api";
import { requireAuth, requireWorkspace } from "@/lib/auth/session";
import { ExportService } from "@/services/reports/export.service";
import { ReportRepository } from "@/repositories/report.repository";
import { parseJsonBody } from "@/validators/request-validator";
import { ExportFormatSchema, type StructuredReport } from "@/schemas/report.schema";
import { z } from "zod";

const exportRequestSchema = z.object({
  reportId: z.string().uuid(),
  format: ExportFormatSchema,
});

export async function POST(request: Request) {
  try {
    await requireAuth();
    const workspaceId = await requireWorkspace();

    const payload = await parseJsonBody(request, exportRequestSchema);
    
    const reportRepository = new ReportRepository();
    const report = await reportRepository.findById(payload.reportId, workspaceId);

    if (!report) {
      return apiError({
        code: "NOT_FOUND",
        message: `Report with ID ${payload.reportId} not found`,
        status: 404,
      });
    }

    if (report.status !== 'READY') {
      return apiError({
        code: "BAD_REQUEST",
        message: `Report is not ready for export (Status: ${report.status})`,
        status: 400,
      });
    }

    const exportService = new ExportService();
    // report.metrics holds the StructuredReport according to our architecture
    const output = await exportService.exportReport(report.metrics as unknown as StructuredReport, payload.format);

    return new Response(output, {
      status: 200,
      headers: {
        'Content-Type': payload.format === 'HTML' ? 'text/html' :
                        payload.format === 'JSON' ? 'application/json' : 
                        'text/plain',
      },
    });
  } catch (error) {
    return apiError({
      code: "INTERNAL_ERROR",
      message: error instanceof Error ? error.message : "Failed to export report",
      status: 500,
    });
  }
}
