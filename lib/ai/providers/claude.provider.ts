/* eslint-disable @typescript-eslint/no-unused-vars */
import type { AIProvider } from "../ai-provider.interface";
import type { NormalizedAiResponse, AiProviderType } from "@/schemas/ai.schema";

export class ClaudeProvider implements AIProvider {
  get name(): AiProviderType {
    return "claude";
  }

  async classify(_text: string, _systemPrompt: string): Promise<NormalizedAiResponse> {
    throw new Error("ClaudeProvider not fully implemented. Use MockProvider for testing.");
  }
}
