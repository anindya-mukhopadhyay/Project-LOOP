/* eslint-disable @typescript-eslint/no-unused-vars */
import type { AIProvider } from "../ai-provider.interface";
import type { NormalizedAiResponse, AiProviderType } from "@/schemas/ai.schema";

export class OpenAIProvider implements AIProvider {
  get name(): AiProviderType {
    return "openai";
  }

  async classify(_text: string, _systemPrompt: string): Promise<NormalizedAiResponse> {
    // In a real implementation, this would call the OpenAI SDK.
    // For Phase 7, we are defining the abstraction layer.
    
    throw new Error("OpenAIProvider not fully implemented. Use MockProvider for testing.");
  }
}
