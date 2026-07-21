import { apiError, apiSuccess } from "@/lib/utils/api";
import { requireAuth, requireWorkspace } from "@/lib/auth/session";
import { ReportTemplateRepository } from "@/repositories/report-template.repository";

export async function GET() {
  try {
    await requireAuth();
    await requireWorkspace();

    const templateRepo = new ReportTemplateRepository();
    const templates = await templateRepo.findAll();

    return apiSuccess(templates);
  } catch (error) {
    return apiError({
      code: "INTERNAL_ERROR",
      message: error instanceof Error ? error.message : "Failed to list templates",
      status: 500,
    });
  }
}
