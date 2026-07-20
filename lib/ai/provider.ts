export type AiProviderCapability =
  "classification" | "embedding" | "theme-clustering" | "rag-chat" | "summarization";

export type AiProviderHealth = {
  provider: string;
  capabilities: AiProviderCapability[];
  ready: boolean;
};

export interface AiProvider {
  readonly name: string;
  readonly capabilities: AiProviderCapability[];
  health(): Promise<AiProviderHealth>;
}
