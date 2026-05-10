// src/lib/utils.ts
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Severity } from "@prisma/client";

// Required by shadcn/ui — merges Tailwind classes safely
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// =============================================
// SEVERITY HELPERS
// =============================================
export function getSeverityColor(severity: Severity): string {
  const colors: Record<Severity, string> = {
    CRITICAL: "text-red-400",
    HIGH: "text-orange-400",
    MEDIUM: "text-yellow-400",
    LOW: "text-blue-400",
    INFO: "text-gray-400",
  };
  return colors[severity] || "text-gray-400";
}

export function getSeverityBadgeClass(severity: Severity): string {
  const classes: Record<Severity, string> = {
    CRITICAL: "bg-red-500/20 text-red-400 border-red-500/30",
    HIGH: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    MEDIUM: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    LOW: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    INFO: "bg-gray-500/20 text-gray-400 border-gray-500/30",
  };
  return classes[severity] || "bg-gray-500/20 text-gray-400";
}

export function getSeverityDotColor(severity: Severity): string {
  const colors: Record<Severity, string> = {
    CRITICAL: "bg-red-500",
    HIGH: "bg-orange-500",
    MEDIUM: "bg-yellow-500",
    LOW: "bg-blue-500",
    INFO: "bg-gray-500",
  };
  return colors[severity] || "bg-gray-500";
}

// Parse severity from AI response text
export function parseSeverityFromText(text: string): Severity {
  const upper = text.toUpperCase();
  if (upper.includes("CRITICAL")) return "CRITICAL";
  if (upper.includes("HIGH")) return "HIGH";
  if (upper.includes("MEDIUM")) return "MEDIUM";
  if (upper.includes("LOW")) return "LOW";
  return "INFO";
}

// =============================================
// DATE HELPERS
// =============================================
export function formatRelativeTime(date: Date | string): string {
  const d = new Date(date);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString();
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// =============================================
// TEXT HELPERS
// =============================================
export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.substring(0, length) + "...";
}

export function extractAnomaliesToTags(text: string): string[] {
  const patterns = [
    { pattern: /BGP/gi, tag: "BGP" },
    { pattern: /OSPF/gi, tag: "OSPF" },
    { pattern: /STP|spanning.?tree/gi, tag: "STP" },
    { pattern: /interface.*(down|err|flap)/gi, tag: "Interface" },
    { pattern: /CPU|processor/gi, tag: "CPU" },
    { pattern: /memory|mem/gi, tag: "Memory" },
    { pattern: /authentication|auth|login/gi, tag: "Auth" },
    { pattern: /firewall|ACL|access.list/gi, tag: "Security" },
    { pattern: /VPN|IPSEC|tunnel/gi, tag: "VPN" },
    { pattern: /VLAN/gi, tag: "VLAN" },
    { pattern: /CDP/gi, tag: "CDP" },
    { pattern: /SNMP/gi, tag: "SNMP" },
  ];

  const tags: Set<string> = new Set();
  for (const { pattern, tag } of patterns) {
    if (pattern.test(text)) tags.add(tag);
  }
  return Array.from(tags);
}

// =============================================
// CLIPBOARD
// =============================================
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
