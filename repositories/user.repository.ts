import { BaseRepository, type RepositoryContext } from "./base.repository";
import type { User, Prisma, PrismaClient } from "@prisma/client";

export class UserRepository extends BaseRepository {
  constructor(context?: RepositoryContext, db?: PrismaClient) {
    super(context, db);
  }


  async findByEmail(email: string): Promise<User | null> {

    return this.db.user.findFirst({
      where: {
        email,
        deletedAt: null,
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

  async create(data: Prisma.UserUncheckedCreateInput): Promise<User> {
    return this.db.user.create({
      data,
    });
  }

  async update(id: string, data: Prisma.UserUpdateInput): Promise<User> {
    return this.db.user.update({
      where: { id },
      data,
    });
  }
}
