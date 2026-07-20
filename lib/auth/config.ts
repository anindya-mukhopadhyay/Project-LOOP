import type { NextAuthConfig } from "next-auth";

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
    session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }

      return session;
    },
  },
} satisfies NextAuthConfig;
