import type { AppRole, Permission } from "@/types/auth";

export const rolePermissions: Record<AppRole, Permission[]> = {
  ADMIN: [
    "workspace:read",
    "workspace:update",
    "members:manage",
    "feedback:read",
    "feedback:write",
    "analytics:read",
    "reports:read",
    "reports:write",
    "settings:manage",
  ],
  ANALYST: [
    "workspace:read",
    "feedback:read",
    "analytics:read",
    "reports:read",
  ],
  VIEWER: [
    "workspace:read",
    "feedback:read",
    "analytics:read",
  ],
};

export function hasPermission(role: AppRole, permission: Permission) {
  return rolePermissions[role]?.includes(permission) ?? false;
}

