// src/app/page.tsx
// Root page — redirects based on auth state

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import LandingPage from "@/components/shared/landing-page";

export default async function Home() {
  const session = await auth();

  // If logged in, send to dashboard
  if (session?.user) {
    redirect("/dashboard");
  }

  // Show landing page for unauthenticated users
  return <LandingPage />;
}
