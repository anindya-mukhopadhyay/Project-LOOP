import { PromptService } from "@/services/ai/prompt.service";

export class PromptBuilderService {
  constructor(private readonly promptService = new PromptService()) {}

  buildAskPrompt(question: string, context: string, history: string): string {
    const { prompt: systemPrompt } = this.promptService.getAskLoopSystemPrompt();

    return `${systemPrompt}

${context}

--- CONVERSATION HISTORY ---
${history}

--- USER QUESTION ---
${question}

Answer:`;
  }
}
