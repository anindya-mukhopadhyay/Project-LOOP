export type AppRole = "owner" | "admin" | "manager" | "analyst" | "member" | "viewer";

export type Permission =
  | "workspace:read"
  | "workspace:update"
  | "members:manage"
  | "feedback:read"
  | "feedback:write"
  | "analytics:read"
  | "reports:read"
  | "reports:write"
  | "settings:manage";

export type AuthenticatedActor = {
  id: string;
  email: string;
  name?: string;
  workspaceId?: string;
  role: AppRole;
  permissions: Permission[];
};
