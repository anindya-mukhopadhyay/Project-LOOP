import type { DefaultSession } from "next-auth";
import type { AppRole } from "@/types/auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      workspaceId?: string;
      role?: AppRole;
    } & DefaultSession["user"];
  }
}
