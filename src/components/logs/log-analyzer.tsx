"use client";
import { useState } from "react";
import { DeviceType, Severity } from "@prisma/client";
import { getSeverityBadgeClass, copyToClipboard } from "@/lib/utils";

const SAMPLE_LOGS = {
  BGP: `%BGP-5-ADJCHANGE: neighbor 10.0.0.1 Down BGP Notification sent
%BGP-3-NOTIFICATION: sent to neighbor 10.0.0.1 6/7 (cease/connection collision resolution) 0 bytes
%BGP-5-ADJCHANGE: neighbor 10.0.0.1 Up
%BGP-5-ADJCHANGE: neighbor 10.0.0.1 Down Hold Timer Expired
Mar 15 09:23:11.438: %BGP-3-NOTIFICATION: sent to neighbor 10.0.0.1 4/0 (hold time expired)
Mar 15 09:23:41.438: %BGP-5-ADJCHANGE: neighbor 10.0.0.1 Up
Mar 15 09:24:55.009: %BGP-5-ADJCHANGE: neighbor 10.0.0.1 Down BGP Notification sent`,

  SECURITY: `Mar 15 10:30:01.123: %SEC_LOGIN-4-LOGIN_FAILED: Login failed [user: admin] [Source: 192.168.100.50] [localport: 22] [Reason: Login Authentication Failed] at 10:30:01 UTC
Mar 15 10:30:04.234: %SEC_LOGIN-4-LOGIN_FAILED: Login failed [user: root] [Source: 192.168.100.50]
Mar 15 10:30:07.456: %SEC_LOGIN-4-LOGIN_FAILED: Login failed [user: cisco] [Source: 192.168.100.50]
Mar 15 10:30:10.678: %SEC-6-IPACCESSLOGP: list BLOCK_LIST denied tcp 192.168.100.50(45231) -> 10.0.0.1(22), 1 packet
Mar 15 10:30:11.890: %SSH-4-SSH2_UNEXPECTED_MSG: Unexpected message type has arrived. Terminating the connection from 192.168.100.50`,

  INTERFACE: `Mar 15 08:15:33.123: %LINK-3-UPDOWN: Interface GigabitEthernet0/1, changed state to down
Mar 15 08:15:36.456: %LINEPROTO-5-UPDOWN: Line protocol on Interface GigabitEthernet0/1, changed state to down
Mar 15 08:16:03.789: %LINK-3-UPDOWN: Interface GigabitEthernet0/1, changed state to up
Mar 15 08:16:06.012: %LINEPROTO-5-UPDOWN: Line protocol on Interface GigabitEthernet0/1, changed state to up
Mar 15 08:17:45.345: %LINK-3-UPDOWN: Interface GigabitEthernet0/1, changed state to down
Mar 15 08:17:48.678: %ETHCNTR-3-LOOP_BACK_DETECTED: Loop-back detected on GigabitEthernet0/1`,
};

interface AnalysisResult {
  id: string;
  analysis: string;
  severity: Severity;
  anomalies: string[];
  tags: string[];
  provider: string;
}

export default function LogAnalyzer() {
  const [rawLog, setRawLog] = useState("");
  const [deviceType, setDeviceType] = useState<DeviceType>("ROUTER");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const handleAnalyze = async () => {
    if (!rawLog.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/analyze-logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rawLog, deviceType }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Analysis failed");
      } else {
        setResult(data.data);
      }
    } catch {
      setError("Network error — please try again");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (result?.analysis) {
      await copyToClipboard(result.analysis);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const loadSample = (type: keyof typeof SAMPLE_LOGS) => {
    setRawLog(SAMPLE_LOGS[type]);
    setResult(null);
    setError("");
  };

  return (
    <div className="space-y-4">
      {/* Input Panel */}
      <div className="cisco-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-semibold font-display">
            Paste Network Logs
          </h2>
          <div className="flex items-center gap-2">
            <span className="text-gray-600 text-xs">Load sample:</span>
            {(Object.keys(SAMPLE_LOGS) as Array<keyof typeof SAMPLE_LOGS>).map(
              (type) => (
                <button
                  key={type}
                  onClick={() => loadSample(type)}
                  className="px-2 py-1 text-xs bg-[#0d1117] border border-[#1f2937] rounded text-gray-400 hover:text-[#00bceb] hover:border-[#00bceb]/30 transition-colors font-mono"
                >
                  {type}
                </button>
              )
            )}
          </div>
        </div>

        {/* Device type selector */}
        <div className="flex items-center gap-3 mb-3">
          <label className="text-gray-400 text-sm">Device Type:</label>
          <select
            value={deviceType}
            onChange={(e) => setDeviceType(e.target.value as DeviceType)}
            className="px-3 py-1.5 bg-[#0d1117] border border-[#1f2937] rounded-lg text-white text-sm focus:outline-none focus:border-[#00bceb]/50 font-mono"
          >
            {["ROUTER", "SWITCH", "FIREWALL", "ACCESS_POINT", "LOAD_BALANCER", "OTHER"].map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        {/* Log textarea */}
        <textarea
          value={rawLog}
          onChange={(e) => setRawLog(e.target.value)}
          placeholder={`Paste your Cisco syslog data here...\n\nExample:\nMar 15 09:23:11.438: %BGP-3-NOTIFICATION: sent to neighbor 10.0.0.1 4/0 (hold time expired)`}
          rows={10}
          className="w-full terminal-block text-green-400 text-sm resize-none focus:outline-none focus:border-[#00bceb]/50 placeholder-gray-700 font-mono leading-relaxed"
          spellCheck={false}
        />

        <div className="flex items-center justify-between mt-4">
          <span className="text-gray-600 text-xs font-mono">
            {rawLog.length} chars · {rawLog.split("\n").filter((l) => l.trim()).length} lines
          </span>
          <button
            onClick={handleAnalyze}
            disabled={loading || !rawLog.trim()}
            className="btn-cisco flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Analyzing...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Analyze Logs
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="cisco-card p-4 border border-red-500/20 bg-red-500/5">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Analysis Result */}
      {result && (
        <div className="cisco-card p-6 border border-[#00bceb]/10 animate-fade-in-up">
          {/* Result header */}
          <div className="flex items-start justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#00bceb]/10 border border-[#00bceb]/20 flex items-center justify-center">
                <svg className="w-4 h-4 text-[#00bceb]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div>
                <h3 className="text-white font-semibold font-display">
                  AI Analysis Complete
                </h3>
                <p className="text-gray-500 text-xs font-mono">
                  via {result.provider === "ollama" ? "🦙 Ollama (local)" : result.provider === "openai" ? "🤖 OpenAI" : "📋 Demo Mode"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-xs px-2.5 py-1 rounded border font-mono ${getSeverityBadgeClass(result.severity)}`}>
                {result.severity}
              </span>
              <button
                onClick={handleCopy}
                className="p-2 text-gray-500 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                title="Copy analysis"
              >
                {copied ? (
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
          </div>

          {/* Tags */}
          {result.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {result.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 bg-[#00bceb]/5 border border-[#00bceb]/15 rounded text-[#00bceb] text-xs font-mono"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Analysis markdown rendered */}
          <div
            className="prose-dark text-sm leading-relaxed"
            dangerouslySetInnerHTML={{
              __html: formatMarkdown(result.analysis),
            }}
          />
        </div>
      )}
    </div>
  );
}

// Simple markdown → HTML converter
function formatMarkdown(text: string): string {
  return text
    .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/^[\-\*] (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>\n?)+/g, (match) => `<ul>${match}</ul>`)
    .replace(/\n\n/g, '</p><p>')
    .replace(/^(?!<[huplo])/gm, '')
    .replace(/\n/g, '<br/>');
}
