/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { ConversationRepository } from "@/repositories/conversation.repository";
import { Message } from "@prisma/client";

export class ConversationMemoryService {
  constructor(private readonly conversationRepo = new ConversationRepository()) {}

  async getFormattedHistory(conversationId: string, workspaceId: string): Promise<string> {
    const conversation = await this.conversationRepo.getConversation(conversationId, workspaceId);
    if (!conversation) return "";

    return this.getContextWindow(conversation.messages);
  }

  getContextWindow(messages: any[], limit: number = 10): string {
    // Advanced Context Window Management:
    // This could involve token counting (tiktoken), dropping middle messages, or summarization.
    // Stub implementation keeps last N messages.
    const recent = messages.slice(-limit);
    return recent.map((m: any) => `${m.role}: ${m.content}`).join("\n\n");
  }

  async summarizeMemory(_conversationId: string, _workspaceId: string): Promise<string> {
    // Triggers an LLM call to summarize the conversation so far, replacing older messages
    // to maintain context limits while preserving key facts.
    // Stub implementation.
    return "Summary of past topics discussed...";
  }

  async saveUserMessage(workspaceId: string, conversationId: string, userId: string, content: string): Promise<Message> {
    return this.conversationRepo.addMessage({
      workspaceId,
      conversationId,
      userId,
      role: "USER",
      content,
    });
  }

  async saveAssistantMessage(workspaceId: string, conversationId: string, content: string, citations: any[]): Promise<Message> {
    return this.conversationRepo.addMessage({
      workspaceId,
      conversationId,
      role: "ASSISTANT",
      content,
      citations,
    });
  }
}
