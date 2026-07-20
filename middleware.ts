import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { isAuthRoute, isProtectedRoute, isPublicRoute } from "@/lib/auth/routes";

export default auth((request) => {
  const { nextUrl } = request;
  const isAuthenticated = Boolean(request.auth);

  if (isAuthRoute(nextUrl.pathname)) {
    return NextResponse.next();
  }

  if (isAuthenticated && isPublicRoute(nextUrl.pathname)) {
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }

  if (!isAuthenticated && isProtectedRoute(nextUrl.pathname)) {
    const loginUrl = new URL("/login", nextUrl);
    loginUrl.searchParams.set("callbackUrl", `${nextUrl.pathname}${nextUrl.search}`);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
