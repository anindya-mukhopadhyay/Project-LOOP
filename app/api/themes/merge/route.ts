/* eslint-disable @typescript-eslint/no-explicit-any */
 
import { NextRequest, NextResponse } from "next/server";
import { ThemeIntelligenceService } from "@/services/themes/theme-intelligence.service";
import { MergeThemesRequestSchema } from "@/schemas/theme.schema";
import { requireAuth, requireWorkspace } from "@/lib/auth/session";

export async function POST(req: NextRequest) {
  try {
    await requireAuth();
    const workspaceId = await requireWorkspace();

    const body = await req.json();
    const result = MergeThemesRequestSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: result.error.issues }, { status: 400 });
    }

    const intelligenceService = new ThemeIntelligenceService();
    await intelligenceService.mergeThemes(result.data.sourceThemeIds, result.data.targetThemeId, workspaceId);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
