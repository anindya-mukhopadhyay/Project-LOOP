import type { User, Role } from "@prisma/client";
import { MemberRepository } from "@/repositories/member.repository";
import { AuditRepository } from "@/repositories/audit.repository";
import { ServiceError, type ServiceResult } from "./errors";

export interface PaginatedMembers {
  members: User[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

export class MemberService {
  private memberRepository: MemberRepository;
  private auditRepository: AuditRepository;

  constructor(memberRepository = new MemberRepository(), auditRepository = new AuditRepository()) {
    this.memberRepository = memberRepository;
    this.auditRepository = auditRepository;
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
  ): Promise<ServiceResult<PaginatedMembers>> {
    try {
      const members = await this.memberRepository.listMembers(workspaceId, params);
      const total = await this.memberRepository.countMembers(workspaceId, params);

      return {
        ok: true,
        data: {
          members,
          total,
          page: params.page,
          perPage: params.perPage,
          totalPages: Math.ceil(total / params.perPage),
        },
      };
    } catch (error) {
      return {
        ok: false,
        error: new ServiceError(
          error instanceof Error ? error.message : "Failed to list members.",
          "INTERNAL_ERROR"
        ),
      };
    }
  }

  async updateMemberRole(
    workspaceId: string,
    actorId: string,
    targetUserId: string,
    role: Role
  ): Promise<ServiceResult<User>> {
    try {
      const actor = await this.memberRepository.findById(actorId);
      if (!actor || actor.workspaceId !== workspaceId || actor.role !== "ADMIN") {
        return {
          ok: false,
          error: new ServiceError("Only administrators can manage roles.", "FORBIDDEN"),
        };
      }

      const target = await this.memberRepository.findById(targetUserId);
      if (!target || target.workspaceId !== workspaceId) {
        return {
          ok: false,
          error: new ServiceError("Member not found in this workspace.", "NOT_FOUND"),
        };
      }

      // If demoting an Admin, ensure there's at least one other Admin
      if (target.role === "ADMIN" && role !== "ADMIN") {
        const adminCount = await this.memberRepository.countMembers(workspaceId, { role: "ADMIN" });
        if (adminCount <= 1) {
          return {
            ok: false,
            error: new ServiceError("Cannot demote the last administrator in the workspace.", "BAD_REQUEST"),
          };
        }
      }

      const updated = await this.memberRepository.updateRole(targetUserId, role);

      // Log Action
      await this.auditRepository.create({
        workspaceId,
        actorId,
        action: "UPDATE",
        entityType: "User",
        entityId: targetUserId,
        summary: `Role of ${target.name || target.email} updated to ${role} by ${actor.name || actor.email}`,
        before: target,
        after: updated,
      });

      return { ok: true, data: updated };
    } catch (error) {
      return {
        ok: false,
        error: new ServiceError(
          error instanceof Error ? error.message : "Failed to update member role.",
          "INTERNAL_ERROR"
        ),
      };
    }
  }

  async toggleSuspension(
    workspaceId: string,
    actorId: string,
    targetUserId: string
  ): Promise<ServiceResult<User>> {
    try {
      const actor = await this.memberRepository.findById(actorId);
      if (!actor || actor.workspaceId !== workspaceId || actor.role !== "ADMIN") {
        return {
          ok: false,
          error: new ServiceError("Only administrators can suspend members.", "FORBIDDEN"),
        };
      }

      if (targetUserId === actorId) {
        return {
          ok: false,
          error: new ServiceError("You cannot suspend your own account.", "BAD_REQUEST"),
        };
      }

      const target = await this.memberRepository.findById(targetUserId);
      if (!target || target.workspaceId !== workspaceId) {
        return {
          ok: false,
          error: new ServiceError("Member not found in this workspace.", "NOT_FOUND"),
        };
      }

      const targetMetadata = (target.metadata as Record<string, unknown>) || {};
      const isCurrentlySuspended = Boolean(targetMetadata.suspended);
      const newSuspendedState = !isCurrentlySuspended;

      // If suspending an Admin, ensure there's at least one other active Admin
      if (target.role === "ADMIN" && newSuspendedState) {
        const admins = await this.memberRepository.listMembers(workspaceId, {
          role: "ADMIN",
          page: 1,
          perPage: 100,
        });
        const activeAdminsCount = admins.filter((u) => !(u.metadata as Record<string, unknown>)?.suspended).length;

        if (activeAdminsCount <= 1) {
          return {
            ok: false,
            error: new ServiceError("Cannot suspend the last active administrator.", "BAD_REQUEST"),
          };
        }
      }

      const updated = await this.memberRepository.updateSuspendedState(targetUserId, newSuspendedState);

      // Log Action
      await this.auditRepository.create({
        workspaceId,
        actorId,
        action: "UPDATE",
        entityType: "User",
        entityId: targetUserId,
        summary: `${target.name || target.email} was ${newSuspendedState ? "suspended" : "activated"} by ${actor.name || actor.email}`,
        before: target,
        after: updated,
      });

      return { ok: true, data: updated };
    } catch (error) {
      return {
        ok: false,
        error: new ServiceError(
          error instanceof Error ? error.message : "Failed to toggle member suspension state.",
          "INTERNAL_ERROR"
        ),
      };
    }
  }

  async removeMember(
    workspaceId: string,
    actorId: string,
    targetUserId: string
  ): Promise<ServiceResult<User>> {
    try {
      const actor = await this.memberRepository.findById(actorId);
      if (!actor || actor.workspaceId !== workspaceId || actor.role !== "ADMIN") {
        return {
          ok: false,
          error: new ServiceError("Only administrators can remove members.", "FORBIDDEN"),
        };
      }

      if (targetUserId === actorId) {
        return {
          ok: false,
          error: new ServiceError("You cannot remove your own account from the workspace.", "BAD_REQUEST"),
        };
      }

      const target = await this.memberRepository.findById(targetUserId);
      if (!target || target.workspaceId !== workspaceId) {
        return {
          ok: false,
          error: new ServiceError("Member not found in this workspace.", "NOT_FOUND"),
        };
      }

      // If removing an Admin, ensure there's at least one other Admin remaining
      if (target.role === "ADMIN") {
        const admins = await this.memberRepository.listMembers(workspaceId, {
          role: "ADMIN",
          page: 1,
          perPage: 100,
        });
        const activeAdminsCount = admins.filter((u) => !(u.metadata as Record<string, unknown>)?.suspended).length;

        if (activeAdminsCount <= 1) {
          return {
            ok: false,
            error: new ServiceError("Cannot remove the last active administrator.", "BAD_REQUEST"),
          };
        }
      }

      const updated = await this.memberRepository.removeMember(workspaceId, targetUserId);

      // Log Action
      await this.auditRepository.create({
        workspaceId,
        actorId,
        action: "DELETE",
        entityType: "User",
        entityId: targetUserId,
        summary: `${target.name || target.email} was removed by ${actor.name || actor.email}`,
        before: target,
        after: updated,
      });

      return { ok: true, data: updated };
    } catch (error) {
      return {
        ok: false,
        error: new ServiceError(
          error instanceof Error ? error.message : "Failed to remove member.",
          "INTERNAL_ERROR"
        ),
      };
    }
  }
}
