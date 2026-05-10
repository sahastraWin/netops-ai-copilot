"use client";
import Link from "next/link";

export default function LandingPage() {
  const features = [
    {
      icon: "🔍",
      title: "AI Log Analyzer",
      desc: "Paste syslog data and get instant anomaly detection powered by local LLMs",
      color: "text-[#00bceb]",
      border: "border-[#00bceb]/20",
    },
    {
      icon: "⚙️",
      title: "Intent-to-Config",
      desc: "Describe your intent in English, receive production Cisco IOS commands",
      color: "text-[#6cc04a]",
      border: "border-[#6cc04a]/20",
    },
    {
      icon: "🛡️",
      title: "RBAC Security",
      desc: "Role-based access control with Junior Engineer, Senior Engineer, and Admin tiers",
      color: "text-purple-400",
      border: "border-purple-400/20",
    },
    {
      icon: "🤖",
      title: "Local AI First",
      desc: "Ollama + Llama 3 runs on-premise for enterprise data privacy, OpenAI as fallback",
      color: "text-orange-400",
      border: "border-orange-400/20",
    },
  ];

  return (
    <div className="min-h-screen bg-[#080c10] net-grid overflow-hidden">
      {/* Ambient blobs */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/3 w-[600px] h-[600px] bg-[#00bceb]/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-[#6cc04a]/5 rounded-full blur-[100px]" />
      </div>

      {/* Nav */}
      <nav className="relative z-10 border-b border-[#1f2937] px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#00bceb]/10 border border-[#00bceb]/30 flex items-center justify-center">
              <span className="text-[#00bceb] text-sm font-bold">N</span>
            </div>
            <span className="text-white font-bold font-display">NetOps AI Copilot</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/auth/login" className="text-gray-400 hover:text-white text-sm transition-colors">
              Sign In
            </Link>
            <Link
              href="/auth/register"
              className="btn-cisco text-sm"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 pt-24 pb-16 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#00bceb]/10 border border-[#00bceb]/20 rounded-full text-[#00bceb] text-xs font-mono mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00bceb] animate-pulse" />
          Cisco AIOps · Intent-Based Networking
        </div>

        <h1 className="text-5xl md:text-7xl font-bold text-white font-display leading-tight mb-6">
          Network Intelligence
          <br />
          <span className="text-[#00bceb]">Supercharged by AI</span>
        </h1>

        <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          Diagnose network anomalies instantly. Generate secure Cisco IOS configurations from plain English.
          Built for enterprise network engineers who demand precision.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/auth/register" className="btn-cisco text-base px-8 py-3 inline-block">
            Launch Dashboard →
          </Link>
          <Link href="/auth/login" className="px-8 py-3 border border-[#1f2937] text-gray-300 rounded-lg hover:border-[#00bceb]/30 hover:text-white transition-all text-base inline-block">
            Sign In
          </Link>
        </div>
      </div>

      {/* Feature Grid */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((f, i) => (
            <div
              key={i}
              className={`cisco-card p-6 border ${f.border} animate-fade-in-up stagger-${i + 1}`}
            >
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className={`text-lg font-bold mb-2 font-display ${f.color}`}>
                {f.title}
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* Stack badges */}
        <div className="mt-12 text-center">
          <p className="text-gray-600 text-xs mb-4 font-mono">BUILT WITH</p>
          <div className="flex flex-wrap justify-center gap-2">
            {[
              "Next.js 15",
              "TypeScript",
              "Tailwind CSS",
              "Prisma + MongoDB",
              "Auth.js v5",
              "Ollama / LLaMA 3",
              "OpenAI SDK",
              "Recharts",
            ].map((tech) => (
              <span
                key={tech}
                className="px-3 py-1 bg-[#0d1117] border border-[#1f2937] rounded-full text-gray-400 text-xs font-mono"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
