import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;

  // Public routes that don't require authentication
  const publicRoutes = ["/login", "/register", "/api/auth", "/api/register", "/api/intelligence/diagnose", "/api/intelligence/test", "/api/intelligence/models"];
  
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

  // Check for onboarding completion bypass cookie (set immediately after completion)
  const justCompletedCookie = req.cookies.get("onboarding_just_completed");
  const justCompletedParam = req.nextUrl.searchParams.get("just_completed");
  
  // If authenticated but onboarding not complete, redirect to onboarding
  // (unless already on onboarding route OR just completed)
  if (
    req.auth &&
    !req.auth.user.onboardingComplete &&
    !isOnboardingRoute &&
    !justCompletedCookie &&
    !justCompletedParam
  ) {
    return NextResponse.redirect(new URL("/onboarding", req.url));
  }

  // If just completed, clear the completion cookie and update response
  if (justCompletedCookie || justCompletedParam) {
    const response = NextResponse.next();
    
    // Clear the temporary cookie
    response.cookies.delete("onboarding_just_completed");
    
    // Remove the query parameter for cleaner URL
    if (justCompletedParam) {
      const url = req.nextUrl.clone();
      url.searchParams.delete("just_completed");
      return NextResponse.redirect(url);
    }
    
    return response;
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
