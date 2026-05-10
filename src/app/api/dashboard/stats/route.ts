// src/app/api/dashboard/stats/route.ts
// Dashboard statistics API endpoint

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const isAdmin = session.user.role === "ADMIN";

    // Base where clause (admins see all, others see own)
    const userFilter = isAdmin ? {} : { userId };

    // Run all stat queries in parallel for performance
    const [
      totalLogs,
      criticalAlerts,
      generatedConfigs,
      resolvedIssues,
      logsBySeverity,
      recentLogs,
      recentConfigs,
    ] = await Promise.all([
      prisma.logEntry.count({ where: userFilter }),
      prisma.logEntry.count({
        where: { ...userFilter, severity: "CRITICAL" },
      }),
      prisma.savedConfig.count({ where: userFilter }),
      prisma.logEntry.count({
        where: { ...userFilter, resolved: true },
      }),
      prisma.logEntry.groupBy({
        by: ["severity"],
        where: userFilter,
        _count: { severity: true },
      }),
      prisma.logEntry.findMany({
        where: userFilter,
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true,
          severity: true,
          tags: true,
          createdAt: true,
          anomalies: true,
        },
      }),
      prisma.savedConfig.findMany({
        where: userFilter,
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true,
          title: true,
          platform: true,
          createdAt: true,
        },
      }),
    ]);

    // Build recent activity timeline
    const recentActivity = [
      ...recentLogs.map((log) => ({
        id: log.id,
        type: "log" as const,
        description: `Log analyzed: ${log.tags.join(", ") || "Network anomaly"} detected`,
        severity: log.severity,
        createdAt: log.createdAt,
      })),
      ...recentConfigs.map((config) => ({
        id: config.id,
        type: "config" as const,
        description: `Config generated: ${config.title}`,
        createdAt: config.createdAt,
      })),
    ]
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .slice(0, 8);

    // Generate weekly trend data (last 7 days)
    const weeklyTrend = await generateWeeklyTrend(userId, isAdmin);

    return NextResponse.json({
      success: true,
      data: {
        totalLogs,
        criticalAlerts,
        generatedConfigs,
        resolvedIssues,
        logsBySeverity: logsBySeverity.map((s) => ({
          severity: s.severity,
          count: s._count.severity,
        })),
        recentActivity,
        weeklyTrend,
      },
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return NextResponse.json(
      { error: "Failed to load dashboard stats" },
      { status: 500 }
    );
  }
}

async function generateWeeklyTrend(userId: string, isAdmin: boolean) {
  const days = 7;
  const trend = [];
  const userFilter = isAdmin ? {} : { userId };

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);

    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + 1);

    const [logsCount, configsCount, criticalCount] = await Promise.all([
      prisma.logEntry.count({
        where: {
          ...userFilter,
          createdAt: { gte: date, lt: nextDate },
        },
      }),
      prisma.savedConfig.count({
        where: {
          ...userFilter,
          createdAt: { gte: date, lt: nextDate },
        },
      }),
      prisma.logEntry.count({
        where: {
          ...userFilter,
          severity: "CRITICAL",
          createdAt: { gte: date, lt: nextDate },
        },
      }),
    ]);

    trend.push({
      date: date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      logs: logsCount,
      configs: configsCount,
      critical: criticalCount,
    });
  }

  return trend;
}
