import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

import { authConfig } from "@/lib/auth/config";
import { loginSchema } from "@/schemas/auth.schema";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) {
          return null;
        }

        const { email, password } = parsed.data;

        // Dynamic import to avoid bundling Node/Prisma code into Edge runtime / middleware
        const { AuthService } = await import("@/services/auth.service");
        const authService = new AuthService();

        const result = await authService.authenticate(email, password);
        if (!result.ok || !result.data) {
          return null;
        }

        const user = result.data;
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          workspaceId: user.workspaceId,
          role: user.role,
        };
      },
    }),
  ],
});
