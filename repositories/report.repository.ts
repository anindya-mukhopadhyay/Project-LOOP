import { BaseRepository, type RepositoryContext } from "./base.repository";
import type { Report, ReportStatus, Prisma, PrismaClient } from "@prisma/client";

export class ReportRepository extends BaseRepository {
  constructor(context?: RepositoryContext, db?: PrismaClient) {
    super(context, db);
  }

  async findById(id: string, workspaceId: string): Promise<Report | null> {
    return this.db.report.findFirst({
      where: {
        id,
        workspaceId,
        deletedAt: null,
      },
    });
  }

  async findBySlug(slug: string, workspaceId: string): Promise<Report | null> {
    return this.db.report.findFirst({
      where: {
        slug,
        workspaceId,
        deletedAt: null,
      },
    });
  }

  async create(data: Prisma.ReportUncheckedCreateInput): Promise<Report> {
    return this.db.report.create({
      data,
    });
  }

  async update(id: string, workspaceId: string, data: Prisma.ReportUpdateInput): Promise<Report> {
    return this.db.report.update({
      where: {
        id,
        workspaceId,
      },
      data,
    });
  }

  async updateStatus(id: string, workspaceId: string, status: ReportStatus): Promise<Report> {
    return this.db.report.update({
      where: {
        id,
        workspaceId,
      },
      data: {
        status,
        ...(status === "READY" ? { generatedAt: new Date() } : {}),
      },
    });
  }

  async softDelete(id: string, workspaceId: string): Promise<Report> {
    return this.db.report.update({
      where: {
        id,
        workspaceId,
      },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  async listReports(
    workspaceId: string,
    params: {
      status?: ReportStatus;
      page: number;
      perPage: number;
    }
  ): Promise<Report[]> {
    const skip = (params.page - 1) * params.perPage;

    const where: Prisma.ReportWhereInput = {
      workspaceId,
      deletedAt: null,
      ...(params.status ? { status: params.status } : {}),
    };

    return this.db.report.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: params.perPage,
    });
  }

  async countReports(
    workspaceId: string,
    params: {
      status?: ReportStatus;
    }
  ): Promise<number> {
    const where: Prisma.ReportWhereInput = {
      workspaceId,
      deletedAt: null,
      ...(params.status ? { status: params.status } : {}),
    };

    return this.db.report.count({
      where,
    });
  }
}
