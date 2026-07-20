import { BaseRepository, type RepositoryContext } from "./base.repository";
import type { Workspace, Prisma, PrismaClient } from "@prisma/client";

export class WorkspaceRepository extends BaseRepository {
  constructor(context?: RepositoryContext, db?: PrismaClient) {
    super(context, db);
  }


  async findById(id: string): Promise<Workspace | null> {

    return this.db.workspace.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });
  }

  async findBySlug(slug: string): Promise<Workspace | null> {
    return this.db.workspace.findFirst({
      where: {
        slug,
        deletedAt: null,
      },
    });
  }

  async create(data: Prisma.WorkspaceCreateInput): Promise<Workspace> {
    return this.db.workspace.create({
      data,
    });
  }

  async update(id: string, data: Prisma.WorkspaceUpdateInput): Promise<Workspace> {
    return this.db.workspace.update({
      where: { id },
      data,
    });
  }
}
