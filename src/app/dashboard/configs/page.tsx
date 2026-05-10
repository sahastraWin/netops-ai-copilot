// src/app/dashboard/configs/page.tsx
import { auth } from "@/lib/auth";
import ConfigGenerator from "@/components/config/config-generator";
import ConfigHistory from "@/components/config/config-history";
import PermissionGate from "@/components/shared/permission-gate";

export default async function ConfigsPage() {
  const session = await auth();

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-2xl font-bold text-white font-display">
          Config Generator
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          Describe your intent — get production-ready Cisco IOS CLI commands
        </p>
      </div>

      <PermissionGate
        role={session!.user.role}
        permission="generate:config"
        fallback={
          <div className="cisco-card p-8 text-center">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
            </div>
            <h3 className="text-white font-semibold text-lg mb-2">Permission Denied</h3>
            <p className="text-gray-400 text-sm">
              Your role (Viewer) cannot generate configurations.
            </p>
          </div>
        }
      >
        <ConfigGenerator />
      </PermissionGate>

      <ConfigHistory userId={session!.user.id} role={session!.user.role} />
    </div>
  );
}
