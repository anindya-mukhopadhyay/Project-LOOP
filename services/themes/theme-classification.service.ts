import { ClassificationService } from "@/services/ai/classification.service";
import { Role } from "@prisma/client";

export class ThemeClassificationService {
  constructor(private readonly classificationService: ClassificationService = new ClassificationService()) {}

  async classifyFeedback(feedbackId: string, workspaceId: string, actorId: string, role: Role = "ADMIN"): Promise<void> {
    // Reuses the Phase 7 AI Engine for primary classification
    await this.classificationService.classifyFeedback(workspaceId, actorId, role, feedbackId);
  }
}
