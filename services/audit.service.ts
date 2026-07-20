import { Prisma } from "@prisma/client";
import type { AuditLog, AuditAction } from "@prisma/client";
import { AuditRepository } from "@/repositories/audit.repository";
import { ServiceError, type ServiceResult } from "./errors";

export class AuditService {
  private auditRepository: AuditRepository;

  constructor(auditRepository = new AuditRepository()) {
    this.auditRepository = auditRepository;
  }

  async logAction(params: {
    workspaceId: string;
    actorId?: string;
    action: AuditAction;
    entityType: string;
    entityId?: string;
    summary: string;
    before?: unknown;
    after?: unknown;
    ipAddress?: string;
    userAgent?: string;
    metadata?: Record<string, unknown>;
  }): Promise<ServiceResult<AuditLog>> {
    try {
      const auditLog = await this.auditRepository.create({
        workspaceId: params.workspaceId,
        actorId: params.actorId || null,
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId || null,
        summary: params.summary,
        before: (params.before as Prisma.InputJsonValue) ?? Prisma.JsonNull,
        after: (params.after as Prisma.InputJsonValue) ?? Prisma.JsonNull,
        ipAddress: params.ipAddress || null,
        userAgent: params.userAgent || null,
        metadata: (params.metadata as Prisma.InputJsonValue) ?? {},
      });
      return { ok: true, data: auditLog };
    } catch (error) {
      return {
        ok: false,
        error: new ServiceError(
          error instanceof Error ? error.message : "Failed to create audit log.",
          "INTERNAL_ERROR"
        ),
      };
    }
  }

  async getWorkspaceTimeline(
    workspaceId: string,
    limit = 10
  ): Promise<
    ServiceResult<
      (AuditLog & {
        actor: {
          id: string;
          name: string | null;
          email: string;
        } | null;
      })[]
    >
  > {

    try {
      const logs = await this.auditRepository.listByWorkspace(workspaceId, limit);
      return { ok: true, data: logs };
    } catch (error) {
      return {
        ok: false,
        error: new ServiceError(
          error instanceof Error ? error.message : "Failed to load audit timeline.",
          "INTERNAL_ERROR"
        ),
      };
    }
  }
}
