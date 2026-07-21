/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextRequest, NextResponse } from "next/server";
import { ThemeRepository } from "@/repositories/theme.repository";
import { requireAuth, requireWorkspace } from "@/lib/auth/session";

export async function GET(_req: NextRequest) {
  try {
    await requireAuth();
    const workspaceId = await requireWorkspace();

    const themeRepo = new ThemeRepository();
    const themes = await themeRepo.findAll(workspaceId);
    
    // For relationships, we just extract the metadata.relationships
    const relationships = themes.map(t => ({
      themeId: t.id,
      relationships: (t.metadata as any)?.relationships || {}
    }));

    return NextResponse.json({ data: relationships });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
