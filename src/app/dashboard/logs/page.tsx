// src/app/dashboard/logs/page.tsx
import { auth } from "@/lib/auth";
import { canAnalyzeLogs } from "@/lib/auth";
import LogAnalyzer from "@/components/logs/log-analyzer";
import LogHistory from "@/components/logs/log-history";
import PermissionGate from "@/components/shared/permission-gate";

export default async function LogsPage() {
  const session = await auth();

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-2xl font-bold text-white font-display">
          Log Analyzer
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          Paste network device logs for AI-powered anomaly detection
        </p>
      </div>

      <PermissionGate
        role={session!.user.role}
        permission="analyze:logs"
        fallback={
          <div className="cisco-card p-8 text-center">
            <div className="w-16 h-16 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-white font-semibold text-lg mb-2">Access Restricted</h3>
            <p className="text-gray-400 text-sm max-w-sm mx-auto">
              Log analysis requires Senior Engineer or Admin role. Contact your administrator to upgrade your access level.
            </p>
            <div className="mt-4 px-3 py-1.5 bg-yellow-500/10 border border-yellow-500/20 rounded-lg inline-block">
              <span className="text-yellow-400 text-xs font-mono">
                Required: SENIOR_ENGINEER | ADMIN
              </span>
            </div>
          </div>
        }
      >
        <LogAnalyzer />
      </PermissionGate>

      {/* Log history visible to all */}
      <LogHistory userId={session!.user.id} role={session!.user.role} />
    </div>
  );
}
