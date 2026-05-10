// src/app/dashboard/page.tsx
import { auth } from "@/lib/auth";
import { Suspense } from "react";
import StatsCards from "@/components/dashboard/stats-cards";
import ActivityChart from "@/components/dashboard/activity-chart";
import RecentActivity from "@/components/dashboard/recent-activity";
import AlertsPanel from "@/components/dashboard/alerts-panel";
import QuickActions from "@/components/dashboard/quick-actions";

export default async function DashboardPage() {
  const session = await auth();

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white font-display">
            Network Operations Center
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Real-time network intelligence ·{" "}
            <span className="text-[#6cc04a]">● System Operational</span>
          </p>
        </div>
        <div className="hidden md:flex items-center gap-2 text-xs text-gray-500 font-mono">
          <span className="w-2 h-2 rounded-full bg-[#00bceb] animate-pulse inline-block" />
          AI Provider Active
        </div>
      </div>

      {/* Stats Row */}
      <Suspense fallback={<StatsCardsSkeleton />}>
        <StatsCards userId={session!.user.id} role={session!.user.role} />
      </Suspense>

      {/* Middle Row: Chart + Alerts */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <Suspense fallback={<ChartSkeleton />}>
            <ActivityChart />
          </Suspense>
        </div>
        <div>
          <Suspense fallback={<PanelSkeleton />}>
            <AlertsPanel />
          </Suspense>
        </div>
      </div>

      {/* Bottom Row: Recent Activity + Quick Actions */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <Suspense fallback={<PanelSkeleton />}>
            <RecentActivity />
          </Suspense>
        </div>
        <div>
          <QuickActions role={session!.user.role} />
        </div>
      </div>
    </div>
  );
}

// Skeleton components
function StatsCardsSkeleton() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="cisco-card p-5 h-28 animate-pulse bg-[#0d1117]"
        />
      ))}
    </div>
  );
}

function ChartSkeleton() {
  return (
    <div className="cisco-card p-6 h-72 animate-pulse" />
  );
}

function PanelSkeleton() {
  return (
    <div className="cisco-card p-6 h-72 animate-pulse" />
  );
}
