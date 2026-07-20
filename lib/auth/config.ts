import type { NextAuthConfig } from "next-auth";
import type { AppRole } from "@/types/auth";

export const authConfig = {
  ...(process.env.AUTH_SECRET ? { secret: process.env.AUTH_SECRET } : {}),
  trustHost: process.env.AUTH_TRUST_HOST === "true" || process.env.VERCEL === "1",
  pages: {
    signIn: "/login",
    error: "/login",
    newUser: "/signup",
    verifyRequest: "/verify-email",
  },
  session: {
    strategy: "jwt",
  },
  providers: [],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        const typedUser = user as { id?: string; workspaceId?: string; role?: AppRole };
        token.id = typedUser.id;
        token.workspaceId = typedUser.workspaceId;
        token.role = typedUser.role;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.workspaceId = token.workspaceId as string;
        session.user.role = token.role as AppRole;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;

