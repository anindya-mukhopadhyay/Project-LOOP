import { apiError, apiSuccess } from "@/lib/utils/api";
import { requireAuth, requireWorkspace } from "@/lib/auth/session";
import { AIRepository } from "@/repositories/ai.repository";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    const workspaceId = await requireWorkspace();

    const { id } = await params;

    if (!id) {
      return apiError({
        code: "VALIDATION_ERROR",
        message: "Feedback ID required",
        status: 400
      });
    }

    const aiRepository = new AIRepository();
    const metadata = await aiRepository.getFeedbackAiMetadata(id, workspaceId);

    if (!metadata) {
      // Default to PENDING if there's no metadata found
      return apiSuccess({ status: "PENDING" });
    }

    return apiSuccess(metadata);
  } catch (error) {
    return apiError({
      code: "INTERNAL_ERROR",
      message: error instanceof Error ? error.message : "Internal server error",
      status: 500
    });
  }
}
