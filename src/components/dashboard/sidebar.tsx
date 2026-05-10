"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { SessionUser } from "@/types";
import { cn } from "@/lib/utils";

interface SidebarProps {
  user: SessionUser;
}

const navItems = [
  {
    href: "/dashboard",
    label: "Overview",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
    ),
    exact: true,
  },
  {
    href: "/dashboard/logs",
    label: "Log Analyzer",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    href: "/dashboard/configs",
    label: "Config Generator",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>
    ),
  },
  {
    href: "/dashboard/settings",
    label: "Settings",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
];

const roleColors: Record<string, string> = {
  ADMIN: "text-[#ff6300] bg-[#ff6300]/10 border-[#ff6300]/20",
  SENIOR_ENGINEER: "text-[#00bceb] bg-[#00bceb]/10 border-[#00bceb]/20",
  JUNIOR_ENGINEER: "text-[#6cc04a] bg-[#6cc04a]/10 border-[#6cc04a]/20",
  VIEWER: "text-gray-400 bg-gray-400/10 border-gray-400/20",
};

const roleLabels: Record<string, string> = {
  ADMIN: "Admin",
  SENIOR_ENGINEER: "Senior Eng.",
  JUNIOR_ENGINEER: "Junior Eng.",
  VIEWER: "Viewer",
};

export default function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="w-60 flex-shrink-0 border-r border-[#1f2937] bg-[#0a0e14] flex flex-col">
      {/* Logo */}
      <div className="p-4 border-b border-[#1f2937]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#00bceb]/10 border border-[#00bceb]/20 flex items-center justify-center flex-shrink-0">
            <svg viewBox="0 0 24 24" className="w-4 h-4 text-[#00bceb]" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <div>
            <span className="text-white font-bold text-sm font-display block">NetOps AI</span>
            <span className="text-gray-600 text-xs">Copilot v1.0</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        <p className="text-gray-600 text-xs font-mono px-3 py-2 uppercase tracking-wider">
          Operations
        </p>
        {navItems.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "nav-item",
                isActive && "active"
              )}
            >
              {item.icon}
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* System Status */}
      <div className="p-3 border-t border-[#1f2937]">
        <div className="p-3 bg-[#0d1117] rounded-lg border border-[#1f2937] mb-3">
          <p className="text-xs text-gray-600 font-mono mb-2">SYSTEM STATUS</p>
          <div className="space-y-1.5">
            {[
              { label: "AI Engine", status: "online" },
              { label: "Database", status: "online" },
              { label: "Ollama", status: "warning" },
            ].map(({ label, status }) => (
              <div key={label} className="flex items-center justify-between">
                <span className="text-gray-500 text-xs">{label}</span>
                <span className={`w-1.5 h-1.5 rounded-full status-${status}`} />
              </div>
            ))}
          </div>
        </div>

        {/* User info */}
        <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/5 transition-colors group">
          <div className="w-7 h-7 rounded-full bg-[#00bceb]/20 flex items-center justify-center text-[#00bceb] text-xs font-bold flex-shrink-0">
            {user.name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-medium truncate">
              {user.name || "User"}
            </p>
            <span className={`text-xs px-1.5 py-0.5 rounded border font-mono ${roleColors[user.role]}`}>
              {roleLabels[user.role]}
            </span>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/auth/login" })}
            className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-600 hover:text-red-400"
            title="Sign out"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>
    </aside>
  );
}
