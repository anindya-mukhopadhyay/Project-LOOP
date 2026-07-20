export const publicRoutes = ["/login", "/signup", "/forgot-password", "/verify-email"] as const;

export const protectedRoutePrefixes = [
  "/dashboard",
  "/feedback",
  "/themes",
  "/analytics",
  "/ask",
  "/reports",
  "/workspace",
  "/members",
  "/settings",
  "/profile",
  "/notifications",
  "/admin",
] as const;

export function isAuthRoute(pathname: string) {
  return pathname.startsWith("/api/auth");
}

export function isPublicRoute(pathname: string) {
  return publicRoutes.some((route) => route === pathname);
}

export function isProtectedRoute(pathname: string) {
  return protectedRoutePrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}
