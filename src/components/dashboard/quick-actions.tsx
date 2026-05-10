"use client";
import Link from "next/link";
import { Role } from "@prisma/client";
import { canAnalyzeLogs, canGenerateConfig } from "@/lib/auth";

export default function QuickActions({ role }: { role: Role }) {
  const actions = [
    {
      label: "Analyze Logs",
      href: "/dashboard/logs",
      desc: "Paste syslog data for AI analysis",
      icon: "🔍",
      color: "border-[#00bceb]/20 hover:border-[#00bceb]/40",
      allowed: canAnalyzeLogs(role),
    },
    {
      label: "Generate Config",
      href: "/dashboard/configs",
      desc: "Describe your intent in English",
      icon: "⚙️",
      color: "border-[#6cc04a]/20 hover:border-[#6cc04a]/40",
      allowed: canGenerateConfig(role),
    },
  ];

  return (
    <div className="cisco-card p-6">
      <h3 className="text-white font-semibold font-display mb-5">
        Quick Actions
      </h3>
      <div className="space-y-3">
        {actions.map((action) => (
          <div key={action.label}>
            {action.allowed ? (
              <Link
                href={action.href}
                className={`block p-4 bg-[#0d1117] border rounded-lg transition-all group ${action.color}`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{action.icon}</span>
                  <div>
                    <p className="text-white text-sm font-medium group-hover:text-[#00bceb] transition-colors">
                      {action.label}
                    </p>
                    <p className="text-gray-600 text-xs mt-0.5">{action.desc}</p>
                  </div>
                  <svg className="w-4 h-4 text-gray-600 group-hover:text-[#00bceb] ml-auto transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            ) : (
              <div className="block p-4 bg-[#0d1117] border border-[#1f2937] rounded-lg opacity-50 cursor-not-allowed">
                <div className="flex items-center gap-3">
                  <span className="text-xl grayscale">{action.icon}</span>
                  <div>
                    <p className="text-gray-500 text-sm font-medium">{action.label}</p>
                    <p className="text-gray-700 text-xs mt-0.5">Permission required</p>
                  </div>
                  <svg className="w-4 h-4 text-gray-700 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Role info */}
        <div className="mt-4 p-3 bg-[#0d1117] border border-[#1f2937] rounded-lg">
          <p className="text-gray-600 text-xs font-mono mb-1">YOUR ROLE</p>
          <p className="text-white text-sm font-medium">{role.replace("_", " ")}</p>
          <p className="text-gray-600 text-xs mt-1">
            {role === "ADMIN" && "Full system access"}
            {role === "SENIOR_ENGINEER" && "Log analysis + config generation"}
            {role === "JUNIOR_ENGINEER" && "Config generation only"}
            {role === "VIEWER" && "Read-only dashboard access"}
          </p>
        </div>
      </div>
    </div>
  );
}
