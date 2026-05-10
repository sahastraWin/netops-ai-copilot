"use client";
import { useEffect, useState } from "react";
import { RecentActivity as RecentActivityType } from "@/types";
import { formatRelativeTime, getSeverityBadgeClass } from "@/lib/utils";

export default function RecentActivity() {
  const [activities, setActivities] = useState<RecentActivityType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard/stats")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setActivities(d.data.recentActivity);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="cisco-card p-6">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-white font-semibold font-display">
          Recent Activity
        </h3>
        <span className="text-gray-600 text-xs font-mono">LIVE</span>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-[#0d1117] rounded-lg animate-pulse" />
          ))}
        </div>
      ) : activities.length === 0 ? (
        <div className="text-center py-8 text-gray-600 text-sm font-mono">
          No activity yet. Start by analyzing a log.
        </div>
      ) : (
        <div className="space-y-2">
          {activities.map((activity, i) => (
            <div
              key={activity.id}
              className={`flex items-start gap-3 p-3 rounded-lg bg-[#0d1117] border border-[#1f2937] animate-fade-in-up stagger-${Math.min(i + 1, 5)}`}
            >
              <div className={`mt-0.5 p-1.5 rounded-md flex-shrink-0 ${
                activity.type === "log"
                  ? "bg-[#00bceb]/10 text-[#00bceb]"
                  : "bg-[#6cc04a]/10 text-[#6cc04a]"
              }`}>
                {activity.type === "log" ? (
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                ) : (
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-gray-300 text-xs leading-snug truncate">
                  {activity.description}
                </p>
                <p className="text-gray-600 text-xs mt-0.5 font-mono">
                  {formatRelativeTime(activity.createdAt)}
                </p>
              </div>
              {activity.severity && (
                <span className={`text-xs px-2 py-0.5 rounded border font-mono flex-shrink-0 ${getSeverityBadgeClass(activity.severity)}`}>
                  {activity.severity}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
