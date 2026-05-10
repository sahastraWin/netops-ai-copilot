"use client";
import { useEffect, useState } from "react";
import { LogEntryData, Severity } from "@/types";
import { formatRelativeTime, getSeverityBadgeClass, truncate } from "@/lib/utils";
import { Role } from "@prisma/client";

interface LogHistoryProps {
  userId: string;
  role: Role;
}

export default function LogHistory({ userId, role }: LogHistoryProps) {
  const [logs, setLogs] = useState<LogEntryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [severityFilter, setSeverityFilter] = useState("");

  const fetchLogs = async (p: number, sev: string) => {
    setLoading(true);
    const params = new URLSearchParams({ page: p.toString(), limit: "8" });
    if (sev) params.append("severity", sev);

    const res = await fetch(`/api/analyze-logs?${params}`);
    const data = await res.json();
    if (data.success) {
      setLogs(data.data.logs);
      setTotalPages(data.data.pages);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLogs(page, severityFilter);
  }, [page, severityFilter]);

  const severities: Severity[] = ["CRITICAL", "HIGH", "MEDIUM", "LOW", "INFO"];

  return (
    <div className="cisco-card p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-white font-semibold font-display">Log History</h3>
          <p className="text-gray-500 text-xs mt-0.5">
            {role === "ADMIN" ? "All users' logs" : "Your analyzed logs"}
          </p>
        </div>
        {/* Severity filter */}
        <div className="flex items-center gap-2">
          <select
            value={severityFilter}
            onChange={(e) => { setSeverityFilter(e.target.value); setPage(1); }}
            className="px-2 py-1.5 bg-[#0d1117] border border-[#1f2937] rounded-lg text-gray-400 text-xs focus:outline-none focus:border-[#00bceb]/50 font-mono"
          >
            <option value="">All Severities</option>
            {severities.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-16 bg-[#0d1117] rounded-lg animate-pulse" />
          ))}
        </div>
      ) : logs.length === 0 ? (
        <div className="text-center py-12 text-gray-600 font-mono text-sm">
          <div className="text-4xl mb-3">📋</div>
          No logs analyzed yet.{" "}
          {role !== "VIEWER" && "Paste a log above to get started."}
        </div>
      ) : (
        <div className="space-y-2">
          {logs.map((log) => (
            <div key={log.id} className="border border-[#1f2937] rounded-lg overflow-hidden">
              {/* Log row header */}
              <button
                onClick={() => setExpandedId(expandedId === log.id ? null : log.id)}
                className="w-full flex items-center gap-3 p-3 bg-[#0d1117] hover:bg-[#111827] transition-colors text-left"
              >
                <span className={`flex-shrink-0 text-xs px-2 py-0.5 rounded border font-mono ${getSeverityBadgeClass(log.severity)}`}>
                  {log.severity}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-gray-300 text-xs font-mono truncate">
                    {truncate(log.rawLog.split("\n")[0], 80)}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-gray-600 text-xs">{log.deviceType}</span>
                    {log.tags.slice(0, 3).map((tag) => (
                      <span key={tag} className="text-[#00bceb]/60 text-xs font-mono">#{tag}</span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="text-gray-600 text-xs font-mono">
                    {formatRelativeTime(log.createdAt)}
                  </span>
                  <svg
                    className={`w-3 h-3 text-gray-600 transition-transform ${expandedId === log.id ? "rotate-180" : ""}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>

              {/* Expanded analysis */}
              {expandedId === log.id && (
                <div className="p-4 border-t border-[#1f2937] bg-[#080c10]">
                  <p className="text-gray-500 text-xs font-mono mb-3">AI ANALYSIS:</p>
                  {log.analysisResult ? (
                    <div
                      className="prose-dark text-xs leading-relaxed"
                      dangerouslySetInnerHTML={{
                        __html: log.analysisResult
                          .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>')
                          .replace(/`([^`]+)`/g, '<code>$1</code>')
                          .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
                          .replace(/\n/g, '<br/>'),
                      }}
                    />
                  ) : (
                    <p className="text-gray-600 text-xs">No analysis available</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 bg-[#0d1117] border border-[#1f2937] rounded text-gray-400 text-xs disabled:opacity-40 hover:border-[#00bceb]/30 hover:text-white transition-colors"
          >
            ← Prev
          </button>
          <span className="text-gray-600 text-xs font-mono">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1.5 bg-[#0d1117] border border-[#1f2937] rounded text-gray-400 text-xs disabled:opacity-40 hover:border-[#00bceb]/30 hover:text-white transition-colors"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
