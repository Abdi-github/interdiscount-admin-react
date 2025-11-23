import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/shared/hooks/useAuth';
import { usePermission } from '@/shared/hooks/usePermission';
import type { PermissionAction, RoleName } from '@/shared/types/common.types';
import { Box, Typography } from '@mui/material';

interface PermissionRouteProps {
  resource?: string;
  action?: PermissionAction;
  roles?: RoleName[];
  redirectTo?: string;
}

export function PermissionRoute({
  resource,
  action,
  roles,
  redirectTo,
}: PermissionRouteProps) {
  const { hasAnyRole } = useAuth();
  const { can } = usePermission();

  // Check role-based access
  if (roles && !hasAnyRole(roles)) {
    if (redirectTo) return <Navigate to={redirectTo} replace />;
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          Keine Berechtigung für diese Seite.
        </Typography>
      </Box>
    );
  }

  // Check permission-based access
  if (resource && action && !can(resource, action)) {
    if (redirectTo) return <Navigate to={redirectTo} replace />;
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          Keine Berechtigung für diese Seite.
        </Typography>
      </Box>
    );
  }

  return <Outlet />;
}
