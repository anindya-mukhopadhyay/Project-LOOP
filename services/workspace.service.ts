import { Prisma } from "@prisma/client";
import type { Workspace, AuditLog, Role } from "@prisma/client";
import { WorkspaceRepository } from "@/repositories/workspace.repository";
import { MemberRepository } from "@/repositories/member.repository";
import { InvitationRepository } from "@/repositories/invitation.repository";
import { AuditRepository } from "@/repositories/audit.repository";
import { ServiceError, type ServiceResult } from "./errors";

export interface WorkspaceDashboardData {
  workspace: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    logoUrl: string | null;
    domain: string | null;
    createdAt: Date;
    plan: string;
    preferences: Record<string, unknown>;
  };
  currentUserRole: Role;
  owner: {
    id: string;
    name: string | null;
    email: string;
  } | null;
  counts: {
    members: number;
    pendingInvitations: number;
    feedbackPlaceholder: number;
    aiCreditsPlaceholder: number;
    storageUsedPlaceholder: number; // in MB
  };
  timeline: (AuditLog & {
    actor: {
      id: string;
      name: string | null;
      email: string;
    } | null;
  })[];
}

export class WorkspaceService {
  private workspaceRepository: WorkspaceRepository;
  private memberRepository: MemberRepository;
  private invitationRepository: InvitationRepository;
  private auditRepository: AuditRepository;

  constructor(
    workspaceRepository = new WorkspaceRepository(),
    memberRepository = new MemberRepository(),
    invitationRepository = new InvitationRepository(),
    auditRepository = new AuditRepository()
  ) {
    this.workspaceRepository = workspaceRepository;
    this.memberRepository = memberRepository;
    this.invitationRepository = invitationRepository;
    this.auditRepository = auditRepository;
  }

  async createWorkspace(name: string, slug: string): Promise<ServiceResult<Workspace>> {
    try {
      const existing = await this.workspaceRepository.findBySlug(slug);
      if (existing) {
        return {
          ok: false,
          error: new ServiceError("Workspace slug is already in use.", "CONFLICT"),
        };
      }

      const workspace = await this.workspaceRepository.create({
        name,
        slug,
      });

      return { ok: true, data: workspace };
    } catch (error) {
      return {
        ok: false,
        error: new ServiceError(
          error instanceof Error ? error.message : "Failed to create workspace.",
          "INTERNAL_ERROR"
        ),
      };
    }
  }

  async getWorkspaceBySlug(slug: string): Promise<ServiceResult<Workspace | null>> {
    try {
      const workspace = await this.workspaceRepository.findBySlug(slug);
      return { ok: true, data: workspace };
    } catch (error) {
      return {
        ok: false,
        error: new ServiceError(
          error instanceof Error ? error.message : "Failed to fetch workspace.",
          "INTERNAL_ERROR"
        ),
      };
    }
  }

  async getWorkspaceDashboard(
    workspaceId: string,
    actorId: string
  ): Promise<ServiceResult<WorkspaceDashboardData>> {
    try {
      // 1. Fetch Workspace
      const workspace = await this.workspaceRepository.findById(workspaceId);
      if (!workspace) {
        return {
          ok: false,
          error: new ServiceError("Workspace not found.", "NOT_FOUND"),
        };
      }

      // 2. Fetch actor to verify their role in this workspace
      const actor = await this.memberRepository.findById(actorId);
      if (!actor || actor.workspaceId !== workspaceId) {
        return {
          ok: false,
          error: new ServiceError("Forbidden. Actor does not belong to this workspace.", "FORBIDDEN"),
        };
      }

      // 3. Fetch owner info (oldest admin)
      const owner = await this.memberRepository.getWorkspaceOwner(workspaceId);

      // 4. Fetch counts
      const membersCount = await this.memberRepository.countMembers(workspaceId, {});
      
      const pendingInvites = await this.invitationRepository.listByWorkspace(workspaceId);
      const pendingCount = pendingInvites.filter((inv) => inv.status === "PENDING").length;

      // 5. Fetch timeline (recent 10 actions)
      const timeline = await this.auditRepository.listByWorkspace(workspaceId, 10);

      const metadata = (workspace.metadata as Record<string, unknown>) || {};
      const description = (metadata.description as string) || null;
      const logoUrl = (metadata.logoUrl as string) || null;

      const dashboardData: WorkspaceDashboardData = {
        workspace: {
          id: workspace.id,
          name: workspace.name,
          slug: workspace.slug,
          description,
          logoUrl,
          domain: workspace.domain,
          createdAt: workspace.createdAt,
          plan: workspace.plan,
          preferences: metadata,
        },
        currentUserRole: actor.role,
        owner: owner
          ? {
              id: owner.id,
              name: owner.name,
              email: owner.email,
            }
          : null,
        counts: {
          members: membersCount,
          pendingInvitations: pendingCount,
          feedbackPlaceholder: 128, // Mocked feedback count placeholder
          aiCreditsPlaceholder: 450, // Mocked AI credits count placeholder
          storageUsedPlaceholder: 12.4, // Mocked Storage usage placeholder (in MB)
        },
        timeline,
      };

      return { ok: true, data: dashboardData };
    } catch (error) {
      return {
        ok: false,
        error: new ServiceError(
          error instanceof Error ? error.message : "Failed to load workspace dashboard.",
          "INTERNAL_ERROR"
        ),
      };
    }
  }

  async updateWorkspace(
    workspaceId: string,
    actorId: string,
    data: {
      name: string;
      description?: string | null;
      logoUrl?: string | null;
      domain?: string | null;
      preferences?: Record<string, unknown>;
    }
  ): Promise<ServiceResult<Workspace>> {
    try {
      // 1. Verify actor has permissions
      const actor = await this.memberRepository.findById(actorId);
      if (!actor || actor.workspaceId !== workspaceId) {
        return {
          ok: false,
          error: new ServiceError("Forbidden.", "FORBIDDEN"),
        };
      }

      if (actor.role !== "ADMIN") {
        return {
          ok: false,
          error: new ServiceError("Only workspace administrators can update settings.", "FORBIDDEN"),
        };
      }

      // 2. Fetch current workspace to compare for audit logs
      const currentWorkspace = await this.workspaceRepository.findById(workspaceId);
      if (!currentWorkspace) {
        return {
          ok: false,
          error: new ServiceError("Workspace not found.", "NOT_FOUND"),
        };
      }

      // 3. Update workspace
      const currentMetadata = (currentWorkspace.metadata as Record<string, unknown>) || {};
      const newMetadata = {
        ...currentMetadata,
        description: data.description !== undefined ? data.description : currentMetadata.description,
        logoUrl: data.logoUrl !== undefined ? data.logoUrl : currentMetadata.logoUrl,
        ...(data.preferences || {}),
      };

      const updated = await this.workspaceRepository.update(workspaceId, {
        name: data.name,
        domain: data.domain !== undefined ? data.domain : currentWorkspace.domain,
        metadata: newMetadata as Prisma.InputJsonValue,
      });

      // 4. Log Action
      await this.auditRepository.create({
        workspaceId,
        actorId,
        action: "UPDATE",
        entityType: "Workspace",
        entityId: workspaceId,
        summary: `Workspace settings updated by ${actor.name || actor.email}`,
        before: currentWorkspace,
        after: updated,
      });

      return { ok: true, data: updated };
    } catch (error) {
      return {
        ok: false,
        error: new ServiceError(
          error instanceof Error ? error.message : "Failed to update workspace settings.",
          "INTERNAL_ERROR"
        ),
      };
    }
  }
}
