// src/middleware.ts
// Next.js middleware — runs on EVERY request before rendering
// This is where we protect routes at the edge (fastest possible)
// Auth.js v5 provides auth() that works in middleware

import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { nextUrl, auth: session } = req;
  const isLoggedIn = !!session?.user;

  // Protected routes — require authentication
  const isProtectedRoute =
    nextUrl.pathname.startsWith("/dashboard") ||
    nextUrl.pathname.startsWith("/api/analyze-logs") ||
    nextUrl.pathname.startsWith("/api/generate-config") ||
    nextUrl.pathname.startsWith("/api/dashboard");

  // Auth routes — redirect if already logged in
  const isAuthRoute =
    nextUrl.pathname.startsWith("/auth/login") ||
    nextUrl.pathname.startsWith("/auth/register");

  if (isProtectedRoute && !isLoggedIn) {
    // Not logged in, redirect to login
    const loginUrl = new URL("/auth/login", nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthRoute && isLoggedIn) {
    // Already logged in, redirect to dashboard
    return NextResponse.redirect(new URL("/dashboard", nextUrl.origin));
  }

  return NextResponse.next();
});

// Configure which paths middleware runs on
// Excludes static files, images, and Next.js internals
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.svg$).*)",
  ],
};
