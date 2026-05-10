"use client";
import { useEffect, useState } from "react";

interface SeverityStat {
  severity: string;
  count: number;
}

const severityConfig: Record<string, { color: string; bg: string; label: string }> = {
  CRITICAL: { color: "#ef4444", bg: "rgba(239,68,68,0.15)", label: "Critical" },
  HIGH: { color: "#f97316", bg: "rgba(249,115,22,0.15)", label: "High" },
  MEDIUM: { color: "#eab308", bg: "rgba(234,179,8,0.15)", label: "Medium" },
  LOW: { color: "#60a5fa", bg: "rgba(96,165,250,0.15)", label: "Low" },
  INFO: { color: "#9ca3af", bg: "rgba(156,163,175,0.1)", label: "Info" },
};

export default function AlertsPanel() {
  const [stats, setStats] = useState<SeverityStat[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard/stats")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          const s = d.data.logsBySeverity as SeverityStat[];
          setStats(s);
          setTotal(s.reduce((acc, cur) => acc + cur.count, 0));
        }
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="cisco-card p-6 h-full">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-white font-semibold font-display">
          Alert Distribution
        </h3>
        <span className="text-gray-600 text-xs font-mono">{total} total</span>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-10 bg-[#0d1117] rounded-lg animate-pulse" />
          ))}
        </div>
      ) : total === 0 ? (
        <div className="text-center py-8">
          <div className="w-12 h-12 bg-[#6cc04a]/10 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-[#6cc04a]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-[#6cc04a] text-sm font-medium">All Clear</p>
          <p className="text-gray-600 text-xs mt-1">No alerts to report</p>
        </div>
      ) : (
        <div className="space-y-3">
          {Object.entries(severityConfig).map(([sev, cfg]) => {
            const stat = stats.find((s) => s.severity === sev);
            const count = stat?.count ?? 0;
            const pct = total > 0 ? (count / total) * 100 : 0;

            return (
              <div key={sev}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-mono" style={{ color: cfg.color }}>
                    {cfg.label}
                  </span>
                  <span className="text-xs font-mono text-gray-500">{count}</span>
                </div>
                <div className="h-1.5 bg-[#0d1117] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${pct}%`,
                      background: cfg.color,
                      boxShadow: count > 0 ? `0 0 8px ${cfg.color}40` : "none",
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
