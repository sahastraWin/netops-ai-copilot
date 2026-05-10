// src/types/index.ts
// Shared TypeScript types across the application

import { Role, Severity, DeviceType } from "@prisma/client";

// =============================================
// AUTH TYPES
// =============================================
export type { Role };

export interface SessionUser {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role: Role;
}

// Extend next-auth types
declare module "next-auth" {
  interface Session {
    user: SessionUser;
  }
  interface User {
    role: Role;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: Role;
    id: string;
  }
}

// =============================================
// LOG TYPES
// =============================================
export type { Severity, DeviceType };

export interface LogEntryData {
  id: string;
  rawLog: string;
  deviceType: DeviceType;
  severity: Severity;
  analysisResult?: string | null;
  anomalies: string[];
  tags: string[];
  resolved: boolean;
  createdAt: Date;
  user?: {
    name?: string | null;
    email?: string | null;
  };
}

export interface LogAnalysisRequest {
  rawLog: string;
  deviceType: DeviceType;
}

export interface LogAnalysisResponse {
  analysis: string;
  severity: Severity;
  anomalies: string[];
  tags: string[];
  provider: "ollama" | "openai" | "mock";
}

// =============================================
// CONFIG TYPES
// =============================================
export interface SavedConfigData {
  id: string;
  title: string;
  intent: string;
  generatedConfig: string;
  deviceType: DeviceType;
  platform: string;
  tags: string[];
  applied: boolean;
  createdAt: Date;
  user?: {
    name?: string | null;
    email?: string | null;
  };
}

export interface ConfigGenerationRequest {
  intent: string;
  deviceType: DeviceType;
  platform: string;
}

export interface ConfigGenerationResponse {
  title: string;
  config: string;
  platform: string;
  provider: "ollama" | "openai" | "mock";
}

// =============================================
// DASHBOARD STATS
// =============================================
export interface DashboardStats {
  totalLogs: number;
  criticalAlerts: number;
  generatedConfigs: number;
  resolvedIssues: number;
  logsBySeverity: {
    severity: Severity;
    count: number;
  }[];
  recentActivity: RecentActivity[];
  weeklyTrend: WeeklyTrend[];
}

export interface RecentActivity {
  id: string;
  type: "log" | "config";
  description: string;
  severity?: Severity;
  createdAt: Date;
}

export interface WeeklyTrend {
  date: string;
  logs: number;
  configs: number;
  critical: number;
}

// =============================================
// API RESPONSE WRAPPER
// =============================================
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
