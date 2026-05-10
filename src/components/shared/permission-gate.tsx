"use client";
// Permission gate component — shows children only if user has the permission
// Otherwise shows fallback UI
// This is how RBAC manifests in the UI layer

import { Role } from "@prisma/client";
import { hasPermission, Permission } from "@/lib/auth";

interface PermissionGateProps {
  role: Role;
  permission: Permission;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function PermissionGate({
  role,
  permission,
  children,
  fallback = null,
}: PermissionGateProps) {
  if (!hasPermission(role, permission)) {
    return <>{fallback}</>;
  }
  return <>{children}</>;
}
