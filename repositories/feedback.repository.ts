import { BaseRepository, type RepositoryContext } from "./base.repository";
import type { Feedback, Channel, FeedbackStatus, Sentiment, Prisma, PrismaClient } from "@prisma/client";

export class FeedbackRepository extends BaseRepository {
  constructor(context?: RepositoryContext, db?: PrismaClient) {
    super(context, db);
  }

  async findById(id: string, workspaceId: string): Promise<Feedback | null> {
    return this.db.feedback.findFirst({
      where: {
        id,
        workspaceId,
      },
      include: {
        feedbackTheme: {
          include: {
            theme: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async create(data: Prisma.FeedbackUncheckedCreateInput): Promise<Feedback> {
    return this.db.feedback.create({
      data,
    });
  }

  async update(id: string, workspaceId: string, data: Prisma.FeedbackUpdateInput): Promise<Feedback> {
    return this.db.feedback.update({
      where: {
        id,
        workspaceId,
      },
      data,
    });
  }

  async softDelete(id: string, workspaceId: string): Promise<Feedback> {
    return this.db.feedback.update({
      where: {
        id,
        workspaceId,
      },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  async restore(id: string, workspaceId: string): Promise<Feedback> {
    return this.db.feedback.update({
      where: {
        id,
        workspaceId,
      },
      data: {
        deletedAt: null,
      },
    });
  }

  private buildWhereClause(
    workspaceId: string,
    params: {
      query?: string;
      status?: FeedbackStatus;
      channel?: Channel;
      sentiment?: Sentiment;
      themeId?: string;
      startDate?: Date;
      endDate?: Date;
      includeDeleted?: boolean;
    }
  ): Prisma.FeedbackWhereInput {
    const { query, status, channel, sentiment, themeId, startDate, endDate, includeDeleted = false } = params;

    const where: Prisma.FeedbackWhereInput = {
      workspaceId,
      ...(!includeDeleted ? { deletedAt: null } : {}),
    };

    if (status) where.status = status;
    if (channel) where.channel = channel;
    if (sentiment) where.sentiment = sentiment;

    if (themeId) {
      where.feedbackTheme = {
        some: {
          themeId,
        },
      };
    }

    if (startDate || endDate) {
      where.receivedAt = {
        ...(startDate ? { gte: startDate } : {}),
        ...(endDate ? { lte: endDate } : {}),
      };
    }

    if (query) {
      where.OR = [
        { title: { contains: query, mode: "insensitive" } },
        { body: { contains: query, mode: "insensitive" } },
        { customerName: { contains: query, mode: "insensitive" } },
        { customerEmail: { contains: query, mode: "insensitive" } },
        { externalId: { contains: query, mode: "insensitive" } },
        { sourceUrl: { contains: query, mode: "insensitive" } },
      ];
    }

    return where;
  }

  async listFeedback(
    workspaceId: string,
    params: {
      query?: string;
      status?: FeedbackStatus;
      channel?: Channel;
      sentiment?: Sentiment;
      themeId?: string;
      startDate?: Date;
      endDate?: Date;
      page: number;
      perPage: number;
      sortBy: "createdAt" | "updatedAt" | "status" | "channel" | "customerName" | "customerEmail";
      sortOrder: "asc" | "desc";
      includeDeleted?: boolean;
    }
  ): Promise<Feedback[]> {
    const where = this.buildWhereClause(workspaceId, params);
    const skip = (params.page - 1) * params.perPage;

    // Handle sort mappings if not directly columns
    const orderBy: Prisma.FeedbackOrderByWithRelationInput = {
      [params.sortBy]: params.sortOrder,
    };

    return this.db.feedback.findMany({
      where,
      orderBy,
      skip,
      take: params.perPage,
      include: {
        feedbackTheme: {
          include: {
            theme: true,
          },
        },
      },
    });
  }

  async countFeedback(
    workspaceId: string,
    params: {
      query?: string;
      status?: FeedbackStatus;
      channel?: Channel;
      sentiment?: Sentiment;
      themeId?: string;
      startDate?: Date;
      endDate?: Date;
      includeDeleted?: boolean;
    }
  ): Promise<number> {
    const where = this.buildWhereClause(workspaceId, params);
    return this.db.feedback.count({
      where,
    });
  }

  async bulkUpdateStatus(workspaceId: string, ids: string[], status: FeedbackStatus): Promise<Prisma.BatchPayload> {
    return this.db.feedback.updateMany({
      where: {
        id: { in: ids },
        workspaceId,
      },
      data: {
        status,
        ...(status === "REVIEWED" ? { reviewedAt: new Date() } : {}),
        ...(status === "ACTIONED" ? { actionedAt: new Date() } : {}),
      },
    });
  }

  async bulkSoftDelete(workspaceId: string, ids: string[]): Promise<Prisma.BatchPayload> {
    return this.db.feedback.updateMany({
      where: {
        id: { in: ids },
        workspaceId,
      },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  async bulkRestore(workspaceId: string, ids: string[]): Promise<Prisma.BatchPayload> {
    return this.db.feedback.updateMany({
      where: {
        id: { in: ids },
        workspaceId,
        deletedAt: { not: null },
      },
      data: {
        deletedAt: null,
      },
    });
  }

  async createMany(data: Prisma.FeedbackUncheckedCreateInput[]): Promise<Prisma.BatchPayload> {
    return this.db.feedback.createMany({
      data,
    });
  }

  async findExistingExternalIds(workspaceId: string, channel: Channel, externalIds: string[]): Promise<string[]> {
    const records = await this.db.feedback.findMany({
      where: {
        workspaceId,
        channel,
        externalId: { in: externalIds },
      },
      select: {
        externalId: true,
      },
    });

    return records.map((r) => r.externalId).filter((id): id is string => id !== null);
  }
}
