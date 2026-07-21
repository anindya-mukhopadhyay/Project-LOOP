/* eslint-disable @typescript-eslint/no-explicit-any */
 
import { NextRequest, NextResponse } from "next/server";
import { ThemeRelationshipService } from "@/services/themes/theme-relationship.service";
import { SplitThemeRequestSchema } from "@/schemas/theme.schema";
import { requireAuth, requireWorkspace } from "@/lib/auth/session";

export async function POST(req: NextRequest) {
  try {
    await requireAuth();
    const workspaceId = await requireWorkspace();

    const body = await req.json();
    const result = SplitThemeRequestSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: result.error.issues }, { status: 400 });
    }

    // In a real app we would create the new themes first and get their IDs.
    // Stubbing this logic.
    const newThemeIds = ["stub-id-1", "stub-id-2"];

    const relationshipService = new ThemeRelationshipService();
    await relationshipService.splitTheme(result.data.sourceThemeId, newThemeIds, workspaceId);

    return NextResponse.json({ success: true, newThemeIds });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
