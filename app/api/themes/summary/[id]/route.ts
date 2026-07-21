/* eslint-disable @typescript-eslint/no-explicit-any */
 
import { NextRequest, NextResponse } from "next/server";
import { ThemeSummaryService } from "@/services/themes/theme-summary.service";
import { requireAuth, requireWorkspace } from "@/lib/auth/session";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await requireAuth();
    const workspaceId = await requireWorkspace();

    const summaryService = new ThemeSummaryService();
    
    // In a real app we might just return the pre-generated metadata summary
    // If it's empty, we might trigger a generation
    await summaryService.generateSummary(id, workspaceId);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
