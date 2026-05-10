// src/lib/prisma.ts
// Singleton Prisma client to prevent connection exhaustion in development
// In production Next.js, each serverless function gets its own instance

import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

// In development, Next.js hot-reloads clear module cache.
// Without this, each reload creates a new PrismaClient, exhausting DB connections.
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
