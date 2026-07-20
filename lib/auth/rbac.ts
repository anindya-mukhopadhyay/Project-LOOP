import type { AppRole, Permission } from "@/types/auth";

export const rolePermissions: Record<AppRole, Permission[]> = {
  owner: [
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
  admin: [
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
  manager: [
    "workspace:read",
    "feedback:read",
    "feedback:write",
    "analytics:read",
    "reports:read",
    "reports:write",
  ],
  analyst: ["workspace:read", "feedback:read", "analytics:read", "reports:read"],
  member: ["workspace:read", "feedback:read", "feedback:write", "analytics:read"],
  viewer: ["workspace:read", "feedback:read", "analytics:read", "reports:read"],
};

export function hasPermission(role: AppRole, permission: Permission) {
  return rolePermissions[role].includes(permission);
}
