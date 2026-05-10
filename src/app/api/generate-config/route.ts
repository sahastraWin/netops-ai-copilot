// src/app/api/generate-config/route.ts
// AI-powered Cisco config generation endpoint
// Permission required: generate:config (JUNIOR_ENGINEER and above)

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateCompletion, SYSTEM_PROMPTS } from "@/lib/ai";
import { canGenerateConfig } from "@/lib/auth";
import { z } from "zod";

const configSchema = z.object({
  intent: z
    .string()
    .min(10, "Please describe what you want to configure")
    .max(2000),
  deviceType: z.enum([
    "ROUTER",
    "SWITCH",
    "FIREWALL",
    "ACCESS_POINT",
    "LOAD_BALANCER",
    "OTHER",
  ]),
  platform: z.string().default("Cisco IOS"),
});

export async function POST(request: NextRequest) {
  try {
    // Authentication check
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // RBAC check
    if (!canGenerateConfig(session.user.role)) {
      return NextResponse.json(
        { error: "Forbidden: Insufficient permissions to generate configs" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const parsed = configSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { intent, deviceType, platform } = parsed.data;

    // Generate config with AI
    const { text: configResponse, provider } = await generateCompletion(
      SYSTEM_PROMPTS.CONFIG_GENERATOR,
      `Generate a ${platform} configuration for a ${deviceType} for the following intent:\n\n"${intent}"\n\nProvide complete, production-ready CLI commands with comments.`,
      { maxTokens: 3000, temperature: 0.1 } // Low temperature for precise configs
    );

    // Extract title from AI response or generate one
    const title = extractTitle(configResponse) || generateTitle(intent);

    // Extract just the CLI commands for storage
    const generatedConfig = extractCLICommands(configResponse);

    // Save to database
    const savedConfig = await prisma.savedConfig.create({
      data: {
        userId: session.user.id,
        title,
        intent,
        generatedConfig: configResponse, // Store full response
        deviceType,
        platform,
        tags: extractConfigTags(intent + " " + configResponse),
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "GENERATE_CONFIG",
        resource: savedConfig.id,
        metadata: JSON.stringify({ deviceType, platform, provider }),
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: savedConfig.id,
        title,
        config: configResponse,
        cliCommands: generatedConfig,
        provider,
      },
    });
  } catch (error) {
    console.error("Config generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate configuration" },
      { status: 500 }
    );
  }
}

// GET: Retrieve saved configs
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    const where: Record<string, unknown> = {};

    // Admins see all configs, others see own
    if (session.user.role !== "ADMIN") {
      where.userId = session.user.id;
    }

    const [configs, total] = await Promise.all([
      prisma.savedConfig.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          user: { select: { name: true, email: true } },
        },
      }),
      prisma.savedConfig.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: { configs, total, page, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Config fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch configs" },
      { status: 500 }
    );
  }
}

// Helpers
function extractTitle(response: string): string {
  const match = response.match(/\*\*Configuration Title:\*\*\s*(.+)/);
  return match ? match[1].trim() : "";
}

function generateTitle(intent: string): string {
  const words = intent.split(" ").slice(0, 6).join(" ");
  return words.length > 50 ? words.substring(0, 50) + "..." : words;
}

function extractCLICommands(response: string): string {
  const codeBlockMatch = response.match(/```(?:cisco|ios|)?\n([\s\S]*?)```/);
  return codeBlockMatch ? codeBlockMatch[1].trim() : response;
}

function extractConfigTags(text: string): string[] {
  const tags: Set<string> = new Set();
  const patterns = [
    { re: /ACL|access.list/gi, tag: "ACL" },
    { re: /OSPF/gi, tag: "OSPF" },
    { re: /BGP/gi, tag: "BGP" },
    { re: /VLAN/gi, tag: "VLAN" },
    { re: /NAT/gi, tag: "NAT" },
    { re: /VPN|IPSEC/gi, tag: "VPN" },
    { re: /QoS/gi, tag: "QoS" },
    { re: /SNMP/gi, tag: "SNMP" },
    { re: /SSH|telnet/gi, tag: "Management" },
    { re: /spanning.?tree|STP/gi, tag: "STP" },
    { re: /route|routing/gi, tag: "Routing" },
    { re: /firewall|security|block|deny/gi, tag: "Security" },
    { re: /interface/gi, tag: "Interface" },
  ];

  for (const { re, tag } of patterns) {
    if (re.test(text)) tags.add(tag);
  }

  return Array.from(tags).slice(0, 8);
}
