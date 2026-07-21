/* eslint-disable @typescript-eslint/no-unused-vars */

export class SuggestedQuestionService {
  // constructor(private readonly _promptService = new PromptService()) {}

  async generateSuggestions(_answer: string, _context: string, _workspaceId: string): Promise<string[]> {
    // Normally would use promptService to prompt LLM for suggestions
    // Stub implementation
    return [
      "What changed compared to last month?",
      "Which channels contributed most?",
      "Show only critical feedback."
    ];
  }
}
