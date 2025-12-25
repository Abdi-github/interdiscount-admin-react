import { useAuth } from './useAuth';
import type { PermissionAction } from '@/shared/types/common.types';
import { hasPermission, hasAnyPermission } from '@/shared/utils/permissions';

// ─── Permission hook ──────────────────────────────────────────────────────────

export function usePermission() {
  const { user } = useAuth();

  return {
    can: (resource: string, action: PermissionAction) =>
      hasPermission(user, resource, action),
    canAny: (checks: Array<{ resource: string; action: PermissionAction }>) =>
      hasAnyPermission(user, checks),
  };
}
