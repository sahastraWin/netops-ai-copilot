"use client";
import { useEffect, useState } from "react";
import { SavedConfigData } from "@/types";
import { formatRelativeTime, truncate, copyToClipboard } from "@/lib/utils";
import { Role } from "@prisma/client";

interface ConfigHistoryProps {
  userId: string;
  role: Role;
}

export default function ConfigHistory({ userId, role }: ConfigHistoryProps) {
  const [configs, setConfigs] = useState<SavedConfigData[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchConfigs = async (p: number) => {
    setLoading(true);
    const res = await fetch(`/api/generate-config?page=${p}&limit=8`);
    const data = await res.json();
    if (data.success) {
      setConfigs(data.data.configs);
      setTotalPages(data.data.pages);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchConfigs(page);
  }, [page]);

  const handleCopy = async (config: SavedConfigData) => {
    await copyToClipboard(config.generatedConfig);
    setCopiedId(config.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="cisco-card p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-white font-semibold font-display">Saved Configurations</h3>
          <p className="text-gray-500 text-xs mt-0.5">
            {role === "ADMIN" ? "All generated configs" : "Your generated configurations"}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-16 bg-[#0d1117] rounded-lg animate-pulse" />
          ))}
        </div>
      ) : configs.length === 0 ? (
        <div className="text-center py-12 text-gray-600 font-mono text-sm">
          <div className="text-4xl mb-3">⚙️</div>
          No configs generated yet. Describe your intent above.
        </div>
      ) : (
        <div className="space-y-2">
          {configs.map((config) => (
            <div key={config.id} className="border border-[#1f2937] rounded-lg overflow-hidden">
              <div className="flex items-center gap-3 p-3 bg-[#0d1117]">
                {/* Expand button */}
                <button
                  onClick={() => setExpandedId(expandedId === config.id ? null : config.id)}
                  className="flex-1 flex items-center gap-3 text-left"
                >
                  <div className="p-1.5 bg-[#6cc04a]/10 rounded-md flex-shrink-0">
                    <svg className="w-3.5 h-3.5 text-[#6cc04a]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-200 text-xs font-medium truncate">{config.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-gray-600 text-xs font-mono">{config.platform}</span>
                      <span className="text-gray-700">·</span>
                      <span className="text-gray-600 text-xs">{config.deviceType}</span>
                      {config.tags.slice(0, 2).map((tag) => (
                        <span key={tag} className="text-[#6cc04a]/60 text-xs font-mono">#{tag}</span>
                      ))}
                    </div>
                  </div>
                  <span className="text-gray-600 text-xs font-mono flex-shrink-0">
                    {formatRelativeTime(config.createdAt)}
                  </span>
                </button>

                {/* Copy button */}
                <button
                  onClick={() => handleCopy(config)}
                  className="p-1.5 text-gray-600 hover:text-[#6cc04a] transition-colors flex-shrink-0"
                  title="Copy config"
                >
                  {copiedId === config.id ? (
                    <svg className="w-4 h-4 text-[#6cc04a]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  )}
                </button>
              </div>

              {/* Expanded config */}
              {expandedId === config.id && (
                <div className="border-t border-[#1f2937] bg-[#020408]">
                  <div className="p-2 border-b border-[#1f2937] flex items-center gap-2">
                    <span className="text-gray-600 text-xs font-mono px-2">INTENT:</span>
                    <span className="text-gray-400 text-xs">{truncate(config.intent, 100)}</span>
                  </div>
                  <pre className="p-4 text-[#6cc04a] text-xs font-mono whitespace-pre-wrap overflow-x-auto max-h-80 overflow-y-auto leading-relaxed">
                    {config.generatedConfig}
                  </pre>
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
            className="px-3 py-1.5 bg-[#0d1117] border border-[#1f2937] rounded text-gray-400 text-xs disabled:opacity-40 hover:border-[#6cc04a]/30 transition-colors"
          >
            ← Prev
          </button>
          <span className="text-gray-600 text-xs font-mono">{page} / {totalPages}</span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1.5 bg-[#0d1117] border border-[#1f2937] rounded text-gray-400 text-xs disabled:opacity-40 hover:border-[#6cc04a]/30 transition-colors"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
