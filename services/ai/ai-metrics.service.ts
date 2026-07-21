import { AuditService } from "../audit.service";
import type { AiProviderType, AiErrorCategory } from "@/schemas/ai.schema";

export class AiMetricsService {
  private auditService: AuditService;

  constructor(auditService = new AuditService()) {
    this.auditService = auditService;
  }

  /**
   * Calculate the estimated cost for a given request.
   */
  calculateCost(_provider: AiProviderType, model: string, inputTokens: number, outputTokens: number): number {
    const pricing: Record<string, { in: number; out: number }> = {
      "mock-v1": { in: 0.0000, out: 0.0000 },
      "gpt-4o": { in: 0.0050, out: 0.0150 },
      "claude-3-5-sonnet": { in: 0.0030, out: 0.0150 },
      "gemini-1.5-pro": { in: 0.0035, out: 0.0105 },
    };

    const rate = pricing[model] || pricing["mock-v1"] || { in: 0, out: 0 };
    const inputCost = (inputTokens / 1000) * rate.in;
    const outputCost = (outputTokens / 1000) * rate.out;

    return inputCost + outputCost;
  }

  /**
   * Log Provider Health & AI Quality Metrics to AuditLog
   * This prepares data for the future AI Dashboard to aggregate.
   */
  async logMetrics(
    workspaceId: string,
    actorId: string,
    provider: AiProviderType,
    metrics: {
      success: boolean;
      latency: number;
      confidence?: number;
      cost?: number;
      errorCategory?: AiErrorCategory;
    }
  ): Promise<void> {
    await this.auditService.logAction({
      workspaceId,
      actorId,
      action: "CLASSIFY",
      entityType: "AiMetrics",
      entityId: provider,
      summary: `AI Provider Metrics for ${provider}: ${metrics.success ? "SUCCESS" : "FAILURE"}`,
      metadata: metrics as unknown as Record<string, unknown>
    });
  }
}
