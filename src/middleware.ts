// src/middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function middleware(req: NextRequest) {
  const session = await auth();
  const { nextUrl } = req;
  const isLoggedIn = !!session?.user;

  const isProtectedRoute =
    nextUrl.pathname.startsWith("/dashboard") ||
    nextUrl.pathname.startsWith("/api/analyze-logs") ||
    nextUrl.pathname.startsWith("/api/generate-config") ||
    nextUrl.pathname.startsWith("/api/dashboard");

  const isAuthRoute =
    nextUrl.pathname.startsWith("/auth/login") ||
    nextUrl.pathname.startsWith("/auth/register");

  if (isProtectedRoute && !isLoggedIn) {
    const loginUrl = new URL("/auth/login", nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthRoute && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", nextUrl.origin));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.svg$).*)",
  ],
};