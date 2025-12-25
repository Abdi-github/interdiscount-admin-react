import { useAppSelector } from '@/app/hooks';
import {
  selectCurrentUser,
  selectIsAuthenticated,
  selectAccessToken,
} from '@/shared/state/authSlice';
import type { RoleName } from '@/shared/types/common.types';
import { hasRole, hasAnyRole } from '@/shared/utils/permissions';

// ─── Auth hook ────────────────────────────────────────────────────────────────

export function useAuth() {
  const user = useAppSelector(selectCurrentUser);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const accessToken = useAppSelector(selectAccessToken);

  return {
    user,
    isAuthenticated,
    accessToken,
    hasRole: (role: RoleName) => hasRole(user, role),
    hasAnyRole: (roles: RoleName[]) => hasAnyRole(user, roles),
    isSuperAdmin: hasRole(user, 'super_admin'),
    isAdmin: hasAnyRole(user, ['super_admin', 'admin']),
  };
}
