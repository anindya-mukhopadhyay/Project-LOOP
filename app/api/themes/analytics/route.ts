/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextRequest, NextResponse } from "next/server";
import { ThemeAnalyticsService } from "@/services/themes/theme-analytics.service";
import { ThemeHealthService } from "@/services/themes/theme-health.service";
import { ThemeRepository } from "@/repositories/theme.repository";
import { requireAuth, requireWorkspace } from "@/lib/auth/session";

export async function GET(_req: NextRequest) {
  try {
    await requireAuth();
    const workspaceId = await requireWorkspace();

    const themeRepo = new ThemeRepository();
    const analyticsService = new ThemeAnalyticsService();
    const healthService = new ThemeHealthService();

    const themes = await themeRepo.findAll(workspaceId);
    
    const analyticsData = await Promise.all(
      themes.map(async (t) => {
        const analytics = await analyticsService.getAnalyticsForTheme(t.id, workspaceId);
        const health = healthService.calculateHealth(t.metadata as any, t.updatedAt);
        return { themeId: t.id, analytics, health };
      })
    );

    return NextResponse.json({ data: analyticsData });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
