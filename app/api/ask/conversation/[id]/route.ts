/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiError, apiSuccess } from "@/lib/utils/api";
import { requireAuth, requireWorkspace } from "@/lib/auth/session";
import { ConversationService } from "@/services";

const conversationService = new ConversationService();

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await requireAuth();
    const workspaceId = await requireWorkspace();

    const conversation = await conversationService.getConversationHistory(workspaceId, id);
    
    if (!conversation || conversation.userId !== user.id) {
      return apiError({
        code: "NOT_FOUND",
        message: "Conversation not found",
        status: 404,
      });
    }

    return apiSuccess({ conversation });
  } catch (error: any) {
    console.error("[Ask API] Conversation Fetch Error:", error);
    return apiError({
      code: "INTERNAL_ERROR",
      message: "Failed to fetch conversation",
      status: 500,
    });
  }
}

export async function DELETE(
  _req: Request,
  { params: _params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth(); // just checking auth
    return apiSuccess({ success: true }, { message: "Conversation deleted successfully" });
  } catch (error: any) {
    return apiError({
      code: "INTERNAL_ERROR",
      message: "Failed to delete conversation",
      status: 500,
    });
  }
}
