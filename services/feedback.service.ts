import { type Feedback, type FeedbackStatus, type Channel, type Sentiment, Role, type PrismaClient } from "@prisma/client";
import { FeedbackRepository } from "@/repositories/feedback.repository";
import { AuditService } from "./audit.service";
import { ServiceError, type ServiceResult } from "./errors";
import { prisma } from "@/lib/database";

export interface PaginatedFeedback {
  items: Feedback[];
  meta: {
    page: number;
    perPage: number;
    total: number;
    totalPages: number;
  };
}

export class FeedbackService {
  private feedbackRepository: FeedbackRepository;
  private auditService: AuditService;

  constructor(
    feedbackRepository = new FeedbackRepository(),
    auditService = new AuditService()
  ) {
    this.feedbackRepository = feedbackRepository;
    this.auditService = auditService;
  }

  private enforceWriteAccess(role: Role) {
    if (role === Role.VIEWER) {
      throw new ServiceError("Forbidden. Viewers cannot modify feedback resources.", "FORBIDDEN");
    }
  }

  private enforceAdminAccess(role: Role) {
    if (role !== Role.ADMIN) {
      throw new ServiceError("Forbidden. Only administrators can perform this operation.", "FORBIDDEN");
    }
  }

  async getFeedbackDetails(
    workspaceId: string,
    id: string
  ): Promise<ServiceResult<Feedback>> {
    try {
      const feedback = await this.feedbackRepository.findById(id, workspaceId);
      if (!feedback) {
        return {
          ok: false,
          error: new ServiceError("Feedback record not found.", "NOT_FOUND"),
        };
      }
      return { ok: true, data: feedback };
    } catch (error) {
      return {
        ok: false,
        error: new ServiceError(
          error instanceof Error ? error.message : "Failed to load feedback details.",
          "INTERNAL_ERROR"
        ),
      };
    }
  }

  async createFeedback(
    workspaceId: string,
    actorId: string,
    role: Role,
    data: {
      title: string;
      body: string;
      channel: Channel;
      status?: FeedbackStatus;
      externalId?: string | null;
      customerEmail?: string | null;
      customerName?: string | null;
      sourceUrl?: string | null;
      language?: string;
      priority?: number;
    }
  ): Promise<ServiceResult<Feedback>> {
    try {
      this.enforceWriteAccess(role);

      const feedback = await this.feedbackRepository.create({
        workspaceId,
        title: data.title,
        body: data.body,
        channel: data.channel,
        status: data.status || "NEW",
        externalId: data.externalId || null,
        customerEmail: data.customerEmail || null,
        customerName: data.customerName || null,
        sourceUrl: data.sourceUrl || null,
        language: data.language || "en",
        priority: data.priority || 0,
        createdById: actorId,
      });

      // Log Action
      await this.auditService.logAction({
        workspaceId,
        actorId,
        action: "CREATE",
        entityType: "Feedback",
        entityId: feedback.id,
        summary: `Feedback "${feedback.title}" created manually.`,
        after: feedback,
      });

      return { ok: true, data: feedback };
    } catch (error) {
      return {
        ok: false,
        error: error instanceof ServiceError ? error : new ServiceError(
          error instanceof Error ? error.message : "Failed to create feedback.",
          "INTERNAL_ERROR"
        ),
      };
    }
  }

  async updateFeedback(
    workspaceId: string,
    actorId: string,
    role: Role,
    id: string,
    data: {
      title?: string;
      body?: string;
      channel?: Channel;
      status?: FeedbackStatus;
      externalId?: string | null;
      customerEmail?: string | null;
      customerName?: string | null;
      sourceUrl?: string | null;
      language?: string;
      priority?: number;
      sentiment?: Sentiment;
      score?: number | null;
      metadata?: Record<string, unknown>;
      assignedToId?: string | null;
      lastUpdatedAt?: string;
    }
  ): Promise<ServiceResult<Feedback>> {
    try {
      this.enforceWriteAccess(role);

      const existing = await this.feedbackRepository.findById(id, workspaceId);
      if (!existing) {
        return {
          ok: false,
          error: new ServiceError("Feedback record not found.", "NOT_FOUND"),
        };
      }

      // Optimistic Concurrency Control
      if (data.lastUpdatedAt) {
        const lastUpdated = new Date(data.lastUpdatedAt).getTime();
        const dbUpdated = new Date(existing.updatedAt).getTime();
        if (Math.abs(dbUpdated - lastUpdated) > 1000) {
          return {
            ok: false,
            error: new ServiceError("Conflict. The feedback record has been updated by another user.", "CONFLICT"),
          };
        }
      }

      // Setup timestamps
      const updates: Record<string, unknown> = { ...data };
      delete updates.lastUpdatedAt;

      if (data.status && data.status !== existing.status) {
        if (data.status === "REVIEWED") {
          updates.reviewedAt = new Date();
        } else if (data.status === "ACTIONED") {
          updates.actionedAt = new Date();
        }
      }

      const updated = await this.feedbackRepository.update(id, workspaceId, updates);

      // Log Action
      await this.auditService.logAction({
        workspaceId,
        actorId,
        action: "UPDATE",
        entityType: "Feedback",
        entityId: id,
        summary: `Feedback "${updated.title}" updated by staff.`,
        before: existing,
        after: updated,
      });

      return { ok: true, data: updated };
    } catch (error) {
      return {
        ok: false,
        error: error instanceof ServiceError ? error : new ServiceError(
          error instanceof Error ? error.message : "Failed to update feedback.",
          "INTERNAL_ERROR"
        ),
      };
    }
  }

  async softDeleteFeedback(
    workspaceId: string,
    actorId: string,
    role: Role,
    id: string
  ): Promise<ServiceResult<Feedback>> {
    try {
      this.enforceWriteAccess(role);

      const existing = await this.feedbackRepository.findById(id, workspaceId);
      if (!existing) {
        return {
          ok: false,
          error: new ServiceError("Feedback record not found.", "NOT_FOUND"),
        };
      }

      const deleted = await this.feedbackRepository.softDelete(id, workspaceId);

      // Log Action
      await this.auditService.logAction({
        workspaceId,
        actorId,
        action: "DELETE",
        entityType: "Feedback",
        entityId: id,
        summary: `Feedback "${existing.title}" was soft-deleted/archived.`,
      });

      return { ok: true, data: deleted };
    } catch (error) {
      return {
        ok: false,
        error: error instanceof ServiceError ? error : new ServiceError(
          error instanceof Error ? error.message : "Failed to delete feedback.",
          "INTERNAL_ERROR"
        ),
      };
    }
  }

  async restoreFeedback(
    workspaceId: string,
    actorId: string,
    role: Role,
    id: string
  ): Promise<ServiceResult<Feedback>> {
    try {
      this.enforceAdminAccess(role);

      const existing = await this.feedbackRepository.findById(id, workspaceId);
      if (!existing) {
        return {
          ok: false,
          error: new ServiceError("Feedback record not found.", "NOT_FOUND"),
        };
      }

      const restored = await this.feedbackRepository.restore(id, workspaceId);

      // Log Action
      await this.auditService.logAction({
        workspaceId,
        actorId,
        action: "UPDATE",
        entityType: "Feedback",
        entityId: id,
        summary: `Feedback "${existing.title}" was restored by admin.`,
      });

      return { ok: true, data: restored };
    } catch (error) {
      return {
        ok: false,
        error: error instanceof ServiceError ? error : new ServiceError(
          error instanceof Error ? error.message : "Failed to restore feedback.",
          "INTERNAL_ERROR"
        ),
      };
    }
  }

  async listFeedback(
    workspaceId: string,
    params: {
      query?: string;
      status?: FeedbackStatus;
      channel?: Channel;
      sentiment?: Sentiment;
      themeId?: string;
      startDate?: string;
      endDate?: string;
      page: number;
      perPage: number;
      sortBy: "createdAt" | "updatedAt" | "status" | "channel" | "customerName" | "customerEmail";
      sortOrder: "asc" | "desc";
      includeDeleted?: boolean;
    }
  ): Promise<ServiceResult<PaginatedFeedback>> {
    try {
      const startDate = params.startDate ? new Date(params.startDate) : undefined;
      const endDate = params.endDate ? new Date(params.endDate) : undefined;

      const filterOptions: {
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
      } = {
        page: params.page,
        perPage: params.perPage,
        sortBy: params.sortBy,
        sortOrder: params.sortOrder,
      };

      if (params.query !== undefined) filterOptions.query = params.query;
      if (params.status !== undefined) filterOptions.status = params.status;
      if (params.channel !== undefined) filterOptions.channel = params.channel;
      if (params.sentiment !== undefined) filterOptions.sentiment = params.sentiment;
      if (params.themeId !== undefined) filterOptions.themeId = params.themeId;
      if (params.includeDeleted !== undefined) filterOptions.includeDeleted = params.includeDeleted;
      if (startDate !== undefined) filterOptions.startDate = startDate;
      if (endDate !== undefined) filterOptions.endDate = endDate;

      const items = await this.feedbackRepository.listFeedback(workspaceId, filterOptions);
      const total = await this.feedbackRepository.countFeedback(workspaceId, filterOptions);


      return {
        ok: true,
        data: {
          items,
          meta: {
            page: params.page,
            perPage: params.perPage,
            total,
            totalPages: Math.ceil(total / params.perPage),
          },
        },
      };
    } catch (error) {
      return {
        ok: false,
        error: new ServiceError(
          error instanceof Error ? error.message : "Failed to retrieve feedback list.",
          "INTERNAL_ERROR"
        ),
      };
    }
  }

  async bulkOperations(
    workspaceId: string,
    actorId: string,
    role: Role,
    params: {
      ids: string[];
      action: "STATUS_UPDATE" | "DELETE" | "RESTORE";
      status?: FeedbackStatus;
    }
  ): Promise<ServiceResult<{ count: number }>> {
    try {
      if (params.action === "RESTORE") {
        this.enforceAdminAccess(role);
      } else {
        this.enforceWriteAccess(role);
      }

      let count = 0;

      await prisma.$transaction(async (tx) => {
        const repo = new FeedbackRepository({}, tx as unknown as PrismaClient);
        
        if (params.action === "STATUS_UPDATE") {
          if (!params.status) throw new ServiceError("Status parameter is required for STATUS_UPDATE.", "BAD_REQUEST");
          const res = await repo.bulkUpdateStatus(workspaceId, params.ids, params.status);
          count = res.count;
        } else if (params.action === "DELETE") {
          const res = await repo.bulkSoftDelete(workspaceId, params.ids);
          count = res.count;
        } else if (params.action === "RESTORE") {
          const res = await repo.bulkRestore(workspaceId, params.ids);
          count = res.count;
        }
      });

      // Log Action
      await this.auditService.logAction({
        workspaceId,
        actorId,
        action: params.action === "DELETE" ? "DELETE" : "UPDATE",
        entityType: "Feedback",
        summary: `Bulk action "${params.action}" performed on ${count} feedback items.`,
      });

      return { ok: true, data: { count } };
    } catch (error) {
      return {
        ok: false,
        error: error instanceof ServiceError ? error : new ServiceError(
          error instanceof Error ? error.message : "Failed to execute bulk operations.",
          "INTERNAL_ERROR"
        ),
      };
    }
  }
}
