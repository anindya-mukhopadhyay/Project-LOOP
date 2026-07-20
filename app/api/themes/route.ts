import { apiSuccess, apiError } from "@/lib/utils/api";
import { requireAuth, requireWorkspace } from "@/lib/auth/session";
import { prisma } from "@/lib/database";

export async function GET() {
  try {
    await requireAuth();
    const workspaceId = await requireWorkspace();

    const themes = await prisma.theme.findMany({
      where: {
        workspaceId,
        deletedAt: null,
      },
      orderBy: {
        name: "asc",
      },
    });

    return apiSuccess(themes);
  } catch (error) {
    return apiError({
      code: "INTERNAL_ERROR",
      message: error instanceof Error ? error.message : "Failed to load themes.",
      status: 500,
    });
  }
}
