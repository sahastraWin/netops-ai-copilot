// src/app/auth/error/page.tsx
"use client";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";

function ErrorContent() {
  const params = useSearchParams();
  const error = params.get("error");

  const messages: Record<string, string> = {
    Configuration: "Server configuration error. Please contact your admin.",
    AccessDenied: "Access denied. You don't have permission to sign in.",
    Verification: "Verification link is invalid or has expired.",
    Default: "An authentication error occurred. Please try again.",
  };

  const message = messages[error || "Default"] || messages.Default;

  return (
    <div className="min-h-screen bg-[#080c10] net-grid flex items-center justify-center p-4">
      <div className="cisco-card p-8 max-w-md w-full text-center border border-red-500/20">
        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h1 className="text-white text-xl font-bold mb-2 font-display">Authentication Error</h1>
        <p className="text-gray-400 text-sm mb-6">{message}</p>
        <Link href="/auth/login" className="btn-cisco inline-block">
          Back to Login
        </Link>
      </div>
    </div>
  );
}

export default function AuthError() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#080c10]" />}>
      <ErrorContent />
    </Suspense>
  );
}
