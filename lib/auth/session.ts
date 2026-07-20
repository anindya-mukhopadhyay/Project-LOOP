import { auth } from "@/auth";

export async function getCurrentSession() {
  return auth();
}

export async function getCurrentUserId() {
  const session = await getCurrentSession();
  return session?.user?.id ?? null;
}
