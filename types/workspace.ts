import type { AppRole } from "@/types/auth";

export type WorkspaceContext = {
  workspaceId: string;
  slug: string;
  role: AppRole;
};
