"use client";
import { SessionUser } from "@/types";

interface TopBarProps {
  user: SessionUser;
}

export default function TopBar({ user }: TopBarProps) {
  const now = new Date();
  const timeStr = now.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
  const dateStr = now.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <header className="h-14 border-b border-[#1f2937] bg-[#0a0e14] flex items-center justify-between px-6 flex-shrink-0">
      {/* Left: Breadcrumb-style title */}
      <div className="flex items-center gap-2 text-sm font-mono">
        <span className="text-gray-600">netops</span>
        <span className="text-gray-700">/</span>
        <span className="text-[#00bceb]">dashboard</span>
      </div>

      {/* Right: Status indicators */}
      <div className="flex items-center gap-4">
        <div className="hidden md:flex items-center gap-2 text-xs text-gray-600 font-mono">
          <span className="text-gray-700">{dateStr}</span>
          <span className="text-[#00bceb]">{timeStr}</span>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#6cc04a]/10 border border-[#6cc04a]/20 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-[#6cc04a] animate-pulse" />
          <span className="text-[#6cc04a] text-xs font-mono">OPERATIONAL</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-[#00bceb]/20 flex items-center justify-center text-[#00bceb] text-xs font-bold">
            {user.name?.[0]?.toUpperCase() || "U"}
          </div>
        </div>
      </div>
    </header>
  );
}
