// src/lib/auth.ts
// Auth.js v5 (NextAuth) configuration
// Handles: Credentials login, JWT sessions, RBAC role injection

import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";
import { z } from "zod";

// Validation schema for login form
const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  // Use Prisma adapter to store sessions/accounts in MongoDB
  adapter: PrismaAdapter(prisma),

  // Use JWT strategy (works better with Credentials provider)
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // Validate input
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;

        // Look up user in database
        const user = await prisma.user.findUnique({
          where: { email: email.toLowerCase() },
        });

        if (!user || !user.password) return null;

        // Compare password with bcrypt hash
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) return null;

        // Return user object (gets embedded in JWT)
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
        };
      },
    }),
  ],

  callbacks: {
    // JWT callback: called when token is created or updated
    // This is where we embed the user's role into the token
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as { role: Role }).role;
        token.id = user.id;
      }
      return token;
    },

    // Session callback: called when session is accessed via useSession()
    // Expose role to the client session
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as Role;
      }
      return session;
    },
  },

  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },

  events: {
    // Log authentication events for security auditing
    async signIn({ user }) {
      if (user.id) {
        await prisma.auditLog.create({
          data: {
            userId: user.id,
            action: "SIGN_IN",
            metadata: JSON.stringify({ timestamp: new Date().toISOString() }),
          },
        });
      }
    },
  },
});

// =============================================
// RBAC HELPERS
// These functions check if a user has permission
// to perform certain actions
// =============================================

export type Permission =
  | "view:dashboard"
  | "analyze:logs"
  | "generate:config"
  | "view:all_logs"
  | "manage:users"
  | "export:data";

const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  VIEWER: ["view:dashboard"],
  JUNIOR_ENGINEER: ["view:dashboard", "generate:config"],
  SENIOR_ENGINEER: ["view:dashboard", "analyze:logs", "generate:config"],
  ADMIN: [
    "view:dashboard",
    "analyze:logs",
    "generate:config",
    "view:all_logs",
    "manage:users",
    "export:data",
  ],
};

export function hasPermission(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export function canAnalyzeLogs(role: Role): boolean {
  return hasPermission(role, "analyze:logs");
}

export function canGenerateConfig(role: Role): boolean {
  return hasPermission(role, "generate:config");
}

export function isAdmin(role: Role): boolean {
  return role === "ADMIN";
}
