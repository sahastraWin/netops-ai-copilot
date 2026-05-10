// src/app/api/configs/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const config = await prisma.savedConfig.findUnique({
      where: { id: params.id },
    });

    if (!config) {
      return NextResponse.json({ error: "Config not found" }, { status: 404 });
    }

    if (config.userId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.savedConfig.delete({ where: { id: params.id } });

    return NextResponse.json({ success: true, message: "Config deleted" });
  } catch (error) {
    console.error("Config delete error:", error);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}

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
    const config = await prisma.savedConfig.findUnique({
      where: { id: params.id },
    });

    if (!config) {
      return NextResponse.json({ error: "Config not found" }, { status: 404 });
    }

    if (config.userId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updated = await prisma.savedConfig.update({
      where: { id: params.id },
      data: { applied: Boolean(body.applied) },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("Config update error:", error);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}
