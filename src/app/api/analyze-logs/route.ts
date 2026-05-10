// src/app/api/analyze-logs/route.ts
// AI-powered log analysis endpoint
// Permission required: analyze:logs (SENIOR_ENGINEER, ADMIN)

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateCompletion, SYSTEM_PROMPTS } from "@/lib/ai";
import { parseSeverityFromText, extractAnomaliesToTags } from "@/lib/utils";
import { canAnalyzeLogs } from "@/lib/auth";
import { z } from "zod";

const analyzeSchema = z.object({
  rawLog: z.string().min(10, "Log must be at least 10 characters").max(10000),
  deviceType: z.enum([
    "ROUTER",
    "SWITCH",
    "FIREWALL",
    "ACCESS_POINT",
    "LOAD_BALANCER",
    "OTHER",
  ]),
});

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check RBAC permission
    if (!canAnalyzeLogs(session.user.role)) {
      return NextResponse.json(
        {
          error:
            "Forbidden: Your role does not have permission to analyze logs. Contact your admin.",
        },
        { status: 403 }
      );
    }

    // Validate request body
    const body = await request.json();
    const parsed = analyzeSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { rawLog, deviceType } = parsed.data;

    // Call AI provider (Ollama → OpenAI fallback)
    const { text: analysis, provider } = await generateCompletion(
      SYSTEM_PROMPTS.LOG_ANALYZER,
      `Analyze this ${deviceType} log and identify any anomalies, issues, or security concerns:\n\n${rawLog}`,
      { maxTokens: 2000, temperature: 0.2 }
    );

    // Parse AI response to extract structured data
    const severity = parseSeverityFromText(analysis);
    const anomalies = extractAnomaliesFromAnalysis(analysis);
    const tags = extractAnomaliesToTags(rawLog + " " + analysis);

    // Save to database
    const logEntry = await prisma.logEntry.create({
      data: {
        userId: session.user.id,
        rawLog,
        deviceType,
        severity,
        analysisResult: analysis,
        anomalies,
        tags,
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "ANALYZE_LOG",
        resource: logEntry.id,
        metadata: JSON.stringify({ deviceType, severity, provider }),
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: logEntry.id,
        analysis,
        severity,
        anomalies,
        tags,
        provider,
      },
    });
  } catch (error) {
    console.error("Log analysis error:", error);
    return NextResponse.json(
      { error: "Failed to analyze logs" },
      { status: 500 }
    );
  }
}

// Extract anomaly list from AI markdown response
function extractAnomaliesFromAnalysis(analysis: string): string[] {
  const anomalies: string[] = [];
  const lines = analysis.split("\n");

  for (const line of lines) {
    // Look for bullet points or numbered lists that describe anomalies
    if (line.match(/^[\-\*\d]+\.?\s+/)) {
      const cleaned = line.replace(/^[\-\*\d]+\.?\s+/, "").trim();
      if (cleaned.length > 5 && cleaned.length < 200) {
        anomalies.push(cleaned);
      }
    }
  }

  return anomalies.slice(0, 10); // Max 10 anomalies
}

// GET: Retrieve log history for current user
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const severity = searchParams.get("severity");

    const where: Record<string, unknown> = {
      userId: session.user.id,
    };

    // Admins can see all logs
    if (session.user.role === "ADMIN") {
      delete where.userId;
    }

    if (severity) {
      where.severity = severity;
    }

    const [logs, total] = await Promise.all([
      prisma.logEntry.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          user: {
            select: { name: true, email: true },
          },
        },
      }),
      prisma.logEntry.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: { logs, total, page, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Log fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch logs" },
      { status: 500 }
    );
  }
}
