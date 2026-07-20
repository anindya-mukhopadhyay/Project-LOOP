import type { PrismaClient } from "@prisma/client";

import { prisma } from "@/lib/database";

export type RepositoryContext = {
  requestId?: string;
  actorId?: string;
  workspaceId?: string;
};

export abstract class BaseRepository {
  protected constructor(
    protected readonly context: RepositoryContext = {},
    protected readonly db: PrismaClient = prisma,
  ) {}
}
