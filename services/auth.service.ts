import bcrypt from "bcryptjs";
import type { User, Workspace } from "@prisma/client";
import { Role } from "@prisma/client";
import { UserService } from "./user.service";
import { WorkspaceService } from "./workspace.service";
import { ServiceError, type ServiceResult } from "./errors";

export class AuthService {
  private userService: UserService;
  private workspaceService: WorkspaceService;

  constructor(userService = new UserService(), workspaceService = new WorkspaceService()) {
    this.userService = userService;
    this.workspaceService = workspaceService;
  }

  async signup(
    email: string,
    passwordSecret: string,
    workspaceName: string,
    name?: string
  ): Promise<ServiceResult<{ user: User; workspace: Workspace }>> {
    try {
      // 1. Check if email is already taken
      const userExistsResult = await this.userService.getUserByEmail(email);
      if (!userExistsResult.ok) {
        return userExistsResult;
      }
      if (userExistsResult.data) {
        return {
          ok: false,
          error: new ServiceError("Email address is already in use.", "CONFLICT"),
        };
      }

      // 2. Generate slug from workspace name
      let slug = workspaceName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

      if (!slug) {
        slug = "workspace";
      }

      // Check if slug exists, if so append random characters
      const existingWorkspaceResult = await this.workspaceService.getWorkspaceBySlug(slug);
      if (existingWorkspaceResult.ok && existingWorkspaceResult.data) {
        slug = `${slug}-${Math.random().toString(36).substring(2, 6)}`;
      }

      // 3. Create Workspace
      const workspaceResult = await this.workspaceService.createWorkspace(workspaceName, slug);
      if (!workspaceResult.ok) {
        return workspaceResult;
      }
      const workspace = workspaceResult.data;

      // 4. Hash Password
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(passwordSecret, salt);

      // 5. Create First User (ADMIN) in the new Workspace
      const userResult = await this.userService.createUser(
        email,
        name,
        Role.ADMIN,
        workspace.id,
        passwordHash
      );
      if (!userResult.ok) {
        return userResult;
      }
      const user = userResult.data;

      return {
        ok: true,
        data: { user, workspace },
      };
    } catch (error) {
      return {
        ok: false,
        error: new ServiceError(
          error instanceof Error ? error.message : "Failed during user signup.",
          "INTERNAL_ERROR"
        ),
      };
    }
  }

  async authenticate(email: string, passwordSecret: string): Promise<ServiceResult<User | null>> {
    try {
      const userResult = await this.userService.getUserByEmail(email);
      if (!userResult.ok || !userResult.data) {
        return { ok: true, data: null };
      }

      const user = userResult.data;
      const metadata = user.metadata as Record<string, unknown> | null;
      const passwordHash = metadata?.passwordHash;

      if (typeof passwordHash !== "string") {
        return { ok: true, data: null };
      }

      const isValid = await bcrypt.compare(passwordSecret, passwordHash);
      if (!isValid) {
        return { ok: true, data: null };
      }

      return { ok: true, data: user };
    } catch (error) {
      return {
        ok: false,
        error: new ServiceError(
          error instanceof Error ? error.message : "Failed during authentication.",
          "INTERNAL_ERROR"
        ),
      };
    }
  }
}
