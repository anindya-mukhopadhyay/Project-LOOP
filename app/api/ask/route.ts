/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiError, apiSuccess } from "@/lib/utils/api";
import { requireAuth, requireWorkspace } from "@/lib/auth/session";
import { AskRequestSchema } from "@/schemas/ask.schema";
import { ConversationService } from "@/services";
import { parseJsonBody } from "@/validators/request-validator";

const conversationService = new ConversationService();

export async function POST(req: Request) {
  try {
    const user = await requireAuth();
    const workspaceId = await requireWorkspace();

    const data = await parseJsonBody(req, AskRequestSchema);

    const response = await conversationService.askQuestion(
      workspaceId,
      user.id,
      data
    );

    return apiSuccess(response);
  } catch (error: any) {
    console.error("[Ask API] Error:", error);
    return apiError({
      code: "INTERNAL_ERROR",
      message: error.message || "Failed to generate answer",
      status: 500,
    });
  }
}
