import type { NormalizedAiResponse, AiProviderType } from "@/schemas/ai.schema";

export interface AIProvider {
  /**
   * The unique identifier for this provider implementation (e.g. "openai", "claude")
   */
  get name(): AiProviderType;

  /**
   * Classify feedback text into the structured NormalizedAiResponse format.
   * 
   * @param text The raw feedback text to analyze
   * @param systemPrompt The instructions for the AI
   * @returns Structured, normalized classification data
   */
  classify(text: string, systemPrompt: string): Promise<NormalizedAiResponse>;
}
