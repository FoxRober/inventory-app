import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Public paths that don't require authentication
  const isPublicPath = path === "/login";
  
  // Get the token from cookies
  const token = request.cookies.get("auth_session")?.value || "";
  
  // If the path is public but the user is already authenticated, redirect to dashboard
  if (isPublicPath && token) {
    return NextResponse.redirect(new URL("/", request.nextUrl));
  }
  
  // If the path is protected and the user is not authenticated, redirect to login
  if (!isPublicPath && !token) {
    // Exclude static files, images, api routes if any 
    if (!path.startsWith('/_next') && !path.startsWith('/api') && !path.includes('.')) {
        return NextResponse.redirect(new URL("/login", request.nextUrl));
    }
  }
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
