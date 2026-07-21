/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextRequest, NextResponse } from "next/server";
import { ThemeAnalyticsService } from "@/services/themes/theme-analytics.service";
import { ThemeRepository } from "@/repositories/theme.repository";
import { requireAuth, requireWorkspace } from "@/lib/auth/session";

export async function GET(_req: NextRequest) {
  try {
    await requireAuth();
    const workspaceId = await requireWorkspace();

    const themeRepo = new ThemeRepository();
    const analyticsService = new ThemeAnalyticsService();

    const themes = await themeRepo.findAll(workspaceId);
    
    const trends = await Promise.all(
      themes.map(async (t) => {
        const analytics = await analyticsService.getAnalyticsForTheme(t.id, workspaceId);
        return { themeId: t.id, weeklyGrowth: analytics.weeklyGrowth, monthlyGrowth: analytics.monthlyGrowth, trendVelocity: analytics.trendVelocity };
      })
    );

    return NextResponse.json({ data: trends });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
