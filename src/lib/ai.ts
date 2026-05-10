// src/lib/ai.ts
// AI Provider abstraction layer
// Tries Ollama (local, private) first, falls back to OpenAI
// This is a KEY talking point in Cisco interviews:
// "We prioritize data privacy by using local inference"

import OpenAI from "openai";

// =============================================
// CLIENT SETUP
// =============================================

// Ollama uses OpenAI-compatible API — we can use the OpenAI SDK for both!
const ollamaClient = new OpenAI({
  baseURL: process.env.OLLAMA_BASE_URL || "http://localhost:11434/v1",
  apiKey: "ollama", // Ollama doesn't need a real key
});

const openaiClient = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "not-set",
});

// =============================================
// HEALTH CHECK — Is Ollama Running?
// =============================================
async function isOllamaAvailable(): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000); // 2s timeout

    const response = await fetch(
      `${process.env.OLLAMA_BASE_URL || "http://localhost:11434"}/api/tags`,
      { signal: controller.signal }
    );

    clearTimeout(timeout);
    return response.ok;
  } catch {
    return false;
  }
}

// =============================================
// MAIN AI COMPLETION FUNCTION
// =============================================
export async function generateCompletion(
  systemPrompt: string,
  userMessage: string,
  options: {
    maxTokens?: number;
    temperature?: number;
  } = {}
): Promise<{ text: string; provider: "ollama" | "openai" | "mock" }> {
  const { maxTokens = 2000, temperature = 0.3 } = options;
  const provider = process.env.AI_PROVIDER || "auto";

  // Try Ollama if configured
  if (provider === "ollama" || provider === "auto") {
    const ollamaAvailable = await isOllamaAvailable();
    if (ollamaAvailable) {
      try {
        const response = await ollamaClient.chat.completions.create({
          model: process.env.OLLAMA_MODEL || "llama3",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userMessage },
          ],
          max_tokens: maxTokens,
          temperature,
        });
        return {
          text: response.choices[0]?.message?.content || "",
          provider: "ollama",
        };
      } catch (err) {
        console.error("Ollama error:", err);
        // Fall through to OpenAI
      }
    }
  }

  // Try OpenAI as fallback
  if (
    provider === "openai" ||
    (provider === "auto" && process.env.OPENAI_API_KEY)
  ) {
    if (
      process.env.OPENAI_API_KEY &&
      process.env.OPENAI_API_KEY !== "not-set"
    ) {
      try {
        const response = await openaiClient.chat.completions.create({
          model: process.env.OPENAI_MODEL || "gpt-4o-mini",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userMessage },
          ],
          max_tokens: maxTokens,
          temperature,
        });
        return {
          text: response.choices[0]?.message?.content || "",
          provider: "openai",
        };
      } catch (err) {
        console.error("OpenAI error:", err);
      }
    }
  }

  // If neither is available, return a helpful error message
  // This allows the UI to still function in demo mode
  return {
    text: getMockResponse(userMessage),
    provider: "mock",
  };
}

// =============================================
// MOCK RESPONSES — For demo without AI
// =============================================
function getMockResponse(input: string): string {
  const lower = input.toLowerCase();
  if (lower.includes("bgp") || lower.includes("flap")) {
    return `**BGP Session Instability Detected**

**Anomaly:** BGP neighbor relationship is repeatedly establishing and dropping (flapping).

**Root Cause Analysis:**
- Interface MTU mismatch between peers (common Cisco BGP issue)
- Hold timer expiry due to high CPU or link congestion  
- Keepalive packets being dropped by intermediate firewall

**Recommended Actions:**
1. Check \`show bgp summary\` for session uptime
2. Verify MTU: \`show interface GigabitEthernet0/0 | include MTU\`
3. Review CPU: \`show processes cpu sorted\`
4. Check if PMTUD is enabled on both peers

**Cisco IOS Fix:**
\`\`\`
router bgp 65001
  neighbor 10.0.0.1 timers 10 30
  neighbor 10.0.0.1 soft-reconfiguration inbound
\`\`\`

⚠️ *Note: This is a demo response. Connect Ollama or OpenAI for real AI analysis.*`;
  }

  return `**AI Analysis Complete**

Demo mode is active. To get real AI analysis:
1. Install Ollama: https://ollama.ai
2. Run: \`ollama pull llama3\`
3. Or add your OpenAI API key to .env.local

⚠️ *This is a mock response for demonstration purposes.*`;
}

// =============================================
// PROMPTS — Specialized for network engineering
// =============================================

export const SYSTEM_PROMPTS = {
  LOG_ANALYZER: `You are NetOps AI, an expert Cisco network engineering assistant specializing in log analysis and anomaly detection. You work like a senior Cisco TAC engineer.

When analyzing logs, you:
1. Identify specific anomalies (BGP flapping, interface errors, authentication failures, CPU spikes, memory issues, spanning tree issues, etc.)
2. Explain the issue in plain English that a junior engineer can understand
3. Provide the exact Cisco show commands to investigate further
4. Suggest remediation steps with actual IOS/NX-OS CLI commands
5. Rate severity: CRITICAL / HIGH / MEDIUM / LOW / INFO

Format your response with clear sections:
- **Anomaly Detected:** (brief summary)
- **Severity:** CRITICAL/HIGH/MEDIUM/LOW/INFO
- **Root Cause Analysis:** (detailed explanation)
- **Affected Components:** (interfaces, protocols, devices)
- **Cisco Diagnostic Commands:** (exact CLI commands)
- **Remediation Steps:** (step-by-step fix)
- **Prevention:** (how to avoid this in future)

Always use proper Cisco CLI syntax. Be precise, technical, and actionable.`,

  CONFIG_GENERATOR: `You are NetOps AI, an expert Cisco network engineer specializing in secure device configuration generation. You follow Cisco security hardening guidelines and best practices.

When generating configurations, you:
1. Generate syntactically correct Cisco IOS/IOS-XE/NX-OS CLI commands
2. Follow Cisco security best practices (CIS benchmarks where applicable)
3. Add explanatory comments before each section
4. Include verification commands to confirm the config was applied
5. Warn about any potential impact or caveats

Format your response:
- **Configuration Title:** (brief description)
- **Platform:** Cisco IOS / NX-OS / ASA
- **Impact Assessment:** (what this change will do)
- **Configuration Commands:**
\`\`\`cisco
! Comments explaining each section
! Actual CLI commands here
\`\`\`
- **Verification Commands:** (show commands to verify)
- **Rollback Commands:** (how to undo if needed)

Only generate configurations for legitimate network operations. Never generate configs that could be used maliciously.`,
};
