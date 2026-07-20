import { BaseRepository, type RepositoryContext } from "./base.repository";
import type { User, Role, Prisma, PrismaClient } from "@prisma/client";

export class MemberRepository extends BaseRepository {
  constructor(context?: RepositoryContext, db?: PrismaClient) {
    super(context, db);
  }

  async listMembers(
    workspaceId: string,
    params: {
      query?: string;
      role?: Role;
      page: number;
      perPage: number;
      sortBy?: "name" | "email" | "role" | "createdAt";
      sortOrder?: "asc" | "desc";
    }
  ): Promise<User[]> {
    const { query, role, page, perPage, sortBy = "name", sortOrder = "asc" } = params;

    const whereClause: Prisma.UserWhereInput = {
      workspaceId,
      deletedAt: null,
    };

    if (role) {
      whereClause.role = role;
    }

    if (query) {
      whereClause.OR = [
        { name: { contains: query, mode: "insensitive" } },
        { email: { contains: query, mode: "insensitive" } },
      ];
    }

    const skip = (page - 1) * perPage;

    return this.db.user.findMany({
      where: whereClause,
      orderBy: {
        [sortBy]: sortOrder,
      },
      skip,
      take: perPage,
    });
  }

  async countMembers(
    workspaceId: string,
    params: {
      query?: string;
      role?: Role;
    }
  ): Promise<number> {
    const { query, role } = params;

    const whereClause: Prisma.UserWhereInput = {
      workspaceId,
      deletedAt: null,
    };

    if (role) {
      whereClause.role = role;
    }

    if (query) {
      whereClause.OR = [
        { name: { contains: query, mode: "insensitive" } },
        { email: { contains: query, mode: "insensitive" } },
      ];
    }

    return this.db.user.count({
      where: whereClause,
    });
  }

  async getWorkspaceOwner(workspaceId: string): Promise<User | null> {
    // Treat the oldest Admin as the owner
    return this.db.user.findFirst({
      where: {
        workspaceId,
        role: "ADMIN",
        deletedAt: null,
      },
      orderBy: {
        createdAt: "asc",
      },
    });
  }

  async findById(id: string): Promise<User | null> {
    return this.db.user.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });
  }

  async updateRole(id: string, role: Role): Promise<User> {
    return this.db.user.update({
      where: { id },
      data: { role },
    });
  }

  async updateSuspendedState(id: string, suspended: boolean): Promise<User> {
    const user = await this.findById(id);
    if (!user) throw new Error("User not found");

    const metadata = (user.metadata as Record<string, unknown>) || {};
    metadata.suspended = suspended;


    return this.db.user.update({
      where: { id },
      data: { metadata: metadata as Prisma.InputJsonValue },
    });

  }

  async removeMember(workspaceId: string, userId: string): Promise<User> {
    return this.db.user.update({
      where: {
        id: userId,
        workspaceId,
      },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  async updateWorkspaceAndRole(userId: string, workspaceId: string, role: Role): Promise<User> {
    return this.db.user.update({
      where: { id: userId },
      data: {
        workspaceId,
        role,
        deletedAt: null,
      },
    });
  }
}
