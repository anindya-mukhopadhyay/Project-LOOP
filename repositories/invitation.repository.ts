import { BaseRepository, type RepositoryContext } from "./base.repository";
import type { Invitation, Prisma, PrismaClient } from "@prisma/client";

export class InvitationRepository extends BaseRepository {
  constructor(context?: RepositoryContext, db?: PrismaClient) {
    super(context, db);
  }

  async findById(id: string): Promise<Invitation | null> {
    return this.db.invitation.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });
  }

  async findByHashedToken(hashedToken: string): Promise<Invitation | null> {
    return this.db.invitation.findUnique({
      where: {
        token: hashedToken,
      },
    });
  }

  async findPendingByEmailAndWorkspace(email: string, workspaceId: string): Promise<Invitation | null> {
    return this.db.invitation.findFirst({
      where: {
        email,
        workspaceId,
        status: "PENDING",
        deletedAt: null,
      },
    });
  }

  async listByWorkspace(workspaceId: string): Promise<Invitation[]> {
    return this.db.invitation.findMany({
      where: {
        workspaceId,
        deletedAt: null,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        invitedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async create(data: Prisma.InvitationUncheckedCreateInput): Promise<Invitation> {
    return this.db.invitation.create({
      data,
    });
  }

  async update(id: string, data: Prisma.InvitationUpdateInput): Promise<Invitation> {
    return this.db.invitation.update({
      where: { id },
      data,
    });
  }
}
