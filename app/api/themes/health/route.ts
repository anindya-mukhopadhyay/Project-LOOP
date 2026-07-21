/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextRequest, NextResponse } from "next/server";
import { ThemeHealthService } from "@/services/themes/theme-health.service";
import { ThemeRepository } from "@/repositories/theme.repository";
import { requireAuth, requireWorkspace } from "@/lib/auth/session";

export async function GET(_req: NextRequest) {
  try {
    await requireAuth();
    const workspaceId = await requireWorkspace();

    const themeRepo = new ThemeRepository();
    const healthService = new ThemeHealthService();

    const themes = await themeRepo.findAll(workspaceId);
    
    const healthData = themes.map(t => healthService.calculateHealth(t.metadata as any, t.updatedAt));

    return NextResponse.json({ data: healthData });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
