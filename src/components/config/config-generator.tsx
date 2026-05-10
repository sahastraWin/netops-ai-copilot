"use client";
import { useState } from "react";
import { DeviceType } from "@prisma/client";
import { copyToClipboard } from "@/lib/utils";

const SAMPLE_INTENTS = [
  {
    label: "Block IP ACL",
    intent: "Configure a standard access list to block IP 192.168.1.50 from accessing the network and allow all other traffic",
    deviceType: "ROUTER" as DeviceType,
    platform: "Cisco IOS",
  },
  {
    label: "SSH Hardening",
    intent: "Harden SSH access on a Cisco router: disable telnet, enable SSH version 2 only, set timeout to 5 minutes, configure login local authentication",
    deviceType: "ROUTER" as DeviceType,
    platform: "Cisco IOS",
  },
  {
    label: "VLAN Setup",
    intent: "Create VLANs 10 (Management), 20 (Users), 30 (Servers) and configure trunk ports on GigabitEthernet0/1 and 0/2",
    deviceType: "SWITCH" as DeviceType,
    platform: "Cisco IOS",
  },
  {
    label: "OSPF Config",
    intent: "Configure OSPF Area 0 on a router with network 10.0.0.0/8 and enable MD5 authentication for all OSPF neighbors",
    deviceType: "ROUTER" as DeviceType,
    platform: "Cisco IOS",
  },
  {
    label: "Firewall Rules",
    intent: "Configure an extended ACL on a Cisco ASA to allow HTTP/HTTPS from outside zone to DMZ server 172.16.1.100 and deny all other inbound traffic",
    deviceType: "FIREWALL" as DeviceType,
    platform: "Cisco ASA",
  },
];

interface GeneratedConfig {
  id: string;
  title: string;
  config: string;
  cliCommands: string;
  provider: string;
}

export default function ConfigGenerator() {
  const [intent, setIntent] = useState("");
  const [deviceType, setDeviceType] = useState<DeviceType>("ROUTER");
  const [platform, setPlatform] = useState("Cisco IOS");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GeneratedConfig | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"full" | "cli">("full");

  const handleGenerate = async () => {
    if (!intent.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/generate-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ intent, deviceType, platform }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Config generation failed");
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
    const text = activeTab === "cli" ? result?.cliCommands : result?.config;
    if (text) {
      await copyToClipboard(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const loadSample = (sample: (typeof SAMPLE_INTENTS)[0]) => {
    setIntent(sample.intent);
    setDeviceType(sample.deviceType);
    setPlatform(sample.platform);
    setResult(null);
    setError("");
  };

  const platforms = [
    "Cisco IOS",
    "Cisco IOS-XE",
    "Cisco NX-OS",
    "Cisco ASA",
    "Cisco IOS-XR",
  ];

  return (
    <div className="space-y-4">
      {/* Input Panel */}
      <div className="cisco-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-semibold font-display">
            Describe Your Intent
          </h2>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-gray-600 text-xs hidden md:block">Examples:</span>
            {SAMPLE_INTENTS.map((s) => (
              <button
                key={s.label}
                onClick={() => loadSample(s)}
                className="px-2 py-1 text-xs bg-[#0d1117] border border-[#1f2937] rounded text-gray-400 hover:text-[#6cc04a] hover:border-[#6cc04a]/30 transition-colors font-mono"
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Controls row */}
        <div className="flex items-center gap-3 mb-3 flex-wrap">
          <div className="flex items-center gap-2">
            <label className="text-gray-400 text-sm">Device:</label>
            <select
              value={deviceType}
              onChange={(e) => setDeviceType(e.target.value as DeviceType)}
              className="px-3 py-1.5 bg-[#0d1117] border border-[#1f2937] rounded-lg text-white text-sm focus:outline-none focus:border-[#6cc04a]/50 font-mono"
            >
              {["ROUTER", "SWITCH", "FIREWALL", "ACCESS_POINT", "LOAD_BALANCER"].map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-gray-400 text-sm">Platform:</label>
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              className="px-3 py-1.5 bg-[#0d1117] border border-[#1f2937] rounded-lg text-white text-sm focus:outline-none focus:border-[#6cc04a]/50 font-mono"
            >
              {platforms.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Intent textarea */}
        <textarea
          value={intent}
          onChange={(e) => setIntent(e.target.value)}
          placeholder={`Describe what you want to configure in plain English...\n\nExamples:\n• "Block all traffic from 10.0.0.0/8 on GigabitEthernet0/1"\n• "Configure BGP with neighbor 192.168.1.1, AS 65001, send community attribute"\n• "Enable port security on all access ports, max 2 MAC addresses"`}
          rows={6}
          className="w-full px-4 py-3 bg-[#0d1117] border border-[#1f2937] rounded-lg text-white placeholder-gray-700 text-sm resize-none focus:outline-none focus:border-[#6cc04a]/50 focus:ring-1 focus:ring-[#6cc04a]/10 transition-all leading-relaxed"
          spellCheck={false}
        />

        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-[#6cc04a] animate-pulse" />
            <span className="text-gray-600 text-xs font-mono">
              AI will generate {platform} CLI commands
            </span>
          </div>
          <button
            onClick={handleGenerate}
            disabled={loading || !intent.trim()}
            className="flex items-center gap-2 px-4 py-2 bg-[#6cc04a] text-[#080c10] font-semibold rounded-lg text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#7dd55a] transition-all"
          >
            {loading ? (
              <>
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Generating...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
                Generate Config
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

      {/* Generated Config Result */}
      {result && (
        <div className="cisco-card p-6 border border-[#6cc04a]/10 animate-fade-in-up">
          {/* Result header */}
          <div className="flex items-start justify-between mb-5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 rounded-full bg-[#6cc04a]" />
                <h3 className="text-white font-semibold font-display">
                  {result.title}
                </h3>
              </div>
              <p className="text-gray-500 text-xs font-mono">
                via {result.provider === "ollama" ? "🦙 Ollama (local)" : result.provider === "openai" ? "🤖 OpenAI" : "📋 Demo Mode"}
                {" · "}
                {platform}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#6cc04a]/10 border border-[#6cc04a]/20 rounded-lg text-[#6cc04a] text-xs hover:bg-[#6cc04a]/20 transition-colors"
              >
                {copied ? (
                  <>
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Copied!
                  </>
                ) : (
                  <>
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Copy
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mb-4 p-1 bg-[#0d1117] rounded-lg border border-[#1f2937] w-fit">
            {(["full", "cli"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 rounded text-xs font-mono transition-all ${
                  activeTab === tab
                    ? "bg-[#6cc04a]/10 text-[#6cc04a] border border-[#6cc04a]/20"
                    : "text-gray-500 hover:text-gray-300"
                }`}
              >
                {tab === "full" ? "Full Response" : "CLI Commands Only"}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="terminal-block overflow-x-auto max-h-[500px] overflow-y-auto">
            {activeTab === "full" ? (
              <div
                className="prose-dark text-sm leading-relaxed"
                dangerouslySetInnerHTML={{
                  __html: result.config
                    .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>')
                    .replace(/`([^`]+)`/g, '<code>$1</code>')
                    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
                    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
                    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
                    .replace(/\n/g, '<br/>'),
                }}
              />
            ) : (
              <pre className="text-[#6cc04a] text-sm font-mono whitespace-pre-wrap">
                {result.cliCommands || result.config}
              </pre>
            )}
          </div>

          {/* Warning banner */}
          <div className="mt-4 p-3 bg-yellow-500/5 border border-yellow-500/20 rounded-lg flex items-start gap-2">
            <svg className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <p className="text-yellow-400 text-xs">
              <strong>Important:</strong> Always test configurations in a lab environment before applying to production devices. Review rollback commands before making changes.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
