import { apiError, apiSuccess } from "@/lib/utils/api";
import { requireAuth, requireWorkspace } from "@/lib/auth/session";
import { ReportService } from "@/services/reports/report.service";
import { ReportCompositionService } from "@/services/reports/report-composition.service";
import { ExecutiveSummaryService } from "@/services/reports/executive-summary.service";
import { ThemeReportService } from "@/services/reports/theme-report.service";
import { SentimentReportService } from "@/services/reports/sentiment-report.service";
import { BusinessImpactService } from "@/services/reports/business-impact.service";
import { RecommendationService } from "@/services/reports/recommendation.service";
import { ReportHealthService } from "@/services/reports/report-health.service";
import { ReportRepository } from "@/repositories/report.repository";
import { ReportTemplateRepository } from "@/repositories/report-template.repository";
import { parseJsonBody } from "@/validators/request-validator";
import { ReportRequestSchema } from "@/schemas/report.schema";

export async function POST(request: Request) {
  try {
    const actor = await requireAuth();
    const workspaceId = await requireWorkspace();

    const payload = await parseJsonBody(request, ReportRequestSchema);
    
    const templateRepo = new ReportTemplateRepository();
    const template = await templateRepo.findById(payload.templateId);

    if (!template) {
      return apiError({
        code: "NOT_FOUND",
        message: `Template with ID ${payload.templateId} not found`,
        status: 404,
      });
    }

    // Initialize Services
    const compositionService = new ReportCompositionService(
      new ExecutiveSummaryService(),
      new ThemeReportService(),
      new SentimentReportService(),
      new BusinessImpactService(),
      new RecommendationService(),
      new ReportHealthService()
    );
    const reportService = new ReportService(new ReportRepository(), compositionService);

    // If it's a schedule, we would pass it to the ReportSchedulerService instead
    if (payload.schedule && payload.schedule.cron) {
       // Handled in a separate scheduling flow usually, but we could handle it here if requested
       return apiError({
         code: "BAD_REQUEST",
         message: "Please use /api/reports/schedule for scheduling",
         status: 400
       });
    }

    // Generate the report immediately
    // Notice that we use the template defaultFilters merged with the payload filters
    const report = await reportService.generateReport(
      workspaceId,
      actor.id,
      template,
      {
        dateRange: payload.dateRange,
        filters: { ...template.defaultFilters, ...payload.filters }
      }
    );

    return apiSuccess(report, { message: "Report generated successfully.", status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message.includes('NOT_FOUND')) {
      return apiError({ code: "NOT_FOUND", message: error.message, status: 404 });
    }
    
    return apiError({
      code: "INTERNAL_ERROR",
      message: error instanceof Error ? error.message : "Failed to generate report",
      status: 500,
    });
  }
}
