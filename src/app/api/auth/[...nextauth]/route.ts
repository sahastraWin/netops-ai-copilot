// src/app/api/auth/[...nextauth]/route.ts
// This is the catch-all route handler for Auth.js v5
// It handles all /api/auth/* routes automatically:
// - /api/auth/signin
// - /api/auth/signout
// - /api/auth/session
// - /api/auth/csrf
// - /api/auth/callback/*

import { handlers } from "@/lib/auth";

export const { GET, POST } = handlers;
