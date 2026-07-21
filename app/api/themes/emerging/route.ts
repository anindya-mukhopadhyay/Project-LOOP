/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextRequest, NextResponse } from "next/server";
import { ThemeTrendService } from "@/services/themes/theme-trend.service";
import { requireAuth, requireWorkspace } from "@/lib/auth/session";

export async function GET(_req: NextRequest) {
  try {
    await requireAuth();
    const workspaceId = await requireWorkspace();

    const trendService = new ThemeTrendService();
    const data = await trendService.detectEmergingThemes(workspaceId);

    return NextResponse.json({ data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
