import type { AIProvider } from "@/lib/ai/ai-provider.interface";
import { MockProvider } from "@/lib/ai/providers/mock.provider";
import { OpenAIProvider } from "@/lib/ai/providers/openai.provider";
import { ClaudeProvider } from "@/lib/ai/providers/claude.provider";
import { GeminiProvider } from "@/lib/ai/providers/gemini.provider";
import type { AiProviderType } from "@/schemas/ai.schema";
import { ServiceError } from "../errors";

export class ProviderRegistry {
  private providers: Map<AiProviderType, AIProvider>;

  constructor() {
    this.providers = new Map<AiProviderType, AIProvider>();
    this.register(new MockProvider());
    this.register(new OpenAIProvider());
    this.register(new ClaudeProvider());
    this.register(new GeminiProvider());
  }

  private register(provider: AIProvider) {
    this.providers.set(provider.name, provider);
  }

  getProvider(name: AiProviderType): AIProvider {
    const provider = this.providers.get(name);
    if (!provider) {
      throw new ServiceError(`AI Provider '${name}' is not registered.`, "BAD_REQUEST");
    }
    return provider;
  }

  listProviders(): AIProvider[] {
    return Array.from(this.providers.values());
  }

  getDefaultProvider(): AIProvider {
    // Default to mock for development/testing, or could be driven by environment variables
    const defaultName = (process.env.DEFAULT_AI_PROVIDER as AiProviderType) || "mock";
    return this.getProvider(defaultName);
  }
}
