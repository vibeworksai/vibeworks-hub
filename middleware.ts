import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;

  // Public routes that don't require authentication
  const publicRoutes = ["/login", "/register", "/api/auth", "/api/register"];

  // Check if current path is public
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));

  if (!req.auth && !isPublicRoute) {
    // Redirect to login if not authenticated
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If authenticated but onboarding not complete, redirect to onboarding
  if (
    req.auth &&
    !req.auth.user.onboardingComplete &&
    pathname !== "/onboarding" &&
    !pathname.startsWith("/api")
  ) {
    return NextResponse.redirect(new URL("/onboarding", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
