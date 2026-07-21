/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from "@/lib/database";
import { Prisma, Conversation, Message, MessageRole } from "@prisma/client";

// Define a type for a Conversation that includes its messages
export type ConversationWithMessages = Prisma.ConversationGetPayload<{
  include: {
    messages: true;
  };
}>;

export class ConversationRepository {
  async createConversation(workspaceId: string, userId: string, title: string): Promise<Conversation> {
    return prisma.conversation.create({
      data: {
        workspaceId,
        userId,
        title,
      },
    });
  }

  async getConversation(conversationId: string, workspaceId: string): Promise<ConversationWithMessages | null> {
    return prisma.conversation.findFirst({
      where: {
        id: conversationId,
        workspaceId,
        deletedAt: null,
      },
      include: {
        messages: {
          where: { deletedAt: null },
          orderBy: { createdAt: 'asc' },
        },
      },
    });
  }

  async listConversations(workspaceId: string, userId: string): Promise<Conversation[]> {
    return prisma.conversation.findMany({
      where: {
        workspaceId,
        userId,
        deletedAt: null,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });
  }

  async addMessage(data: {
    workspaceId: string;
    conversationId: string;
    userId?: string;
    role: MessageRole;
    content: string;
    citations?: any;
    metadata?: any;
  }): Promise<Message> {
    return prisma.message.create({
      data: {
        workspaceId: data.workspaceId,
        conversationId: data.conversationId,
        userId: data.userId || null,
        role: data.role,
        content: data.content,
        citations: data.citations || [],
        metadata: data.metadata || {},
      },
    });
  }
}
