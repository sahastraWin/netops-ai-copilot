// src/app/api/logs/[id]/route.ts
// PATCH: mark log as resolved
// DELETE: delete a log entry

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { resolved } = body;

    // Find the log and verify ownership (or admin)
    const log = await prisma.logEntry.findUnique({
      where: { id: params.id },
    });

    if (!log) {
      return NextResponse.json({ error: "Log not found" }, { status: 404 });
    }

    if (log.userId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updated = await prisma.logEntry.update({
      where: { id: params.id },
      data: { resolved: Boolean(resolved) },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("Log update error:", error);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const log = await prisma.logEntry.findUnique({
      where: { id: params.id },
    });

    if (!log) {
      return NextResponse.json({ error: "Log not found" }, { status: 404 });
    }

    if (log.userId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.logEntry.delete({ where: { id: params.id } });

    return NextResponse.json({ success: true, message: "Log deleted" });
  } catch (error) {
    console.error("Log delete error:", error);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
