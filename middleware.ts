import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;

  // Public routes that don't require authentication
  const publicRoutes = ["/login", "/register", "/api/auth", "/api/register"];
  
  // Onboarding routes (authenticated but allowed even if onboarding incomplete)
  const onboardingRoutes = ["/onboarding", "/api/onboarding"];

  // Check if current path is public or onboarding
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));
  const isOnboardingRoute = onboardingRoutes.some((route) => pathname.startsWith(route));

  if (!req.auth && !isPublicRoute) {
    // Redirect to login if not authenticated
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If authenticated but onboarding not complete, redirect to onboarding
  // (unless already on onboarding route)
  if (
    req.auth &&
    !req.auth.user.onboardingComplete &&
    !isOnboardingRoute
  ) {
    return NextResponse.redirect(new URL("/onboarding", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
