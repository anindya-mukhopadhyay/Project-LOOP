/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiError, apiSuccess } from "@/lib/utils/api";
import { requireAuth, requireWorkspace } from "@/lib/auth/session";
import { ConversationService } from "@/services";

const conversationService = new ConversationService();

export async function GET(_req: Request) {
  try {
    const user = await requireAuth();
    const workspaceId = await requireWorkspace();

    const conversations = await conversationService.getConversations(workspaceId, user.id);

    return apiSuccess({ conversations });
  } catch (error: any) {
    console.error("[Ask API] History Error:", error);
    return apiError({
      code: "INTERNAL_ERROR",
      message: "Failed to fetch conversation history",
      status: 500,
    });
  }
}
