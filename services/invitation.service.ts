import crypto from "crypto";
import type { Invitation, User } from "@prisma/client";
import { Role } from "@prisma/client";
import { InvitationRepository } from "@/repositories/invitation.repository";
import { MemberRepository } from "@/repositories/member.repository";
import { AuditRepository } from "@/repositories/audit.repository";
import { UserService } from "./user.service";
import { ServiceError, type ServiceResult } from "./errors";
import bcrypt from "bcryptjs";

export class InvitationService {
  private invitationRepository: InvitationRepository;
  private memberRepository: MemberRepository;
  private auditRepository: AuditRepository;
  private userService: UserService;

  constructor(
    invitationRepository = new InvitationRepository(),
    memberRepository = new MemberRepository(),
    auditRepository = new AuditRepository(),
    userService = new UserService()
  ) {
    this.invitationRepository = invitationRepository;
    this.memberRepository = memberRepository;
    this.auditRepository = auditRepository;
    this.userService = userService;
  }

  private hashToken(rawToken: string): string {
    return crypto.createHash("sha256").update(rawToken).digest("hex");
  }

  async listInvitations(workspaceId: string): Promise<ServiceResult<Invitation[]>> {
    try {
      const list = await this.invitationRepository.listByWorkspace(workspaceId);
      return { ok: true, data: list };
    } catch (error) {
      return {
        ok: false,
        error: new ServiceError(
          error instanceof Error ? error.message : "Failed to list invitations.",
          "INTERNAL_ERROR"
        ),
      };
    }
  }

  async inviteMember(
    workspaceId: string,
    actorId: string,
    email: string,
    role: Role
  ): Promise<ServiceResult<{ invitation: Invitation; rawToken: string }>> {
    try {
      const actor = await this.memberRepository.findById(actorId);
      if (!actor || actor.workspaceId !== workspaceId || actor.role !== "ADMIN") {
        return {
          ok: false,
          error: new ServiceError("Only administrators can invite new members.", "FORBIDDEN"),
        };
      }

      // Check if user is already a member
      const existingUser = await this.memberRepository.listMembers(workspaceId, {
        query: email,
        page: 1,
        perPage: 1,
      });
      if (existingUser.length > 0) {
        return {
          ok: false,
          error: new ServiceError("This user is already a member of the workspace.", "CONFLICT"),
        };
      }

      // Check if there is already a pending invitation
      const existingInvite = await this.invitationRepository.findPendingByEmailAndWorkspace(email, workspaceId);
      if (existingInvite) {
        return {
          ok: false,
          error: new ServiceError("An invitation is already pending for this email address.", "CONFLICT"),
        };
      }

      // Generate secure token
      const rawToken = crypto.randomBytes(32).toString("hex");
      const hashedToken = this.hashToken(rawToken);

      // Expiry in 7 days
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      const invitation = await this.invitationRepository.create({
        workspaceId,
        email,
        role,
        token: hashedToken,
        invitedById: actorId,
        expiresAt,
        status: "PENDING",
      });

      // Log action
      await this.auditRepository.create({
        workspaceId,
        actorId,
        action: "INVITE",
        entityType: "Invitation",
        entityId: invitation.id,
        summary: `${email} was invited as ${role} by ${actor.name || actor.email}`,
      });

      return {
        ok: true,
        data: { invitation, rawToken },
      };
    } catch (error) {
      return {
        ok: false,
        error: new ServiceError(
          error instanceof Error ? error.message : "Failed to invite member.",
          "INTERNAL_ERROR"
        ),
      };
    }
  }

  async resendInvitation(
    workspaceId: string,
    actorId: string,
    invitationId: string
  ): Promise<ServiceResult<{ invitation: Invitation; rawToken: string }>> {
    try {
      const actor = await this.memberRepository.findById(actorId);
      if (!actor || actor.workspaceId !== workspaceId || actor.role !== "ADMIN") {
        return {
          ok: false,
          error: new ServiceError("Only administrators can resend invitations.", "FORBIDDEN"),
        };
      }

      const invite = await this.invitationRepository.findById(invitationId);
      if (!invite || invite.workspaceId !== workspaceId) {
        return {
          ok: false,
          error: new ServiceError("Invitation not found.", "NOT_FOUND"),
        };
      }

      // Generate new token
      const rawToken = crypto.randomBytes(32).toString("hex");
      const hashedToken = this.hashToken(rawToken);

      // Extend expiration
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      const updated = await this.invitationRepository.update(invitationId, {
        token: hashedToken,
        expiresAt,
        status: "PENDING",
      });

      // Log action
      await this.auditRepository.create({
        workspaceId,
        actorId,
        action: "INVITE",
        entityType: "Invitation",
        entityId: invitationId,
        summary: `Invitation for ${invite.email} was resent by ${actor.name || actor.email}`,
      });

      return {
        ok: true,
        data: { invitation: updated, rawToken },
      };
    } catch (error) {
      return {
        ok: false,
        error: new ServiceError(
          error instanceof Error ? error.message : "Failed to resend invitation.",
          "INTERNAL_ERROR"
        ),
      };
    }
  }

  async cancelInvitation(
    workspaceId: string,
    actorId: string,
    invitationId: string
  ): Promise<ServiceResult<Invitation>> {
    try {
      const actor = await this.memberRepository.findById(actorId);
      if (!actor || actor.workspaceId !== workspaceId || actor.role !== "ADMIN") {
        return {
          ok: false,
          error: new ServiceError("Only administrators can cancel invitations.", "FORBIDDEN"),
        };
      }

      const invite = await this.invitationRepository.findById(invitationId);
      if (!invite || invite.workspaceId !== workspaceId) {
        return {
          ok: false,
          error: new ServiceError("Invitation not found.", "NOT_FOUND"),
        };
      }

      const updated = await this.invitationRepository.update(invitationId, {
        status: "REVOKED",
        revokedAt: new Date(),
      });

      // Log action
      await this.auditRepository.create({
        workspaceId,
        actorId,
        action: "DELETE",
        entityType: "Invitation",
        entityId: invitationId,
        summary: `Invitation for ${invite.email} was canceled by ${actor.name || actor.email}`,
      });

      return { ok: true, data: updated };
    } catch (error) {
      return {
        ok: false,
        error: new ServiceError(
          error instanceof Error ? error.message : "Failed to cancel invitation.",
          "INTERNAL_ERROR"
        ),
      };
    }
  }

  async verifyInvitationToken(rawToken: string): Promise<ServiceResult<Invitation>> {
    try {
      const hashedToken = this.hashToken(rawToken);
      const invite = await this.invitationRepository.findByHashedToken(hashedToken);

      if (!invite || invite.deletedAt) {
        return {
          ok: false,
          error: new ServiceError("Invalid or expired invitation token.", "NOT_FOUND"),
        };
      }

      if (invite.status !== "PENDING") {
        return {
          ok: false,
          error: new ServiceError(`Invitation status is currently ${invite.status}.`, "BAD_REQUEST"),
        };
      }

      if (invite.expiresAt < new Date()) {
        await this.invitationRepository.update(invite.id, { status: "EXPIRED" });
        return {
          ok: false,
          error: new ServiceError("Invitation token has expired.", "BAD_REQUEST"),
        };
      }

      return { ok: true, data: invite };
    } catch (error) {
      return {
        ok: false,
        error: new ServiceError(
          error instanceof Error ? error.message : "Failed to verify invitation token.",
          "INTERNAL_ERROR"
        ),
      };
    }
  }

  async acceptInvitation(
    rawToken: string,
    registration: { name?: string; password?: string }
  ): Promise<ServiceResult<{ user: User; invitation: Invitation }>> {
    try {
      const verifyResult = await this.verifyInvitationToken(rawToken);
      if (!verifyResult.ok) {
        return verifyResult;
      }

      const invite = verifyResult.data;

      // Check if user already exists
      const userResult = await this.userService.getUserByEmail(invite.email);
      let user: User;

      if (userResult.ok && userResult.data) {
        // User already has an account, update workspace mapping and role
        const existingUser = userResult.data;
        
        user = await this.memberRepository.updateWorkspaceAndRole(
          existingUser.id,
          invite.workspaceId,
          invite.role
        );
      } else {
        // User is signing up for the first time
        if (!registration.password) {
          return {
            ok: false,
            error: new ServiceError("Password is required to sign up.", "BAD_REQUEST"),
          };
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(registration.password, salt);

        const newUserResult = await this.userService.createUser(
          invite.email,
          registration.name,
          invite.role,
          invite.workspaceId,
          passwordHash
        );

        if (!newUserResult.ok) {
          return newUserResult;
        }

        user = newUserResult.data;
      }

      const invitation = await this.invitationRepository.update(invite.id, {
        status: "ACCEPTED",
        acceptedBy: { connect: { id: user.id } },
        acceptedAt: new Date(),
      });

      // Log action
      await this.auditRepository.create({
        workspaceId: invite.workspaceId,
        actorId: user.id,
        action: "CREATE",
        entityType: "User",
        entityId: user.id,
        summary: `${invite.email} accepted invitation and joined workspace.`,
      });

      return {
        ok: true,
        data: { user, invitation },
      };
    } catch (error) {
      return {
        ok: false,
        error: new ServiceError(
          error instanceof Error ? error.message : "Failed to accept invitation.",
          "INTERNAL_ERROR"
        ),
      };
    }
  }

  async rejectInvitation(rawToken: string): Promise<ServiceResult<Invitation>> {
    try {
      const verifyResult = await this.verifyInvitationToken(rawToken);
      if (!verifyResult.ok) {
        return verifyResult;
      }

      const invite = verifyResult.data;

      const updated = await this.invitationRepository.update(invite.id, {
        status: "REVOKED",
        revokedAt: new Date(),
      });

      // Log action
      await this.auditRepository.create({
        workspaceId: invite.workspaceId,
        action: "DELETE",
        entityType: "Invitation",
        entityId: invite.id,
        summary: `Invitation for ${invite.email} was rejected by recipient.`,
      });

      return { ok: true, data: updated };
    } catch (error) {
      return {
        ok: false,
        error: new ServiceError(
          error instanceof Error ? error.message : "Failed to reject invitation.",
          "INTERNAL_ERROR"
        ),
      };
    }
  }
}
