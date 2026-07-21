import { ProviderRegistry } from "./provider-registry.service";
import { PromptService } from "./prompt.service";
import { AiMetricsService } from "./ai-metrics.service";
import { RetryService } from "./retry.service";
import type { NormalizedAiResponse, AiProviderType } from "@/schemas/ai.schema";
import { ServiceError, type ServiceResult } from "../errors";

export class AIService {
  private providerRegistry: ProviderRegistry;
  private promptService: PromptService;
  private metricsService: AiMetricsService;
  private retryService: RetryService;

  constructor(
    providerRegistry = new ProviderRegistry(),
    promptService = new PromptService(),
    metricsService = new AiMetricsService(),
    retryService = new RetryService()
  ) {
    this.providerRegistry = providerRegistry;
    this.promptService = promptService;
    this.metricsService = metricsService;
    this.retryService = retryService;
  }

  /**
   * Classifies a feedback item using the configured AI provider.
   * Handles prompt retrieval, provider execution, retries, and cost tracking.
   */
  async classifyFeedback(
    text: string,
    providerName?: AiProviderType
  ): Promise<ServiceResult<NormalizedAiResponse>> {
    try {
      const provider = providerName 
        ? this.providerRegistry.getProvider(providerName)
        : this.providerRegistry.getDefaultProvider();

      // We use getClassificationPrompt to also fetch the version
      const { prompt: systemPrompt, version: promptVersion } = this.promptService.getClassificationPrompt();

      // Execute with retry logic
      const response = await this.retryService.withRetry(async () => {
        return provider.classify(text, systemPrompt);
      });

      // Inject prompt version
      response.promptVersion = promptVersion;
      // Inject classification version (could be tied to system code versions)
      response.classificationVersion = "1.0.0";

      // Augment the response with calculated cost if it wasn't provided directly by the SDK
      if (!response.estimatedCost || response.estimatedCost === 0) {
        response.estimatedCost = this.metricsService.calculateCost(
          response.provider as AiProviderType,
          response.model,
          response.tokens, // Using total tokens as a rough estimate for the mock
          Math.floor(response.tokens * 0.3) // Assuming output is 30% of input length
        );
      }

      return { ok: true, data: response };
    } catch (error) {
      return {
        ok: false,
        error: error instanceof ServiceError ? error : new ServiceError(
          error instanceof Error ? error.message : "AI classification failed",
          "INTERNAL_ERROR"
        ),
      };
    }
  }

  // Future methods for Phase 8 and Phase 9:
  // async generateThemes(...) 
  // async generateEmbeddings(...)
}
