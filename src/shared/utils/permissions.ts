import type { User, RoleName, PermissionAction } from '@/shared/types/common.types';

// ─── Check if user has a specific role (from user_type) ──────────────────────

export function hasRole(user: User | null, role: RoleName): boolean {
  if (!user) return false;
  return user.user_type === role;
}

export function hasAnyRole(user: User | null, roles: RoleName[]): boolean {
  if (!user) return false;
  return roles.includes(user.user_type);
}

// ─── Check permission ─────────────────────────────────────────────────────────
// super_admin and admin have all permissions; others need explicit checks

export function hasPermission(
  user: User | null,
  _resource: string,
  _action: PermissionAction
): boolean {
  if (!user) return false;
  if (user.user_type === 'super_admin' || user.user_type === 'admin') return true;
  // For more granular checks add server-fetched permission list here
  return false;
}

export function hasAnyPermission(
  user: User | null,
  checks: Array<{ resource: string; action: PermissionAction }>
): boolean {
  return checks.some(({ resource: r, action: a }) => hasPermission(user, r, a));
}
