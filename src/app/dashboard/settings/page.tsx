// src/app/dashboard/settings/page.tsx
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function SettingsPage() {
  const session = await auth();
  const user = await prisma.user.findUnique({
    where: { id: session!.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      _count: {
        select: {
          logEntries: true,
          configs: true,
        },
      },
    },
  });

  const rolePermissions: Record<string, string[]> = {
    ADMIN: ["View Dashboard", "Analyze Logs", "Generate Configs", "View All Logs", "Manage Users", "Export Data"],
    SENIOR_ENGINEER: ["View Dashboard", "Analyze Logs", "Generate Configs"],
    JUNIOR_ENGINEER: ["View Dashboard", "Generate Configs"],
    VIEWER: ["View Dashboard"],
  };

  const permissions = rolePermissions[session!.user.role] || [];

  return (
    <div className="space-y-6 animate-fade-in-up max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-white font-display">Settings</h1>
        <p className="text-gray-400 text-sm mt-1">Your account details and permissions</p>
      </div>

      {/* Profile card */}
      <div className="cisco-card p-6">
        <h2 className="text-white font-semibold mb-4 font-display">Profile</h2>
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 rounded-full bg-[#00bceb]/20 flex items-center justify-center text-[#00bceb] text-xl font-bold">
            {user?.name?.[0]?.toUpperCase() || "U"}
          </div>
          <div>
            <p className="text-white font-medium">{user?.name || "Unknown"}</p>
            <p className="text-gray-400 text-sm">{user?.email}</p>
            <p className="text-gray-600 text-xs font-mono mt-0.5">
              Member since {new Date(user?.createdAt || Date.now()).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-[#0d1117] border border-[#1f2937] rounded-lg">
            <p className="text-gray-500 text-xs font-mono mb-1">LOGS ANALYZED</p>
            <p className="text-white text-2xl font-bold font-display">{user?._count.logEntries || 0}</p>
          </div>
          <div className="p-3 bg-[#0d1117] border border-[#1f2937] rounded-lg">
            <p className="text-gray-500 text-xs font-mono mb-1">CONFIGS GENERATED</p>
            <p className="text-white text-2xl font-bold font-display">{user?._count.configs || 0}</p>
          </div>
        </div>
      </div>

      {/* Role & Permissions */}
      <div className="cisco-card p-6">
        <h2 className="text-white font-semibold mb-4 font-display">Role & Permissions</h2>
        <div className="flex items-center gap-3 mb-4">
          <div className="px-3 py-1.5 bg-[#00bceb]/10 border border-[#00bceb]/20 rounded-lg">
            <span className="text-[#00bceb] font-mono text-sm font-semibold">
              {session!.user.role.replace("_", " ")}
            </span>
          </div>
        </div>
        <div className="space-y-2">
          {["View Dashboard", "Analyze Logs", "Generate Configs", "View All Logs", "Manage Users", "Export Data"].map((perm) => {
            const hasIt = permissions.includes(perm);
            return (
              <div key={perm} className="flex items-center gap-3 p-2.5 bg-[#0d1117] rounded-lg">
                {hasIt ? (
                  <svg className="w-4 h-4 text-[#6cc04a] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4 text-gray-700 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                  </svg>
                )}
                <span className={`text-sm ${hasIt ? "text-gray-300" : "text-gray-700"}`}>
                  {perm}
                </span>
              </div>
            );
          })}
        </div>
        <p className="text-gray-600 text-xs mt-4 font-mono">
          Contact your admin to change role permissions.
        </p>
      </div>

      {/* System Info */}
      <div className="cisco-card p-6">
        <h2 className="text-white font-semibold mb-4 font-display">System Information</h2>
        <div className="space-y-2 font-mono text-xs">
          {[
            { label: "App Version", value: "1.0.0" },
            { label: "AI Primary", value: process.env.OLLAMA_MODEL || "llama3 (Ollama)" },
            { label: "AI Fallback", value: "GPT-4o-mini (OpenAI)" },
            { label: "Database", value: "MongoDB + Prisma" },
            { label: "Auth", value: "Auth.js v5 (JWT)" },
            { label: "Framework", value: "Next.js 15" },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between p-2 bg-[#0d1117] rounded">
              <span className="text-gray-500">{label}</span>
              <span className="text-gray-300">{value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
