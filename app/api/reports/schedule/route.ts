import { apiError, apiSuccess } from "@/lib/utils/api";
import { requireAuth, requireWorkspace } from "@/lib/auth/session";
import { ReportSchedulerService } from "@/services/reports/report-scheduler.service";
import { ReportRepository } from "@/repositories/report.repository";
import { ReportTemplateRepository } from "@/repositories/report-template.repository";
import { parseJsonBody } from "@/validators/request-validator";
import { ReportRequestSchema } from "@/schemas/report.schema";

export async function POST(request: Request) {
  try {
    const actor = await requireAuth();
    const workspaceId = await requireWorkspace();

    const payload = await parseJsonBody(request, ReportRequestSchema);
    
    if (!payload.schedule || !payload.schedule.cron) {
      return apiError({
        code: "BAD_REQUEST",
        message: "A cron schedule is required for this endpoint.",
        status: 400,
      });
    }

    const templateRepo = new ReportTemplateRepository();
    const template = await templateRepo.findById(payload.templateId);

    if (!template) {
      return apiError({
        code: "NOT_FOUND",
        message: `Template with ID ${payload.templateId} not found`,
        status: 404,
      });
    }

    const schedulerService = new ReportSchedulerService(new ReportRepository());
    
    const scheduledReport = await schedulerService.schedule(
      workspaceId,
      actor.id,
      {
        title: payload.title || `Scheduled: ${template.name}`,
        description: payload.description || null,
        slug: `sched-${template.id}-${Date.now()}`,
        filters: { ...template.defaultFilters, ...payload.filters },
        cron: payload.schedule.cron,
      }
    );

    return apiSuccess(scheduledReport, { message: "Report schedule created successfully.", status: 201 });
  } catch (error) {
    return apiError({
      code: "INTERNAL_ERROR",
      message: error instanceof Error ? error.message : "Failed to schedule report",
      status: 500,
    });
  }
}
