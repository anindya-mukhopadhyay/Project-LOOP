import type { AIProvider } from "../ai-provider.interface";
import type { NormalizedAiResponse, AiProviderType } from "@/schemas/ai.schema";

export class GeminiProvider implements AIProvider {
  get name(): AiProviderType {
    return "gemini";
  }

  async classify(_text: string, _systemPrompt: string): Promise<NormalizedAiResponse> {
    throw new Error("GeminiProvider not fully implemented. Use MockProvider for testing.");
  }
}
