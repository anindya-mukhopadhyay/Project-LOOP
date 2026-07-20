import { auth } from "@/auth";
import { ServiceError } from "@/services/errors";
import type { AuthenticatedActor, Permission } from "@/types/auth";
import type { Role } from "@prisma/client";
import { hasPermission } from "./rbac";

export async function getCurrentSession() {
  return auth();
}

export async function getCurrentUserId() {
  const session = await getCurrentSession();
  return session?.user?.id ?? null;
}

export async function requireAuth(): Promise<AuthenticatedActor> {
  const session = await getCurrentSession();
  if (!session?.user || !session.user.id || !session.user.email) {
    throw new ServiceError("Unauthorized access. Please log in.", "UNAUTHORIZED");
  }

  const role = session.user.role as Role;
  if (!role) {
    throw new ServiceError("User role is missing from session.", "UNAUTHORIZED");
  }

  // Get permissions for the user role
  const { rolePermissions } = await import("./rbac");
  const permissions = rolePermissions[role] || [];

  return {
    id: session.user.id,
    email: session.user.email,
    role,
    permissions,
    ...(session.user.name ? { name: session.user.name } : {}),
    ...(session.user.workspaceId ? { workspaceId: session.user.workspaceId } : {}),
  };

}

export async function requireWorkspace(): Promise<string> {
  const actor = await requireAuth();
  if (!actor.workspaceId) {
    throw new ServiceError("Workspace context is missing.", "BAD_REQUEST");
  }
  return actor.workspaceId;
}

export async function requireRole(allowedRoles: Role[]): Promise<AuthenticatedActor> {
  const actor = await requireAuth();
  if (!allowedRoles.includes(actor.role)) {
    throw new ServiceError("Forbidden. Insufficient permissions.", "FORBIDDEN");
  }
  return actor;
}

export async function requirePermission(permission: Permission): Promise<AuthenticatedActor> {
  const actor = await requireAuth();
  if (!hasPermission(actor.role, permission)) {
    throw new ServiceError(`Forbidden. Missing required permission: ${permission}.`, "FORBIDDEN");
  }
  return actor;
}

export async function requireAdmin(): Promise<AuthenticatedActor> {
  const { Role } = await import("@prisma/client");
  return requireRole([Role.ADMIN]);
}

export async function requireAnalyst(): Promise<AuthenticatedActor> {
  const { Role } = await import("@prisma/client");
  return requireRole([Role.ADMIN, Role.ANALYST]);
}

export async function requireViewer(): Promise<AuthenticatedActor> {
  const { Role } = await import("@prisma/client");
  return requireRole([Role.ADMIN, Role.ANALYST, Role.VIEWER]);
}
