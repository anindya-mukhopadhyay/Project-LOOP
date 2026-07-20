import type { User, Role, Prisma } from "@prisma/client";
import { UserRepository } from "@/repositories/user.repository";
import { ServiceError, type ServiceResult } from "./errors";

export class UserService {
  private userRepository: UserRepository;

  constructor(userRepository = new UserRepository()) {
    this.userRepository = userRepository;
  }

  async getUserByEmail(email: string): Promise<ServiceResult<User | null>> {
    try {
      const user = await this.userRepository.findByEmail(email);
      return { ok: true, data: user };
    } catch (error) {
      return {
        ok: false,
        error: new ServiceError(
          error instanceof Error ? error.message : "Failed to fetch user.",
          "INTERNAL_ERROR"
        ),
      };
    }
  }

  async createUser(
    email: string,
    name: string | undefined,
    role: Role,
    workspaceId: string,
    passwordHash: string
  ): Promise<ServiceResult<User>> {
    try {
      const existing = await this.userRepository.findByEmail(email);
      if (existing && existing.workspaceId === workspaceId) {
        return {
          ok: false,
          error: new ServiceError("User already exists in this workspace.", "CONFLICT"),
        };
      }

      const userData: Prisma.UserUncheckedCreateInput = {
        email,
        role,
        workspaceId,
        metadata: { passwordHash },
      };

      if (name !== undefined) {
        userData.name = name;
      }

      const user = await this.userRepository.create(userData);


      return { ok: true, data: user };
    } catch (error) {
      return {
        ok: false,
        error: new ServiceError(
          error instanceof Error ? error.message : "Failed to create user.",
          "INTERNAL_ERROR"
        ),
      };
    }
  }
}
