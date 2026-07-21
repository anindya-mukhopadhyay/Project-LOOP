/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextRequest, NextResponse } from "next/server";
import { ThemeIntelligenceService } from "@/services/themes/theme-intelligence.service";
import { requireAuth, requireWorkspace } from "@/lib/auth/session"; // Assumed existing standard

export async function GET(_req: NextRequest) {
  try {
    // Assuming workspaceId is extracted from auth or search params
    await requireAuth();
    const workspaceId = await requireWorkspace();

    const intelligenceService = new ThemeIntelligenceService();
    const data = await intelligenceService.getDashboardIntelligence(workspaceId);

    return NextResponse.json({ data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
