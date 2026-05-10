// src/app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { SessionProvider } from "@/components/shared/session-provider";

export const metadata: Metadata = {
  title: "NetOps AI Copilot | Cisco-Powered Network Intelligence",
  description:
    "AI-powered network operations dashboard for Cisco engineers. Analyze logs, generate configurations, and detect anomalies with local AI.",
  keywords: [
    "Cisco",
    "NetOps",
    "AI",
    "Network Engineering",
    "AIOps",
    "Intent-Based Networking",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#080c10] antialiased">
        <SessionProvider>
          {children}
          <Toaster />
        </SessionProvider>
      </body>
    </html>
  );
}
