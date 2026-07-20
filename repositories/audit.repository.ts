import { BaseRepository, type RepositoryContext } from "./base.repository";
import type { AuditLog, Prisma, PrismaClient } from "@prisma/client";

export class AuditRepository extends BaseRepository {
  constructor(context?: RepositoryContext, db?: PrismaClient) {
    super(context, db);
  }

  async create(data: Prisma.AuditLogUncheckedCreateInput): Promise<AuditLog> {
    return this.db.auditLog.create({
      data,
    });
  }

  async listByWorkspace(
    workspaceId: string,
    limit = 10
  ): Promise<
    (AuditLog & {
      actor: {
        id: string;
        name: string | null;
        email: string;
      } | null;
    })[]
  > {

    return this.db.auditLog.findMany({
      where: {
        workspaceId,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
      include: {
        actor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }
}
