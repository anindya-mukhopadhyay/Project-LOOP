/* eslint-disable @typescript-eslint/no-explicit-any */
 
import { NextRequest, NextResponse } from "next/server";
import { ThemeClassificationService } from "@/services/themes/theme-classification.service";
import { ReclassifyThemeRequestSchema } from "@/schemas/theme.schema";
import { requireAuth, requireWorkspace } from "@/lib/auth/session";

export async function POST(req: NextRequest) {
  try {
    const actor = await requireAuth();
    const workspaceId = await requireWorkspace();

    const body = await req.json();
    const result = ReclassifyThemeRequestSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: result.error.issues }, { status: 400 });
    }

    const classificationService = new ThemeClassificationService();
    // We would reassign in DB then re-evaluate
    for (const feedbackId of result.data.feedbackIds) {
      await classificationService.classifyFeedback(feedbackId, workspaceId, actor.id, actor.role);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
